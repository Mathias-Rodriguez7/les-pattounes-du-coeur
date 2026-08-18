import prisma from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { catId, medias } = await request.json();

        if (!catId || !medias) {
            return error(400, 'catId et medias requis');
        }

        // Mettre à jour tous les médias
        for (const media of medias) {
            await prisma.mediaCat.update({
                where: { id: media.id },
                data: {
                    order: media.order,
                    focalPointX: media.focalPointX,
                    focalPointY: media.focalPointY
                }
            });
        }

        return json({ success: true });
    } catch (err) {
        console.error('Reorder error:', err);
        return error(500, 'Reorder failed');
    }
};