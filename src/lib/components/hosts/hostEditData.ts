import type { ColabActivity, HostType, Heal, Socialize, BabyFeeding } from '@prisma/client';
import type { HostEditData, HostFull } from '#lib/types/host.ts';

// =====================================================================
// Passage « FA en base » → « champs du formulaire d'édition » (HostEditForm).
// Ce n'est pas de l'affichage : c'est une transformation de données, d'où un fichier .ts.
// =====================================================================

/** Valeurs de départ (le formulaire n'est affiché qu'après hostToEditData) */
export function emptyHostEditData(): HostEditData {
	return {
		// Profil
		firstName: '',
		lastName: '',
		birthDate: new Date(),
		email: '',
		phone: '',
		district: '',
		address: '',
		city: '',
		postalCode: '',
		// Host
		actif: 'ACTIVE' as ColabActivity,
		breakStart: null,
		breakEnd: null,
		type: 'CLASSIC' as HostType,
		isAvailable: false,
		// Zone d'accueil
		space: 0,
		outside: false,
		car: false,
		isStockFeed: false,
		// Animaux
		hasAnimalsAtHome: false,
		numberOfCatsAtHome: 0,
		numberOfDogsAtHome: 0,
		otherAnimalsAtHome: '',
		// Capacités
		heal: 'NO' as Heal,
		socialize: 'NO' as Socialize,
		babyFeeding: 'NO' as BabyFeeding,
		// Chats acceptés
		catAdult: 0,
		kittyAndKitten: false,
		kitten: 0,
		// Descriptions
		homeDescription: '',
		presence: '',
		outsideDescription: '',
		stopActivity: '',
		additionalInformation: ''
	};
}

/** Les champs du formulaire, pré-remplis avec la FA (null en base → '' ou 0 dans le formulaire) */
export function hostToEditData(host: HostFull): HostEditData {
	return {
		firstName: host.profil.firstName,
		lastName: host.profil.lastName,
		birthDate: host.profil.birthDate ? new Date(host.profil.birthDate) : new Date(),
		email: host.profil.email,
		phone: host.profil.phone,
		district: host.profil.district || '',
		address: host.profil.address,
		city: host.profil.city,
		postalCode: host.profil.postalCode,

		actif: host.actif ?? undefined,
		breakStart: host.breakStart ? new Date(host.breakStart) : null,
		breakEnd: host.breakEnd ? new Date(host.breakEnd) : null,
		type: host.type ?? undefined,
		isAvailable: host.isAvailable,

		space: host.space,
		outside: host.outside,
		car: host.car,
		isStockFeed: host.isStockFeed,

		hasAnimalsAtHome: host.hasAnimalsAtHome,
		numberOfCatsAtHome: host.numberOfCatsAtHome || 0,
		numberOfDogsAtHome: host.numberOfDogsAtHome || 0,
		otherAnimalsAtHome: host.otherAnimalsAtHome || '',

		heal: host.heal,
		socialize: host.socialize,
		babyFeeding: host.babyFeeding,

		catAdult: host.catAdult || 0,
		kittyAndKitten: host.kittyAndKitten,
		kitten: host.kitten || 0,

		homeDescription: host.homeDescription,
		presence: host.presence,
		outsideDescription: host.outsideDescription || '',
		// null en base, '' dans le formulaire (comme les valeurs de départ plus haut)
		stopActivity: host.stopActivity ?? '',
		additionalInformation: host.additionalInformation ?? ''
	};
}
