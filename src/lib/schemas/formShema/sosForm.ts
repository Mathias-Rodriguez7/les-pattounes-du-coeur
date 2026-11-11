import { z } from 'zod';
import { emailField } from '#lib/schemas/fields.ts';
import { SOS_ALERT_TYPES, type SosAlertType } from '#lib/constants/sos.ts';

// Les valeurs autorisées viennent des constantes : impossible qu'elles divergent du formulaire
const alertTypes = Object.keys(SOS_ALERT_TYPES) as [SosAlertType, ...SosAlertType[]];

export const sosFormSchema = z.object({
	alertType: z.enum(alertTypes, 'Choisissez un type de signalement'),
	lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
	firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: emailField("L'email n'est pas valide"),
	description: z.string().trim().min(10, 'Décrivez la situation').max(5000, 'Max 5 000 caractères'),
	address: z.string().trim().min(5, "L'adresse est requise").max(500),
	// Anti-spam (« pot de miel ») : champ invisible pour les humains, rempli par les robots
	website: z.string().optional()
});
