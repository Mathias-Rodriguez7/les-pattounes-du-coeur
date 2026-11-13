import {
	emptyPersonForm,
	personFormFrom,
	toPersonInput,
	type PersonForm
} from '#lib/person/personForm.ts';

// =====================================================================
// Le formulaire « Nouvelle FA » (NewHostDialog) : UN objet pour tous les champs.
// Avant : 30 variables séparées, chacune écrite 5 fois (déclarée, pré-remplie,
// convertie, remise à zéro, liée dans le HTML).
// Les nombres restent du texte ici : c'est ce que contient un <input type="number">.
// =====================================================================

export type NewHostForm = PersonForm & {
	// Statut
	actif: string;
	type: string;
	isAvailable: boolean;
	// Zone d'accueil
	space: string;
	outside: boolean;
	car: boolean;
	isStockFeed: boolean;
	// Animaux
	hasAnimalsAtHome: boolean;
	numberOfCatsAtHome: string;
	numberOfDogsAtHome: string;
	otherAnimalsAtHome: string;
	// Capacités
	heal: string;
	socialize: string;
	babyFeeding: string;
	// Chats acceptés
	catAdult: string;
	kittyAndKitten: boolean;
	kitten: string;
	// Descriptions
	homeDescription: string;
	presence: string;
	outsideDescription: string;
	additionalInformation: string;
};

/** Un formulaire vide (création depuis la page FA) */
export function emptyNewHostForm(): NewHostForm {
	return {
		...emptyPersonForm(),
		actif: 'ACTIVE',
		type: 'CLASSIC',
		isAvailable: true,
		space: '',
		outside: false,
		car: false,
		isStockFeed: false,
		hasAnimalsAtHome: false,
		numberOfCatsAtHome: '',
		numberOfDogsAtHome: '',
		otherAnimalsAtHome: '',
		heal: 'NO',
		socialize: 'NO',
		babyFeeding: 'NO',
		catAdult: '',
		kittyAndKitten: false,
		kitten: '',
		homeDescription: '',
		presence: '',
		outsideDescription: '',
		additionalInformation: ''
	};
}

/** Ce que peut contenir une demande FA (le JSON du formulaire public) : tout est facultatif */
export type NewHostInitialData = Partial<{
	[K in keyof NewHostForm]: string | number | boolean | Date | null;
}>;

/**
 * Le formulaire pré-rempli avec une demande FA (bouton « Créer la FA » d'une demande).
 * Chaque champ absent garde sa valeur vide.
 */
export function newHostFormFrom(data: NewHostInitialData): NewHostForm {
	const empty = emptyNewHostForm();
	const text = (key: keyof NewHostForm) =>
		data[key] === null || data[key] === undefined ? (empty[key] as string) : String(data[key]);
	const flag = (key: keyof NewHostForm) =>
		typeof data[key] === 'boolean' ? (data[key] as boolean) : (empty[key] as boolean);

	return {
		...personFormFrom(data),
		actif: text('actif'),
		type: text('type'),
		isAvailable: flag('isAvailable'),
		space: text('space'),
		outside: flag('outside'),
		car: flag('car'),
		isStockFeed: flag('isStockFeed'),
		hasAnimalsAtHome: flag('hasAnimalsAtHome'),
		numberOfCatsAtHome: text('numberOfCatsAtHome'),
		numberOfDogsAtHome: text('numberOfDogsAtHome'),
		otherAnimalsAtHome: text('otherAnimalsAtHome'),
		heal: text('heal'),
		socialize: text('socialize'),
		babyFeeding: text('babyFeeding'),
		catAdult: text('catAdult'),
		kittyAndKitten: flag('kittyAndKitten'),
		kitten: text('kitten'),
		homeDescription: text('homeDescription'),
		presence: text('presence'),
		outsideDescription: text('outsideDescription'),
		additionalInformation: text('additionalInformation')
	};
}

/** Les valeurs à valider avec createHostSchema : textes nettoyés, nombres convertis */
export function toCreateHostInput(form: NewHostForm) {
	const int = (value: string) => (value ? parseInt(value) : undefined);
	return {
		...toPersonInput(form),
		type: form.type,
		actif: form.actif,
		isAvailable: form.isAvailable,
		space: int(form.space),
		outside: form.outside,
		car: form.car,
		isStockFeed: form.isStockFeed,
		hasAnimalsAtHome: form.hasAnimalsAtHome,
		numberOfCatsAtHome: int(form.numberOfCatsAtHome) ?? null,
		numberOfDogsAtHome: int(form.numberOfDogsAtHome) ?? null,
		otherAnimalsAtHome: form.otherAnimalsAtHome.trim() || undefined,
		heal: form.heal,
		socialize: form.socialize,
		babyFeeding: form.babyFeeding,
		catAdult: int(form.catAdult) ?? 0,
		kittyAndKitten: form.kittyAndKitten,
		kitten: int(form.kitten) ?? 0,
		homeDescription: form.homeDescription.trim(),
		presence: form.presence.trim(),
		outsideDescription: form.outsideDescription.trim() || undefined,
		additionalInformation: form.additionalInformation.trim() || undefined
	};
}
