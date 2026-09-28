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
const STATUS = ['AVAILABLE', 'SOCIALIZE', 'ADOPTED', 'FREE', 'DEAD'] as const;
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

const HOST_TYPE = ['CLASSIC', 'SOS', 'ADOPT', 'PROPRIO', 'RELAY'] as const;
const HEAL = ['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING'] as const;
const SOCIALIZE = ['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED'] as const;
const BABY = ['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY'] as const;

const NEWS_TYPES = ['NEWS', 'NEWSLETTER', 'HISTORY', 'NEWSCATS', 'EVENT'] as const;
const FORM_TYPES = ['ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER'] as const;
const FORM_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

const SICKNESS_STATUS = ['ACTIVE', 'TREATED', 'RESOLVED'] as const;
const CARE_TYPE = ['VACCINE', 'TREATMENT', 'SURGERY', 'OTHER', 'CONTROL', 'STERILIZE'] as const;
const PLACEMENT_TYPE = ['PROPOSAL', 'TRANSFER', 'LONG', 'SHORT'] as const;

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

// ✅ NOUVELLE FONCTION : Générer un catNumber unique avec regex CJJMMnnn
function generateCatNumber(sequenceNumber: number): string {
	// Date aléatoire pour plus de réalisme
	const randomDate = faker.date.recent({ days: 365 });
	const day = String(randomDate.getDate()).padStart(2, '0');
	const month = String(randomDate.getMonth() + 1).padStart(2, '0');
	const sequence = String(sequenceNumber).padStart(3, '0');

	return `C${day}${month}${sequence}`;
}

// ✅ NOUVELLE FONCTION : Générer des dates de break
function generateBreakDates(breakProbability = 0.3) {
	if (!randomBool(breakProbability)) {
		return { breakStart: null, breakEnd: null };
	}

	// Break a commencé il y a 1-60 jours
	const breakStart = faker.date.recent({ days: 60 });

	// Break se termine dans 1-90 jours (à partir d'aujourd'hui)
	const breakEnd = new Date();
	breakEnd.setDate(breakEnd.getDate() + faker.number.int({ min: 1, max: 90 }));

	return { breakStart, breakEnd };
}

