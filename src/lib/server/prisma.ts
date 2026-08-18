import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { PrismaPg } from '@prisma/adapter-pg';

const { DATABASE_URL } = env;
const adapter = new PrismaPg({
	connectionString: DATABASE_URL
});

const prisma = new PrismaClient({
	adapter
});

export default prisma;
