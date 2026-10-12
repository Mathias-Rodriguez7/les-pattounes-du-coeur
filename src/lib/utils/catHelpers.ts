export const statusLabel: Record<string, string> = {
	AVAILABLE: 'Disponible',
	SOCIALIZE: 'Socialisation',
	ADOPTED: 'Adopté',
	FREE: 'Libre',
	DEAD: 'Mort'
};

export const sexLabel: Record<string, string> = {
	MALE: 'Mâle',
	FEMALE: 'Femelle',
	UNKNOWN: 'Inconnu'
};

export const hairLabel: Record<string, string> = {
	SHORT: 'Court',
	MEDIUM: 'Moyen',
	LONG: 'Long'
};

export const vaccinateLabel: Record<string, string> = {
	YES: 'Oui',
	NO: 'Non',
	PARTIAL: 'Partiel'
};

export function getLabel(label: Record<string, string>, value: string | null | undefined): string {
	return value ? (label[value] ?? '—') : '—';
}

export function dot(value: boolean): string {
	return value
		? 'inline-block h-3 w-3 rounded-full bg-green-500'
		: 'inline-block h-3 w-3 rounded-full bg-red-500';
}

export const focalPointClass: Record<string, string> = {
	TOP: 'object-top',
	MID: 'object-center',
	BOT: 'object-bottom'
};

// ✅ Fonction extraite pour obtenir l'icône du sexe
export type SexIconInfo = {
	icon: string;
	color: string;
	label: string;
};

export const getSexIcon = (sex: string | null | undefined): SexIconInfo => {
	switch (sex) {
		case 'MALE':
			return { icon: 'mars', color: 'text-blue-500', label: 'Mâle' };
		case 'FEMALE':
			return { icon: 'venus', color: 'text-pink-500', label: 'Femelle' };
		default:
			return { icon: 'CircleQuestionMark', color: 'text-gray-500', label: 'Inconnu' };
	}
};
