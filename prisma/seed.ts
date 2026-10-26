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
const FORM_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

const SICKNESS_STATUS = ['ACTIVE', 'TREATED', 'RESOLVED'] as const;
const CARE_TYPE = ['VACCINE', 'TREATMENT', 'SURGERY', 'OTHER', 'CONTROL', 'STERILIZE'] as const;
const PLACEMENT_TYPE = ['PROPOSAL', 'TRANSFER', 'LONG', 'SHORT'] as const;

// ---------------------
// UTILS
// ---------------------
const randomBool = (p = 0.5) => Math.random() < p;

const CAT_IMAGES = [
	'/img/cats/cat1.jpg',
	'/img/cats/cat2.jpg',
	'/img/cats/cat3.jpg',
	'/img/cats/cat4.jpg'
] as const;

const CAT_VIDEO = '/videos/cat.mp4';

function randomImage(i: number) {
	return CAT_IMAGES[i % CAT_IMAGES.length];
}

function getLocalPdf() {
	return '/pdf/newsletter.pdf';
}

// Format CAAMMnnn sur 8 caractères : C + YY + MM + SSS
function generateCatNumber(sequenceNumber: number): string {
	const randomDate = faker.date.recent({ days: 365 });
	const year = String(randomDate.getFullYear() % 100).padStart(2, '0');
	const month = String(randomDate.getMonth() + 1).padStart(2, '0');
	const sequence = String(sequenceNumber).padStart(3, '0');

	return `C${year}${month}${sequence}`;
}

function generateBreakDates(breakProbability = 0.3) {
	if (!randomBool(breakProbability)) {
		return { breakStart: null, breakEnd: null };
	}

	const breakStart = faker.date.recent({ days: 60 });

	const breakEnd = new Date();
	breakEnd.setDate(breakEnd.getDate() + faker.number.int({ min: 1, max: 90 }));

	return { breakStart, breakEnd };
}

function generateFocalPoint() {
	return {
		focalPointX: faker.number.int({ min: 0, max: 100 }),
		focalPointY: faker.number.int({ min: 0, max: 100 })
	};
}

