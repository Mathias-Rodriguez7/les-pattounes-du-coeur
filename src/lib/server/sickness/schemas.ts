import { SicknessStatus } from '@prisma/client';
import { z } from 'zod';

const sicknessStatusEnum = z
	.enum(Object.values(SicknessStatus) as [string, ...string[]])
	.transform((val) => val as SicknessStatus);

const sicknessFieldsSchema = {
	name: z.string().max(255),
	description: z.string().optional(),
	treatment: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	status: sicknessStatusEnum
};

const validateDateRange = (data: { startDate?: Date; endDate?: Date }, ctx: z.RefinementCtx) => {
	if (data.startDate && data.endDate && data.endDate < data.startDate) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['endDate'],
			message: 'La date de fin doit être postérieure ou égale à la date de début'
		});
	}
};

export const createSicknessSchema = z
	.object({
		catId: z.string().uuid(),
		...sicknessFieldsSchema,
		status: sicknessStatusEnum.default(SicknessStatus.ACTIVE)
	})
	.superRefine(validateDateRange);

export const updateSicknessSchema = z
	.object(sicknessFieldsSchema)
	.partial()
	.superRefine(validateDateRange);

export type CreateSicknessInput = z.infer<typeof createSicknessSchema>;
export type UpdateSicknessInput = z.infer<typeof updateSicknessSchema>;
