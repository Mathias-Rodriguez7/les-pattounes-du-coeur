// src/lib/server/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { volunteerSecretFields } from '#lib/types/volunteer.ts';

// ✅ Utiliser process.env directement (disponible côté serveur)
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL est manquante dans les variables d'environnement");
}

const prismaClientSingleton = () => {
	const adapter = new PrismaPg({
		connectionString: DATABASE_URL
	});

	return new PrismaClient({
		adapter,
		// 🔒 Ces champs ne sortent JAMAIS de la base par défaut, quel que soit l'include ou le select.
		// Le code qui en a vraiment besoin (connexion, changement de mot de passe) le demande
		// explicitement avec `omit: { password: false }`.
		omit: { volunteer: volunteerSecretFields }
	});
};

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
	globalThis.prisma = prisma;
}
