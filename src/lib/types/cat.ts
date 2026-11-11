// src/lib/types/cat.ts
import type {
	Prisma,
	SexCat,
	CatStatus,
	HairLength,
	Vaccinate,
	Sickness,
	Volunteer,
	MediaCat,
	Adoption,
	Care,
	News
} from '@prisma/client';
import type { PlacementFull } from './placement';
import type { HostBasic } from '$lib/types/host';
import { volunteerSecretFields } from '$lib/types/volunteer';

// ✅ La galerie : photo principale d'abord, puis par ordre d'ajout.
// Jamais d'URL stockée : elle est calculée à partir de la storageKey.
export const catGalleryArgs = {
	orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
	include: {
		file: { select: { id: true, type: true, storageKey: true, mimeType: true, originalName: true } }
	}
} satisfies Prisma.Cat$mediaArgs;

// ✅ Types Prisma avec relations
// ✅ UNE seule définition de ce que charge la fiche d'un chat :
// la requête (load) ET le type (CatFull) en découlent, ils ne peuvent plus diverger.
export const catFullArgs = {
	include: {
		media: catGalleryArgs,
		sicknesses: true,
		placements: {
			include: { host: { include: { profil: true } } }
		},
		volunteers: {
			include: { volunteer: { omit: volunteerSecretFields, include: { profil: true } } }
		},
		// Toutes les adoptions (en cours et annulées), la plus récente d'abord
		adoptions: {
			orderBy: { createdAt: 'desc' },
			include: { profil: true }
		},
		documents: {
			orderBy: { date: 'desc' },
			include: {
				// Jamais la storageKey : la page passe par /api/media/<id>
				media: { select: { id: true, originalName: true, sizeBytes: true } },
				adoption: {
					select: {
						id: true,
						status: true,
						profil: { select: { firstName: true, lastName: true } }
					}
				}
			}
		},
		cares: {
			orderBy: { date: 'desc' },
			include: {
				sickness: { select: { id: true, name: true } },
				documents: {
					orderBy: { createdAt: 'asc' },
					include: { media: { select: { id: true, originalName: true, sizeBytes: true } } }
				}
			}
		}
	}
} satisfies Prisma.CatDefaultArgs;

export type CatFull = Prisma.CatGetPayload<typeof catFullArgs> & {
	/** Calculé par le load de la page Chats : la bénévole connectée est-elle associée au chat ? */
	isMine?: boolean;
};

// ✅ Select réutilisable pour la liste (source unique de vérité)
export const catListSelect = {
	id: true,
	catNumber: true,
	name: true,
	sex: true,
	status: true,
	birthDate: true,
	isVisible: true,
	description: true,
	media: {
		where: { isPrimary: true },
		take: 1,
		select: { focalPointX: true, focalPointY: true, file: { select: { storageKey: true } } }
	}
} satisfies Prisma.CatSelect;

// Chat en liste (léger, pour les tableaux et cartes)
export type CatListItem = Prisma.CatGetPayload<{
	select: typeof catListSelect;
}>;

// ✅ Type pour l'édition
export type CatEditData = {
	catNumber: string;
	name: string | null;
	sex: SexCat;
	birthDate: Date | null;
	description: string | null;

	// Infos santé
	isSterilize: boolean;
	isAlreadySterilized: boolean;
	vaccinate: Vaccinate | '';
	isFivTest: boolean;
	isDeworming: boolean;

	// Identification
	isIdentify: boolean;
	chipId: string | null;

	// Compatibilités
	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
	isOutside: boolean;

	// Apparence
	hairLength: HairLength | '';
	color: string;
	origin: string;

	// Visibilité
	isVisible: boolean;
	status: CatStatus;

	sicknesses?: Sickness[];
	placements?: PlacementFull[];
	volunteers?: Volunteer[];
	adoptions?: Adoption[];
	cares?: Care[];
	media?: MediaCat[];
	news?: News[];
};

// ✅ Type pour les props du formulaire
export type CatEditFormProps = {
	editData: CatEditData;
	catId?: string;
	hosts?: HostBasic[];
	onSuccess?: () => void;
	onCancel?: () => void;
};

// ✅ Type pour les erreurs
export type CatFormErrors = {
	name?: string;
	sex?: string;
	birthDate?: string;
	description?: string;
};

// ✅ Type pour créer un chat
export type CatCreateInput = Omit<CatEditData, 'id'> & {
	catNumber: string;
	media?: Array<{
		picture: string;
		focalPointX: number;
		focalPointY: number;
	}>;
};

// Chat sur le site public (page Adoptions et sa fiche) : rien d'interne (puce, notes, statut médical détaillé…)
export const catPublicSelect = {
	...catListSelect,
	color: true,
	hairLength: true,
	origin: true,
	isOkCat: true,
	isOkDog: true,
	isOkChild: true,
	isOutside: true,
	isSterilize: true,
	isAlreadySterilized: true,
	isDeworming: true,
	isFivTest: true,
	isIdentify: true,
	// Toute la galerie (photos et vidéos), la principale d'abord : remplace la photo seule de catListSelect
	media: catGalleryArgs
} satisfies Prisma.CatSelect;

export type CatPublic = Prisma.CatGetPayload<{ select: typeof catPublicSelect }>;

// ✅ Type pour mettre à jour un chat
export type CatUpdateInput = Partial<CatEditData>;
