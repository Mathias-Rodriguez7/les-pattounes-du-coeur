import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findValidInvitation } from '#lib/server/invitations/mutations.ts';
import { currentCharter } from '#lib/server/invitations/charters.ts';
import { readPrivateFile } from '#lib/server/storage.ts';

/**
 * Le PDF à lire, pour la candidate (pas connectée) : c'est le jeton du lien qui l'autorise.
 * Servi par NOTRE serveur (et pas par une redirection vers S3) : pdf.js le lit depuis la page,
 * ce qu'il ne peut faire que sur la même origine que le site.
 * ?download=1 : le navigateur le télécharge au lieu de l'afficher.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const invitation = await findValidInvitation(params.token);
	const charter = invitation ? await currentCharter(invitation.kind) : null;
	if (!charter) error(404, 'Document introuvable');

	const file = await readPrivateFile(charter.file.storageKey);
	const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
	const fileName = charter.file.originalName ?? 'document.pdf';

	return new Response(file.body, {
		headers: {
			'Content-Type': file.contentType,
			'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
			...(file.size !== undefined && { 'Content-Length': String(file.size) }),
			// Document réservé aux personnes qui ont le lien : pas de cache partagé
			'Cache-Control': 'private, no-store'
		}
	});
};
