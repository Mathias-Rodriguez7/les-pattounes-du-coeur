/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient, type Host, type Profil } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// fakerFR : prénoms, noms, rues et entreprises en français
import { fakerFR as faker } from '@faker-js/faker';
import { hashPassword } from '../src/lib/server/hashing';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';

// =====================================================================
// SEED « RÉALISTE »
// Chaque chat a UNE histoire, tirée dans l'ordre où elle se déroule :
//   arrivée → familles d'accueil → soins → (demandes → adoption → retour éventuel)
// Les tables ne sont plus tirées chacune de leur côté : un chat ADOPTED a forcément
// une adoption, plus de FA active, une demande acceptée…
// =====================================================================

// ---------------------
// DB
// ---------------------
const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

// ---------------------
// ENUMS
// ---------------------
const VOLUNTEER_ROLE = ['ADMIN', 'MANAGER', 'COMMUNICATION'] as const;
const COLAB_ACTIVITY = ['ACTIVE', 'BREAK', 'STOP'] as const;

const DISTRICTS = [
	'HOPITAUX_FACULTES',
	'CROIX_D_ARGENT',
	'PORT_MARIANNE',
	'CENTRE_VILLE',
	'CEVENNES',
	'PRES_D_ARENES',
	'MOSSON'
] as const;

const HOST_TYPE = ['CLASSIC', 'SOS', 'ADOPT', 'PROPRIO', 'RELAY'] as const;
const HEAL = ['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING'] as const;
const SOCIALIZE = ['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED'] as const;
const BABY = ['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY'] as const;

type CatStatus = 'AVAILABLE' | 'SOCIALIZE' | 'ADOPTED' | 'FREE' | 'DEAD';
type CareType =
	| 'VACCINE'
	| 'TREATMENT'
	| 'SURGERY'
	| 'OTHER'
	| 'CONTROL'
	| 'STERILIZE'
	| 'DEWORMING'
	| 'FIV_TEST'
	| 'IDENTIFICATION';

// =====================================================================
// 🇫🇷 DONNÉES FRANÇAISES (au lieu du lorem)
// =====================================================================

const CAT_NAMES = [
	'Mimi',
	'Félix',
	'Caramel',
	'Moustache',
	'Réglisse',
	'Biscotte',
	'Pistache',
	'Noisette',
	'Filou',
	'Câline',
	'Praline',
	'Tigrou',
	'Pépite',
	'Grisou',
	'Chaussette',
	'Nougat',
	'Cannelle',
	'Patapouf',
	'Sushi',
	'Plume',
	'Olive',
	'Lulu',
	'Gribouille',
	'Mistigri',
	'Choupette',
	'Pirate',
	'Sésame',
	'Cachou',
	'Figue',
	'Loustic',
	'Nala',
	'Simba',
	'Oréo',
	'Vanille',
	'Bijou',
	'Perle',
	'Zébulon',
	'Pacha',
	'Cookie',
	'Ficelle',
	'Tartine',
	'Pompon',
	'Marmelade',
	'Calisson',
	'Fripouille',
	'Mochi',
	'Rubis',
	'Soleil',
	'Hibou',
	'Brioche'
];

const CAT_COLORS = [
	{ weight: 5, value: 'Tigré gris' },
	{ weight: 4, value: 'Tigré roux' },
	{ weight: 4, value: 'Noir' },
	{ weight: 3, value: 'Noir et blanc' },
	{ weight: 2, value: 'Roux et blanc' },
	{ weight: 2, value: 'Gris et blanc' },
	{ weight: 2, value: 'Écaille de tortue' },
	{ weight: 2, value: 'Tricolore' },
	{ weight: 2, value: 'Blanc' },
	{ weight: 1, value: 'Gris bleu' },
	{ weight: 1, value: 'Crème' },
	{ weight: 1, value: 'Siamois (point)' }
];

/** D'où vient le chat. surrender : un acte d'abandon est signé ; kittenOnly : chatons seulement */
const ORIGINS = [
	{
		weight: 4,
		value: { label: 'Abandon par son propriétaire', surrender: true, kittenOnly: false }
	},
	{
		weight: 4,
		value: { label: 'Trouvé sur la voie publique', surrender: false, kittenOnly: false }
	},
	{ weight: 2, value: { label: 'Fourrière de Montpellier', surrender: false, kittenOnly: false } },
	{ weight: 2, value: { label: 'Signalement d’un voisin', surrender: false, kittenOnly: false } },
	{ weight: 1, value: { label: 'Décès du propriétaire', surrender: true, kittenOnly: false } },
	{
		weight: 3,
		value: { label: 'Portée trouvée dans un jardin', surrender: false, kittenOnly: true }
	},
	{ weight: 2, value: { label: 'Né en famille d’accueil', surrender: false, kittenOnly: true } }
];
const FREE_ORIGIN = 'Colonie de chats libres (campagne de stérilisation)';

const CAT_TEMPERAMENTS = [
	'Très câlin, il adore les genoux',
	'Joueur et curieux de tout',
	'Calme et discret',
	'Un peu timide au début, puis très attachant',
	'Bavard, il réclame beaucoup d’attention',
	'Indépendant mais affectueux',
	'Plein d’énergie, idéal pour une famille active',
	'Doux et patient'
];

const SICKNESSES = [
	{
		name: 'Coryza',
		description: 'Éternuements, yeux qui coulent',
		treatment: 'Antibiotiques 10 jours, lavage des yeux',
		chronic: false
	},
	{
		name: 'Gale d’oreilles',
		description: 'Grattage, dépôts noirs dans les oreilles',
		treatment: 'Nettoyage auriculaire et antiparasitaire',
		chronic: false
	},
	{
		name: 'Teigne',
		description: 'Plaques sans poils sur la tête',
		treatment: 'Antifongique 6 semaines, désinfection de la pièce',
		chronic: false
	},
	{
		name: 'Gingivite',
		description: 'Gencives rouges, mauvaise haleine',
		treatment: 'Détartrage sous anesthésie',
		chronic: false
	},
	{
		name: 'Giardiose',
		description: 'Diarrhées persistantes',
		treatment: 'Vermifuge spécifique 5 jours',
		chronic: false
	},
	{
		name: 'Conjonctivite',
		description: 'Œil rouge et gonflé',
		treatment: 'Collyre antibiotique 7 jours',
		chronic: false
	},
	{
		name: 'Fracture de la patte',
		description: 'Boiterie après une chute',
		treatment: 'Plâtre puis repos strict 4 semaines',
		chronic: false
	}
];
const KIDNEY_DISEASE = {
	name: 'Insuffisance rénale',
	description: 'Soif importante, amaigrissement',
	treatment: 'Alimentation rénale, prise de sang tous les 3 mois',
	chronic: true
};
const FIV_POSITIVE = {
	name: 'FIV positif',
	description: 'Test positif à l’arrivée',
	treatment: 'Suivi régulier, vie en intérieur uniquement',
	chronic: true
};

const VETERINARIES = [
	'Clinique vétérinaire des Arceaux',
	'Cabinet vétérinaire de Port Marianne',
	'Clinique vétérinaire du Lez',
	'Cabinet vétérinaire des Beaux-Arts',
	'Clinique vétérinaire de la Paillade'
];
const CARE_DOC_NAMES = ['ordonnance', 'facture', 'compte-rendu', 'resultats-analyses'];

const NEARBY_CITIES = [
	{ city: 'Castelnau-le-Lez', postalCode: '34170' },
	{ city: 'Lattes', postalCode: '34970' },
	{ city: 'Pérols', postalCode: '34470' },
	{ city: 'Juvignac', postalCode: '34990' },
	{ city: 'Saint-Jean-de-Védas', postalCode: '34430' },
	{ city: 'Grabels', postalCode: '34790' }
];
const MONTPELLIER_POSTAL_CODES = ['34000', '34070', '34080', '34090'];

// Familles d'accueil
const HOME_DESCRIPTIONS = [
	'Appartement lumineux avec une pièce dédiée aux chats',
	'Maison de plain-pied, chambre d’amis réservée à l’accueil',
	'T3 calme au 2e étage, fenêtres sécurisées',
	'Maison avec véranda fermée',
	'Studio au calme, idéal pour un chat seul'
];
const PRESENCES = [
	'Télétravail la plupart du temps',
	'Absente en journée, présente le soir et le week-end',
	'Retraitée, présente toute la journée',
	'Horaires décalés, présente le matin'
];
const OUTSIDE_DESCRIPTIONS = [
	'Jardin clos de 200 m²',
	'Balcon sécurisé avec filet',
	'Terrasse fermée',
	'Petit jardin clôturé'
];
const OTHER_ANIMALS = [
	'un lapin',
	'deux poules',
	'un perroquet',
	'des poissons',
	'un cochon d’Inde'
];
const HOST_INFOS = [
	'Peut accueillir des chats timides',
	'Préfère les chats adultes calmes',
	'Disponible pour les urgences le week-end',
	'A l’habitude des biberons'
];
const STOP_REASONS = [
	'Déménagement hors de la région',
	'Arrivée d’un bébé',
	'Raisons de santé',
	'A adopté son dernier chat accueilli'
];
const HOST_MOTIVATIONS = [
	'J’ai de la place et du temps, je veux aider les chats en attendant leur famille.',
	'Mon chat est parti l’an dernier, je ne suis pas prête à adopter mais je veux aider.',
	'Je télétravaille et je peux m’occuper de chatons à sociabiliser.'
];

