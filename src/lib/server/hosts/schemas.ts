import { z } from 'zod';
import {
	District,
	HostStatus,
	HostType,
	Space,
	Heal,
	Socialize,
	BabyFeeding,
	ColabActivity
} from '@prisma/client';

export const createHostSchema = z.object({
	// PROFIL
	firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
	lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
	email: z.string().email('Email invalide'),
	phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),
	address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
	city: z.string().default('Montpellier'),
	postalCode: z.string().default('34000'),
	district: z.nativeEnum(District).nullable().optional(),

	// HOST
	age: z.number().int().min(18, "L'âge minimum est 18 ans"),
	type: z.nativeEnum(HostType).nullable().optional(),
	job: z.string().min(2, 'Le métier doit contenir au moins 2 caractères'),
	status: z.nativeEnum(HostStatus).default(HostStatus.WAITING_VALIDATION),
	actif: z.nativeEnum(ColabActivity).default(ColabActivity.ACTIVE),
	additionalInformation: z.string().optional(),
	hasAnimalsAtHome: z.boolean().default(false),
	numberOfCatsAtHome: z.number().int().min(0).optional(),
	numberOfDogsAtHome: z.number().int().min(0).optional(),
	otherAnimalsAtHome: z.string().optional(),
	space: z.nativeEnum(Space),
	homeDescription: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
	presence: z.string(),
	outside: z.boolean().default(false),
	outsideDescription: z.string().optional(),
	isStockFeed: z.boolean().default(false),
	heal: z.nativeEnum(Heal),
	socialize: z.nativeEnum(Socialize),
	car: z.boolean().default(false),
	babyFeeding: z.nativeEnum(BabyFeeding)
});

export const updateHostSchema = createHostSchema.partial().extend({
	hostId: z.string().uuid('ID invalide')
});

export type CreateHostInput = z.infer<typeof createHostSchema>;
export type UpdateHostInput = z.infer<typeof updateHostSchema>;
