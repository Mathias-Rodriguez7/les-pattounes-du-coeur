import prisma from '#lib/server/prisma.ts';
import type { CancelAdoptionInput, CreateAdoptionInput } from '#lib/schemas/adoption.ts';
import { CatStatus, FormStatus } from '@prisma/client';
import { isEmailBlacklisted } from '../accountStatus';
import { addMonths, formatDateNum, todayDateOnly } from '#lib/utils/date.ts';
import type { MediaData } from '#lib/server/media/mutations.ts';
import { deleteFiles } from '#lib/server/storage.ts';
import { ADOPTABLE_STATUSES, ADOPTION_TRIAL_MONTHS } from '#lib/constants/adoption.ts';

/** L'adoptant est sur liste noire et personne n'a autorisé l'adoption : l'action affiche la raison */
export class BlacklistedAdopterError extends Error {
	constructor() {
		super('Cet adoptant est sur la liste noire');
	}
}

/** La note ajoutée aux autres demandes du chat, quand il est adopté par une autre famille */
const REJECTED_NOTE = 'Chat adopté par une autre famille.';

/**
 * @param allowBlacklisted true seulement si une ADMIN a coché « J'ai pris connaissance de la liste
 *        noire » (vérifié par l'action) : l'adoption est alors permise, et tracée dans la demande.
 */