// Bénévoles
const CAT_EXPERIENCES = [
	'A toujours vécu avec des chats',
	'Bénévole en refuge pendant deux ans',
	'Ancienne famille d’accueil dans une autre association'
];
const ASSOCIATION_EXPERIENCES = [
	'Bénévole dans une association de quartier',
	'Trésorière d’un club sportif',
	'Organisation de collectes alimentaires'
];
const MEDICAL_EXPERIENCES = [
	'Auxiliaire vétérinaire',
	'Infirmière, à l’aise avec les injections',
	'A soigné son chat diabétique pendant 3 ans'
];
const VOLUNTEER_MOTIVATIONS = [
	'J’ai du temps libre et j’aimerais aider les chats de Montpellier.',
	'J’ai adopté chez vous, je veux rendre la pareille.',
	'Je veux me rendre utile, les week-ends surtout.'
];
const SKILLS = [
	'Photographie',
	'Réseaux sociaux',
	'Bricolage (cabanes, griffoirs)',
	'Couture',
	'Comptabilité'
];

// Demandes d'adoption
const WANTED_TEMPERAMENTS = [
	'Un chat câlin qui aime les genoux',
	'Un chat calme, je travaille à la maison',
	'Un chat joueur pour mes enfants',
	'Un compagnon pour mon chat actuel',
	'Peu importe, surtout un chat qui a besoin d’une famille'
];
const FORM_NOTES = [
	'Appel effectué, très bon contact.',
	'Relancée par mail, en attente de réponse.',
	'Visite pré-adoption prévue la semaine prochaine.',
	'Logement vérifié en visio.'
];
const REJECT_REASONS = [
	'Logement inadapté (fenêtres non sécurisées)',
	'Pas de réponse après deux relances',
	'Souhaite laisser le chat sortir près d’une route passante',
	'Demande en double'
];
// Le même texte que REJECTED_NOTE dans server/adoptions/mutations.ts
const ADOPTED_ELSEWHERE_NOTE = 'Chat adopté par une autre famille.';
const CANCEL_REASONS = [
	'Allergie déclarée dans la famille',
	'Mésentente avec le chat déjà présent',
	'Déménagement à l’étranger',
	'Le chat ne supportait pas les enfants'
];

// Partenariats
const COLAB_KINDS = [
	'Animalerie indépendante',
	'Toiletteur',
	'Boutique de croquettes en vrac',
	'Photographe animalier',
	'Pension pour chats'
];
const COLAB_PROPOSALS = [
	'Une collecte de croquettes dans notre magasin pendant un mois.',
	'Une remise de 10 % pour chaque adoptant de l’association.',
	'Une séance photo offerte pour les chats à l’adoption.',
	'Afficher vos chats à l’adoption dans notre vitrine.'
];

// Actualités
const NEWS_CONTENT = {
	NEWS: {
		titles: [
			'Journée portes ouvertes au local',
			'Bilan de la collecte de printemps',
			'Nouveaux horaires de permanence'
		],
		content:
			'Merci à toutes et à tous pour votre soutien ! Retrouvez les détails dans le document joint.'
	},
	NEWSLETTER: {
		titles: [
			'La lettre du printemps',
			'La lettre de l’été',
			'La lettre de rentrée',
			'La lettre de fin d’année'
		],
		content:
			'Les adoptions du trimestre, les chats qui attendent toujours, et les prochains rendez-vous.'
	},
	HISTORY: {
		titles: [
			'Il y a 10 ans, notre première adoption',
			'L’histoire de Pacha, retrouvé sous la pluie'
		],
		content: 'Une histoire qui nous tient à cœur, racontée par la bénévole qui l’a vécue.'
	},
	NEWSCATS: { titles: ['Les nouveaux à l’adoption', 'Ils cherchent une famille'], content: null },
	EVENT: {
		titles: [
			'Stand au marché des Arceaux',
			'Collecte de croquettes en animalerie',
			'Soirée loto au profit des chats'
		],
		content: 'Venez nous rencontrer ! Toutes les infos pratiques sont dans le document joint.'
	}
} as const;
const NEWS_TYPES = Object.keys(NEWS_CONTENT) as (keyof typeof NEWS_CONTENT)[];

// =====================================================================
// UTILS
// =====================================================================
const randomBool = (p = 0.5) => Math.random() < p;
const pick = <T>(items: readonly T[]) => faker.helpers.arrayElement(items);
const int = (min: number, max: number) => faker.number.int({ min, max });

const DAY_MS = 86_400_000;
const now = new Date();
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);
const daysAgo = (days: number) => addDays(now, -days);
// Même calcul que addMonths ($lib/utils/date) : le seed n'importe pas $lib
const addMonths = (date: Date, months: number) => {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
};
const minDate = (...dates: Date[]) => new Date(Math.min(...dates.map((d) => d.getTime())));
const maxDate = (...dates: Date[]) => new Date(Math.max(...dates.map((d) => d.getTime())));
/** Une date aléatoire entre deux dates (si l'intervalle est vide : la première) */
const dateBetween = (from: Date, to: Date) =>
	from >= to ? new Date(from) : faker.date.between({ from, to });
const monthsBetween = (from: Date, to: Date) => (to.getTime() - from.getTime()) / (30.44 * DAY_MS);

/** « Hélène » → « helene » : pour fabriquer des emails lisibles */
const slug = (text: string) =>
	text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z]/g, '');

/** Un portable français : 06 ou 07 + 8 chiffres (le format qu'acceptent les formulaires) */
const frenchMobile = () => `0${pick([6, 7])}${faker.string.numeric(8)}`;

const TRIAL_MONTHS = 6;

// ---------------------
// S3 (RustFS en local)
// ---------------------
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
const PUBLIC_BUCKET = process.env.S3_BUCKET_PUBLIC ?? 'pattounes-public';

const PRIVATE_BUCKET = process.env.S3_BUCKET_PRIVATE ?? 'pattounes-private';

// Un vrai PDF d'exemple : envoyé une fois dans chaque bucket, puis copié pour chaque document
const SAMPLE_PDF_PATH = 'prisma/data/samples/sample.pdf';
const SAMPLE_PDF_KEY = 'seed/sample.pdf';
let samplePdfSize = 0;

type Sample = {
	path: string; // dans static/
	type: 'IMAGE' | 'VIDEO';
	mimeType: string;
	extension: string;
	sizeBytes: number; // rempli à l'envoi
};

const SAMPLE_IMAGES: Sample[] = ['cat1', 'cat2', 'cat3', 'cat4'].map((name) => ({
	path: `img/cats/${name}.jpg`,
	type: 'IMAGE',
	mimeType: 'image/jpeg',
	extension: 'jpg',
	sizeBytes: 0
}));
const SAMPLE_VIDEO: Sample = {
	path: 'videos/cat.mp4',
	type: 'VIDEO',
	mimeType: 'video/mp4',
	extension: 'mp4',
	sizeBytes: 0
};

const sampleKey = (sample: Sample) => `seed/${sample.path.split('/').pop()}`;

/** Envoie une fois les fichiers d'exemple dans le bucket public */
async function uploadSamples() {
	for (const sample of [...SAMPLE_IMAGES, SAMPLE_VIDEO]) {
		const body = await readFile(`static/${sample.path}`);
		sample.sizeBytes = body.length;
		await s3.send(
			new PutObjectCommand({
				Bucket: PUBLIC_BUCKET,
				Key: sampleKey(sample),
				Body: body,
				ContentType: sample.mimeType
			})
		);
	}

	const pdf = await readFile(SAMPLE_PDF_PATH);
	samplePdfSize = pdf.length;
	for (const Bucket of [PUBLIC_BUCKET, PRIVATE_BUCKET]) {
		await s3.send(
			new PutObjectCommand({
				Bucket,
				Key: SAMPLE_PDF_KEY,
				Body: pdf,
				ContentType: 'application/pdf'
			})
		);
	}
}

/** Copie un exemple dans la galerie d'un chat. La copie se fait DANS S3 : rien ne transite par le seed */
async function copySampleToCat(catId: string, sample: Sample) {
	const storageKey = `cats/${catId}/gallery/${randomUUID()}.${sample.extension}`;
	await s3.send(
		new CopyObjectCommand({
			Bucket: PUBLIC_BUCKET,
			CopySource: `${PUBLIC_BUCKET}/${sampleKey(sample)}`,
			Key: storageKey
		})
	);
	return storageKey;
}

