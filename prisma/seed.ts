/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

// ✅ IMPORTANT Prisma 7
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
	adapter
});

// enums
const HAIR = ['SHORT', 'MEDIUM', 'LONG'] as const;
const STATUS = ['AVAILABLE', 'ADOPTED', 'SOCIALIZE'] as const;
const VACCINATE = ['YES', 'NO', 'PARTIAL'] as const;

function randomBool(probability = 0.5) {
	return Math.random() < probability;
}

function getRandomImage(index: number) {
	return `/img/cats/cat${(index % 4) + 1}.jpg`;
}

async function main() {
	console.log('🌱 Seeding...');

	await prisma.mediaCat.deleteMany();
	await prisma.cat.deleteMany();

	for (let i = 0; i < 40; i++) {
		await prisma.cat.create({
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
	}

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
