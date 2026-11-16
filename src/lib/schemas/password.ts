import { z } from 'zod';

/**
 * Les règles d'un nouveau mot de passe, écrites UNE fois :
 * - le navigateur les affiche en direct (la petite liste qui se coche) ;
 * - zod les vérifie sur le serveur, avec les MÊMES tests.
 * Utilisées par le Profil (changer son mot de passe) et l'inscription bénévole.
 */
export const PASSWORD_RULES = [
	{
		label: '8 caractères minimum',
		message: 'Le mot de passe doit contenir au moins 8 caractères',
		test: (password: string) => password.length >= 8
	},
	{
		label: 'Une majuscule',
		message: 'Le mot de passe doit contenir au moins une majuscule',
		test: (password: string) => /[A-Z]/.test(password)
	},
	{
		label: 'Un chiffre',
		message: 'Le mot de passe doit contenir au moins un chiffre',
		test: (password: string) => /[0-9]/.test(password)
	},
	{
		label: 'Un caractère spécial (!@#$%^&*)',
		message: 'Le mot de passe doit contenir au moins un caractère spécial',
		test: (password: string) => /[!@#$%^&*]/.test(password)
	}
] as const;

/** Un nouveau mot de passe : toutes les règles ci-dessus */
export const newPasswordField = PASSWORD_RULES.reduce(
	(schema, rule) => schema.refine(rule.test, rule.message),
	z.string()
);

/** Nouveau mot de passe + confirmation */
export const newPasswordSchema = z
	.object({ newPassword: newPasswordField, confirmPassword: z.string() })
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword']
	});
