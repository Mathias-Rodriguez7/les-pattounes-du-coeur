import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { QuickAdoptionFormSchema } from '$lib/schemas/formShema/quickAdoptionForm';
import prisma from '$lib/server/prisma';
import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';

export const load: PageServerLoad = async ({ params }) => {
	// Un id mal formé ferait planter PostgreSQL (colonne uuid) : on répond 404 avant
	if (!z.string().uuid().safeParse(params.id).success) error(404, 'Chat introuvable');

	// Seulement un chat visible ET encore à l'adoption, et seulement son nom
	const cat = await prisma.cat.findFirst({
		where: { id: params.id, isVisible: true, status: 'AVAILABLE' },
		select: { name: true }
	});
	if (!cat) error(404, "Ce chat n'est plus à l'adoption");

	return {
		cat,
		catId: params.id,
		form: await superValidate(zod4(QuickAdoptionFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod4(QuickAdoptionFormSchema));

		// 🔥 injecte catId côté server (important)
		form.data.catId = params.id;

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await prisma.form.create({
				data: {
					type: 'ADOPTION_SPECIFIC',
					status: 'PENDING',

					email: form.data.email,

					data: {
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone: form.data.phone,
						birthDate: form.data.birthDate,
						address: form.data.address,
						city: form.data.city,
						postalCode: form.data.postalCode,
						district: form.data.district,

						housing: {
							size: form.data.housingSize,
							hasGarden: form.data.hasGarden,
							gardenSize: form.data.gardenSize
						},

						pets: {
							hasPets: form.data.hasPets,
							cats: form.data.numberOfCats,
							dogs: form.data.numberOfDogs,
							other: form.data.otherPets
						},

						children: form.data.numberOfChildren,
						catId: form.data.catId
					}
				}
			});

			return { form, success: true };
		} catch (e) {
			// Le détail reste dans le terminal du serveur, le visiteur reçoit un message simple
			console.error("Erreur enregistrement demande d'adoption :", e);
			return fail(500, {
				form,
				message: "Votre demande n'a pas pu être envoyée. Réessayez dans quelques minutes."
			});
		}
	}
};
