// Les vérifications faites dans le navigateur quand on QUITTE un champ (avant même d'envoyer) :
// un champ obligatoire resté vide, une adresse email mal écrite. Le serveur revérifie tout,
// ses messages restent prioritaires (prop `error` des champs).

export const REQUIRED_MESSAGE = 'Ce champ est obligatoire';
export const EMAIL_MESSAGE = 'Adresse email invalide (ex : prenom@exemple.fr)';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmptyValue(value: unknown): boolean {
	return value === undefined || value === null || String(value).trim() === '';
}

/** Le message à afficher pour ce champ, ou '' s'il est correct */
export function localFieldError({
	value,
	required = false,
	type = 'text'
}: {
	value: unknown;
	required?: boolean;
	type?: string;
}): string {
	if (isEmptyValue(value)) return required ? REQUIRED_MESSAGE : '';
	if (type === 'email' && !EMAIL_PATTERN.test(String(value).trim())) return EMAIL_MESSAGE;
	return '';
}
