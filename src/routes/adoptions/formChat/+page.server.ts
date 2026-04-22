import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { adoptionFormSchema } from '$lib/schema/adoptionForm';

export const load = async () => {
	const form = await superValidate(zod4(adoptionFormSchema));

	return {
		form
	};
};
