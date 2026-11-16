import { createHash, randomBytes } from 'node:crypto';

/** Durée de validité d'un lien d'inscription */
export const INVITATION_DAYS = 14;

/**
 * Un jeton pour le lien de l'email, et son empreinte pour la base.
 * Comme un mot de passe : la base ne garde que l'empreinte (sha256), jamais le jeton.
 * Quelqu'un qui lirait la base ne pourrait pas fabriquer un lien valide.
 */
export function newInvitationToken() {
	const token = randomBytes(32).toString('base64url');
	return { token, tokenHash: hashInvitationToken(token) };
}

/** L'empreinte d'un jeton reçu dans un lien, pour retrouver l'invitation */
export function hashInvitationToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

/** Date d'expiration d'une invitation créée maintenant */
export function invitationExpiry(now: Date = new Date()): Date {
	return new Date(now.getTime() + INVITATION_DAYS * 24 * 60 * 60 * 1000);
}
