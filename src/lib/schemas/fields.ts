import { z } from 'zod';

/**
 * Booléen venu d'un formulaire HTML : un input envoie toujours du TEXTE.
 * ⚠️ z.coerce.boolean() ne convient pas : Boolean('false') vaut true (chaîne non vide).
 * On accepte donc un vrai booléen (JSON) ou les textes qu'un formulaire peut envoyer.
 */
export const booleanField = () =>
	z
		.union([z.boolean(), z.enum(['true', 'false', 'on', 'off', ''])])
		.transform((v) => v === true || v === 'true' || v === 'on')
		.optional();

/**
 * Champ email normalisé : espaces retirés + minuscules, puis validation.
 * Garantit que tous les emails sont stockés et comparés de la même façon.
 */
export const emailField = (message = 'Email invalide') =>
	z.string().trim().toLowerCase().pipe(z.email(message));
