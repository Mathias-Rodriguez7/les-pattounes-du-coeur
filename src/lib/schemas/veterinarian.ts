import { z } from 'zod';
import { VeterinarianCategory } from '@prisma/client';
import { booleanField } from '#lib/schemas/fields.ts';

// Un champ vide envoyé par un formulaire ('') devient null
const emptyToNull = (value: unknown) => (value === '' ? null : value);
const optionalText = (max: number) =>
	z.preprocess(emptyToNull, z.string().trim().max(max, `Max ${max} caractères`).nullish());

export const veterinarianSchema = z.object({
	category: z.enum(VeterinarianCategory, 'Choisissez une catégorie'),
	name: z.string().trim().min(1, 'Le nom de la clinique est obligatoire').max(255),
	doctors: optionalText(255),
	specialty: optionalText(255),
	area: optionalText(100),
	address: optionalText(255),
	phone: optionalText(30),
	website: z.preprocess(emptyToNull, z.url('Adresse web invalide').max(255).nullish()),
	hours: optionalText(2000),
	notes: optionalText(2000),
	// Partenaire de la mairie de Montpellier (stérilisation des chats libres)
	isCityPartner: booleanField().default(false)
});

export const updateVeterinarianSchema = veterinarianSchema.extend({
	veterinarianId: z.uuid('Vétérinaire invalide')
});

export const setVeterinarianActiveSchema = z.object({
	veterinarianId: z.uuid('Vétérinaire invalide'),
	isActive: z.enum(['true', 'false']).transform((value) => value === 'true')
});

export type VeterinarianInput = z.infer<typeof veterinarianSchema>;
