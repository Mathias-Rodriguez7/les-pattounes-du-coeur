import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { adoptionFormSchema } from '$lib/schema/adoptionForm';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(adoptionFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('🔥 SUBMIT REÇU');

		const raw = await request.formData();

		console.log('📦 RAW FORM DATA:');
		for (const [key, value] of raw.entries()) {
			console.log(key, value);
		}

		const form = await superValidate(raw, zod4(adoptionFormSchema));

		console.log('📦 PARSED DATA:', form.data);

		if (!form.valid) {
			console.log('❌ ZOD ERRORS:', form.errors);
			return fail(400, { form });
		}

		try {
			await prisma.form.create({
				data: {
					type: 'ADOPTION',
					status: 'PENDING',
					email: form.data.email,
					data: {
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone: form.data.phone,
						age: form.data.age,

						catPreferences: {
							age: form.data.catAge,
							sex: form.data.catSex,
							furLength: form.data.furLength,
							color: form.data.color,
							temperament: form.data.temperament
						},

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

						children: form.data.numberOfChildren
					}
				}
			});

			return {
				form,
				success: true as const
			};
		} catch (error) {
			console.error('❌ ERREUR PRISMA:', error);

			return fail(500, {
				form,
				message: 'Erreur serveur',
				error: String(error)
			});
		}
	}
};
