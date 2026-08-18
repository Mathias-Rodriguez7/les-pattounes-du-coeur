import prisma from '$lib/server/prisma';
import { uploadToStorage } from '$lib/server/storage';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const catId = formData.get('catId') as string;

        if (!file || !catId) {
            return error(400, 'File et catId requis');
        }

        // Upload vers ton provider
        const { url, storageKey } = await uploadToStorage(file, catId);

        // Sauvegarder en BD
        const media = await prisma.mediaCat.create({
            data: {
                catId,
                name: file.name,
                size: file.size,
                type: file.type.includes('pdf') ? 'pdf' : 'image',
                url,
                storageKey,
                order: 0
            }
        });

        return json(media, { status: 201 });
    } catch (err) {
        console.error('Upload error:', err);
        return error(500, 'Upload failed');
    }
};