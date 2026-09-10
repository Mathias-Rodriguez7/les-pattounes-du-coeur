import { ZodError } from 'zod';

export interface FieldError {
	path: string;
	message: string;
}

export interface FlattenedErrors {
	[key: string]: string;
}

/**
 * Convertit les erreurs Zod en objet plat pour les formulaires
 * @example
 * {
 *   firstName: "Le prénom doit contenir au moins 2 caractères",
 *   email: "Email invalide"
 * }
 */
export function flattenErrors(error: ZodError): FlattenedErrors {
	const errors: FlattenedErrors = {};

	error.issues.forEach((issue) => {
		// Construire le chemin (ex: "address.city" si nested)
		const path = issue.path.join('.');

		// Récupérer le premier message (Zod peut avoir plusieurs)
		const message = Array.isArray(issue.message) ? issue.message[0] : issue.message;

		errors[path] = message;
	});

	return errors;
}

/**
 * Version alternative qui retourne un array d'objets
 */
export function flattenErrorsToArray(error: ZodError): FieldError[] {
	return error.issues.map((issue) => ({
		path: issue.path.join('.'),
		message: Array.isArray(issue.message) ? issue.message[0] : issue.message
	}));
}

/**
 * Récupérer le premier message d'erreur pour un champ
 */
export function getFieldError(errors: FlattenedErrors, fieldName: string): string | undefined {
	return errors[fieldName];
}
