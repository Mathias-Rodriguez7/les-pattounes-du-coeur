/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../src/lib/server/password';

// ---------------------
// DB
// ---------------------
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
	adapter: new PrismaPg(pool)
});

// ---------------------
// ENUMS
// ---------------------
const SEX = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
const STATUS = ['AVAILABLE', 'SOCIALIZE', 'ADOPTED', 'FREE'] as const;
const HAIR = ['SHORT', 'MEDIUM', 'LONG'] as const;
const VACCINATE = ['YES', 'NO', 'PARTIAL'] as const;

const VOLUNTEER_ROLE = ['ADMIN', 'MANAGER', 'COMMUNICATION'] as const;

const COLAB_ACTIVITY = ['ACTIVE', 'BREAK', 'STOP'] as const;

const HOST_STATUS = ['FREE', 'CAT_PLACE', 'WAITING', 'WAITING_VALIDATION'] as const;
const HOST_TYPE = ['CLASSIC', 'RELAY'] as const;
const SPACE = ['SMALL', 'MEDIUM', 'LARGE'] as const;
const HEAL = ['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING'] as const;
const SOCIALIZE = ['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED'] as const;
const BABY = ['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY'] as const;

const NEWS_TYPES = ['NEWS', 'NEWSLETTER', 'HISTORY', 'NEWSCATS', 'EVENT'] as const;
const FORM_TYPES = ['ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER'] as const;
const FORM_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

// ---------------------
// UTILS
// ---------------------
const randomBool = (p = 0.5) => Math.random() < p;

function randomImage(i: number) {
	return `/img/cats/cat${(i % 4) + 1}.jpg`;
}

function getLocalPdf() {
	return '/pdf/newsletter.pdf';
}

