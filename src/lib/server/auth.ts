import { prisma } from '$lib/server/prisma';
import { verifyPassword } from '$lib/server/password';

export async function login(email: string, password: string) {
	const volunteer = await prisma.volunteer.findFirst({
		where: {
			profil: { email }
		},
		include: {
			profil: true
		}
	});

	if (!volunteer) {
		throw new Error('INVALID_CREDENTIALS');
	}

	const isValid = await verifyPassword(volunteer.password, password);

	if (!isValid) {
		throw new Error('INVALID_CREDENTIALS');
	}

	return volunteer;
}