/**
 * Copie le PDF d'exemple dans S3, puis renvoie les données de sa ligne Media
 * (à utiliser dans un `create` imbriqué). La copie se fait DANS S3.
 */
async function pdfMedia(folder: string, originalName: string, isPrivate: boolean) {
	const Bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
	const storageKey = `${folder}/${randomUUID()}.pdf`;

	await s3.send(
		new CopyObjectCommand({
			Bucket,
			CopySource: `${Bucket}/${SAMPLE_PDF_KEY}`,
			Key: storageKey
		})
	);

	return {
		type: 'DOCUMENT' as const,
		storageKey,
		mimeType: 'application/pdf',
		sizeBytes: samplePdfSize,
		originalName,
		isPrivate
	};
}

const DOC_FILE_NAMES = {
	SURRENDER: 'acte-abandon',
	ADOPTION_CONTRACT: 'contrat-adoption',
	ADOPTION_RETURN: 'retour-adoption',
	OTHER: 'document'
} as const;

async function createCatDocument(
	cat: { id: string; catNumber: string },
	kind: keyof typeof DOC_FILE_NAMES,
	date: Date,
	adoptionId?: string
) {
	return prisma.catDocument.create({
		data: {
			cat: { connect: { id: cat.id } },
			kind,
			date,
			...(adoptionId ? { adoption: { connect: { id: adoptionId } } } : {}),
			media: {
				create: await pdfMedia(
					`cats/${cat.id}/documents`,
					`${cat.catNumber}_${DOC_FILE_NAMES[kind]}.pdf`,
					true
				)
			}
		}
	});
}

// =====================================================================
// FABRIQUES : des données cohérentes entre elles
// =====================================================================

/** Une adresse : Montpellier (avec quartier) 3 fois sur 4, sinon une commune voisine (sans quartier) */
function fakeAddress() {
	const address = faker.location.streetAddress().slice(0, 100);
	if (randomBool(0.75)) {
		return {
			address,
			city: 'Montpellier',
			postalCode: pick(MONTPELLIER_POSTAL_CODES),
			district: pick(DISTRICTS)
		};
	}
	return { address, ...pick(NEARBY_CITIES), district: null };
}

function fakeProfil(index: number) {
	const firstName = faker.person.firstName().slice(0, 60);
	const lastName = faker.person.lastName().slice(0, 60);
	return {
		firstName,
		lastName,
		birthDate: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
		// prenom.nom42@test.com : lisible, et unique grâce à l'index
		email: `${slug(firstName)}.${slug(lastName)}${index}@test.com`,
		phone: frenchMobile(),
		...fakeAddress()
	};
}

/** « A des animaux » : au moins UN animal (sinon la case n'aurait pas été cochée) */
function someAnimals(maxCats: number, maxDogs: number) {
	const animals = {
		cats: int(0, maxCats),
		dogs: int(0, maxDogs),
		other: randomBool(0.3) ? pick(OTHER_ANIMALS) : null
	};
	if (animals.cats + animals.dogs === 0 && !animals.other) animals.cats = 1;
	return animals;
}

function generateBreakDates() {
	return { breakStart: daysAgo(int(1, 60)), breakEnd: addDays(now, int(1, 90)) };
}

/**
 * Les réponses d'une FA. Les champs « dépendants » suivent leur case :
 * pas d'animaux → pas de nombres ; pas d'extérieur → pas de description.
 */
function hostAnswers() {
	const hasAnimalsAtHome = randomBool(0.5);
	const animals = hasAnimalsAtHome ? someAnimals(3, 2) : null;
	const outside = randomBool(0.5);
	const catAdult = int(1, 4);
	const kittyAndKitten = randomBool(0.5);

	return {
		type: faker.helpers.weightedArrayElement([
			{ weight: 6, value: HOST_TYPE[0] },
			{ weight: 1, value: HOST_TYPE[1] },
			{ weight: 1, value: HOST_TYPE[2] },
			{ weight: 1, value: HOST_TYPE[3] },
			{ weight: 1, value: HOST_TYPE[4] }
		]),
		catAdult,
		kittyAndKitten,
		kitten: kittyAndKitten ? int(1, 5) : 0,
		hasAnimalsAtHome,
		numberOfCatsAtHome: animals?.cats ?? null,
		numberOfDogsAtHome: animals?.dogs ?? null,
		otherAnimalsAtHome: animals?.other ?? null,
		space: int(25, 180),
		homeDescription: pick(HOME_DESCRIPTIONS),
		presence: pick(PRESENCES),
		outside,
		outsideDescription: outside ? pick(OUTSIDE_DESCRIPTIONS) : null,
		heal: pick(HEAL),
		socialize: pick(SOCIALIZE),
		car: randomBool(0.7),
		babyFeeding: pick(BABY)
	};
}

function generateHostData() {
	const actif = faker.helpers.weightedArrayElement([
		{ weight: 7, value: COLAB_ACTIVITY[0] },
		{ weight: 2, value: COLAB_ACTIVITY[1] },
		{ weight: 1, value: COLAB_ACTIVITY[2] }
	]);

	return {
		...hostAnswers(),
		actif,
		...(actif === 'BREAK' ? generateBreakDates() : { breakStart: null, breakEnd: null }),
		// En pause ou arrêtée : elle ne prend pas de nouveau chat
		isAvailable: actif === 'ACTIVE' && randomBool(0.7),
		isStockFeed: randomBool(0.4),
		additionalInformation: randomBool(0.5) ? pick(HOST_INFOS) : null,
		stopActivity: actif === 'STOP' ? pick(STOP_REASONS) : null
	};
}

function generateFocalPoint() {
	return { focalPointX: int(30, 70), focalPointY: int(20, 60) };
}

/** Le foyer décrit dans une demande d'adoption (mêmes règles que le serveur : rules.ts) */
function adoptionHome() {
	const hasGarden = randomBool(0.4);
	const hasPets = randomBool(0.5);
	const pets = hasPets ? someAnimals(2, 1) : null;
	return {
		housingSize: int(25, 200),
		hasGarden,
		gardenSize: hasGarden ? int(20, 1500) : undefined,
		hasPets,
		numberOfCats: pets?.cats ?? 0,
		numberOfDogs: pets?.dogs ?? 0,
		otherPets: pets?.other ?? undefined,
		numberOfChildren: int(0, 3)
	};
}

type PersonLike = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	address: string | null;
	birthDate: Date | null;
	city: string | null;
	postalCode: string | null;
	district: string | null;
};

/** La partie « personne » d'une demande : recopiée du profil (même téléphone, même adresse) */
function personAnswers(profil: PersonLike) {
	return {
		firstName: profil.firstName,
		lastName: profil.lastName,
		phone: profil.phone,
		email: profil.email,
		address: profil.address,
		birthDate: profil.birthDate,
		city: profil.city,
		postalCode: profil.postalCode,
		district: profil.district ?? undefined
	};
}

/** Une demande libre : le chat recherché, plutôt cohérent (une préférence ou « sans préférence ») */
function flexiblePreferences() {
	return {
		catAge: pick(['kitten', 'junior', 'adult', 'senior', 'free']),
		catSex: pick(['male', 'female', 'free']),
		color: randomBool(0.4) ? faker.helpers.weightedArrayElement(CAT_COLORS) : undefined,
		furLength: pick(['short', 'medium', 'long', 'free']),
		temperament: pick(WANTED_TEMPERAMENTS)
	};
}

/** La note d'un refus, au même format que l'app (rejectForm) */
const rejectedNote = (date: Date, reason: string) =>
	`Refusée le ${date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })} : ${reason}`;

/** Format CAAMMnnn : C + année + mois d'ARRIVÉE + numéro d'ordre */
function catNumber(arrivedAt: Date, sequence: number) {
	const year = String(arrivedAt.getFullYear() % 100).padStart(2, '0');
	const month = String(arrivedAt.getMonth() + 1).padStart(2, '0');
	return `C${year}${month}${String(sequence).padStart(3, '0')}`;
}

/** L'âge (en mois) selon le statut : beaucoup de chatons à sociabiliser, des adultes libres… */
function ageInMonthsFor(status: CatStatus, returned: boolean) {
	const kitten = { min: 2, max: 5 };
	const junior = { min: 6, max: 12 };
	const adult = { min: 13, max: 120 };
	const senior = { min: 121, max: 200 };

	// Un chat déjà rendu une fois est arrivé il y a longtemps : au moins 1 an
	if (returned) return int(14, 120);

	const range = faker.helpers.weightedArrayElement(
		{
			AVAILABLE: [
				{ weight: 3, value: kitten },
				{ weight: 2, value: junior },
				{ weight: 4, value: adult },
				{ weight: 1, value: senior }
			],
			SOCIALIZE: [
				{ weight: 5, value: { min: 1, max: 5 } },
				{ weight: 2, value: junior },
				{ weight: 2, value: adult }
			],
			ADOPTED: [
				{ weight: 2, value: { min: 3, max: 5 } },
				{ weight: 3, value: junior },
				{ weight: 4, value: adult },
				{ weight: 1, value: senior }
			],
			FREE: [{ weight: 1, value: { min: 12, max: 96 } }],
			DEAD: [{ weight: 1, value: { min: 60, max: 200 } }]
		}[status]
	);
	return int(range.min, range.max);
}

