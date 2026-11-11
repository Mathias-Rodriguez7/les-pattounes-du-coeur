// src/routes/(app)/adoptions/formChat/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { adoptionFormSchema } from '#lib/schemas/formShema/adoptionForm.ts';
import prisma from '#lib/server/prisma.ts';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(adoptionFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(adoptionFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await prisma.form.create({
				data: {
					type: 'ADOPTION_FLEXIBLE',
					status: 'PENDING',
					email: form.data.email,
					data: form.data
				}
			});

			return {
				form,
				success: true as const
			};
		} catch (error) {
			// Le détail reste dans le terminal du serveur, le visiteur reçoit un message simple
			console.error("Erreur enregistrement demande d'adoption (formulaire libre) :", error);

			return fail(500, {
				form,
				message: "Votre demande n'a pas pu être envoyée. Réessayez dans quelques minutes."
			});
		}
	}
};
