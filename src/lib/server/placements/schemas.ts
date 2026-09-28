import { z } from 'zod';
import { PlacementType, ColabActivity } from '@prisma/client';

const placementTypeEnum = z
	.enum(Object.values(PlacementType) as [string, ...string[]])
	.transform((val) => val as PlacementType);

const colabActivityEnum = z
	.enum(Object.values(ColabActivity) as [string, ...string[]])
	.transform((val) => val as ColabActivity);

export const createPlacementSchema = z
	.object({
		catId: z.string().uuid('catId invalide'),
		hostId: z.string().uuid('hostId invalide'),
		type: placementTypeEnum,
		status: colabActivityEnum,
		startedDate: z.coerce.date().nullable().optional(),
		endedDate: z.coerce.date().nullable().optional(),
		notes: z.string().optional().default('')
	})
	.refine(
		(data) => {
			if (data.startedDate && data.endedDate) {
				return data.endedDate >= data.startedDate;
			}
			return true;
		},
		{
			message: 'La date de fin doit être postérieure à la date de début',
			path: ['endedDate']
		}
	);

export const updatePlacementSchema = z
	.object({
		hostId: z.string().uuid('hostId invalide').optional(),
		type: placementTypeEnum.optional(),
		status: colabActivityEnum.optional(),
		startedDate: z.coerce.date().nullable().optional(),
		endedDate: z.coerce.date().nullable().optional(),
		notes: z.string().optional()
	})
	.refine(
		(data) => {
			if (data.startedDate && data.endedDate) {
				return data.endedDate >= data.startedDate;
			}
			return true;
		},
		{
			message: 'La date de fin doit être postérieure à la date de début',
			path: ['endedDate']
		}
	);

export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
