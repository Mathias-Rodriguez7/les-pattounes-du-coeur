import { z } from 'zod';
import { CatDocumentKind } from '@prisma/client';

// Un champ vide envoyé par un formulaire ('') devient null
const emptyToNull = (value: unknown) => (value === '' ? null : value);

export const createCatDocumentSchema = z.object({
	catId: z.uuid(),
	kind: z.enum(CatDocumentKind),
	// Format "AAAA-MM-JJ", celui que renvoie le DatePicker
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
	note: z.preprocess(emptyToNull, z.string().trim().max(2000, 'Max 2 000 caractères').nullish()),
	adoptionId: z.preprocess(emptyToNull, z.string().uuid().nullish()),
	mediaStorageKey: z.string().min(1, 'Le document PDF est obligatoire').max(500),
	mediaOriginalName: z.preprocess(emptyToNull, z.string().max(255).nullish())
});

export type CreateCatDocumentInput = z.infer<typeof createCatDocumentSchema>;