function generateHostData() {
	const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
	const breakDates =
		actif === 'BREAK' ? generateBreakDates(1.0) : { breakStart: null, breakEnd: null };

	return {
		type: faker.helpers.arrayElement(HOST_TYPE),
		actif,
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
	// 👤 PROFILS FAKE (150)
	// ---------------------
	console.log('👤 Création des profils...');
	const profils = [];

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
	// 🙋 VOLUNTEERS (3 fixes + 27)
	// ---------------------
	console.log('🙋 Création de 30 volunteers...');
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

	for (let i = 0; i < 27; i++) {
		const actif = faker.helpers.arrayElement(COLAB_ACTIVITY);
		const breakDates =
			actif === 'BREAK' ? generateBreakDates(1.0) : { breakStart: null, breakEnd: null };

		const volunteer = await prisma.volunteer.create({
			data: {
				password: await hashPassword('password'),
				role: faker.helpers.arrayElement(VOLUNTEER_ROLE),
				actif,
				isFlexibleDispatcher: false,
				breakStart: breakDates.breakStart,
				breakEnd: breakDates.breakEnd,
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

	console.log('  → 10 hosts qui sont aussi volunteers...');
	for (let i = 0; i < 10; i++) {
		const volunteer = volunteers[3 + i];
		const host = await prisma.host.create({
			data: {
				profilId: volunteer.profilId,
				...generateHostData()
			}
		});
		hosts.push(host);
	}

	console.log('  → 70 hosts sans rôle volunteer...');
	for (let i = 37; i < 107; i++) {
		const host = await prisma.host.create({
			data: {
				profilId: profils[i].id,
				...generateHostData()
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
		const cat = await prisma.cat.create({
			data: {
				name: faker.person.firstName(),
				catNumber: generateCatNumber(i + 1),
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
				chipId: randomBool(0.8) ? faker.string.alphanumeric(10) : null
			}
		});
		cats.push(cat);
	}

	// ---------------------
	// 🖼️ MEDIA
	// ---------------------
	console.log('🖼️ Création des médias...');

	for (const cat of cats) {
		const imageCount = faker.number.int({ min: 3, max: 8 });
		const documentCount = faker.number.int({ min: 3, max: 8 });

		const medias: Array<{
			type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
			url: string;
			mimeType: string;
			originalName: string;
		}> = [];

		// Images : entre 3 et 8
		for (let j = 0; j < imageCount; j++) {
			const url = randomImage(j);
			medias.push({
				type: 'IMAGE',
				url,
				mimeType: 'image/jpeg',
				originalName: url.split('/').pop() ?? 'cat.jpg'
			});
		}

		// Vidéo : exactement 1
		medias.push({
			type: 'VIDEO',
			url: CAT_VIDEO,
			mimeType: 'video/mp4',
			originalName: 'cat.mp4'
		});

		// Documents : entre 3 et 8
		for (let j = 0; j < documentCount; j++) {
			const url = getLocalPdf();
			medias.push({
				type: 'DOCUMENT',
				url,
				mimeType: 'application/pdf',
				originalName: url.split('/').pop() ?? 'document.pdf'
			});
		}

		// La première image est la photo principale
		for (let k = 0; k < medias.length; k++) {
			const m = medias[k];

			await prisma.mediaCat.create({
				data: {
					catId: cat.id,
					type: m.type,
					url: m.url,
					storageKey: m.url,
					mimeType: m.mimeType,
					sizeBytes: faker.number.int({ min: 50_000, max: 2_000_000 }),
					originalName: m.originalName,
					isPrimary: k === 0,
					...generateFocalPoint()
				}
			});
		}
	}

	// ---------------------
	// 🤒 SICKNESSES
	// ---------------------
	console.log('🤒 Création des maladies...');
	for (const cat of cats) {
		const sicknessCount = faker.number.int({ min: 0, max: 3 });

		for (let i = 0; i < sicknessCount; i++) {
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
					startDate,
					endDate
				}
			});
		}
	}

	// ---------------------
	// 💊 CARES
	// ---------------------
	console.log('💊 Création des soins...');
	for (const cat of cats.slice(0, 100)) {
		const careCount = faker.number.int({ min: 1, max: 3 });

		for (let i = 0; i < careCount; i++) {
			await prisma.care.create({
				data: {
					catId: cat.id,
					type: faker.helpers.arrayElement(CARE_TYPE),
					reason: faker.lorem.sentence(),
					description: faker.lorem.sentence(),
					veterinary: randomBool(0.7) ? faker.company.name() : null
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
					create: relatedCats.map((c) => ({ catId: c.id }))
				}
			}
		});
	}

	// ---------------------
	// 🐾 ADOPTIONS
	// ---------------------
	console.log('🐾 Création des adoptions...');
	const adoptants = profils.slice(110, 150);
	const adoptedCats = cats.slice(0, 30);

	for (let i = 0; i < Math.min(adoptedCats.length, adoptants.length); i++) {
		const adoptedCat = adoptedCats[i];
		const adoptant = adoptants[i];

		await prisma.cat.update({
			where: { id: adoptedCat.id },
			data: { status: 'ADOPTED' }
		});

		await prisma.adoption.create({
			data: {
				catId: adoptedCat.id,
				profilId: adoptant.id
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

	console.log("  → 150 formulaires spécifiques d'adoption");
	for (let i = 0; i < 150; i++) {
		const randomAdoptant = faker.helpers.arrayElement(adoptants);
		const randomCat = faker.helpers.arrayElement(cats);

		await prisma.form.create({
			data: {
				type: 'ADOPTION_SPECIFIC',
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: randomAdoptant.email,
				data: {
					firstName: randomAdoptant.firstName,
					lastName: randomAdoptant.lastName,
					phone: `0${faker.number.int({ min: 100000000, max: 999999999 })}`,
					email: randomAdoptant.email,
					address: randomAdoptant.address,
					birthDate: randomAdoptant.birthDate,
					city: randomAdoptant.city,
					postalCode: randomAdoptant.postalCode,
					district: randomAdoptant.district ?? 'CENTRE_VILLE',
					housingSize: faker.number.int({ min: 20, max: 300 }),
					hasGarden: randomBool(),
					gardenSize: randomBool() ? faker.number.int({ min: 10, max: 5000 }) : undefined,
					hasPets: randomBool(),
					numberOfCats: faker.number.int({ min: 0, max: 5 }),
					numberOfDogs: faker.number.int({ min: 0, max: 3 }),
					otherPets: randomBool(0.3) ? faker.word.noun() : undefined,
					numberOfChildren: faker.number.int({ min: 0, max: 4 }),
					catId: randomCat.id
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: randomBool(0.7) ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log("  → 150 formulaires flexibles d'adoption");
	for (let i = 0; i < 150; i++) {
		const randomAdoptant = faker.helpers.arrayElement(adoptants);

		await prisma.form.create({
			data: {
				type: 'ADOPTION_FLEXIBLE',
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: randomAdoptant.email,
				data: {
					firstName: randomAdoptant.firstName,
					lastName: randomAdoptant.lastName,
					phone: `0${faker.number.int({ min: 100000000, max: 999999999 })}`,
					email: randomAdoptant.email,
					address: randomAdoptant.address,
					birthDate: randomAdoptant.birthDate,
					city: randomAdoptant.city,
					postalCode: randomAdoptant.postalCode,
					district: randomAdoptant.district ?? 'CENTRE_VILLE',
					catAge: faker.helpers.arrayElement(['kitten', 'adult', 'senior', 'free']),
					catSex: faker.helpers.arrayElement(['male', 'female', 'free']),
					color: faker.color.human(),
					furLength: faker.helpers.arrayElement(['short', 'medium', 'long', 'free']),
					temperament: faker.lorem.sentences(2),
					housingSize: faker.number.int({ min: 20, max: 300 }),
					hasGarden: randomBool(),
					gardenSize: randomBool() ? faker.number.int({ min: 10, max: 5000 }) : undefined,
					hasPets: randomBool(),
					numberOfCats: faker.number.int({ min: 0, max: 5 }),
					numberOfDogs: faker.number.int({ min: 0, max: 3 }),
					otherPets: randomBool(0.3) ? faker.word.noun() : undefined,
					numberOfChildren: faker.number.int({ min: 0, max: 4 })
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: randomBool(0.7) ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log('  → 10 formulaires de bénévole...');
	for (let i = 0; i < 10; i++) {
		const profil = profils[27 + i];

		await prisma.form.create({
			data: {
				type: 'VOLUNTEER',
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: profil.email,
				data: {
					firstName: profil.firstName,
					lastName: profil.lastName,
					phone: profil.phone,
					email: profil.email,
					address: profil.address,
					birthDate: profil.birthDate,
					city: profil.city,
					postalCode: profil.postalCode,
					district: profil.district,

					hasCatExperience: randomBool(0.7),
					catExperienceDescription: randomBool(0.7) ? faker.lorem.sentences(2) : undefined,
					hasAssociationExperience: randomBool(0.5),
					associationExperienceDescription: randomBool(0.5) ? faker.lorem.sentences(2) : undefined,
					hasMedicalCareExperience: randomBool(0.3),
					medicalCareDescription: randomBool(0.3) ? faker.lorem.sentences(2) : undefined,
					hasTransportExperience: randomBool(0.6),

					car: randomBool(0.8),
					availability: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
					availabilityDuration: faker.helpers.arrayElement([
						'LESS_THAN_1_MONTH',
						'1_TO_3_MONTHS',
						'3_TO_6_MONTHS',
						'MORE_THAN_6_MONTHS',
						'LONG_TERM'
					]),
					canHelpWeekdays: randomBool(0.8),
					canHelpWeekends: randomBool(0.7),
					canHelpEmergencies: randomBool(0.5),

					motivation: faker.lorem.paragraphs(1),
					skills: randomBool(0.6) ? faker.lorem.sentence() : undefined,
					additionalInformation: randomBool(0.4) ? faker.lorem.sentence() : undefined
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: randomBool(0.7) ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log("  → 10 formulaires d'accueil...");
	for (let i = 0; i < 10; i++) {
		const profil = profils[27 + i];
		const hasAnimalsAtHome = randomBool(0.6);

		await prisma.form.create({
			data: {
				type: 'HOST',
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: profil.email,
				data: {
					firstName: profil.firstName,
					lastName: profil.lastName,
					phone: profil.phone,
					email: profil.email,
					address: profil.address,
					birthDate: profil.birthDate,
					city: profil.city,
					postalCode: profil.postalCode,
					district: profil.district,

					space: faker.number.int({ min: 30, max: 500 }),
					outside: randomBool(0.6),
					outsideDescription: randomBool(0.6) ? faker.lorem.sentences(1) : undefined,
					hasAnimalsAtHome,
					numberOfCatsAtHome: hasAnimalsAtHome ? faker.number.int({ min: 0, max: 5 }) : undefined,
					numberOfDogsAtHome: hasAnimalsAtHome ? faker.number.int({ min: 0, max: 3 }) : undefined,
					otherAnimalsAtHome: hasAnimalsAtHome && randomBool(0.3) ? faker.word.noun() : undefined,
					homeDescription: faker.lorem.sentences(2),

					type: faker.helpers.arrayElement(HOST_TYPE),
					heal: faker.helpers.arrayElement(HEAL),
					socialize: faker.helpers.arrayElement(SOCIALIZE),
					car: randomBool(0.7),
					babyFeeding: faker.helpers.arrayElement(BABY),

					catAdult: faker.number.int({ min: 1, max: 10 }),
					kittyAndKitten: randomBool(0.5),
					kitten: randomBool() ? faker.number.int({ min: 1, max: 10 }) : 0,
					presence: faker.lorem.sentence(),
					motivation: faker.lorem.paragraphs(1),
					additionalMessage: randomBool(0.4) ? faker.lorem.sentence() : undefined
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: randomBool(0.7) ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log('  → 10 formulaires de partenariat...');
	for (let i = 0; i < 10; i++) {
		await prisma.form.create({
			data: {
				type: 'COLAB',
				status: faker.helpers.arrayElement(FORM_STATUS),
				email: faker.internet.email(),
				data: {
					firstName: faker.person.firstName(),
					lastName: faker.person.lastName(),
					companyName: randomBool(0.8) ? faker.company.name() : undefined,
					email: faker.internet.email(),
					phone: `0${faker.number.int({ min: 100000000, max: 999999999 })}`,
					presentation: faker.lorem.paragraphs(1),
					partnershipProposal: faker.lorem.paragraphs(1)
				},
				notes: randomBool(0.3) ? faker.lorem.sentence() : undefined,
				assignedToId: randomBool(0.7) ? faker.helpers.arrayElement(volunteers).id : undefined
			}
		});
	}

	console.log('✅ Seed terminé !');
	console.log(`
        📊 Statistiques :
        - 150 Profils (avec districts)
        - 30 Volunteers (avec breakStart/breakEnd si BREAK)
        - 80 Hosts (avec breakStart/breakEnd si BREAK)
        - 150 Chats (avec catNumber unique CAAMMnnn, 1 média principal chacun)
        - ~80 Placements
        - ~100 Soins
        - 30 News
        - 30 Adoptions
        - 320 Formulaires
    `);
}

// ---------------------
main()
	.catch(console.error)
	.finally(async () => {
		await prisma.$disconnect();
	});
