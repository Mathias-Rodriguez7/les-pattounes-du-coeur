import { fail, type RequestEvent } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import prisma from '#lib/server/prisma.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { canManageCat } from '#lib/server/permissions/cat.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import { FREE_CAT_STERILIZATION_REASON } from '#lib/constants/freeCat.ts';
import {
	convertFreeCatSchema,
	createFreeCatSchema,
	updateFreeCatSchema,
	type UpdateFreeCatInput
} from '#lib/schemas/freeCat.ts';

// Les chats libres : attrapés par une bénévole, stérilisés, puis relâchés.
// Un chat libre = un Cat au statut FREE + ses infos (FreeCatInfo). La stérilisation est un soin,
// la bénévole qui l'a attrapé est sa gestionnaire (CatVolunteer) : comme pour un chat asso.
// Les droits sont relus en base à chaque fois : jamais ceux envoyés par le navigateur.

/** Les rôles qui créent des chats (les mêmes que pour un chat asso) */
const CAT_CREATOR_ROLES = ['ADMIN', 'MANAGER', 'COMMUNICATION'];

async function readForm(request: Request) {
	return Object.fromEntries(await request.formData());
}

const validationError = (error: Parameters<typeof zodFieldErrors>[0]) =>
	fail(400, { success: false, error: 'Erreur de validation', errors: zodFieldErrors(error) });

const fieldError = (field: string, message: string) =>
	fail(400, { success: false, error: message, errors: { [field]: [message] } });

/** La puce OU le tatouage, selon ce qui a été choisi (l'autre est vidé) */
function identificationOf(
	data: Pick<UpdateFreeCatInput, 'identificationKind' | 'identificationNumber'>
) {
	const number = data.identificationKind ? (data.identificationNumber ?? null) : null;
	return {
		chipId: data.identificationKind === 'CHIP' ? number : null,
		tattooId: data.identificationKind === 'TATTOO' ? number : null,
		isIdentify: number !== null
	};
}

/** Le N° Pattounes, la puce et le tatouage sont uniques : le message dit lequel est pris */
async function findTakenIdentifier(
	ids: { catNumber?: string | null; chipId: string | null; tattooId: string | null },
	excludeCatId?: string
) {
	const checks = [
		{
			where: { catNumber: ids.catNumber },
			field: 'catNumber',
			message: 'Ce N° Pattounes est déjà utilisé'
		},
		{
			where: { chipId: ids.chipId },
			field: 'identificationNumber',
			message: 'Ce numéro de puce est déjà utilisé'
		},
		{
			where: { tattooId: ids.tattooId },
			field: 'identificationNumber',
			message: 'Ce tatouage est déjà utilisé'
		}
	];
	for (const check of checks) {
		if (!Object.values(check.where)[0]) continue;
		const existing = await prisma.cat.findFirst({
			where: { ...check.where, ...(excludeCatId ? { id: { not: excludeCatId } } : {}) },
			select: { id: true }
		});
		if (existing) return check;
	}
	return null;
}

/** Le lieu de relâchage, le payeur, le nourrisseur : ce que contient FreeCatInfo */
function freeInfoData(data: Omit<UpdateFreeCatInput, 'catId'>) {
	return {
		payer: data.payer,
		payerOther: data.payer === 'OTHER' ? (data.payerOther ?? null) : null,
		address: data.address,
		city: data.city,
		postalCode: data.postalCode ?? null,
		district: data.district ?? null,
		latitude: data.latitude ?? null,
		longitude: data.longitude ?? null,
		feederName: data.feederName,
		feederContact: data.feederContact,
		notes: data.notes ?? null
	} satisfies Omit<Prisma.FreeCatInfoUncheckedCreateInput, 'catId'>;
}

