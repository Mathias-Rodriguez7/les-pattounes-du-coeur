import { z } from 'zod';
import { InfoDocumentCategory } from '@prisma/client';

const emptyToNull = (value: unknown) => (value === '' ? null : value);

// Les champs communs à l'ajout et à la modification
const fields = {
	title: z.string().trim().min(1, 'Le titre est obligatoire').max(255, 'Max 255 caractères'),
	description: z.preprocess(
		emptyToNull,
		z.string().trim().max(2000, 'Max 2 000 caractères').nullish()
	),
	category: z.enum(InfoDocumentCategory)
};

export const createInfoDocumentSchema = z.object({
	...fields,
	// Ajout : le fichier est obligatoire
	mediaStorageKey: z.string().min(1, 'Le fichier est obligatoire').max(500),
	mediaOriginalName: z.preprocess(emptyToNull, z.string().max(255).nullish())
});

export const updateInfoDocumentSchema = z.object({
	id: z.string().uuid(),
	...fields,
	// Modification : un nouveau fichier est facultatif (sinon, on garde l'actuel)
	mediaStorageKey: z.preprocess(emptyToNull, z.string().max(500).nullish()),
	mediaOriginalName: z.preprocess(emptyToNull, z.string().max(255).nullish())
});
