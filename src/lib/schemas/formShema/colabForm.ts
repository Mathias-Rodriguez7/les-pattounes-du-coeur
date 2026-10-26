import { z } from 'zod';

//
// 🔧 Helpers
//

const optionalText = (min = 1, msg?: string) =>
	z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().trim().min(min, msg).optional()
	);

//
// STEP 1 — INFORMATIONS
//

export const colabStep1Schema = z.object({
	firstName: z.string().trim().min(1, 'Le prénom est obligatoire'),

	lastName: z.string().trim().min(1, 'Le nom est obligatoire'),

	companyName: optionalText(),

	email: z.email('Email invalide').trim(),

	phone: z
		.string()
		.trim()
		.regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide')
});

//
// STEP 2 — PARTENARIAT
//

export const colabStep2Schema = z.object({
	presentation: z.string().trim().min(20, 'Veuillez présenter votre activité ou votre projet'),

	partnershipProposal: z
		.string()
		.trim()
		.min(20, 'Veuillez décrire votre proposition de partenariat')
});

//
// GLOBAL SCHEMA
//

export const colabForm = colabStep1Schema.extend(colabStep2Schema.shape);

//
// TYPES
//

export type ColabFormData = z.infer<typeof colabForm>;

//
// UPDATE (admin)
//

export const updateColabSchema = colabForm.partial().extend({
	formId: z.string().uuid('ID invalide'),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	notes: optionalText(),
	assignedToId: z.string().uuid('ID invalide').nullish()
});

export type UpdateColabInput = z.infer<typeof updateColabSchema>;
