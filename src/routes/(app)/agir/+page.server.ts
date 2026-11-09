import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { sosFormSchema } from '$lib/schemas/formShema/sosForm';
import { hostFormSchema } from '$lib/schemas/formShema/hostForm';
import { volunteerFormSchema } from '$lib/schemas/formShema/volunteerForm';
import { colabForm } from '$lib/schemas/formShema/colabForm.js';
import prisma from '$lib/server/prisma';
import { FormStatus, FormType } from '@prisma/client';
import { sendSosAlertEmail } from '$lib/server/mailer';

/** Le message envoyé au visiteur quand l'enregistrement échoue (le détail reste dans les logs) */
const SAVE_ERROR = "Votre demande n'a pas pu être envoyée. Réessayez dans quelques minutes.";

//
// 🧠 LOAD (initialisation des forms)
//

export const load = async () => {
	const startOfYear = new Date(new Date().getFullYear(), 0, 1);

	const savedThisYear = await prisma.cat.count({
		where: {
			createdAt: {
				gte: startOfYear
			}
		}
	});

	return {
		savedThisYear,
		sosForm: await superValidate(zod4(sosFormSchema)),
		hostForm: await superValidate(zod4(hostFormSchema)),
		volunteerForm: await superValidate(zod4(volunteerFormSchema)),
		colabForm: await superValidate(zod4(colabForm))
	};
};

export const actions = {
	//
	// 🚨 SOS : envoyé par e-mail à l'association (rien n'est enregistré en base)
	//
	sos: async ({ request }) => {
		const form = await superValidate(request, zod4(sosFormSchema));

		if (!form.valid) {
			return fail(400, { sosForm: form });
		}

		// Pot de miel rempli : c'est un robot. On fait comme si tout allait bien, sans rien envoyer
		// (lui renvoyer une erreur lui apprendrait à contourner la protection)
		if (form.data.website) {
			return { sosForm: form };
		}

		try {
			// 🆕 sendSosAlertEmail ne lit que les champs dont il a besoin : `website` est ignoré
			await sendSosAlertEmail(form.data);
		} catch (error) {
			// Le détail reste dans les logs ; le visiteur sait que son signalement n'est PAS parti
			console.error('Erreur envoi e-mail SOS :', error);
			return fail(500, {
				sosForm: form,
				message:
					"Votre signalement n'a pas pu être envoyé. Réessayez, ou contactez-nous par téléphone en cas d'urgence."
			});
		}

		return { sosForm: form };
	},

	//
	// 🏠 HOST
	//
	host: async ({ request }) => {
		const form = await superValidate(request, zod4(hostFormSchema));

		// 🆕 Plus de console.log : ils écrivaient les données personnelles dans les logs
		if (!form.valid) {
			return fail(400, { hostForm: form });
		}

		try {
			await prisma.form.create({
				data: {
					type: FormType.HOST,
					status: FormStatus.PENDING,
					email: form.data.email,
					data: form.data
				}
			});
		} catch (error) {
			console.error('Erreur enregistrement candidature FA :', error);
			// 🆕 Avant : l'erreur était avalée, et le visiteur voyait « Candidature envoyée »
			return fail(500, { hostForm: form, message: SAVE_ERROR });
		}

		return { hostForm: form };
	},

	//
	// 🤝 VOLUNTEER
	//
	volunteer: async ({ request }) => {
		const form = await superValidate(request, zod4(volunteerFormSchema));

		if (!form.valid) {
			return fail(400, { volunteerForm: form });
		}

		try {
			await prisma.form.create({
				data: {
					type: FormType.VOLUNTEER,
					status: FormStatus.PENDING,
					email: form.data.email,
					data: form.data
				}
			});
		} catch (error) {
			console.error('Erreur enregistrement candidature bénévole :', error);
			return fail(500, { volunteerForm: form, message: SAVE_ERROR });
		}

		return { volunteerForm: form };
	},

	//
	// 🤝 COLAB
	//
	colab: async ({ request }) => {
		const form = await superValidate(request, zod4(colabForm));

		if (!form.valid) {
			return fail(400, { colabForm: form });
		}

		try {
			await prisma.form.create({
				data: {
					type: FormType.COLAB,
					status: FormStatus.PENDING,
					email: form.data.email,
					data: form.data
				}
			});
		} catch (error) {
			console.error('Erreur enregistrement demande de partenariat :', error);
			return fail(500, { colabForm: form, message: SAVE_ERROR });
		}

		return { colabForm: form };
	}
};