export async function createAdoption(
	input: CreateAdoptionInput,
	contract: MediaData,
	{ allowBlacklisted = false }: { allowBlacklisted?: boolean } = {}
) {
	return prisma.$transaction(async (tx) => {
		// 0. Adoptant sur liste noire : bloqué, sauf autorisation explicite d'une admin
		const isBlacklisted = await isEmailBlacklisted(input.email, tx);
		if (isBlacklisted && !allowBlacklisted) {
			throw new BlacklistedAdopterError();
		}
		// 1. Vérifier que le chat est disponible
		const cat = await tx.cat.findUnique({
			where: { id: input.catId },
			select: { id: true, status: true, name: true }
		});

		if (!cat) throw new Error('Chat introuvable');
		if (!ADOPTABLE_STATUSES.includes(cat.status)) {
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

		// 8. La demande liée (s'il y en a une) est acceptée, et garde le chat adopté.
		//    Liste noire passée outre : on le note dans la demande (trace de la décision)
		if (input.formId) {
			const request = await tx.form.findUnique({
				where: { id: input.formId },
				select: { notes: true }
			});
			const today = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
			const overrideNote = isBlacklisted
				? `Adoption autorisée le ${today} malgré la liste noire (décision admin).`
				: null;
			await tx.form.update({
				where: { id: input.formId },
				data: {
					status: FormStatus.APPROVED,
					catId: input.catId,
					...(overrideNote && {
						notes: [request?.notes, overrideNote].filter(Boolean).join('\n')
					})
				}
			});
		}

		// 9. Les autres demandes en attente pour ce chat sont refusées, avec la raison
		const otherRequests = await tx.form.findMany({
			where: {
				catId: input.catId,
				status: 'PENDING',
				...(input.formId && { id: { not: input.formId } })
			},
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

/**
 * Fin de la période d'essai : l'adoption devient définitive.
 * - uniquement depuis TRIAL, et pas avant trialEndsAt ;
 * - la bénévole a vérifié la stérilisation : la fiche du chat est mise à jour si besoin ;
 * - ménage de la galerie : on garde UNE photo (la principale, sinon la plus ancienne),
 *   on supprime les autres photos et les vidéos. Les PDF (contrat, documents, soins) restent.
 */
export async function finalizeAdoption(adoptionId: string) {
	const today = todayDateOnly();

	const removedFiles = await prisma.$transaction(async (tx) => {
		const adoption = await tx.adoption.findUnique({
			where: { id: adoptionId },
			select: {
				status: true,
				trialEndsAt: true,
				catId: true,
				cat: { select: { isSterilize: true, isAlreadySterilized: true } }
			}
		});

		if (!adoption) throw new Error('Adoption introuvable');
		if (adoption.status !== 'TRIAL') {
			throw new Error("Cette adoption n'est pas en période d'essai");
		}
		if (adoption.trialEndsAt > today) {
			throw new Error(
				`La période d'essai se termine le ${formatDateNum(adoption.trialEndsAt)} : finalisation impossible avant`
			);
		}

		// 1. L'adoption devient définitive
		await tx.adoption.update({
			where: { id: adoptionId },
			data: { status: 'FINAL', finalizedAt: today }
		});

		// 2. Stérilisation vérifiée : la fiche du chat le reflète
		if (!adoption.cat.isSterilize && !adoption.cat.isAlreadySterilized) {
			await tx.cat.update({ where: { id: adoption.catId }, data: { isSterilize: true } });
		}

		// 3. Ménage de la galerie
		const gallery = await tx.mediaCat.findMany({
			where: { catId: adoption.catId },
			orderBy: { createdAt: 'asc' },
			select: {
				id: true,
				isPrimary: true,
				file: { select: { id: true, type: true, storageKey: true, isPrivate: true } }
			}
		});

		const keep =
			gallery.find((m) => m.isPrimary && m.file.type === 'IMAGE') ??
			gallery.find((m) => m.file.type === 'IMAGE');
		const toRemove = gallery.filter((m) => m.id !== keep?.id);

		// La photo gardée devient la principale (si elle ne l'était pas)
		if (keep && !keep.isPrimary) {
			await tx.mediaCat.update({ where: { id: keep.id }, data: { isPrimary: true } });
		}

		if (toRemove.length > 0) {
			// MediaCat d'abord (elle pointe vers Media), puis les lignes Media
			await tx.mediaCat.deleteMany({ where: { id: { in: toRemove.map((m) => m.id) } } });
			await tx.media.deleteMany({ where: { id: { in: toRemove.map((m) => m.file.id) } } });
		}

		return toRemove.map((m) => m.file);
	});

	// 4. Les fichiers sur S3, APRÈS la transaction : si elle échoue, rien n'est perdu.
	// Un échec ici ne doit pas annuler la finalisation (déjà enregistrée) : on le note.
	try {
		await deleteFiles(removedFiles.map(({ storageKey, isPrivate }) => ({ storageKey, isPrivate })));
	} catch (error) {
		console.error('finalizeAdoption : fichiers non supprimés sur S3', error);
	}

	return { removedCount: removedFiles.length };
}

/**
 * Annuler une adoption : le chat revient à l'association (pendant l'essai OU après, même définitive).
 * - l'adoption passe en CANCELLED, avec la date de retour et la raison (facultative) ;
 * - le chat repasse disponible ou en socialisation, au choix de la bénévole ;
 *   disponible ET visible : il est « republié » (publishedAt), pour revenir dans les News chats ;
 * - le document de retour (facultatif) est rangé avec le chat ET l'adoption.
 * Le chat n'a plus de famille d'accueil : la bénévole doit lui en trouver une (placement).
 */
export async function cancelAdoption(input: CancelAdoptionInput, returnDocument: MediaData | null) {
	const today = todayDateOnly();

	return prisma.$transaction(async (tx) => {
		const adoption = await tx.adoption.findUnique({
			where: { id: input.adoptionId },
			select: { status: true, catId: true, cat: { select: { isVisible: true } } }
		});

		if (!adoption) throw new Error('Adoption introuvable');
		if (adoption.status === 'CANCELLED') throw new Error('Cette adoption est déjà annulée');

		// 1. L'adoption est annulée, avec la date et la raison
		await tx.adoption.update({
			where: { id: input.adoptionId },
			data: { status: 'CANCELLED', endDate: today, cancelReason: input.reason ?? null }
		});

		// 2. Le chat revient : nouveau statut, et republication s'il est de nouveau adoptable
		const republish = input.catStatus === 'AVAILABLE' && adoption.cat.isVisible;
		await tx.cat.update({
			where: { id: adoption.catId },
			data: { status: input.catStatus, ...(republish && { publishedAt: new Date() }) }
		});

		// 3. Le document de retour, s'il y en a un
		if (returnDocument) {
			await tx.catDocument.create({
				data: {
					cat: { connect: { id: adoption.catId } },
					adoption: { connect: { id: input.adoptionId } },
					kind: 'ADOPTION_RETURN',
					date: today,
					note: input.reason ?? null,
					media: { create: returnDocument }
				}
			});
		}
	});
}
