import type { InfoDocumentCategory } from '@prisma/client';

/** label : badge d'un document · plural : titre de groupe et puce de filtre */
export const INFO_DOCUMENT_CATEGORY = {
	GUIDE: { label: 'Guide', plural: 'Guides' },
	CONTRACT: { label: 'Contrat', plural: 'Contrats' },
	HEALTH: { label: 'Santé', plural: 'Santé' },
	ADOPTION: { label: 'Adoption', plural: 'Adoption' },
	OTHER: { label: 'Autre', plural: 'Autres' },
	// À accepter à l'inscription : le plus récent de la catégorie fait foi
	FA_CHARTER: { label: 'Convention FA', plural: 'Convention FA' },
	VOLUNTEER_CHARTER: { label: 'Manuel de la gestionnaire', plural: 'Manuel de la gestionnaire' }
} satisfies Record<InfoDocumentCategory, { label: string; plural: string }>;

/** L'ordre d'affichage des groupes (Object.keys garde l'ordre d'écriture) */
export const INFO_DOCUMENT_CATEGORY_ORDER = Object.keys(
	INFO_DOCUMENT_CATEGORY
) as InfoDocumentCategory[];

/** Au format attendu par SelectField (pour les fenêtres de l'étape 3c) */
export const INFO_DOCUMENT_CATEGORY_OPTIONS = INFO_DOCUMENT_CATEGORY_ORDER.map((value) => ({
	value,
	label: INFO_DOCUMENT_CATEGORY[value].label
}));
