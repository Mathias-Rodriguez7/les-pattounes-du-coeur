import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { QuickAdoptionFormSchema } from '$lib/schemas/formShema/quickAdoptionForm';
import prisma from '$lib/server/prisma';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const cat = await prisma.cat.findUnique({
		where: { id: params.id }
	});
	return {
		cat,
		catId: params.id, // 👈 ou depuis ton load cat
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

		console.log('📝 Form Data:', form.data);

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

						children: form.data.numberOfChildren
					}
				}
			});

			return { form, success: true };
		} catch (e) {
			console.error('❌ ERREUR PRISMA:', e);
			return fail(500, { form, message: e.message });
		}
	}
};
