import { defineEnvVars } from '@sveltejs/kit/env';
import { building } from '$app/env';

// =====================================================================
// VARIABLES D'ENVIRONNEMENT (SvelteKit 3)
// Chaque variable utilisée par l'app est déclarée ICI, avec sa règle de validation.
// Elles sont vérifiées au démarrage : une variable obligatoire manquante empêche
// l'app de démarrer, avec un message clair (au lieu d'une erreur au premier envoi de mail
// ou au premier upload).
// On les importe ensuite par leur nom : import { S3_REGION } from '$app/env/private'
// =====================================================================

/**
 * Variable obligatoire. Pendant le build (`npm run build`, Docker), les secrets
 * ne sont pas encore fournis : on tolère leur absence à ce moment-là seulement.
 */
const required = (input: string | undefined) => {
	if (input) return input;
	if (building) return '';
	throw new Error("Variable d'environnement obligatoire manquante (voir .env.example)");
};

/** Variable facultative : chaîne vide si absente */
const optional = (input: string | undefined) => input ?? '';

export const variables = defineEnvVars({
	// --- Emails ---
	// Facultatives en local (comportement d'avant la migration) : l'envoi échoue seulement
	// au moment où on essaie d'envoyer un mail.
	SMTP_HOST: { schema: optional },
	// 🆕 Port par défaut 587 : avec '' on obtenait Number('') = 0, un port invalide
	SMTP_PORT: { schema: (input) => input || '587' },
	SMTP_USER: { schema: optional },
	SMTP_PASS: { schema: optional },
	SMTP_FROM: { schema: optional },
	ASSOCIATION_EMAIL: { schema: optional },

	// --- Stockage S3 ---
	S3_ENDPOINT: { schema: required, description: 'Adresse utilisée par le serveur' },
	S3_PUBLIC_ENDPOINT: { schema: required, description: 'Adresse des URLs signées (navigateur)' },
	S3_REGION: { schema: required },
	S3_FORCE_PATH_STYLE: { schema: (input) => input === 'true' },
	S3_ACCESS_KEY_ID: { schema: required },
	S3_SECRET_ACCESS_KEY: { schema: required },
	S3_BUCKET_PUBLIC: { schema: required },
	S3_BUCKET_PRIVATE: { schema: required },

	// --- Public (lisible par le navigateur) ---
	PUBLIC_MEDIA_BASE_URL: { public: true, schema: required }
});
