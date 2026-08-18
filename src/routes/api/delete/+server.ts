import prisma from '$lib/server/prisma';
import { deleteFromStorage } from '$lib/server/storage';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return error(400, 'ID requis');
        }

        // Récupérer le média pour avoir la clé de stockage
        const media = await prisma.mediaCat.findUnique({
            where: { id }
        });

        if (!media) {
            return error(404, 'Média not found');
        }

        // Supprimer du storage
        await deleteFromStorage(media.storageKey);

        // Supprimer de la BD
        await prisma.mediaCat.delete({
            where: { id }
        });

        return json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return error(500, 'Delete failed');
    }
};