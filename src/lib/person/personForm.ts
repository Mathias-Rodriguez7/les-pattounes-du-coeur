import { format } from 'date-fns';

// =====================================================================
// La partie « personne » des formulaires de création (FA, bénévole…) : identité, contact, adresse.
// Écrite UNE fois ; chaque formulaire la complète avec ses propres champs :
//     type NewHostForm = PersonForm & { space: string; … }
// =====================================================================

export type PersonForm = {
	firstName: string;
	lastName: string;
	birthDate: Date | undefined;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	district: string;
};

/** Ce que peut contenir une demande (le JSON d'un formulaire public) : tout est facultatif */
export type PersonInitialData = Partial<{
	[K in keyof PersonForm]: string | number | boolean | Date | null;
}>;

/** Une personne vide. L'association est à Montpellier : c'est la ville par défaut */
export function emptyPersonForm(): PersonForm {
	return {
		firstName: '',
		lastName: '',
		birthDate: undefined,
		email: '',
		phone: '',
		address: '',
		city: 'Montpellier',
		postalCode: '34000',
		district: ''
	};
}

/** Une personne pré-remplie avec une demande ; chaque champ absent garde sa valeur vide */
export function personFormFrom(data: PersonInitialData): PersonForm {
	const empty = emptyPersonForm();
	const text = (key: Exclude<keyof PersonForm, 'birthDate'>) =>
		data[key] === null || data[key] === undefined ? empty[key] : String(data[key]);

	return {
		firstName: text('firstName'),
		lastName: text('lastName'),
		birthDate: data.birthDate ? new Date(data.birthDate as string | Date) : undefined,
		email: text('email'),
		phone: text('phone'),
		address: text('address'),
		city: text('city'),
		postalCode: text('postalCode'),
		district: text('district')
	};
}

/** Les valeurs à valider : textes nettoyés, date au format AAAA-MM-JJ, quartier vide → undefined */
export function toPersonInput(form: PersonForm) {
	return {
		firstName: form.firstName.trim(),
		lastName: form.lastName.trim(),
		birthDate: form.birthDate ? format(form.birthDate, 'yyyy-MM-dd') : undefined,
		email: form.email.trim(),
		phone: form.phone.trim(),
		address: form.address.trim(),
		city: form.city.trim(),
		postalCode: form.postalCode.trim(),
		district: form.district || undefined
	};
}
