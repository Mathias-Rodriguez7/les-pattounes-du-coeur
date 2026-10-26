import prisma from '$lib/server/prisma';
import type { CreateAdoptionInput } from '$lib/schemas/adoption';
import { CatStatus, FormStatus } from '@prisma/client';

export async function createAdoption(input: CreateAdoptionInput) {
	return prisma.$transaction(async (tx) => {
		// 1. Vérifier que le chat est disponible
		const cat = await tx.cat.findUnique({
			where: { id: input.catId },
			select: { id: true, status: true, name: true }
		});

		if (!cat) throw new Error('Chat introuvable');
		if (cat.status !== CatStatus.AVAILABLE) {
			throw new Error(`Le chat ${cat.name} n'est plus disponible`);
		}

		// 2. Vérifier qu'il n'a pas déjà une adoption (contrainte @@unique([catId]))
		const existingAdoption = await tx.adoption.findUnique({
			where: { catId: input.catId }
		});
		if (existingAdoption) throw new Error('Ce chat a déjà une adoption');

		// 3. Créer ou mettre à jour le profil (upsert sur l'email)
		const profil = await tx.profil.upsert({
			where: { email: input.email },
			update: {
				firstName: input.firstName,
				lastName: input.lastName,
				phone: input.phone,
				address: input.address,
				city: input.city,
				postalCode: input.postalCode,
				district: input.district ?? undefined,
				birthDate: input.birthDate ?? undefined
			},
			create: {
				email: input.email,
				firstName: input.firstName,
				lastName: input.lastName,
				phone: input.phone,
				address: input.address,
				city: input.city,
				postalCode: input.postalCode,
				district: input.district ?? null,
				birthDate: input.birthDate ?? null
			}
		});

		// 4. Créer l'adoption
		const adoption = await tx.adoption.create({
			data: {
				catId: input.catId,
				profilId: profil.id
			}
		});

		// 5. Passer le chat en ADOPTED
		await tx.cat.update({
			where: { id: input.catId },
			data: { status: CatStatus.ADOPTED }
		});

		// 6. Clôturer le formulaire
		await tx.form.update({
			where: { id: input.formId },
			data: { status: FormStatus.APPROVED } // adapte à ton enum
		});

		return adoption;
	});
}