/** La phrase de description d'une fiche : caractère + ententes (tirées AVANT, pour coller aux cases) */
function catDescription(
	status: CatStatus,
	ageMonths: number,
	ok: { isOkCat: boolean; isOkDog: boolean; isOkChild: boolean }
) {
	if (status === 'FREE') return 'Chat de colonie, stérilisé puis relâché sur son lieu de vie.';

	const parts = [
		ageMonths < 6 ? 'Chaton plein de vie qui découvre le monde' : pick(CAT_TEMPERAMENTS)
	];
	if (status === 'SOCIALIZE')
		parts.push('En cours de sociabilisation : il lui faut une famille patiente');
	if (ok.isOkCat) parts.push('S’entend bien avec les autres chats');
	if (ok.isOkDog) parts.push('Habitué aux chiens');
	if (ok.isOkChild) parts.push('Adore les enfants');
	return parts.join('. ') + '.';
}

// =====================================================================
// MAIN
// =====================================================================
async function main() {
	console.log('🌱 Seeding avec données réalistes...');

	// ---------------------
	// CLEAN
	// ---------------------
	console.log('🧹 Nettoyage de la BDD...');
	await prisma.careDocument.deleteMany();
	await prisma.catDocument.deleteMany();
	await prisma.newsCat.deleteMany();
	await prisma.catVolunteer.deleteMany();
	await prisma.placement.deleteMany();
	await prisma.adoption.deleteMany();
	await prisma.care.deleteMany();
	await prisma.sickness.deleteMany();
	await prisma.mediaCat.deleteMany();

	await prisma.news.deleteMany();
	await prisma.media.deleteMany({ where: { infoDocument: null } });
	await prisma.cat.deleteMany();
	await prisma.volunteer.deleteMany();
	await prisma.host.deleteMany();
	await prisma.blacklistHistoric.deleteMany();
	await prisma.form.deleteMany();
	await prisma.session.deleteMany();
	await prisma.profil.deleteMany();

	console.log('📤 Envoi des fichiers d’exemple dans S3...');
	await uploadSamples();

	// ---------------------
	// 👤 PROFILS (150)
	// ---------------------
	// Les tranches servent de « rôles » :
	//   0-26 bénévoles · 27-36 candidates bénévoles · 37-106 FA · 107-109 candidates FA
	//   110-149 adoptants (dont 140-142 : cas de blacklist)
	console.log('👤 Création des profils...');
	const profils: Profil[] = [];
	for (let i = 0; i < 150; i++) {
		profils.push(await prisma.profil.create({ data: fakeProfil(i) }));
	}

	// Les personnes blacklistées (cas fixes, créés plus bas) : on ne leur confie rien
	const blacklisted = {
		adopter: profils[140],
		historic: profils[141],
		lifted: profils[142],
		volunteer: profils[26],
		host: profils[106]
	};
	const blacklistedIds = new Set(
		[blacklisted.adopter, blacklisted.historic, blacklisted.volunteer, blacklisted.host].map(
			(p) => p.id
		)
	);

	// ---------------------
	// 🔐 COMPTES FIXES (ADMIN, MANAGER, COMM)
	// ---------------------
	console.log('🔐 Création des comptes fixes...');
	const fixedAccount = (
		firstName: string,
		email: string,
		phone: string,
		birthDate: string,
		district: (typeof DISTRICTS)[number]
	) =>
		prisma.profil.create({
			data: {
				firstName,
				lastName: 'Pattounes',
				birthDate: new Date(birthDate),
				email,
				phone,
				address: '12 rue de l’Université',
				city: 'Montpellier',
				postalCode: '34000',
				district
			}
		});

	const adminProfil = await fixedAccount(
		'Admin',
		'admin@test.com',
		'0600000001',
		'1990-01-01',
		'CENTRE_VILLE'
	);
	const managerProfil = await fixedAccount(
		'Manager',
		'manager@test.com',
		'0600000002',
		'1992-05-15',
		'PORT_MARIANNE'
	);
	const commProfil = await fixedAccount(
		'Communication',
		'comm@test.com',
		'0600000003',
		'1995-12-20',
		'MOSSON'
	);

	// ---------------------
	// 🙋 BÉNÉVOLES (3 fixes + 27)
	// ---------------------
	console.log('🙋 Création de 30 bénévoles...');
	const admin = await prisma.volunteer.create({
		data: {
			password: await hashPassword('admin123'),
			role: 'ADMIN',
			actif: 'ACTIVE',
			isFlexibleDispatcher: true,
			profilId: adminProfil.id
		}
	});
	const manager = await prisma.volunteer.create({
		data: {
			password: await hashPassword('manager123'),
			role: 'MANAGER',
			actif: 'ACTIVE',
			isFlexibleDispatcher: false,
			profilId: managerProfil.id
		}
	});
	const comm = await prisma.volunteer.create({
		data: {
			password: await hashPassword('comm123'),
			role: 'COMMUNICATION',
			actif: 'ACTIVE',
			isFlexibleDispatcher: false,
			profilId: commProfil.id
		}
	});

	const volunteers = [admin, manager, comm];
	// Le hash est lent : on le calcule UNE fois pour les 27 comptes de test
	const testPassword = await hashPassword('password');

	for (let i = 0; i < 27; i++) {
		const isBlacklisted = profils[i].id === blacklisted.volunteer.id;
		const actif = isBlacklisted
			? 'STOP'
			: faker.helpers.weightedArrayElement([
					{ weight: 7, value: COLAB_ACTIVITY[0] },
					{ weight: 2, value: COLAB_ACTIVITY[1] },
					{ weight: 1, value: COLAB_ACTIVITY[2] }
				]);

		volunteers.push(
			await prisma.volunteer.create({
				data: {
					password: testPassword,
					// Surtout des bénévoles « terrain » : peu d'admins
					role: faker.helpers.weightedArrayElement([
						{ weight: 1, value: VOLUNTEER_ROLE[0] },
						{ weight: 6, value: VOLUNTEER_ROLE[1] },
						{ weight: 2, value: VOLUNTEER_ROLE[2] }
					]),
					actif,
					isFlexibleDispatcher: false,
					...(actif === 'BREAK' ? generateBreakDates() : { breakStart: null, breakEnd: null }),
					profilId: profils[i].id
				}
			})
		);
	}

	// Seules les bénévoles actives (et non blacklistées) suivent des chats et des demandes
	const activeVolunteers = volunteers.filter(
		(v) => v.actif === 'ACTIVE' && !blacklistedIds.has(v.profilId)
	);

	// ---------------------
	// 🏠 FAMILLES D'ACCUEIL (80)
	// ---------------------
	console.log("🏠 Création de 80 familles d'accueil...");
	const hosts: Host[] = [];

	console.log('  → 10 FA qui sont aussi bénévoles...');
	for (let i = 0; i < 10; i++) {
		hosts.push(
			await prisma.host.create({
				data: { profilId: volunteers[3 + i].profilId, ...generateHostData() }
			})
		);
	}

	console.log('  → 70 FA sans compte bénévole...');
	for (let i = 37; i < 107; i++) {
		const isBlacklisted = profils[i].id === blacklisted.host.id;
		hosts.push(
			await prisma.host.create({
				data: {
					profilId: profils[i].id,
					...generateHostData(),
					// La FA blacklistée ne travaille plus avec l'association
					...(isBlacklisted && {
						actif: 'STOP' as const,
						isAvailable: false,
						breakStart: null,
						breakEnd: null,
						stopActivity: 'Fin de collaboration'
					})
				}
			})
		);
	}

	// Nombre de chats ACTUELLEMENT chez chaque FA : pour ne pas dépasser sa capacité
	const hostLoad = new Map<string, number>();
	const capacity = (host: (typeof hosts)[number]) => (host.catAdult ?? 1) + (host.kitten ?? 0);

	/** Une FA pour un séjour EN COURS : active, avec de la place, et adaptée au chat si possible */
	function pickCurrentHost(isKitten: boolean, needsSocialization: boolean) {
		const active = hosts.filter((h) => h.actif === 'ACTIVE' && !blacklistedIds.has(h.profilId));
		const withRoom = active.filter((h) => (hostLoad.get(h.id) ?? 0) < capacity(h));
		const suited = withRoom.filter(
			(h) => (!isKitten || h.kittyAndKitten) && (!needsSocialization || h.socialize !== 'NO')
		);
		// On assouplit les critères si personne ne convient
		const host = pick(suited.length ? suited : withRoom.length ? withRoom : active);
		hostLoad.set(host.id, (hostLoad.get(host.id) ?? 0) + 1);
		return host;
	}

	// ---------------------
	// 🐱 CHATS (150) : une histoire par chat
	// ---------------------
	console.log('🐱 Création de 150 chats et de leur histoire...');

	// Les statuts sont FIXÉS (puis mélangés) : les stats ne bougent pas d'un seed à l'autre
	const repeat = (status: CatStatus, count: number) => Array.from({ length: count }, () => status);
	const statusPlan = faker.helpers.shuffle([
		...repeat('AVAILABLE', 70),
		...repeat('SOCIALIZE', 30),
		...repeat('ADOPTED', 30),
		...repeat('FREE', 15),
		...repeat('DEAD', 5)
	]);

	// Retours d'adoption : 5 chats ré-adoptés ensuite, 3 revenus à l'adoption.
	// Les 2 premiers revenus à l'adoption ont été rendus par des personnes blacklistées depuis
	const returnedBy = new Map<number, { profil: (typeof profils)[number]; reason: string }>();
	const returned = new Set<number>();
	statusPlan
		.map((status, index) => ({ status, index }))
		.filter((c) => c.status === 'ADOPTED')
		.slice(0, 5)
		.forEach((c) => returned.add(c.index));
	const availableReturns = statusPlan
		.map((status, index) => ({ status, index }))
		.filter((c) => c.status === 'AVAILABLE')
		.slice(0, 3);
	availableReturns.forEach((c) => returned.add(c.index));
	returnedBy.set(availableReturns[0].index, {
		profil: blacklisted.adopter,
		reason: 'Chat rendu en mauvais état, refus de tout contact.'
	});
	returnedBy.set(availableReturns[1].index, {
		profil: blacklisted.historic,
		reason: 'Visites de suivi refusées, chat rendu à l’association.'
	});

	// Les adoptants : chacun n'adopte qu'une fois, et jamais une personne blacklistée
	const adopterPool = faker.helpers.shuffle(
		profils.slice(110, 150).filter((p) => !blacklistedIds.has(p.id))
	);
	let nextAdopter = 0;
	const takeAdopter = () => adopterPool[nextAdopter++ % adopterPool.length];

	// Toutes les personnes qui peuvent DEMANDER un chat (les blacklistées aussi : c'est le cas à tester)
	const requesters = profils.slice(110, 150);

	type AdoptionFormType = 'ADOPTION_SPECIFIC' | 'ADOPTION_FLEXIBLE';
	async function createAdoptionForm(input: {
		type: AdoptionFormType;
		profil: PersonLike;
		status: 'PENDING' | 'APPROVED' | 'REJECTED';
		createdAt: Date;
		catId?: string | null;
		assignedToId?: string | null;
		notes?: string | null;
	}) {
		return prisma.form.create({
			data: {
				type: input.type,
				status: input.status,
				email: input.profil.email,
				catId: input.catId ?? null,
				assignedToId: input.assignedToId ?? null,
				createdAt: input.createdAt,
				notes: input.notes ?? (randomBool(0.3) ? pick(FORM_NOTES) : null),
				data: {
					...personAnswers(input.profil),
					birthDate: input.profil.birthDate?.toISOString().split('T')[0] ?? null,
					...(input.type === 'ADOPTION_FLEXIBLE' ? flexiblePreferences() : {}),
					...adoptionHome()
				}
			}
		});
	}

	// Pour les News chats et les demandes en attente
	const visibleAvailableCats: { id: string; publishedAt: Date; referentId: string }[] = [];
	let flexibleCount = 0;

	for (let i = 0; i < statusPlan.length; i++) {
		const status = statusPlan[i];
		const isReturned = returned.has(i);
		const returnInfo = returnedBy.get(i);

		// ===== 1. Âge et arrivée =====
		const ageMonths = ageInMonthsFor(status, isReturned);
		const birthDate = addDays(addMonths(now, -ageMonths), -int(0, 25));

		// Plus tard possible pour l'arrivée : il faut laisser le temps à la suite de l'histoire
		const latestArrival = returnInfo
			? new Date('2025-09-01') // retour avant la blacklist (janvier 2026)
			: isReturned
				? daysAgo(220)
				: status === 'ADOPTED' || status === 'DEAD'
					? daysAgo(60)
					: status === 'FREE'
						? daysAgo(15)
						: daysAgo(5);
		const earliestArrival = maxDate(addDays(birthDate, 14), daysAgo(2 * 365));
		let arrivedAt = dateBetween(earliestArrival, latestArrival);
		const ageAtArrival = monthsBetween(birthDate, arrivedAt);

		// L'origine dépend de l'âge à l'arrivée : une « portée trouvée » n'a que des chatons
		const origin =
			status === 'FREE'
				? { label: FREE_ORIGIN, surrender: false, kittenOnly: false }
				: faker.helpers.weightedArrayElement(
						ORIGINS.filter((o) => ageAtArrival < 3 || !o.value.kittenOnly)
					);
		if (origin.label === 'Né en famille d’accueil') arrivedAt = birthDate;

		// ===== 2. La suite de l'histoire : retour, adoption, décès, relâcher =====
		const cancelled = isReturned
			? (() => {
					const start = dateBetween(
						addDays(arrivedAt, 30),
						returnInfo ? new Date('2025-11-15') : daysAgo(150)
					);
					return {
						start,
						end: addDays(start, int(15, 60)),
						profil: returnInfo?.profil ?? takeAdopter(),
						reason: returnInfo?.reason ?? pick(CANCEL_REASONS)
					};
				})()
			: null;

		const adoptedAt =
			status === 'ADOPTED'
				? dateBetween(addDays(cancelled ? cancelled.end : arrivedAt, 30), daysAgo(2))
				: null;
		const trialEndsAt = adoptedAt ? addMonths(adoptedAt, TRIAL_MONTHS) : null;
		// Essai terminé : une fois sur deux, le propriétaire a été changé (FINAL) ;
		// sinon il reste en essai… et apparaît dans « Adoptions à finaliser »
		const isFinal = !!trialEndsAt && trialEndsAt < now && randomBool(0.5);
		const finalizedAt =
			isFinal && trialEndsAt ? minDate(addDays(trialEndsAt, int(1, 20)), now) : null;

		const diedAt = status === 'DEAD' ? dateBetween(addDays(arrivedAt, 30), daysAgo(5)) : null;
		const releasedAt = status === 'FREE' ? addDays(arrivedAt, int(7, 14)) : null;

		// Les soins s'arrêtent à l'adoption (l'adoptant prend le relais) ou au décès
		const careEnd = adoptedAt ?? diedAt ?? now;

		// ===== 3. Les soins prévus =====
		type PlannedCare = {
			type: CareType;
			date: Date;
			reason: string;
			description: string;
			sickness?: number; // index dans `sicknesses`
		};
		const cares: PlannedCare[] = [];
		/** Ajoute le soin s'il a lieu avant la fin de l'histoire ; renvoie s'il a été ajouté */
		const addCare = (care: PlannedCare) => {
			if (care.date > careEnd) return false;
			cares.push(care);
			return true;
		};

		const sex = pick(['MALE', 'FEMALE'] as const);
		const isAlreadySterilized =
			status !== 'FREE' && origin.surrender && ageAtArrival >= 12 && randomBool(0.5);
		const alreadyIdentified = origin.surrender && randomBool(0.6);

		if (randomBool(0.95)) {
			addCare({
				type: 'DEWORMING',
				date: addDays(arrivedAt, int(0, 3)),
				reason: 'Vermifuge à l’arrivée',
				description: 'Vermifuge et antiparasitaire externe'
			});
		}

		let fivTestDate: Date | null = null;
		let isFivPositive = false;
		if (ageAtArrival >= 6 && randomBool(0.85)) {
			isFivPositive = status !== 'FREE' && randomBool(0.07);
			const date = addDays(arrivedAt, int(0, 7));
			if (
				addCare({
					type: 'FIV_TEST',
					date,
					reason: 'Test FIV/FeLV à l’arrivée',
					description: isFivPositive ? 'FIV positif, FeLV négatif' : 'Négatif'
				})
			) {
				fivTestDate = date;
			} else {
				isFivPositive = false;
			}
		}

		if (status !== 'FREE') {
			// Primo-vaccination à 2 mois minimum, rappel un mois plus tard
			const firstShot = maxDate(addDays(arrivedAt, int(7, 20)), addMonths(birthDate, 2));
			if (
				addCare({
					type: 'VACCINE',
					date: firstShot,
					reason: 'Primo-vaccination typhus/coryza',
					description: 'RAS, rappel dans un mois'
				})
			) {
				addCare({
					type: 'VACCINE',
					date: addDays(firstShot, int(28, 35)),
					reason: 'Rappel typhus/coryza',
					description: 'Vaccination à jour'
				});
			}
		}

		// Stérilisation : dès 5 mois. Toujours pour un chat libre (c'est le but de la campagne)
		// et pour un adopté (avant son départ, ou pendant l'essai s'il est parti chaton)
		let sterilizedAt: Date | null = null;
		if (!isAlreadySterilized) {
			const earliest = maxDate(
				addDays(arrivedAt, status === 'FREE' ? int(1, 3) : int(10, 40)),
				addMonths(birthDate, 5)
			);
			const chance = { AVAILABLE: 0.85, SOCIALIZE: 0.6, ADOPTED: 1, FREE: 1, DEAD: 0.5 }[status];
			if (earliest <= careEnd && randomBool(chance)) {
				sterilizedAt = earliest;
			} else if (adoptedAt && finalizedAt) {
				sterilizedAt = dateBetween(maxDate(adoptedAt, addMonths(birthDate, 5)), finalizedAt);
			}
		}
		if (sterilizedAt) {
			cares.push({
				type: 'STERILIZE',
				date: sterilizedAt,
				reason: 'Stérilisation',
				description:
					sex === 'FEMALE' ? 'Ovariectomie, suites simples' : 'Castration, suites simples'
			});
		}

		// Identification : en même temps que la stérilisation, sinon quelques semaines après l'arrivée
		if (!alreadyIdentified && (status === 'FREE' || randomBool(0.8))) {
			const date = sterilizedAt ?? addDays(arrivedAt, int(14, 45));
			const care = {
				type: 'IDENTIFICATION' as const,
				date,
				reason: 'Pose de puce électronique',
				description: 'Puce posée, enregistrée à l’I-CAD'
			};
			if (sterilizedAt) cares.push(care);
			else addCare(care);
		}

		// ===== 4. Les maladies (et leurs soins) =====
		type PlannedSickness = (typeof SICKNESSES)[number] & {
			startDate: Date;
			endDate: Date | null;
			status: 'ACTIVE' | 'TREATED' | 'RESOLVED';
		};
		const sicknesses: PlannedSickness[] = [];
		const chosen = [
			...(isFivPositive && fivTestDate ? [{ ...FIV_POSITIVE, startDate: fivTestDate }] : []),
			...(ageMonths > 120 && status !== 'FREE' && randomBool(0.3)
				? [{ ...KIDNEY_DISEASE, startDate: dateBetween(arrivedAt, careEnd) }]
				: []),
			...faker.helpers
				.arrayElements(
					SICKNESSES,
					status === 'FREE'
						? 0
						: faker.helpers.weightedArrayElement([
								{ weight: 5, value: 0 },
								{ weight: 3, value: 1 },
								{ weight: 1, value: 2 }
							])
				)
				.map((s) => ({ ...s, startDate: dateBetween(arrivedAt, careEnd) }))
		];

		for (const s of chosen) {
			// Une maladie aiguë guérit en 10 à 40 jours ; une maladie chronique se suit, sans fin
			const healedAt = addDays(s.startDate, int(10, 40));
			const endDate = !s.chronic && healedAt <= now ? healedAt : null;
			const index = sicknesses.length;
			sicknesses.push({
				...s,
				endDate,
				status: s.chronic ? 'TREATED' : endDate ? 'RESOLVED' : 'ACTIVE'
			});

			if (s !== chosen.find((c) => c.name === FIV_POSITIVE.name)) {
				addCare({
					type: 'TREATMENT',
					date: addDays(s.startDate, int(0, 2)),
					reason: `Traitement : ${s.name}`,
					description: s.treatment,
					sickness: index
				});
			}
			addCare({
				type: 'CONTROL',
				date: addDays(s.startDate, int(14, 30)),
				reason: `Contrôle : ${s.name}`,
				description: endDate ? 'Guérison confirmée' : 'Évolution favorable, suivi à poursuivre',
				sickness: index
			});
		}

		// ===== 5. La fiche du chat : ses cases DÉCOULENT des soins =====
		const has = (type: CareType) => cares.some((c) => c.type === type);
		const vaccineCount = cares.filter((c) => c.type === 'VACCINE').length;
		const isIdentify = alreadyIdentified || has('IDENTIFICATION');
		const ok = { isOkCat: randomBool(0.6), isOkDog: randomBool(0.3), isOkChild: randomBool(0.5) };

		// Visible sur le site : surtout les chats à l'adoption, depuis leur (re)mise à l'adoption
		const isVisible =
			status === 'AVAILABLE'
				? randomBool(0.85)
				: status === 'ADOPTED'
					? randomBool(0.7)
					: status === 'SOCIALIZE'
						? randomBool(0.15)
						: false;
		const listedSince = cancelled ? cancelled.end : arrivedAt;
		// Adopté : publié avant son adoption. À l'adoption : dans les 6 dernières semaines
		// (environ 1 sur 6 tombe dans les 7 derniers jours, pour la News chats)
		const publishedAt = !isVisible
			? null
			: adoptedAt
				? dateBetween(listedSince, adoptedAt)
				: dateBetween(maxDate(listedSince, daysAgo(42)), now);

		const cat = await prisma.cat.create({
			data: {
				name: pick(CAT_NAMES),
				catNumber: catNumber(arrivedAt, i + 1),
				// Un jeune chaton pas encore vu par le véto : sexe pas toujours certain
				sex: !sterilizedAt && ageMonths < 4 && randomBool(0.4) ? 'UNKNOWN' : sex,
				birthDate,
				isVisible,
				publishedAt,
				status,
				hairLength: faker.helpers.weightedArrayElement([
					{ weight: 6, value: 'SHORT' as const },
					{ weight: 2, value: 'MEDIUM' as const },
					{ weight: 1, value: 'LONG' as const }
				]),
				color: faker.helpers.weightedArrayElement(CAT_COLORS),
				origin: origin.label,
				// Stérilisé PAR l'asso (soin) OU déjà stérilisé à l'arrivée : jamais les deux
				isSterilize: !!sterilizedAt,
				isAlreadySterilized,
				vaccinate: vaccineCount >= 2 ? 'YES' : vaccineCount === 1 ? 'PARTIAL' : 'NO',
				isFivTest: has('FIV_TEST'),
				isDeworming: has('DEWORMING'),
				description: catDescription(status, ageMonths, ok),
				...ok,
				isOutside: status === 'FREE' ? true : randomBool(0.25),
				isIdentify,
				// Numéro de puce français : 250 + 12 chiffres
				chipId: isIdentify ? `250269${faker.string.numeric(9)}` : null,
				createdAt: arrivedAt
			}
		});

		// ===== 6. Galerie (copies des fichiers d'exemple dans S3) =====
		const gallery = [
			...faker.helpers.arrayElements(SAMPLE_IMAGES, int(1, 4)),
			...(randomBool(0.2) ? [SAMPLE_VIDEO] : [])
		];
		for (let k = 0; k < gallery.length; k++) {
			const sample = gallery[k];
			const storageKey = await copySampleToCat(cat.id, sample);
			await prisma.mediaCat.create({
				data: {
					cat: { connect: { id: cat.id } },
					isPrimary: k === 0, // la première image est la photo principale
					...generateFocalPoint(),
					file: {
						create: {
							type: sample.type,
							storageKey,
							mimeType: sample.mimeType,
							sizeBytes: sample.sizeBytes,
							originalName: sample.path.split('/').pop(),
							isPrivate: false
						}
					}
				}
			});
		}

		// ===== 7. Maladies puis soins (un soin peut pointer vers une maladie) =====
		const sicknessIds: string[] = [];
		for (const s of sicknesses) {
			const created = await prisma.sickness.create({
				data: {
					catId: cat.id,
					name: s.name,
					description: s.description,
					treatment: s.treatment,
					startDate: s.startDate,
					endDate: s.endDate,
					status: s.status
				}
			});
			sicknessIds.push(created.id);
		}

		cares.sort((a, b) => a.date.getTime() - b.date.getTime());
		for (const care of cares) {
			// Un document (ordonnance, facture…) pour environ un soin sur trois
			const media = randomBool(0.35)
				? [
						await pdfMedia(
							`cats/${cat.id}/cares`,
							`${cat.catNumber}_${pick(CARE_DOC_NAMES)}.pdf`,
							true
						)
					]
				: [];
			await prisma.care.create({
				data: {
					catId: cat.id,
					type: care.type,
					date: care.date,
					reason: care.reason,
					description: care.description,
					veterinary: pick(VETERINARIES),
					sicknessId: care.sickness === undefined ? null : sicknessIds[care.sickness],
					documents: { create: media.map((m) => ({ media: { create: m } })) }
				}
			});
		}

		// ===== 8. Bénévoles qui suivent le chat (la 1re est la référente) =====
		const followers = faker.helpers.arrayElements(activeVolunteers, int(1, 2));
		for (const v of followers) {
			await prisma.catVolunteer.create({ data: { catId: cat.id, volunteerId: v.id } });
		}
		const referentId = followers[0].id;

		// ===== 9. Familles d'accueil : des séjours qui se suivent, sans trou ni chevauchement =====
		const isKitten = ageMonths < 6;
		async function createStay(start: Date, end: Date | null, type: 'LONG' | 'SHORT') {
			const host = end ? pick(hosts) : pickCurrentHost(isKitten, status === 'SOCIALIZE');
			await prisma.placement.create({
				data: {
					catId: cat.id,
					hostId: host.id,
					// Séjour terminé : STOP avec une date de fin. En cours : ACTIVE, sans fin
					status: end ? 'STOP' : 'ACTIVE',
					type,
					startDate: start,
					endDate: end
				}
			});
		}
		/** Une période passée en FA : parfois un premier accueil court avant la FA « longue » */
		async function createStays(from: Date, to: Date | null) {
			const until = to ?? now;
			if (monthsBetween(from, until) > 1 && randomBool(0.3)) {
				const switchAt = dateBetween(addDays(from, 7), addDays(until, -7));
				await createStay(from, switchAt, 'SHORT');
				await createStay(switchAt, to, 'LONG');
			} else {
				await createStay(from, to, 'LONG');
			}
		}

		if (status === 'FREE' && releasedAt) {
			// Convalescence après la stérilisation, puis relâché sur son lieu de vie
			await createStay(arrivedAt, releasedAt, 'SHORT');
		} else {
			await createStays(arrivedAt, cancelled ? cancelled.start : (adoptedAt ?? diedAt));
			// Revenu d'adoption : de nouveau en FA, jusqu'à la nouvelle adoption (ou encore aujourd'hui)
			if (cancelled) await createStays(cancelled.end, adoptedAt);
		}

		// ===== 10. Documents d'arrivée =====
		if (origin.surrender) await createCatDocument(cat, 'SURRENDER', arrivedAt);

		// ===== 11. Adoptions et demandes =====
		/** La demande acceptée d'une adoption : précise (souvent) ou libre avec ce chat choisi */
		async function approvedRequest(profil: PersonLike, adoptionStart: Date) {
			const type: AdoptionFormType = randomBool(0.7) ? 'ADOPTION_SPECIFIC' : 'ADOPTION_FLEXIBLE';
			if (type === 'ADOPTION_FLEXIBLE') flexibleCount++;
			await createAdoptionForm({
				type,
				profil,
				status: 'APPROVED',
				catId: cat.id,
				assignedToId: type === 'ADOPTION_SPECIFIC' ? referentId : pick(activeVolunteers).id,
				createdAt: addDays(adoptionStart, -int(5, 25))
			});
		}

		if (cancelled) {
			const adoption = await prisma.adoption.create({
				data: {
					catId: cat.id,
					profilId: cancelled.profil.id,
					status: 'CANCELLED',
					// Elle avait commencé comme toute adoption : par un essai de 6 mois
					trialEndsAt: addMonths(cancelled.start, TRIAL_MONTHS),
					endDate: cancelled.end,
					cancelReason: cancelled.reason,
					createdAt: cancelled.start
				}
			});
			await createCatDocument(cat, 'ADOPTION_CONTRACT', cancelled.start, adoption.id);
			await createCatDocument(cat, 'ADOPTION_RETURN', cancelled.end, adoption.id);
			await approvedRequest(cancelled.profil, cancelled.start);
		}

		if (adoptedAt && trialEndsAt) {
			const adopter = takeAdopter();
			const adoption = await prisma.adoption.create({
				data: {
					catId: cat.id,
					profilId: adopter.id,
					status: isFinal ? 'FINAL' : 'TRIAL',
					trialEndsAt,
					finalizedAt,
					createdAt: adoptedAt
				}
			});
			await createCatDocument(cat, 'ADOPTION_CONTRACT', adoptedAt, adoption.id);
			await approvedRequest(adopter, adoptedAt);

			// Les autres demandes pour ce chat ont été refusées à l'adoption (comme dans l'app)
			const others = faker.helpers.arrayElements(
				requesters.filter((p) => p.id !== adopter.id),
				int(0, 2)
			);
			for (const other of others) {
				await createAdoptionForm({
					type: 'ADOPTION_SPECIFIC',
					profil: other,
					status: 'REJECTED',
					catId: cat.id,
					assignedToId: referentId,
					createdAt: addDays(adoptedAt, -int(1, 30)),
					notes: ADOPTED_ELSEWHERE_NOTE
				});
			}
		}

		if (status === 'AVAILABLE' && isVisible && publishedAt) {
			visibleAvailableCats.push({ id: cat.id, publishedAt, referentId });
		}
	}

	// ---------------------
	// 📄 DEMANDES EN COURS sur les chats à l'adoption
	// ---------------------
	console.log("📄 Création des demandes d'adoption en cours...");

	// Cas fixe : la personne blacklistée demande un chat → l'encadré rouge s'affiche
	const blacklistTarget = visibleAvailableCats[0];
	await createAdoptionForm({
		type: 'ADOPTION_SPECIFIC',
		profil: blacklisted.adopter,
		status: 'PENDING',
		catId: blacklistTarget.id,
		assignedToId: blacklistTarget.referentId,
		createdAt: daysAgo(2)
	});

	for (const cat of visibleAvailableCats) {
		const count = faker.helpers.weightedArrayElement([
			{ weight: 3, value: 0 },
			{ weight: 3, value: 1 },
			{ weight: 2, value: 2 },
			{ weight: 1, value: 3 }
		]);
		for (const profil of faker.helpers.arrayElements(requesters, count)) {
			// Une demande refusée de temps en temps, les autres en attente
			const isRejected = randomBool(0.2);
			const createdAt = dateBetween(maxDate(cat.publishedAt, daysAgo(30)), now);
			await createAdoptionForm({
				type: 'ADOPTION_SPECIFIC',
				profil,
				status: isRejected ? 'REJECTED' : 'PENDING',
				catId: cat.id,
				assignedToId: cat.referentId,
				createdAt,
				notes: isRejected
					? rejectedNote(addDays(createdAt, int(1, 5)), pick(REJECT_REASONS))
					: undefined
			});
		}
	}

	// ---------------------
	// 📄 DEMANDES LIBRES (150 au total, dont celles déjà acceptées)
	// ---------------------
	console.log("  → demandes d'adoption libres...");
	await createAdoptionForm({
		type: 'ADOPTION_FLEXIBLE',
		profil: blacklisted.historic,
		status: 'PENDING',
		createdAt: daysAgo(4)
	});
	flexibleCount++;

	while (flexibleCount < 150) {
		const isPending = randomBool(0.7);
		const createdAt = isPending ? daysAgo(int(0, 60)) : daysAgo(int(30, 365));
		await createAdoptionForm({
			type: 'ADOPTION_FLEXIBLE',
			profil: pick(requesters.filter((p) => !blacklistedIds.has(p.id))),
			status: isPending ? 'PENDING' : 'REJECTED',
			// En attente : pas toujours répartie (c'est le rôle de la répartitrice)
			assignedToId: !isPending || randomBool(0.6) ? pick(activeVolunteers).id : null,
			createdAt,
			notes: isPending
				? undefined
				: rejectedNote(addDays(createdAt, int(1, 10)), pick(REJECT_REASONS))
		});
		flexibleCount++;
	}

	// ---------------------
	// 📰 NEWS
	// ---------------------
	console.log('📰 Création des news...');
	for (let i = 0; i < 30; i++) {
		const type = pick(NEWS_TYPES);
		const isCatsNews = type === 'NEWSCATS';

		// Entre 8 jours et 6 mois : jamais dans la fenêtre des 7 jours du cron
		const createdAt = dateBetween(daysAgo(180), daysAgo(8));

		// Un PDF public par news, sauf pour les News chats
		const media = isCatsNews ? null : await pdfMedia('news', 'newsletter.pdf', false);

		// Des chats seulement pour les News chats : des chats visibles et à l'adoption
		const newsCats = isCatsNews ? faker.helpers.arrayElements(visibleAvailableCats, int(2, 6)) : [];

		await prisma.news.create({
			data: {
				title: pick(NEWS_CONTENT[type].titles),
				type,
				content: NEWS_CONTENT[type].content,
				createdAt,
				...(media && { media: { create: media } }),
				...(newsCats.length > 0 && {
					cats: { create: newsCats.map((c) => ({ catId: c.id })) }
				})
			}
		});
	}

	// ---------------------
	// 🔐 SESSION TEST
	// ---------------------
	console.log('🔐 Création de sessions...');
	await prisma.session.create({
		data: { token: faker.string.uuid(), volunteerId: admin.id, expiresAt: addDays(now, 30) }
	});

	// ---------------------
	// 🚫 BLACKLIST
	// ---------------------
	// Cas FIXES (pas de hasard) : la page Blacklist montre toujours les mêmes situations
	console.log('🚫 Création de blacklist (6 cas fixes)...');
	const lifted = (description: string, date: string, reason: string) =>
		`${description}\n\nLevée le ${date} par Admin Pattounes : ${reason}`;

	const blacklistCases = [
		// 1. Adoptante blacklistée (sans compte) : elle a rendu un chat (adoption annulée),
		//    et a une demande en attente → encadré rouge
		{
			profil: blacklisted.adopter,
			description: 'Chat rendu en mauvais état, refus de tout contact.',
			isBlacklisted: true
		},
		// 2. Historique complet : blacklistée, levée, puis re-blacklistée
		{
			profil: blacklisted.historic,
			description: lifted(
				'Retards répétés pour les visites de suivi.',
				'15/03/2026',
				'Situation régularisée après un échange'
			),
			isBlacklisted: false,
			createdAt: new Date('2026-01-10')
		},
		{
			profil: blacklisted.historic,
			description: 'Nouvel abandon de suivi après la levée.',
			isBlacklisted: true,
			createdAt: new Date('2026-06-02')
		},
		// 3. Levée seulement : n'apparaît PAS dans la table (seulement dans « Levées »)
		{
			profil: blacklisted.lifted,
			description: lifted(
				'Doute sur le logement.',
				'20/02/2026',
				'Visite effectuée, tout est en ordre'
			),
			isBlacklisted: false
		},
		// 4. Bénévole blacklistée : son compte est désactivé (« Compte Bénévole désactivé »)
		{
			profil: blacklisted.volunteer,
			description: 'Comportement inadapté envers une famille d’accueil.',
			isBlacklisted: true
		},
		// 5. FA blacklistée : elle a eu des chats par le passé, plus aucun aujourd'hui
		{
			profil: blacklisted.host,
			description: 'Chats laissés sans soins pendant une absence.',
			isBlacklisted: true
		}
	];

	for (const { profil, ...entry } of blacklistCases) {
		await prisma.blacklistHistoric.create({
			data: { profilId: profil.id, email: profil.email.toLowerCase(), ...entry }
		});
	}

	// 6. Email seul (ni compte, ni demande) : « Nom inconnu » dans le panneau
	await prisma.blacklistHistoric.create({
		data: {
			email: 'demandes.frauduleuses@exemple.fr',
			description: 'Plusieurs demandes avec de fausses informations.',
			isBlacklisted: true
		}
	});

	// ---------------------
	// 📄 AUTRES FORMULAIRES
	// ---------------------
	console.log('  → 10 candidatures de bénévole...');
	// Acceptée → la personne a un compte bénévole ; en attente / refusée → pas (encore) de compte
	const volunteerApplicants = [
		...volunteers.slice(3, 6).map((v) => ({ profilId: v.profilId, status: 'APPROVED' as const })),
		...profils.slice(27, 32).map((p) => ({ profilId: p.id, status: 'PENDING' as const })),
		...profils.slice(32, 34).map((p) => ({ profilId: p.id, status: 'REJECTED' as const }))
	];
	const profilById = new Map(profils.map((p) => [p.id, p]));

	for (const { profilId, status } of volunteerApplicants) {
		const profil = profilById.get(profilId)!;
		const hasCatExperience = randomBool(0.7);
		const hasAssociationExperience = randomBool(0.5);
		const hasMedicalCareExperience = randomBool(0.3);
		const createdAt = status === 'PENDING' ? daysAgo(int(0, 30)) : daysAgo(int(60, 400));

		await prisma.form.create({
			data: {
				type: 'VOLUNTEER',
				status,
				email: profil.email,
				createdAt,
				data: {
					...personAnswers(profil),
					birthDate: profil.birthDate?.toISOString().split('T')[0] ?? null,
					// Une expérience cochée a sa description ; décochée, aucune (comme rules.ts)
					hasCatExperience,
					catExperienceDescription: hasCatExperience ? pick(CAT_EXPERIENCES) : undefined,
					hasAssociationExperience,
					associationExperienceDescription: hasAssociationExperience
						? pick(ASSOCIATION_EXPERIENCES)
						: undefined,
					hasMedicalCareExperience,
					medicalCareDescription: hasMedicalCareExperience ? pick(MEDICAL_EXPERIENCES) : undefined,
					hasTransportExperience: randomBool(0.6),
					car: randomBool(0.8),
					availability: pick(['LOW', 'MEDIUM', 'HIGH']),
					availabilityDuration: pick([
						'LESS_THAN_1_MONTH',
						'1_TO_3_MONTHS',
						'3_TO_6_MONTHS',
						'MORE_THAN_6_MONTHS',
						'LONG_TERM'
					]),
					canHelpWeekdays: randomBool(0.7),
					canHelpWeekends: randomBool(0.7),
					canHelpEmergencies: randomBool(0.4),
					motivation: pick(VOLUNTEER_MOTIVATIONS),
					skills: randomBool(0.6) ? pick(SKILLS) : undefined,
					additionalInformation: undefined
				},
				notes:
					status === 'REJECTED'
						? rejectedNote(addDays(createdAt, 7), 'Pas de réponse après deux relances')
						: null,
				assignedToId: status === 'PENDING' && randomBool(0.4) ? null : pick(activeVolunteers).id
			}
		});
	}

	console.log("  → 10 candidatures de famille d'accueil...");
	const hostApplicants = [
		...hosts.slice(10, 13).map((h) => ({ profilId: h.profilId, status: 'APPROVED' as const })),
		...[107, 108, 109, 34, 35].map((n) => ({
			profilId: profils[n].id,
			status: 'PENDING' as const
		})),
		...[36, 30].map((n) => ({ profilId: profils[n].id, status: 'REJECTED' as const }))
	];

	for (const { profilId, status } of hostApplicants) {
		const profil = profilById.get(profilId)!;
		const createdAt = status === 'PENDING' ? daysAgo(int(0, 30)) : daysAgo(int(60, 400));
		const answers = hostAnswers();

		await prisma.form.create({
			data: {
				type: 'HOST',
				status,
				email: profil.email,
				createdAt,
				data: {
					...personAnswers(profil),
					birthDate: profil.birthDate?.toISOString().split('T')[0] ?? null,
					...answers,
					// Le JSON n'a pas de null : une réponse absente est simplement omise
					numberOfCatsAtHome: answers.numberOfCatsAtHome ?? undefined,
					numberOfDogsAtHome: answers.numberOfDogsAtHome ?? undefined,
					otherAnimalsAtHome: answers.otherAnimalsAtHome ?? undefined,
					outsideDescription: answers.outsideDescription ?? undefined,
					motivation: pick(HOST_MOTIVATIONS),
					additionalMessage: randomBool(0.4) ? pick(HOST_INFOS) : undefined
				},
				notes:
					status === 'REJECTED'
						? rejectedNote(addDays(createdAt, 7), 'Logement inadapté (fenêtres non sécurisées)')
						: null,
				assignedToId: status === 'PENDING' && randomBool(0.4) ? null : pick(activeVolunteers).id
			}
		});
	}

	console.log('  → 10 propositions de partenariat...');
	for (let i = 0; i < 10; i++) {
		const kind = pick(COLAB_KINDS);
		const companyName = faker.company.name();
		const email = `contact@${slug(companyName).slice(0, 20) || 'partenaire'}${i}.fr`;
		const status = faker.helpers.weightedArrayElement([
			{ weight: 5, value: 'PENDING' as const },
			{ weight: 3, value: 'APPROVED' as const },
			{ weight: 2, value: 'REJECTED' as const }
		]);

		await prisma.form.create({
			data: {
				type: 'COLAB',
				status,
				email,
				createdAt: daysAgo(int(0, 200)),
				data: {
					firstName: faker.person.firstName(),
					lastName: faker.person.lastName(),
					companyName,
					email,
					phone: frenchMobile(),
					presentation: `${kind} à Montpellier depuis ${int(2, 20)} ans.`,
					partnershipProposal: pick(COLAB_PROPOSALS)
				},
				notes: randomBool(0.3) ? pick(FORM_NOTES) : null,
				assignedToId: randomBool(0.7) ? pick(activeVolunteers).id : null
			}
		});
	}

	// ---------------------
	// 📊 STATISTIQUES (comptées en base : elles ne peuvent pas mentir)
	// ---------------------
	const catsByStatus = await prisma.cat.groupBy({ by: ['status'], _count: true });
	const formsByType = await prisma.form.groupBy({ by: ['type'], _count: true });
	const adoptionsByStatus = await prisma.adoption.groupBy({ by: ['status'], _count: true });

	console.log('✅ Seed terminé !');
	console.log('📊 Statistiques :');
	console.log(
		`  - ${await prisma.profil.count()} profils, ${volunteers.length} bénévoles, ${hosts.length} FA`
	);
	console.log(`  - Chats : ${catsByStatus.map((c) => `${c.status} ${c._count}`).join(', ')}`);
	console.log(
		`  - Adoptions : ${adoptionsByStatus.map((a) => `${a.status} ${a._count}`).join(', ')}`
	);
	console.log(
		`  - Séjours en FA : ${await prisma.placement.count()} (dont ${await prisma.placement.count({ where: { status: 'ACTIVE' } })} en cours)`
	);
	console.log(
		`  - Soins : ${await prisma.care.count()}, maladies : ${await prisma.sickness.count()}`
	);
	console.log(`  - Formulaires : ${formsByType.map((f) => `${f.type} ${f._count}`).join(', ')}`);
}

// ---------------------
main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
