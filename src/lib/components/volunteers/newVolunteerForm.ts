import {
	emptyPersonForm,
	personFormFrom,
	toPersonInput,
	type PersonForm,
	type PersonInitialData
} from '#lib/person/personForm.ts';

// Le formulaire « Nouveau bénévole » (NewVolunteerDialog) : la personne + son rôle

export type NewVolunteerForm = PersonForm & {
	role: string;
};

const DEFAULT_ROLE = 'MANAGER';

export function emptyNewVolunteerForm(): NewVolunteerForm {
	return { ...emptyPersonForm(), role: DEFAULT_ROLE };
}

/** Pré-rempli avec une demande bénévole (bouton « Créer le bénévole » d'une demande) */
export function newVolunteerFormFrom(data: PersonInitialData): NewVolunteerForm {
	return { ...personFormFrom(data), role: DEFAULT_ROLE };
}

/** Les valeurs à valider avec createVolunteerSchema */
export function toCreateVolunteerInput(form: NewVolunteerForm) {
	return { ...toPersonInput(form), role: form.role };
}
