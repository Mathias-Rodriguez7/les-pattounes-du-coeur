import { z } from 'zod';

//
// STEP 1 — INFORMATIONS
//

export const colabStep1Schema = z.object({
	firstName: z.string().min(1, 'Le prénom est obligatoire'),

	lastName: z.string().min(1, 'Le nom est obligatoire'),

	companyName: z.string().optional(),

	email: z.email('Email invalide'),

	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide')
});

//
// STEP 2 — PARTENARIAT
//

export const colabStep2Schema = z.object({
	presentation: z.string().min(20, 'Veuillez présenter votre activité ou votre projet'),

	partnershipProposal: z.string().min(20, 'Veuillez décrire votre proposition de partenariat')
});

//
// GLOBAL SCHEMA
//

export const colabForm = colabStep1Schema.extend(colabStep2Schema.shape);

//
// TYPES
//

export type ColabForm = typeof colabForm;

export type ColabFormData = z.infer<typeof colabForm>;
