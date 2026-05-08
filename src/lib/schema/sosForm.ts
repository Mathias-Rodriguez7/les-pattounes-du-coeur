import { z } from 'zod';

export const sosFormSchema = z.object({
	alertType: z.enum(['abandon', 'feeding_spot', 'found', 'danger', 'other'] as const),
	lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
	firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email("L'email n'est pas valide"),
	description: z.string().min(10, 'Décrivez la situation'),
	address: z.string().min(5, "L'adresse est requise")
});