/** Créer un chat libre, sa stérilisation (un soin) et le lien avec sa gestionnaire : tout ou rien */
export async function createFreeCatAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user || !CAT_CREATOR_ROLES.includes(user.role)) {
		return fail(403, { success: false, error: 'Non autorisé' });
	}

	const parsed = createFreeCatSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);
	const data = parsed.data;

	// Une bénévole crée ses chats libres ; l'admin choisit la bénévole qui l'a attrapé
	const volunteerId = hasAdminRole(user) ? data.volunteerId : user.id;
	if (!volunteerId) {
		return fieldError('volunteerId', 'Choisissez la bénévole qui a attrapé le chat');
	}
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { id: true }
	});
	if (!volunteer) return fieldError('volunteerId', 'Bénévole introuvable');

	if (data.veterinarianId) {
		const vet = await prisma.veterinarian.count({ where: { id: data.veterinarianId } });
		if (vet === 0) return fieldError('veterinarianId', 'Vétérinaire introuvable');
	}

	const identification = identificationOf(data);
	const taken = await findTakenIdentifier({ catNumber: data.catNumber, ...identification });
	if (taken) return fieldError(taken.field, taken.message);

	try {
		const cat = await prisma.cat.create({
			data: {
				status: 'FREE',
				// Jamais affiché sur le site public
				isVisible: false,
				sex: data.sex,
				catNumber: data.catNumber ?? null,
				...identification,
				isSterilize: true,
				freeInfo: { create: freeInfoData(data) },
				cares: {
					create: {
						type: 'STERILIZE',
						date: new Date(data.sterilizedAt),
						reason: FREE_CAT_STERILIZATION_REASON,
						veterinarianId: data.veterinarianId ?? null,
						veterinary: data.veterinarianId ? null : (data.veterinary ?? null)
					}
				},
				volunteers: { create: { volunteerId } }
			},
			select: { id: true }
		});
		return { success: true, message: 'Chat libre enregistré', catId: cat.id };
	} catch (error) {
		console.error('Erreur création chat libre:', error);
		return fail(500, { success: false, error: 'Erreur lors de la création' });
	}
}

/** Modifier un chat libre (ou les infos d'origine d'un ancien chat libre) */
export async function updateFreeCatAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = updateFreeCatSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);
	const { catId, ...data } = parsed.data;

	if (!(await canManageCat(user, catId))) {
		return fail(403, { success: false, error: "Vous n'avez pas le droit de modifier ce chat" });
	}
	const cat = await prisma.cat.findUnique({
		where: { id: catId },
		select: { status: true, catNumber: true, freeInfo: { select: { catId: true } } }
	});
	if (!cat?.freeInfo)
		return fail(404, { success: false, error: "Ce chat n'est pas un chat libre" });

	// Un chat passé en asso garde son N° Pattounes : on ne peut plus l'enlever
	if (cat.status !== 'FREE' && !data.catNumber) {
		return fieldError('catNumber', 'Un chat asso a toujours un N° Pattounes');
	}

	const identification = identificationOf(data);
	const taken = await findTakenIdentifier({ catNumber: data.catNumber, ...identification }, catId);
	if (taken) return fieldError(taken.field, taken.message);

	await prisma.cat.update({
		where: { id: catId },
		data: {
			sex: data.sex,
			catNumber: data.catNumber ?? null,
			...identification,
			freeInfo: { update: freeInfoData(data) }
		}
	});
	return { success: true, message: 'Chat libre modifié' };
}

/** Passer un chat libre en chat asso : il entre dans le parcours normal (FA, adoption…) */
export async function convertFreeCatAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = convertFreeCatSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);
	const { catId, status, catNumber } = parsed.data;

	if (!(await canManageCat(user, catId))) {
		return fail(403, { success: false, error: "Vous n'avez pas le droit de modifier ce chat" });
	}
	const cat = await prisma.cat.findUnique({
		where: { id: catId },
		select: { status: true, catNumber: true }
	});
	if (!cat || cat.status !== 'FREE') {
		return fail(409, { success: false, error: "Ce chat n'est plus un chat libre" });
	}

	// Un chat asso a toujours un N° Pattounes : celui du chat libre, ou celui saisi ici
	const number = cat.catNumber ?? catNumber ?? null;
	if (!number) return fieldError('catNumber', 'Le N° Pattounes est obligatoire pour un chat asso');
	if (!cat.catNumber) {
		const taken = await findTakenIdentifier({ catNumber: number, chipId: null, tattooId: null });
		if (taken) return fieldError(taken.field, taken.message);
	}

	// Seulement s'il est encore libre (deux clics en même temps : un seul passe)
	const [updated] = await prisma.$transaction([
		prisma.cat.updateMany({
			where: { id: catId, status: 'FREE' },
			data: { status, catNumber: number }
		}),
		prisma.freeCatInfo.updateMany({
			where: { catId, convertedAt: null },
			data: { convertedAt: new Date() }
		})
	]);
	if (updated.count === 0) {
		return fail(409, { success: false, error: "Ce chat n'est plus un chat libre" });
	}
	return { success: true, message: 'Le chat fait maintenant partie des chats asso' };
}
