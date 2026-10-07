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
		startDate: z.coerce.date().nullable().optional(),
		endDate: z.coerce.date().nullable().optional()
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
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
		startDate: z.coerce.date().nullable().optional(),
		endDate: z.coerce.date().nullable().optional()
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
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
