import { z } from 'zod';

/**
 * Les erreurs zod existent sous DEUX formes dans l'app, pour deux usages :
 *
 * 1. zodFieldErrors → { email: ['Email invalide', …] }
 *    Côté SERVEUR : renvoyé dans fail(400, { errors }). Le navigateur lit errors.email?.[0].
 *
 * 2. flattenErrors  → { email: 'Email invalide' }
 *    Côté NAVIGATEUR : un message par champ, prêt à afficher sous l'input (getFieldError).
 */

/** Chaque champ → la liste de ses messages (remplace `error.flatten().fieldErrors`, déprécié en zod 4) */
export function zodFieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
	// Type simple (nom du champ → messages) : accepte aussi les schémas choisis selon l'étape
	return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

export interface FlattenedErrors {
	[key: string]: string;
}

/**
 * Chaque champ → son PREMIER message
 * @example { firstName: 'Le prénom doit contenir au moins 2 caractères', email: 'Email invalide' }
 */
export function flattenErrors(error: z.ZodError): FlattenedErrors {
	const errors: FlattenedErrors = {};
	for (const issue of error.issues) {
		// Chemin du champ ("address.city" si imbriqué). ??= : on garde le premier message
		errors[issue.path.join('.')] ??= issue.message;
	}
	return errors;
}

/**
 * Erreurs renvoyées par le SERVEUR ({ email: ['Email invalide'] }) → un message par champ,
 * la forme qu'attend getFieldError. (Sans conversion, on affichait un tableau.)
 */
export function firstMessages(errors: Record<string, string[] | undefined>): FlattenedErrors {
	const result: FlattenedErrors = {};
	for (const [field, messages] of Object.entries(errors)) {
		if (messages?.[0]) result[field] = messages[0];
	}
	return result;
}

/** Le message d'erreur d'un champ */
export function getFieldError(errors: FlattenedErrors, fieldName: string): string | undefined {
	return errors[fieldName];
}
