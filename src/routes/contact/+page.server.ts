import { fail } from '@sveltejs/kit';

import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { sosFormSchema } from '$lib/schema/sosForm';
import { hostFormSchema } from '$lib/schema/hostForm';
import { volunteerFormSchema } from '$lib/schema/volunteerForm';

import { prisma } from '$lib/server/prisma';

import { FormStatus, FormType } from '@prisma/client';

//
// 🧠 LOAD (initialisation des forms)
//
export const load = async () => {
	return {
		sosForm: await superValidate(zod4(sosFormSchema)),
		hostForm: await superValidate(zod4(hostFormSchema)),
		volunteerForm: await superValidate(zod4(volunteerFormSchema))
	};
};

//
// 🚨 ACTIONS
//
export const actions = {
	//
	// SOS
	//
	sos: async ({ request }) => {
		const form = await superValidate(request, zod4(sosFormSchema));

		console.log('🚨 SOS DATA:', form.data);

		if (!form.valid) {
			console.log('❌ SOS INVALID', form.errors);
			return fail(400, { sosForm: form });
		}

		try {
			const created = await prisma.form.create({
				data: {
					type: FormType.ALERT,
					status: FormStatus.PENDING,
					email: form.data.email,
					data: form.data
				}
			});

			console.log('✅ SOS CREATED:', created);
		} catch (e) {
			console.error('🔥 SOS PRISMA ERROR:', e);
		}

		return { sosForm: form };
	},

	//
	// 🏠 HOST
	//
	host: async ({ request }) => {
		const form = await superValidate(request, zod4(hostFormSchema));

		console.log('🏠 HOST DATA:', form.data);

		if (!form.valid) {
			console.log('❌ HOST INVALID', form.errors);
			return fail(400, { hostForm: form });
		}

		try {
			const created = await prisma.form.create({
				data: {
					type: FormType.HOST,
					status: FormStatus.PENDING,
					email: form.data.email,
					data: form.data
				}
			});

			console.log('✅ HOST CREATED:', created);
		} catch (e) {
			console.error('🔥 HOST PRISMA ERROR:', e);
		}

		return { hostForm: form };
	},

	//
	// 🤝 VOLUNTEER
	//
	volunteer: async ({ request }) => {
		const raw = await request.clone().formData();

		console.log('🔥 RAW FORM:');
		console.log(Object.fromEntries(raw));

		const form = await superValidate(request, zod4(volunteerFormSchema));

		console.log('🔥 VALID:', form.valid);
		console.log('🔥 DATA:', form.data);
		console.log('🔥 ERRORS:', form.errors);

		if (!form.valid) {
			return fail(400, { volunteerForm: form });
		}

		try {
			const created = await prisma.form.create({
				data: {
					type: FormType.VOLUNTEER,
					status: FormStatus.PENDING,
					email: form.data.email,

					// 🔥 TEMP FIX DEBUG
					data: JSON.parse(JSON.stringify(form.data))
				}
			});

			console.log('✅ CREATED:', created);
		} catch (e) {
			console.error('🔥 PRISMA ERROR FULL:', e);
			return fail(500, { volunteerForm: form });
		}

		return { volunteerForm: form };
	}
};
