import prisma from '#lib/server/prisma.ts';
import {
	createCatSchema,
	updateCatSchema,
	type CreateCatInput,
	type UpdateCatInput
} from '../../schemas/cat';
import { z } from 'zod';
import { deleteFiles } from '#lib/server/storage.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

const CAT_FIELDS = [
	'name',
	'sex',
	'birthDate',
	'status',
	'color',
	'hairLength',
	'origin',
	'isOkDog',
	'isOkCat',
	'isOkChild',
	'isOutside',
	'vaccinate',
	'isFivTest',
	'isDeworming',
	'isSterilize',
	'isAlreadySterilized',
	'isIdentify',
	'chipId',
	'isVisible',
	'description'
] as const;

function convertFormData(formData: FormData): Record<string, string | null> {
	const data: Record<string, string | null> = {};
	for (const [key, value] of formData.entries()) {
		data[key] = (value as string) || null;
	}
	return data;
}

async function checkCatNumberUniqueness(catNumber: string, excludeId?: string): Promise<boolean> {
	const existing = await prisma.cat.findFirst({ where: { catNumber } });
	return existing ? excludeId !== existing.id : false;
}

async function checkChipIdUniqueness(chipId: string, excludeId?: string): Promise<boolean> {
	const existing = await prisma.cat.findFirst({ where: { chipId } });
	return existing ? excludeId !== existing.id : false;
}

function buildCatData(data: CreateCatInput | UpdateCatInput) {
	return CAT_FIELDS.reduce(
		(acc, field) => {
			if (field in data && data[field as keyof typeof data] !== undefined) {
				acc[field] = data[field as keyof typeof data];
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}

export async function createCat({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !['ADMIN', 'MANAGER', 'COMMUNICATION'].includes(locals.user.role)) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		const result = createCatSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error)
			};
		}

		const validatedData: CreateCatInput = result.data;

		// 🔍 Unicité catNumber
		const catNumberExists = await checkCatNumberUniqueness(validatedData.catNumber);
		if (catNumberExists) {
			return {
				success: false,
				error: 'Ce numéro de suivi est déjà utilisé',
				errors: { catNumber: ['Numéro de suivi déjà utilisé'] }
			};
		}

		// 🔍 Unicité chipId (si renseigné)
		if (validatedData.chipId) {
			const chipIdExists = await checkChipIdUniqueness(validatedData.chipId);
			if (chipIdExists) {
				return {
					success: false,
					error: 'Ce numéro de puce est déjà utilisé',
					errors: { chipId: ['Numéro de puce déjà utilisé'] }
				};
			}
		}

		const newCat = await prisma.cat.create({
			data: {
				catNumber: validatedData.catNumber,
				name: validatedData.name,
				sex: validatedData.sex,
				birthDate: validatedData.birthDate,
				status: validatedData.status,
				color: validatedData.color,
				hairLength: validatedData.hairLength,
				origin: validatedData.origin,
				isOkDog: validatedData.isOkDog,
				isOkCat: validatedData.isOkCat,
				isOkChild: validatedData.isOkChild,
				isOutside: validatedData.isOutside,
				vaccinate: validatedData.vaccinate,
				isFivTest: validatedData.isFivTest,
				isDeworming: validatedData.isDeworming,
				isSterilize: validatedData.isSterilize,
				isAlreadySterilized: validatedData.isAlreadySterilized,
				isIdentify: validatedData.isIdentify,
				chipId: validatedData.chipId,
				isVisible: validatedData.isVisible,
				publishedAt: validatedData.isVisible ? new Date() : null,
				description: validatedData.description
			}
		});

		return {
			success: true,
			message: 'Chat créé avec succès',
			data: newCat,
			errors: {}
		};
	} catch (error) {
		console.error('Erreur création Cat:', error);
		return { success: false, error: 'Erreur lors de la création', errors: {} };
	}
}

