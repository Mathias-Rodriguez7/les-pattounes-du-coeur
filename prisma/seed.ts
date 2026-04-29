/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

// DB
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
	adapter
});

// ENUMS
const HAIR = ['SHORT', 'MEDIUM', 'LONG'] as const;
const STATUS = ['AVAILABLE', 'ADOPTED', 'SOCIALIZE'] as const;
const VACCINATE = ['YES', 'NO', 'PARTIAL'] as const;
const NEWS_TYPES = ['NEWS', 'NEWSLETTER', 'HISTORY', 'NEWSCATS', 'EVENT'] as const;

// UTILS
function randomBool(probability = 0.5) {
	return Math.random() < probability;
}

function getRandomImage(index: number) {
	return `/img/cats/cat${(index % 4) + 1}.jpg`;
}

function generateContent(type: (typeof NEWS_TYPES)[number]) {
	switch (type) {
		case 'EVENT':
			return faker.lorem.paragraphs(2);
		case 'HISTORY':
			return faker.lorem.paragraphs(4);
		case 'NEWSLETTER':
			return faker.lorem.paragraphs(3);
		case 'NEWSCATS':
			return faker.lorem.paragraphs(2);
		default:
			return faker.lorem.paragraphs(2);
	}
}

async function main() {
	console.log('🌱 Seeding...');

	// CLEAN
	await prisma.newsCat.deleteMany();
	await prisma.news.deleteMany();
	await prisma.mediaCat.deleteMany();
	await prisma.cat.deleteMany();

	// 🐱 CREATE CATS
	const createdCats = [];

	for (let i = 0; i < 40; i++) {
		const cat = await prisma.cat.create({
			data: {
				name: faker.person.firstName(),
				age: faker.number.int({ min: 1, max: 18 }),
				sex: faker.datatype.boolean(),

				status: faker.helpers.arrayElement(STATUS),
				isVisible: randomBool(0.9),

				hairLength: faker.helpers.arrayElement(HAIR),
				color: faker.color.human(),
				origin: faker.location.country(),

				isSterilize: randomBool(),
				isAlreadySterilized: randomBool(),

				vaccinate: faker.helpers.arrayElement(VACCINATE),

				isFivTest: randomBool(),
				isDeworming: randomBool(),

				description: faker.lorem.sentences(2),

				isOkCat: randomBool(),
				isOkDog: randomBool(),
				isOkChild: randomBool(),

				isOutside: randomBool(),
				isIdentify: randomBool(),

				chipId: faker.string.alphanumeric(10),

				media: {
					create: [
						{
							picture: getRandomImage(i)
						}
					]
				}
			}
		});

		createdCats.push(cat);
	}

	console.log(`🐱 ${createdCats.length} cats created`);

	// 📰 CREATE NEWS
	for (let i = 0; i < 25; i++) {
		const type = faker.helpers.arrayElement(NEWS_TYPES);

		// 0 à 3 chats liés
		const relatedCats = faker.helpers.arrayElements(
			createdCats,
			faker.number.int({ min: 1, max: 5 })
		);

		await prisma.news.create({
			data: {
				title: faker.lorem.sentence(),
				type,
				content: generateContent(type),

				created_at: faker.date.between({
					from: new Date('2025-01-01'),
					to: new Date()
				}),

				cats: {
					create: relatedCats.map((cat) => ({
						cat: {
							connect: { id: cat.id }
						}
					}))
				}
			}
		});
	}

	console.log('📰 News created');

	console.log('✅ Seeding terminé');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
