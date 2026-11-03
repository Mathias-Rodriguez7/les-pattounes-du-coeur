import argon2 from 'argon2';
import { createHash } from 'node:crypto';

export async function hashPassword(password: string) {
	return await argon2.hash(password, {
		type: argon2.argon2id
	});
}

export async function verifyPassword(hash: string, password: string) {
	return await argon2.verify(hash, password);
}

/**
 * Hache un token aléatoire (ex : lien de réinitialisation de mot de passe).
 * sha256 et pas argon2 :
 * - le token est long et aléatoire → impossible à deviner, pas besoin d'un hachage lent ;
 * - sha256 est déterministe (même entrée = même hash) → on peut chercher le hash en base.
 */
export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}
