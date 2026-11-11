import type { HostFull } from '$lib/types/host';
import type { CatFull } from '$lib/types/cat';
import { getAgeInMonths } from '$lib/utils/age';

export type CompatibilityLevel = 'high' | 'medium' | 'low' | 'none';

export type CompatibilityReason = {
	label: string;
	impact: 'bonus' | 'malus' | 'bloquant';
};

export type Compatibility = {
	score: number; // 0 → 100
	level: CompatibilityLevel;
	reasons: CompatibilityReason[];
};

export const COMPATIBILITY_COLORS: Record<CompatibilityLevel, string> = {
	high: 'bg-green-100 text-green-800',
	medium: 'bg-orange-100 text-orange-800',
	low: 'bg-red-100 text-red-800',
	none: 'bg-gray-100 text-gray-500'
};

const BLOCKING = -100;

// Barèmes : un tableau [points, raison] par valeur d'enum.
// `satisfies Record<…>` → TypeScript râle si un jour tu ajoutes une valeur à l'enum
// sans l'ajouter ici. C'est un filet de sécurité gratuit.
const HEAL_SCORE = {
	NO: [-40, 'Ne fait pas de soins'],
	LIGHT: [10, 'Soins légers'],
	HEAVY: [20, 'Soins lourds'],
	HEAVY_STING: [25, 'Soins lourds + seringue']
} satisfies Record<HostFull['heal'], [number, string]>;

const SOCIALIZE_SCORE = {
	NO: [-40, 'Ne socialise pas'],
	FEARFUL: [15, 'Socialise les chats craintifs'],
	WITHOUT_EX: [5, 'Socialisation sans expérience'],
	EXPERIENCED: [20, 'Socialisation expérimentée']
} satisfies Record<HostFull['socialize'], [number, string]>;

const BABY_FEEDING_SCORE = {
	NO: [-40, 'Ne fait pas de biberonnage'],
	WITHOUT_EX: [5, 'Biberonnage sans expérience'],
	EXPERIENCED: [20, 'Biberonnage expérimenté'],
	RELAY: [10, 'Biberonnage en relais']
} satisfies Record<HostFull['babyFeeding'], [number, string]>;

export function getHostCompatibility(host: HostFull, cat: CatFull): Compatibility {
	let score = 50;
	const reasons: CompatibilityReason[] = [];

	function add(points: number, label: string) {
		score += points;
		reasons.push({
			label,
			impact: points <= BLOCKING ? 'bloquant' : points > 0 ? 'bonus' : 'malus'
		});
	}

	// 1. Disponibilité → bloquant
	if (host.actif !== 'ACTIVE') add(BLOCKING, 'FA inactive');
	if (!host.isAvailable) add(BLOCKING, 'FA indisponible');

	// 2. Animaux déjà présents au foyer
	if (cat.isOkCat === false && (host.numberOfCatsAtHome ?? 0) > 0) add(-30, 'Chats au foyer');
	if (cat.isOkDog === false && (host.numberOfDogsAtHome ?? 0) > 0) add(-30, 'Chiens au foyer');

	// 3. Soins : seulement si le chat a une maladie active ou en traitement
	const needsCare = (cat.sicknesses ?? []).some(
		(s) => s.status === 'ACTIVE' || s.status === 'TREATED'
	);
	if (needsCare) add(...HEAL_SCORE[host.heal]);

	// 4. Socialisation
	if (cat.status === 'SOCIALIZE') add(...SOCIALIZE_SCORE[host.socialize]);

	// 5. Chaton de moins de 2 mois → biberonnage
	if (cat.birthDate && getAgeInMonths(cat.birthDate) < 2) {
		add(...BABY_FEEDING_SCORE[host.babyFeeding]);
	}

	// 6. Extérieur
	if (cat.isOutside && host.outside) add(10, 'Accès extérieur');

	// 7. Type de chat accepté par la FA
	const isKitten = cat.birthDate !== null && getAgeInMonths(cat.birthDate) < 6;
	const accepted = isKitten ? host.kitten : host.catAdult;
	const typeLabel = isKitten ? 'chatons' : 'chats adultes';

	if (accepted === 0) {
		add(-40, `N'accueille pas de ${typeLabel}`);
	} else if (accepted !== null) {
		const active = (host.placements ?? []).filter(
			(p) => p.status === 'ACTIVE' && p.type !== 'PROPOSAL'
		).length;
		if (active >= accepted) add(-15, `Déjà ${active} chat(s) pour ~${accepted} ${typeLabel}`);
		else add(10, `Accueille des ${typeLabel}`);
	}
	// accepted === null → pas renseigné → on ne juge pas (ni bonus ni malus)

	score = Math.max(0, Math.min(100, score)); // on borne entre 0 et 100

	const level: CompatibilityLevel =
		score === 0 ? 'none' : score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

	return { score, level, reasons };
}
