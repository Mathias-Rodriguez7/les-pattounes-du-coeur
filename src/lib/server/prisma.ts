// src/lib/server/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
		adapter
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
