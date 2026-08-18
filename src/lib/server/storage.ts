import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SCALEWAY_REGION, SCALEWAY_ENDPOINT, SCALEWAY_ACCESS_KEY, SCALEWAY_SECRET_KEY, SCALEWAY_BUCKET } from '$env/static/private';

const s3Client = new S3Client({
    region: SCALEWAY_REGION,
    endpoint: SCALEWAY_ENDPOINT,
    credentials: {
        accessKeyId: SCALEWAY_ACCESS_KEY,
        secretAccessKey: SCALEWAY_SECRET_KEY
    }
});

export async function uploadToStorage(
    file: File,
    catId: string
): Promise<{ url: string; storageKey: string }> {
    const timestamp = Date.now();
    const storageKey = `cats/${catId}/${timestamp}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
        Bucket: SCALEWAY_BUCKET,
        Key: storageKey,
        Body: Buffer.from(buffer),
        ContentType: file.type
    });

    await s3Client.send(command);

    const url = `${SCALEWAY_ENDPOINT}/${SCALEWAY_BUCKET}/${storageKey}`;

    return { url, storageKey };
}

export async function deleteFromStorage(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: SCALEWAY_BUCKET,
        Key: storageKey
    });

    await s3Client.send(command);
}