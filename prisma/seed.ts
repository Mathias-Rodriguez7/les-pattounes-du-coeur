/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../src/lib/server/password';

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
const SEX = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
const STATUS = ['AVAILABLE', 'SOCIALIZE', 'ADOPTED', 'FREE'] as const;
const HAIR = ['SHORT', 'MEDIUM', 'LONG'] as const;
const VACCINATE = ['YES', 'NO', 'PARTIAL'] as const;

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

const HOST_STATUS = ['FREE', 'CAT_PLACE', 'WAITING', 'WAITING_VALIDATION'] as const;
const HOST_TYPE = ['CLASSIC', 'RELAY'] as const;
const SPACE = ['SMALL', 'MEDIUM', 'LARGE'] as const;
const HEAL = ['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING'] as const;
const SOCIALIZE = ['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED'] as const;
const BABY = ['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY'] as const;

const NEWS_TYPES = ['NEWS', 'NEWSLETTER', 'HISTORY', 'NEWSCATS', 'EVENT'] as const;
const FORM_TYPES = ['ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER'] as const;
const FORM_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

const SICKNESS_STATUS = ['ACTIVE', 'TREATED', 'RESOLVED'] as const;
const CARE_TYPE = ['VACCINE', 'TREATMENT', 'SURGERY', 'OTHER', 'CONTROL', 'STERILIZE'] as const;

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
	console.log('🌱 Seeding avec données réalistes...');

	// ---------------------
	// CLEAN
	// ---------------------
	console.log('🧹 Nettoyage de la BDD...');
	await prisma.newsCat.deleteMany();
	await prisma.catVolunteer.deleteMany();
	await prisma.placement.deleteMany();
	await prisma.adoption.deleteMany();
	await prisma.care.deleteMany();
	await prisma.sickness.deleteMany();
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
	// 👤 PROFILS FAKE (3 + 30 volunteers + 80 hosts + 40 adoptants)
	// ---------------------
	console.log('👤 Création des profils...');
	const profils = [];

	// 30 profils pour volunteers + 80 pour hosts + 40 pour adoptants = 150 profils
	for (let i = 0; i < 150; i++) {
		const profil = await prisma.profil.create({
			data: {
				firstName: faker.person.firstName().slice(0, 60),
				lastName: faker.person.lastName().slice(0, 60),
				email: `${faker.string.alphanumeric(8)}_${i}@test.com`,
				phone: faker.string.numeric(10),
				address: faker.location.streetAddress().slice(0, 100),
				city: 'Montpellier',
				postalCode: '34000',
				district: faker.helpers.arrayElement(DISTRICTS)
			}
		});
		profils.push(profil);
	}

	// ---------------------
	// 🔐 FIXED PROFILS (ADMIN, MANAGER, COMM)
	// ---------------------
	console.log('🔐 Création des comptes fixes...');
	const adminProfil = await prisma.profil.create({
		data: {
			firstName: 'Admin',
			lastName: 'System',
			email: 'admin@test.com',
			phone: '0000000001',
			address: 'Admin address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'CENTRE_VILLE' // ✅ NOUVEAU
		}
	});

	const managerProfil = await prisma.profil.create({
		data: {
			firstName: 'Manager',
			lastName: 'User',
			email: 'manager@test.com',
			phone: '0000000002',
			address: 'Manager address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'PORT_MARIANNE' // ✅ NOUVEAU
		}
	});

	const commProfil = await prisma.profil.create({
		data: {
			firstName: 'Communication',
			lastName: 'User',
			email: 'comm@test.com',
			phone: '0000000003',
			address: 'Comm address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'MOSSON' // ✅ NOUVEAU
		}
	});

	// ---------------------
	// 🔐 FIXED VOLUNTEERS (3 + 27)
	// ---------------------
	console.log('🙋 Création de 30 volunteers...');
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

	// 27 autres volunteers aléatoires
	for (let i = 0; i < 27; i++) {
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
	// 🏠 HOSTS (80)
	// ---------------------
	console.log('🏠 Création de 80 hosts...');
	const hosts = [];

	for (let i = 27; i < 107; i++) {
		// 27 à 106 (80 hosts)
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
	// 🐱 CATS (150)
	// ---------------------
	console.log('🐱 Création de 150 chats...');
	const cats = [];
	const FOCAL_POINT = ['TOP', 'MID', 'BOT'] as const;

	for (let i = 0; i < 150; i++) {
		const cat = await prisma.cat.create({
			data: {
				name: faker.person.firstName(),
				sex: faker.helpers.arrayElement(SEX),
				birthDate: faker.date.birthdate({ min: 1, max: 30, mode: 'age' }),
				isVisible: randomBool(0.8), // 80% visible
				status: faker.helpers.arrayElement(STATUS),
				hairLength: faker.helpers.arrayElement(HAIR),
				color: faker.color.human(),
				origin: faker.location.country(),
				isSterilize: randomBool(),
				isAlreadySterilized: randomBool(),
				vaccinate: faker.helpers.arrayElement(VACCINATE),
				isFivTest: randomBool(0.7),
				isDeworming: randomBool(0.7),
				description: faker.lorem.sentences(2),
				isOkCat: randomBool(),
				isOkDog: randomBool(),
				isOkChild: randomBool(),
				isOutside: randomBool(),
				isIdentify: randomBool(0.6),
				chipId: randomBool(0.8) ? faker.string.alphanumeric(10) : null,
				focalPoint: faker.helpers.arrayElement(FOCAL_POINT),
				media: {
					create: [{ picture: randomImage(i) }]
				}
			}
		});

		cats.push(cat);
	}

	// ---------------------
	// 🤒 SICKNESSES
	// ---------------------
	console.log('🤒 Création des maladies...');
	for (const cat of cats.slice(0, 50)) {
		// ~33% des chats
		if (randomBool(0.6)) {
			await prisma.sickness.create({
				data: {
					catId: cat.id,
					name: faker.lorem.word(),
					description: faker.lorem.sentence(),
					treatment: faker.lorem.sentence(),
					startDate: faker.date.recent(),
					endDate: randomBool(0.5) ? faker.date.future() : null,
					status: faker.helpers.arrayElement(SICKNESS_STATUS)
				}
			});
		}
	}

	// ---------------------
	// 🔗 CAT ↔ VOLUNTEERS
	// ---------------------
	console.log('🔗 Création des liens chat ↔ volunteer...');
	for (const cat of cats) {
		const randomVols = faker.helpers.arrayElements(
			volunteers,
			faker.number.int({ min: 1, max: 3 })
		);

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
	console.log('📍 Création des placements...');
	for (const cat of cats.slice(0, 80)) {
		// ~53% des chats ont un placement
		// Créer un placement LONG
		await prisma.placement.create({
			data: {
				catId: cat.id,
				hostId: faker.helpers.arrayElement(hosts).id,
				type: 'LONG',
				started: faker.date.recent({ days: 180 }),
				ended: null
			}
		});

		// 40% de chance d'avoir aussi un SHORT placement (ancien)
		if (randomBool(0.4)) {
			const startDate = faker.date.recent({ days: 365 });
			const endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + faker.number.int({ min: 7, max: 60 }));

			await prisma.placement.create({
				data: {
					catId: cat.id,
					hostId: faker.helpers.arrayElement(hosts).id,
					type: 'SHORT',
					started: startDate,
					ended: endDate
				}
			});
		}
	}

	// ---------------------
	// 💊 CARES
	// ---------------------
	console.log('💊 Création des soins...');
	for (const cat of cats.slice(0, 100)) {
		// ~67% des chats ont des soins
		const careCount = faker.number.int({ min: 1, max: 3 });

		for (let i = 0; i < careCount; i++) {
			await prisma.care.create({
				data: {
					catId: cat.id,
					type: faker.helpers.arrayElement(CARE_TYPE),
					reason: faker.lorem.sentence(),
					description: faker.lorem.sentence(),
					veterinary: randomBool(0.7) ? faker.company.name() : undefined
				}
			});
		}
	}

	// ---------------------
	// 📰 NEWS
	// ---------------------
	console.log('📰 Création des news...');
	for (let i = 0; i < 30; i++) {
		const relatedCats = faker.helpers.arrayElements(cats, faker.number.int({ min: 2, max: 5 }));

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
	console.log('🐾 Création des adoptions...');
	for (const cat of cats.slice(0, 30)) {
		// ~20% des chats sont adoptés
		await prisma.adoption.create({
			data: {
				catId: cat.id,
				profilId: profils[107 + faker.number.int({ min: 0, max: 39 })].id // Profils adoptants
			}
		});
	}

	// ---------------------
	// 🔐 SESSION TEST
	// ---------------------
	console.log('🔐 Création de sessions...');
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
	console.log('🚫 Création de blacklist...');
	for (let i = 0; i < 5; i++) {
		await prisma.blacklistHistoric.create({
			data: {
				profilId: profils[140 + i].id,
				email: profils[140 + i].email,
				description: faker.lorem.sentence(),
				isBlacklisted: randomBool(0.7)
			}
		});
	}

	// ---------------------
	// 📄 FORMS
	// ---------------------
	console.log('📄 Création des formulaires...');
	for (let i = 0; i < 50; i++) {
		const shouldBeAssigned = randomBool(0.7);

		await prisma.form.create({
			data: {
				type: faker.helpers.arrayElement(FORM_TYPES),
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: faker.internet.email(),
				data: {
					message: faker.lorem.sentence(),
					name: faker.person.fullName()
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: shouldBeAssigned ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log('✅ Seed terminé !');
	console.log(`
        📊 Statistiques :
        - 150 Profils (avec districts)
        - 30 Volunteers
        - 80 Hosts
        - 150 Chats
        - ~80 Placements
        - ~100 Soins
        - 30 News
        - 30 Adoptions
        - 50 Formulaires
    `);
}

// ---------------------
main()
	.catch(console.error)
	.finally(async () => {
		await prisma.$disconnect();
	});
