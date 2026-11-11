// src/lib/types/catProfile.ts
import type { Prisma } from '@prisma/client';

/**
 * Ce qu'il faut pour afficher le profil d'un chat : identité, compatibilité, santé, maladies.
 * Partagé par la fiche du chat et le panneau d'une demande d'adoption.
 * (Fichier à part : types/cat.ts et types/form.ts l'utilisent tous les deux.)
 */
export const catProfileSelect = {
	name: true,
	sex: true,
	birthDate: true,
	isOkDog: true,
	isOkCat: true,
	isOkChild: true,
	isOutside: true,
	vaccinate: true,
	isFivTest: true,
	isDeworming: true,
	isSterilize: true,
	isAlreadySterilized: true,
	isIdentify: true,
	chipId: true,
	// Les maladies qui comptent pour un adoptant : à vie ou en traitement (pas les guéries)
	sicknesses: {
		where: { status: { not: 'RESOLVED' } },
		orderBy: { name: 'asc' },
		select: { id: true, name: true, status: true }
	}
} satisfies Prisma.CatSelect;

export type CatProfile = Prisma.CatGetPayload<{ select: typeof catProfileSelect }>;
