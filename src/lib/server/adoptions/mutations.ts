import prisma from '$lib/server/prisma';
import type { CreateAdoptionInput } from '$lib/schemas/adoption';
import { CatStatus, FormStatus } from '@prisma/client';
import { isEmailBlacklisted } from '../accountStatus';
import { addMonths } from '$lib/utils/date';
import { ADOPTION_TRIAL_MONTHS } from '$lib/constants/adoption';
import type { MediaData } from '$lib/server/media/mutations';

/** La note ajoutée aux autres demandes du chat, quand il est adopté par une autre famille */
const REJECTED_NOTE = 'Chat adopté par une autre famille.';

export async function createAdoption(input: CreateAdoptionInput, contract: MediaData) {
	return prisma.$transaction(async (tx) => {
		// 0. Vérifier que l'adoptant n'est pas blacklisté
		if (await isEmailBlacklisted(input.email, tx)) {
			throw new Error('Cet adoptant est sur la liste noire');
		}
		// 1. Vérifier que le chat est disponible
		const cat = await tx.cat.findUnique({
			where: { id: input.catId },
			select: { id: true, status: true, name: true }
		});

		if (!cat) throw new Error('Chat introuvable');
		if (cat.status !== CatStatus.AVAILABLE) {
			throw new Error(`Le chat ${cat.name} n'est plus disponible`);
		}

		// 2. Vérifier qu'il n'a pas déjà une adoption en cours (essai ou définitive)
		const existingAdoption = await tx.adoption.findFirst({
			where: { catId: input.catId, status: { in: ['TRIAL', 'FINAL'] } }
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

		// 4. Créer l'adoption : elle commence TOUJOURS par une période d'essai
		const adoption = await tx.adoption.create({
			data: {
				catId: input.catId,
				profilId: profil.id,
				trialEndsAt: addMonths(new Date(), ADOPTION_TRIAL_MONTHS)
			}
		});

		// 5. Passer le chat en ADOPTED
		await tx.cat.update({
			where: { id: input.catId },
			data: { status: CatStatus.ADOPTED }
		});

		const today = new Date();

		// 6. Le contrat, lié au chat ET à l'adoption, créé dans la MÊME transaction :
		//    jamais d'adoption sans contrat, ni de contrat sans adoption
		await tx.catDocument.create({
			data: {
				cat: { connect: { id: input.catId } },
				adoption: { connect: { id: adoption.id } },
				kind: 'ADOPTION_CONTRACT',
				date: today,
				media: { create: contract }
			}
		});

		// 7. Le chat quitte sa famille d'accueil
		await tx.placement.updateMany({
			where: { catId: input.catId, status: { in: ['ACTIVE', 'BREAK'] } },
			data: { status: 'STOP', endDate: today }
		});

		// 8. La demande est acceptée, et garde le chat adopté (utile pour une demande libre)
		await tx.form.update({
			where: { id: input.formId },
			data: { status: FormStatus.APPROVED, catId: input.catId }
		});

		// 9. Les autres demandes en attente pour ce chat sont refusées, avec la raison
		const otherRequests = await tx.form.findMany({
			where: { catId: input.catId, status: 'PENDING', id: { not: input.formId } },
			select: { id: true, notes: true }
		});
		for (const other of otherRequests) {
			await tx.form.update({
				where: { id: other.id },
				data: {
					status: FormStatus.REJECTED,
					// On AJOUTE la raison aux notes existantes, sans les effacer
					notes: [other.notes, REJECTED_NOTE].filter(Boolean).join('\n')
				}
			});
		}

		return { adoption, rejectedCount: otherRequests.length };
	});
}
