import { z } from 'zod';
import { NewsType } from '@prisma/client';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const newsTypeEnum = z
	.enum(Object.values(NewsType) as [string, ...string[]])
	.transform((val) => val as NewsType);

// Lien web (http/https) ou fichier du site (/…). Refuse javascript:, data:, //autre-site…
const mediaUrlField = z
	.string()
	.trim()
	.refine(
		(v) => v === '' || /^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v),
		'Le lien doit commencer par http(s):// ou /'
	)
	.optional()
	.nullable();

export const createNewsSchema = z.object({
	title: z.string().min(1, 'Le titre est obligatoire').max(255, 'Max 255 caractères'),
	type: newsTypeEnum,
	content: z.string().optional().nullable(),
	mediaUrl: mediaUrlField,
	catIds: z.array(z.string().uuid()).default([])
});

// ✅ Schéma de mise à jour (tout optionnel sauf l'ID)
export const updateNewsSchema = createNewsSchema.partial().extend({
	newsId: z.string().uuid('ID invalide')
});

// ✅ Schéma de suppression
export const deleteNewsSchema = z.object({
	newsId: z.string().uuid('ID invalide')
});

// ✅ Types TypeScript générés
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type DeleteNewsInput = z.infer<typeof deleteNewsSchema>;