export async function updateCat({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !['ADMIN', 'MANAGER', 'COMMUNICATION'].includes(locals.user.role)) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		const catId = data.catId as string;
		if (!catId) {
			return { success: false, error: 'ID du chat manquant', errors: {} };
		}

		const result = updateCatSchema.safeParse({ ...data, catId });

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error)
			};
		}

		const validatedData: UpdateCatInput = result.data;

		const existingCat = await prisma.cat.findUnique({ where: { id: catId } });
		if (!existingCat) {
			return { success: false, error: 'Chat non trouvé', errors: {} };
		}

		// 🔍 Unicités seulement si modifiées
		const catNumberChanged =
			validatedData.catNumber && validatedData.catNumber !== existingCat.catNumber;
		const chipIdChanged = validatedData.chipId && validatedData.chipId !== existingCat.chipId;

		if (catNumberChanged || chipIdChanged) {
			const [catNumberExists, chipIdExists] = await Promise.all([
				catNumberChanged
					? checkCatNumberUniqueness(validatedData.catNumber!, catId)
					: Promise.resolve(false),
				chipIdChanged ? checkChipIdUniqueness(validatedData.chipId!, catId) : Promise.resolve(false)
			]);

			if (catNumberExists) {
				return {
					success: false,
					error: 'Ce numéro de suivi est déjà utilisé',
					errors: { catNumber: ['Numéro de suivi déjà utilisé'] }
				};
			}

			if (chipIdExists) {
				return {
					success: false,
					error: 'Ce numéro de puce est déjà utilisé',
					errors: { chipId: ['Numéro de puce déjà utilisé'] }
				};
			}
		}

		const catData = buildCatData(validatedData);
		// catNumber toujours inclus (obligatoire en update)
		catData.catNumber = validatedData.catNumber;

		// 🆕 Passage de « masqué » à « visible » : le chat est (re)publié maintenant.
		// Dans tous les autres cas, on garde la date existante.
		const becomesVisible = !existingCat.isVisible && validatedData.isVisible === true;
		if (becomesVisible) {
			catData.publishedAt = new Date();
		}

		const updatedCat = await prisma.cat.update({
			where: { id: catId },
			data: catData
		});

		return {
			success: true,
			message: 'Chat mis à jour avec succès',
			data: updatedCat
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE CAT:', error);
		return { success: false, error: 'Erreur lors de la mise à jour du chat', errors: {} };
	}
}

// ==========================================
// DELETE - Supprimer un chat (ADMIN uniquement)
// Sert à corriger une erreur de saisie : un chat qui a une histoire
// (adoption, documents légaux) change de statut au lieu d'être supprimé.
// ==========================================
export async function deleteCat({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!hasAdminRole(locals.user)) {
		return { success: false, error: 'Non autorisé' };
	}

	const formData = await request.formData();
	const parsedId = z.string().uuid().safeParse(formData.get('catId'));
	if (!parsedId.success) return { success: false, error: 'Chat invalide' };
	const catId = parsedId.data;

	// Tout ce qu'il faudra nettoyer sur S3, lu AVANT de supprimer
	const cat = await prisma.cat.findUnique({
		where: { id: catId },
		select: {
			_count: { select: { adoptions: true, documents: true } },
			media: { select: { file: { select: { id: true, storageKey: true, isPrivate: true } } } },
			documents: { select: { media: { select: { id: true, storageKey: true, isPrivate: true } } } },
			cares: {
				select: {
					documents: {
						select: { media: { select: { id: true, storageKey: true, isPrivate: true } } }
					}
				}
			}
		}
	});

	if (!cat) return { success: false, error: 'Chat introuvable' };

	// 🛡️ Garde-fou : on ne détruit pas des preuves légales
	if (cat._count.adoptions > 0 || cat._count.documents > 0) {
		return {
			success: false,
			error:
				'Ce chat a une adoption ou des documents (abandon, contrat…) : il ne peut pas être supprimé. Changez plutôt son statut.'
		};
	}

	// Lignes Media (documents et soins) + fichiers de la galerie
	const mediaRows = [
		...cat.media.map((m) => m.file),
		...cat.documents.map((d) => d.media),
		...cat.cares.flatMap((care) => care.documents.map((d) => d.media))
	];

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Ce qui n'a pas de cascade et bloquerait la suppression
			await tx.newsCat.deleteMany({ where: { catId } });
			await tx.catVolunteer.deleteMany({ where: { catId } });
			await tx.placement.deleteMany({ where: { catId } });
			await tx.adoption.deleteMany({ where: { catId } });
			await tx.care.deleteMany({ where: { catId } }); // + CareDocument (cascade)

			// 2. Le chat (+ maladies, galerie et CatDocument en cascade)
			await tx.cat.delete({ where: { id: catId } });

			// 3. Les lignes Media qui ne servent plus à rien
			if (mediaRows.length > 0) {
				await tx.media.deleteMany({ where: { id: { in: mediaRows.map((m) => m.id) } } });
			}
		});
	} catch (error) {
		console.error('Erreur suppression chat:', error);
		return { success: false, error: 'Erreur lors de la suppression du chat' };
	}

	// 4. Les fichiers, une fois la base à jour
	await deleteFiles([...mediaRows.map(({ storageKey, isPrivate }) => ({ storageKey, isPrivate }))]);

	return { success: true, message: 'Chat supprimé' };
}
