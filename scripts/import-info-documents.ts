/// <reference types="node" />
// Reprise unique : envoie les documents d'information dans le bucket PRIVÉ et les enregistre en base.
// Rejouable : un document déjà importé (même titre) est ignoré.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PrismaClient, type InfoDocumentCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const s3 = new S3Client({
	endpoint: process.env.S3_ENDPOINT,
	region: process.env.S3_REGION,
	forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ''
	},
	requestChecksumCalculation: 'WHEN_REQUIRED',
	responseChecksumValidation: 'WHEN_REQUIRED'
});
const PRIVATE_BUCKET = process.env.S3_BUCKET_PRIVATE ?? 'pattounes-private';
const SOURCE_DIR = 'prisma/data/info-documents';

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const DOCUMENTS: {
	title: string;
	description: string;
	category: InfoDocumentCategory;
	file: string;
}[] = [
	{
		title: 'Manuel de la gestionnaire',
		description: 'Le guide complet du rôle de gestionnaire.',
		category: 'GUIDE',
		file: 'Manuel_gestionnaire.pdf'
	},
	{
		title: "J'ai perdu mon chat",
		description: 'Les démarches à suivre quand un chat est perdu.',
		category: 'GUIDE',
		file: "J'ai_perdu_mon_chat.pdf"
	},
	{
		title: 'Protocoles de cohabitation entre chats',
		description: 'Comment présenter un nouveau chat à ceux du foyer.',
		category: 'GUIDE',
		file: 'protocole_cohabitation_entre_chats.pdf'
	},
	{
		title: "Certificat d'engagement",
		description: "À signer et à remettre à l'association.",
		category: 'CONTRACT',
		file: 'CERTIF_ENGAGEMENT.pdf'
	},
	{
		title: "Contrat d'adoption",
		description: "Modèle de contrat d'adoption à compléter.",
		category: 'CONTRACT',
		file: 'Contrat_adoption_vierge.docx'
	},
	{
		title: 'Contrat de cession',
		description: 'Modèle de contrat de cession à compléter.',
		category: 'CONTRACT',
		file: 'Contrat_de_cession.pdf'
	},
	{
		title: "Hébergement d'association",
		description: "Dossier d'hébergement par l'association.",
		category: 'CONTRACT',
		file: 'dossier-hebergement-association.docx'
	},
	{
		title: 'Fiche stérilisation Mairie de Montpellier',
		description: 'Fiche à remplir pour une stérilisation prise en charge par la Mairie.',
		category: 'HEALTH',
		file: 'Fiche_stérilisation_Mairie_Mtpl.pdf'
	},
	{
		title: 'Liste des vétérinaires 2025',
		description: 'Vétérinaires partenaires et spécialistes.',
		category: 'HEALTH',
		file: 'Liste_complete_veterinaires_partenaires_et_specialistes_2025.pdf'
	},
	{
		title: 'Guide des adoptants',
		description: 'À remettre aux familles adoptantes.',
		category: 'ADOPTION',
		file: 'Guide_adoptants.pdf'
	},
	{
		title: 'Tarifs & process adoptions',
		description: "Les tarifs et les étapes d'une adoption.",
		category: 'ADOPTION',
		file: 'TARIFS_&_PROCESS_ADOPTIONS.pdf'
	}
];

async function main() {
	for (const doc of DOCUMENTS) {
		if (await prisma.infoDocument.findFirst({ where: { title: doc.title } })) {
			console.log(`✔ Déjà importé : ${doc.title}`);
			continue;
		}

		const isWord = doc.file.endsWith('.docx');
		const body = await readFile(`${SOURCE_DIR}/${doc.file}`);
		const storageKey = `info/${randomUUID()}.${isWord ? 'docx' : 'pdf'}`;

		await s3.send(
			new PutObjectCommand({
				Bucket: PRIVATE_BUCKET,
				Key: storageKey,
				Body: body,
				ContentType: isWord ? DOCX : PDF
			})
		);

		await prisma.infoDocument.create({
			data: {
				title: doc.title,
				description: doc.description,
				category: doc.category,
				file: {
					create: {
						type: 'DOCUMENT',
						storageKey,
						mimeType: isWord ? DOCX : PDF,
						sizeBytes: body.length,
						originalName: doc.file,
						isPrivate: true
					}
				}
			}
		});
		console.log(`＋ Importé : ${doc.title}`);
	}
}

main()
	.catch((error) => {
		console.error('❌ Import impossible :', error);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
