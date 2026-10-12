import { z } from 'zod';
import { NewsType } from '@prisma/client';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const newsTypeEnum = z
	.enum(Object.values(NewsType) as [string, ...string[]])
	.transform((val) => val as NewsType);

// ✅ Schéma de création
export const createNewsSchema = z.object({
	title: z.string().min(1, 'Le titre est obligatoire').max(255, 'Max 255 caractères'),
	type: newsTypeEnum,
	content: z.string().optional().nullable(),
	mediaUrl: z.string().optional().nullable(),
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
