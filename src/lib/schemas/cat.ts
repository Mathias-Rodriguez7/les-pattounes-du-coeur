import { z } from 'zod';
import { SexCat, CatStatus, HairLength, Vaccinate } from '@prisma/client';

const sexEnum = z
	.enum(Object.values(SexCat) as [string, ...string[]])
	.transform((val) => val as SexCat);

const catStatusEnum = z
	.enum(Object.values(CatStatus) as [string, ...string[]])
	.transform((val) => val as CatStatus);

const hairLengthEnum = z
	.enum(Object.values(HairLength) as [string, ...string[]])
	.transform((val) => val as HairLength);

const vaccinateEnum = z
	.enum(Object.values(Vaccinate) as [string, ...string[]])
	.transform((val) => val as Vaccinate);

// ✅ Validation stricte du catNumber : C + AA(01-99) + MM(01-12) + NNN(001-999)
const catNumberRegex = /^C([0-9][1-9]|[1-9]0)(0[1-9]|1[0-2])(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$/;

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

// ✅ Convertir les strings en booleans
const stringToBoolean = z.union([z.boolean(), z.string()]).pipe(z.coerce.boolean()).optional();

export const createCatSchema = z.object({
	catNumber: z
		.string()
		.min(1, 'Le numéro de suivi est obligatoire')
		.regex(catNumberRegex, 'Format attendu: C + JJ + MM + NNN (ex: C2509026)'),

	name: z.string().trim().optional().nullable(),
	sex: sexEnum,
	birthDate: stringToDate,
	status: catStatusEnum,

	color: z.string().trim().optional().nullable(),
	hairLength: hairLengthEnum,
	origin: z.string().trim().optional().nullable(),

	// Compatibilités
	isOkDog: stringToBoolean.default(false),
	isOkCat: stringToBoolean.default(false),
	isOkChild: stringToBoolean.default(false),
	isOutside: stringToBoolean.default(false),

	// Santé
	vaccinate: vaccinateEnum,
	isFivTest: stringToBoolean.default(false),
	isDeworming: stringToBoolean.default(false),
	isSterilize: stringToBoolean.default(false),
	isAlreadySterilized: stringToBoolean.default(false),
	isIdentify: stringToBoolean.default(false),
	chipId: z.string().trim().optional().nullable(),

	// Visibilité
	isVisible: stringToBoolean.default(false),

	description: z.string().trim().optional().nullable()
});

export const updateCatSchema = createCatSchema.partial().extend({
	catNumber: createCatSchema.shape.catNumber // catNumber reste obligatoire même en update
});

export type CreateCatInput = z.infer<typeof createCatSchema>;
export type UpdateCatInput = z.infer<typeof updateCatSchema>;