// ✅ NOUVELLE FONCTION : Générer des focalPoints pour les images
function generateFocalPoint() {
	return {
		focalPointX: faker.number.int({ min: 0, max: 100 }),
		focalPointY: faker.number.int({ min: 0, max: 100 })
	};
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
				birthDate: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
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
			birthDate: new Date('1990-01-01'),
			email: 'admin@test.com',
			phone: '0000000001',
			address: 'Admin address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'CENTRE_VILLE'
		}
	});

	const managerProfil = await prisma.profil.create({
		data: {
			firstName: 'Manager',
			lastName: 'User',
			birthDate: new Date('1992-05-15'),
			email: 'manager@test.com',
			phone: '0000000002',
			address: 'Manager address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'PORT_MARIANNE'
		}
	});

	const commProfil = await prisma.profil.create({
		data: {
			firstName: 'Communication',
			lastName: 'User',
			birthDate: new Date('1995-12-20'),
			email: 'comm@test.com',
			phone: '0000000003',
			address: 'Comm address',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'MOSSON'
		}
	});

	// ---------------------
	// 🙋 VOLUNTEERS (3 + 27)
	// ---------------------
	console.log('🙋 Création de 30 volunteers...');
	const admin = await prisma.volunteer.create({
		data: {
			password: await hashPassword('admin123'),
			role: 'ADMIN',
			actif: 'ACTIVE',
			breakStart: null,
			breakEnd: null,
			profilId: adminProfil.id
		}
	});

	const manager = await prisma.volunteer.create({
		data: {
			password: await hashPassword('manager123'),
			role: 'MANAGER',
			actif: 'ACTIVE',
			breakStart: null,
			breakEnd: null,
			profilId: managerProfil.id
		}
	});

	const comm = await prisma.volunteer.create({
		data: {
			password: await hashPassword('comm123'),
			role: 'COMMUNICATION',
			actif: 'ACTIVE',
			breakStart: null,
			breakEnd: null,
			profilId: commProfil.id
		}
	});

	const volunteers = [admin, manager, comm];

	// 27 autres volunteers aléatoires
	for (let i = 0; i < 27; i++) {
		const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
		const breakDates =
			actif === 'BREAK' ? generateBreakDates(1.0) : { breakStart: null, breakEnd: null };

		const volunteer = await prisma.volunteer.create({
			data: {
				password: await hashPassword('password'),
				role: faker.helpers.arrayElement(VOLUNTEER_ROLE),
				actif: actif,
				breakStart: breakDates.breakStart,
				breakEnd: breakDates.breakEnd,
				profilId: profils[i].id
			}
		});
		volunteers.push(volunteer);
	}

	// ---------------------
	// 🏠 HOSTS (80) - dont certains sont aussi volunteers
	// ---------------------
	console.log('🏠 Création de 80 hosts...');
	const hosts = [];

	// ✅ Créer 10 hosts qui sont AUSSI volunteers
	console.log('  → 10 hosts qui sont aussi volunteers...');
	for (let i = 0; i < 10; i++) {
		// On prend les 10 premiers volunteers (hors admin/manager/comm)
		const volunteer = volunteers[3 + i]; // volunteers[3] à volunteers[12]

		const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
		const breakDates =
			actif === 'BREAK' ? generateBreakDates(1.0) : { breakStart: null, breakEnd: null };

		const host = await prisma.host.create({
			data: {
				profilId: volunteer.profilId, // ✅ Utilise le profilId du volunteer
				type: faker.helpers.arrayElement(HOST_TYPE),
				actif: actif,
				breakStart: breakDates.breakStart,
				breakEnd: breakDates.breakEnd,
				catAdult: faker.number.int({ min: 1, max: 10 }),
				kittyAndKitten: randomBool(),
				kitten: randomBool() ? faker.number.int({ min: 1, max: 10 }) : null,
				isAvailable: randomBool(),
				additionalInformation: faker.lorem.sentences(2),
				hasAnimalsAtHome: randomBool(),
				numberOfCatsAtHome: faker.number.int({ min: 0, max: 5 }),
				numberOfDogsAtHome: faker.number.int({ min: 0, max: 3 }),
				otherAnimalsAtHome: faker.word.noun(),
				space: faker.number.int({ min: 1, max: 999 }),
				homeDescription: faker.lorem.sentences(2),
				presence: faker.lorem.sentence(),
				outside: randomBool(),
				outsideDescription: faker.lorem.sentence(),
				isStockFeed: randomBool(),
				heal: faker.helpers.arrayElement(HEAL),
				socialize: faker.helpers.arrayElement(SOCIALIZE),
				car: randomBool(),
				babyFeeding: faker.helpers.arrayElement(BABY),
				stopActivity: randomBool(0.3) ? faker.lorem.sentence() : null
			}
		});
		hosts.push(host);
	}

	// ✅ Créer 70 hosts normaux (profils restants)
	console.log('  → 70 hosts sans rôle volunteer...');
	for (let i = 37; i < 107; i++) {
		// 37 = 27 (volunteers) + 10 (volunteer-hosts)
		const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
		const breakDates =
			actif === 'BREAK' ? generateBreakDates(1.0) : { breakStart: null, breakEnd: null };

		const host = await prisma.host.create({
			data: {
				profilId: profils[i].id,
				type: faker.helpers.arrayElement(HOST_TYPE),
				actif: actif,
				breakStart: breakDates.breakStart,
				breakEnd: breakDates.breakEnd,
				catAdult: faker.number.int({ min: 1, max: 10 }),
				kittyAndKitten: randomBool(),
				kitten: randomBool() ? faker.number.int({ min: 1, max: 10 }) : null,
				isAvailable: randomBool(),
				additionalInformation: faker.lorem.sentences(2),
				hasAnimalsAtHome: randomBool(),
				numberOfCatsAtHome: faker.number.int({ min: 0, max: 5 }),
				numberOfDogsAtHome: faker.number.int({ min: 0, max: 3 }),
				otherAnimalsAtHome: faker.word.noun(),
				space: faker.number.int({ min: 1, max: 999 }),
				homeDescription: faker.lorem.sentences(2),
				presence: faker.lorem.sentence(),
				outside: randomBool(),
				outsideDescription: faker.lorem.sentence(),
				isStockFeed: randomBool(),
				heal: faker.helpers.arrayElement(HEAL),
				socialize: faker.helpers.arrayElement(SOCIALIZE),
				car: randomBool(),
				babyFeeding: faker.helpers.arrayElement(BABY),
				stopActivity: randomBool(0.3) ? faker.lorem.sentence() : null
			}
		});
		hosts.push(host);
	}

	// ---------------------
	// 🐱 CATS (150)
	// ---------------------
	console.log('🐱 Création de 150 chats...');
	const cats = [];

	for (let i = 0; i < 150; i++) {
		const focalPoint = generateFocalPoint();

		const cat = await prisma.cat.create({
			data: {
				name: faker.person.firstName(),
				catNumber: generateCatNumber(i + 1), // ✅ Génère CJJMMnnn
				sex: faker.helpers.arrayElement(SEX),
				birthDate: faker.date.birthdate({ min: 1, max: 30, mode: 'age' }),
				isVisible: randomBool(0.8),
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
				media: {
					create: [
						{
							picture: randomImage(i),
							focalPointX: focalPoint.focalPointX, // ✅ FocalPoint dans MediaCat
							focalPointY: focalPoint.focalPointY // ✅ FocalPoint dans MediaCat
						}
					]
				}
			}
		});

		cats.push(cat);
	}

	// ---------------------
	// 🤒 SICKNESSES
	// ---------------------
	console.log('🤒 Création des maladies...');
	for (const cat of cats.slice(0, 150)) {
		// Chaque chat peut avoir 0, 1, 2 ou 3 maladies
		const sicknesCount = faker.number.int({ min: 0, max: 5 });

		for (let i = 0; i < sicknesCount; i++) {
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
		const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
		await prisma.placement.create({
			data: {
				catId: cat.id,
				hostId: faker.helpers.arrayElement(hosts).id,
				status: actif,
				type: faker.helpers.arrayElement(PLACEMENT_TYPE),
				startDate: faker.date.recent({ days: 180 }),
				endDate: null
			}
		});

		if (randomBool(0.4)) {
			const startDate = faker.date.recent({ days: 365 });
			const endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + faker.number.int({ min: 7, max: 60 }));

			await prisma.placement.create({
				data: {
					catId: cat.id,
					hostId: faker.helpers.arrayElement(hosts).id,
					status: actif,
					type: faker.helpers.arrayElement(PLACEMENT_TYPE),
					startDate: startDate,
					endDate: endDate
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

	// Les 40 derniers profils sont les adoptants
	const adoptants = profils.slice(110, 150);

	for (let i = 0; i < Math.min(30, adoptants.length); i++) {
		const adoptedCat = cats[i];
		const adoptant = adoptants[i];

		// ✅ Update le statut du chat à ADOPTED
		await prisma.cat.update({
			where: { id: adoptedCat.id },
			data: { status: 'ADOPTED' }
		});

		await prisma.adoption.create({
			data: {
				catId: adoptedCat.id,
				profilId: adoptant.id // ✅ adoptant.id est bien un UUID string
			}
		});

		console.log(
			`✅ Chat "${adoptedCat.name}" adopté par ${adoptant.firstName} ${adoptant.lastName}`
		);
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
        - 30 Volunteers (avec breakStart/breakEnd si BREAK)
        - 80 Hosts (avec breakStart/breakEnd si BREAK)
        - 150 Chats (avec catNumber unique CJJMMnnn)
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
