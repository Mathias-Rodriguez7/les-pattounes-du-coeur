import prisma from '$lib/server/prisma';
import {
	createCatSchema,
	updateCatSchema,
	type CreateCatInput,
	type UpdateCatInput
} from '../../schemas/cat';

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
	if (!locals.user || !['ADMIN', 'MANAGER'].includes(locals.user.role)) {
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
				errors: result.error.flatten().fieldErrors
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
	if (!locals.user || !['ADMIN', 'MANAGER'].includes(locals.user.role)) {
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
				errors: result.error.flatten().fieldErrors
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