// ---------------------
// MAIN
// ---------------------
async function main() {
	console.log('🌱 Seeding...');

	// ---------------------
	// CLEAN
	// ---------------------
	await prisma.newsCat.deleteMany();
	await prisma.catVolunteer.deleteMany();
	await prisma.placement.deleteMany();
	await prisma.adoption.deleteMany();
	await prisma.care.deleteMany();
	await prisma.mediaCat.deleteMany();

	await prisma.news.deleteMany();
	await prisma.cat.deleteMany();
	await prisma.volunteer.deleteMany();
	await prisma.host.deleteMany();
	await prisma.blacklistHistoric.deleteMany();
	await prisma.form.deleteMany();
	await prisma.session.deleteMany();
	await prisma.profil.deleteMany();

	// ---------------------
	// 👤 PROFILS FAKE
	// ---------------------
	const profils = [];

	for (let i = 0; i < 20; i++) {
		const profil = await prisma.profil.create({
			data: {
				firstName: faker.person.firstName().slice(0, 60),
				lastName: faker.person.lastName().slice(0, 60),
				email: faker.internet.email().slice(0, 255),
				phone: faker.string.numeric(10),
				address: faker.location.streetAddress().slice(0, 255)
			}
		});
		profils.push(profil);
	}

	// ---------------------
	// 🔐 FIXED PROFILS
	// ---------------------
	const adminProfil = await prisma.profil.create({
		data: {
			firstName: 'Admin',
			lastName: 'System',
			email: 'admin@test.com',
			phone: '0000000001',
			address: 'Admin address'
		}
	});

	const managerProfil = await prisma.profil.create({
		data: {
			firstName: 'Manager',
			lastName: 'User',
			email: 'manager@test.com',
			phone: '0000000002',
			address: 'Manager address'
		}
	});

	const commProfil = await prisma.profil.create({
		data: {
			firstName: 'Communication',
			lastName: 'User',
			email: 'comm@test.com',
			phone: '0000000003',
			address: 'Comm address'
		}
	});

	profils.push(adminProfil, managerProfil, commProfil);

	// ---------------------
	// 🔐 FIXED VOLUNTEERS
	// ---------------------
	const admin = await prisma.volunteer.create({
		data: {
			password: await hashPassword('admin123'),
			role: 'ADMIN',
			actif: 'ACTIVE',
			profilId: adminProfil.id
		}
	});

	const manager = await prisma.volunteer.create({
		data: {
			password: await hashPassword('manager123'),
			role: 'MANAGER',
			actif: 'ACTIVE',
			profilId: managerProfil.id
		}
	});

	const comm = await prisma.volunteer.create({
		data: {
			password: await hashPassword('comm123'),
			role: 'COMMUNICATION',
			actif: 'ACTIVE',
			profilId: commProfil.id
		}
	});

	const volunteers = [admin, manager, comm];

	// ---------------------
	// 🙋 VOLUNTEERS FAKE
	// ---------------------
	for (let i = 0; i < 5; i++) {
		const volunteer = await prisma.volunteer.create({
			data: {
				password: await hashPassword('password'),
				role: faker.helpers.arrayElement(VOLUNTEER_ROLE),
				actif: faker.helpers.arrayElement(COLAB_ACTIVITY),
				profilId: profils[i].id
			}
		});
		volunteers.push(volunteer);
	}

	// ---------------------
	// 🏠 HOSTS
	// ---------------------
	const hosts = [];

	for (let i = 5; i < 10; i++) {
		const host = await prisma.host.create({
			data: {
				profilId: profils[i].id,
				age: faker.number.int({ min: 20, max: 70 }),
				type: faker.helpers.arrayElement(HOST_TYPE),

				actif: faker.helpers.arrayElement(COLAB_ACTIVITY),

				job: faker.person.jobTitle(),
				status: faker.helpers.arrayElement(HOST_STATUS),

				isAvailable: randomBool(),
				additionalInformation: faker.lorem.sentences(2),

				hasAnimalsAtHome: randomBool(),
				numberOfCatsAtHome: faker.number.int({ min: 0, max: 5 }),
				numberOfDogsAtHome: faker.number.int({ min: 0, max: 3 }),
				otherAnimalsAtHome: faker.word.noun(),

				space: faker.helpers.arrayElement(SPACE),
				homeDescription: faker.lorem.sentences(2),

				presence: 'FULL_TIME',
				outside: randomBool(),
				outsideDescription: faker.lorem.sentence(),

				isStockFeed: randomBool(),

				heal: faker.helpers.arrayElement(HEAL),
				socialize: faker.helpers.arrayElement(SOCIALIZE),

				car: randomBool(),

				babyFeeding: faker.helpers.arrayElement(BABY),

				stopActivity: faker.lorem.sentence(),
				availabilityDuration: 'LONG_TERM'
			}
		});
		hosts.push(host);
	}

	// ---------------------
	// 🐱 CATS
	// ---------------------
	const cats = [];

	for (let i = 0; i < 30; i++) {
		const cat = await prisma.cat.create({
			data: {
				name: faker.person.firstName(),
				sex: faker.helpers.arrayElement(SEX),
				age: faker.number.int({ min: 1, max: 18 }),
				isVisible: true,
				status: faker.helpers.arrayElement(STATUS),
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
					create: [{ picture: randomImage(i) }]
				}
			}
		});

		cats.push(cat);
	}

	// ---------------------
	// 🔗 CAT ↔ VOLUNTEERS
	// ---------------------
	for (const cat of cats) {
		const randomVols = faker.helpers.arrayElements(volunteers, 2);

		for (const v of randomVols) {
			await prisma.catVolunteer.create({
				data: {
					catId: cat.id,
					volunteerId: v.id
				}
			});
		}
	}

	// ---------------------
	// 📍 PLACEMENTS
	// ---------------------
	for (const cat of cats.slice(0, 10)) {
		await prisma.placement.create({
			data: {
				catId: cat.id,
				hostId: faker.helpers.arrayElement(hosts).id,
				started: faker.date.recent()
			}
		});
	}

	// ---------------------
	// 💊 CARES
	// ---------------------
	for (const cat of cats.slice(0, 10)) {
		await prisma.care.create({
			data: {
				catId: cat.id,
				type: 'VACCINE',
				reason: 'Routine',
				description: faker.lorem.sentence()
			}
		});
	}

	// ---------------------
	// 📰 NEWS
	// ---------------------
	for (let i = 0; i < 20; i++) {
		const relatedCats = faker.helpers.arrayElements(cats, 3);

		await prisma.news.create({
			data: {
				title: faker.lorem.sentence(),
				type: faker.helpers.arrayElement(NEWS_TYPES),
				content: faker.lorem.paragraph(),
				mediaUrl: getLocalPdf(),
				cats: {
					create: relatedCats.map((c) => ({
						catId: c.id
					}))
				}
			}
		});
	}

	// ---------------------
	// 🐾 ADOPTIONS
	// ---------------------
	for (const cat of cats.slice(0, 5)) {
		await prisma.adoption.create({
			data: {
				catId: cat.id,
				profilId: faker.helpers.arrayElement(profils).id
			}
		});
	}

	// ---------------------
	// 🔐 SESSION TEST
	// ---------------------
	await prisma.session.create({
		data: {
			token: faker.string.uuid(),
			volunteerId: admin.id,
			expiresAt: faker.date.future()
		}
	});

	// ---------------------
	// 🚫 BLACKLIST
	// ---------------------
	await prisma.blacklistHistoric.create({
		data: {
			profilId: profils[0].id,
			email: profils[0].email,
			description: 'Bad adopter',
			isBlacklisted: true
		}
	});

	// ---------------------
	// 📄 FORMS
	// ---------------------
	for (let i = 0; i < 10; i++) {
		await prisma.form.create({
			data: {
				type: faker.helpers.arrayElement(FORM_TYPES),
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: faker.internet.email(),
				data: { message: faker.lorem.sentence() }
			}
		});
	}

	console.log('✅ Seed terminé');
}

// ---------------------
main()
	.catch(console.error)
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
