import prisma from '#lib/server/prisma.ts';
import type { InfoDocumentCategory, InvitationKind } from '@prisma/client';

// Le document à accepter pour chaque inscription : déposé dans la page Documents.
// Le plus récent de sa catégorie fait foi.
const CHARTER_CATEGORY = {
	HOST: 'FA_CHARTER',
	VOLUNTEER: 'VOLUNTEER_CHARTER'
} as const satisfies Record<InvitationKind, InfoDocumentCategory>;

/** Pour les messages : « Déposez d'abord la Convention FA… » */
export const CHARTER_NAME = {
	HOST: 'la Convention FA',
	VOLUNTEER: 'le Manuel de la gestionnaire'
} as const satisfies Record<InvitationKind, string>;

/** Le document en vigueur (ou null si aucun n'a été déposé). `db` : le client ou une transaction */
export function currentCharter(
	kind: InvitationKind,
	db: Pick<typeof prisma, 'infoDocument'> = prisma
) {
	return db.infoDocument.findFirst({
		where: { category: CHARTER_CATEGORY[kind] },
		orderBy: { createdAt: 'desc' },
		include: { file: true }
	});
}
