import type { VeterinarianCategory } from '@prisma/client';

// Les catégories de la « Liste des vétérinaires partenaires » de l'association.
// label : titre de groupe · one : badge · hint : la règle à respecter (affichée sous le titre)
export const VETERINARIAN_CATEGORY = {
	PARTNER: {
		label: 'Partenaires',
		one: 'Partenaire',
		hint: 'Toutes prises en charge.',
		color: 'bg-green-100 text-green-800'
	},
	EMERGENCY: {
		label: 'Urgences',
		one: 'Urgences',
		hint: 'La nuit ou le week-end, uniquement pour les urgences vitales : les urgences sont très chères.',
		color: 'bg-red-100 text-red-800'
	},
	SPECIALIST: {
		label: 'Spécialistes',
		one: 'Spécialiste',
		hint: "Uniquement sur orientation d'un autre vétérinaire.",
		color: 'bg-violet-100 text-violet-800'
	}
} satisfies Record<
	VeterinarianCategory,
	{ label: string; one: string; hint: string; color: string }
>;

/** L'ordre d'affichage (Object.keys garde l'ordre d'écriture) */
export const VETERINARIAN_CATEGORY_ORDER = Object.keys(
	VETERINARIAN_CATEGORY
) as VeterinarianCategory[];

export const VETERINARIAN_CATEGORY_OPTIONS = VETERINARIAN_CATEGORY_ORDER.map((value) => ({
	value,
	label: VETERINARIAN_CATEGORY[value].one
}));

/** Le badge des vétérinaires partenaires de la mairie (stérilisation des chats libres) */
export const CITY_PARTNER_LABEL = 'Partenaire mairie MPL';
export const CITY_PARTNER_COLOR = 'bg-sky-100 text-sky-800';

/** Le choix « Autre… » de la liste d'un soin : le nom est alors saisi à la main */
export const OTHER_VETERINARIAN = 'OTHER';

/** Le libellé d'un vétérinaire dans une liste : « Clinique du Corum · Montpellier / Corum » */
export function veterinarianOptionLabel(vet: {
	name: string;
	area: string | null;
	category: VeterinarianCategory;
	specialty: string | null;
}) {
	const where = vet.area ? ` · ${vet.area}` : '';
	const kind =
		vet.category === 'PARTNER'
			? ''
			: ` (${VETERINARIAN_CATEGORY[vet.category].one.toLowerCase()}${vet.specialty ? ` : ${vet.specialty.toLowerCase()}` : ''})`;
	return `${vet.name}${where}${kind}`;
}
