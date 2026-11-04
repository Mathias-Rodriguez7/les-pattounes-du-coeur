import { z } from 'zod';

/**
 * Champ email normalisé : espaces retirés + minuscules, puis validation.
 * Garantit que tous les emails sont stockés et comparés de la même façon.
 */
export const emailField = (message = 'Email invalide') =>
	z.string().trim().toLowerCase().pipe(z.email(message));
