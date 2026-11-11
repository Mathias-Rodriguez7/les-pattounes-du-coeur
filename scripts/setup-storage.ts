/// <reference types="node" />
// Crée les buckets et la règle de lecture publique. Rejouable sans risque.
import 'dotenv/config';
import {
	S3Client,
	HeadBucketCommand,
	CreateBucketCommand,
	PutBucketPolicyCommand
} from '@aws-sdk/client-s3';

function required(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
	return value;
}

const client = new S3Client({
	endpoint: required('S3_ENDPOINT'),
	region: required('S3_REGION'),
	forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
	credentials: {
		accessKeyId: required('S3_ACCESS_KEY_ID'),
		secretAccessKey: required('S3_SECRET_ACCESS_KEY')
	}
});

const PUBLIC_BUCKET = required('S3_BUCKET_PUBLIC');
const PRIVATE_BUCKET = required('S3_BUCKET_PRIVATE');

/** Crée le bucket s'il n'existe pas encore */
async function ensureBucket(name: string) {
	try {
		await client.send(new HeadBucketCommand({ Bucket: name }));
		console.log(`✔ ${name} existe déjà`);
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
		if (status !== 404) throw error; // une autre erreur (clés fausses…) : on s'arrête

		await client.send(new CreateBucketCommand({ Bucket: name }));
		console.log(`＋ ${name} créé`);
	}
}

/** Tout le monde peut LIRE un fichier. Personne ne peut lister, écrire ni supprimer */
function publicReadPolicy(bucket: string) {
	return JSON.stringify({
		Version: '2012-10-17',
		Statement: [
			{
				Effect: 'Allow',
				Principal: { AWS: ['*'] },
				Action: ['s3:GetObject'],
				Resource: [`arn:aws:s3:::${bucket}/*`]
			}
		]
	});
}

async function main() {
	await ensureBucket(PUBLIC_BUCKET);
	await ensureBucket(PRIVATE_BUCKET);

	await client.send(
		new PutBucketPolicyCommand({ Bucket: PUBLIC_BUCKET, Policy: publicReadPolicy(PUBLIC_BUCKET) })
	);
	console.log(`🔓 ${PUBLIC_BUCKET} : lecture publique`);

	// Volontairement AUCUNE règle sur le bucket privé :
	// seul quelqu'un qui possède les clés (ton serveur) peut y accéder.
	console.log(`🔒 ${PRIVATE_BUCKET} : privé`);
}

main().catch((error) => {
	console.error('❌ Configuration du stockage impossible :', error);
	process.exit(1);
});
