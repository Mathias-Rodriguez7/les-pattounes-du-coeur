import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { prisma } from '$lib/server/prisma';
import { sosFormSchema } from '$lib/schema/sosForm';

import type { Actions } from './$types';

export const load = async () => {
	return {
		form: await superValidate(zod4(sosFormSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(sosFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await prisma.form.create({
				data: {
					type: 'ALERT',
					status: 'PENDING',

					email: form.data.email,

					data: {
						type: form.data.alertType,
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone: form.data.phone,
						address: form.data.address,
						description: form.data.description
					}
				}
			});

			return {
				form,
				success: true
			};
		} catch (err) {
			console.error(err);

			return fail(500, {
				form,
				message: 'Erreur serveur'
			});
		}
	}
};
