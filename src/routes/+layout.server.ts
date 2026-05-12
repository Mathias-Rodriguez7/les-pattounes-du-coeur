import { prisma } from '$lib/server/prisma';

export const load = async ({ cookies }) => {
	const token = cookies.get('session');

	// 👤 pas connecté
	if (!token) {
		return {
			user: null
		};
	}

	// 🔍 chercher la session
	const session = await prisma.session.findUnique({
		where: {
			token
		},
		include: {
			volunteer: {
				include: {
					profil: true
				}
			}
		}
	});

	// ❌ session invalide
	if (!session) {
		return {
			user: null
		};
	}

	// ⏳ session expirée
	if (session.expiresAt < new Date()) {
		await prisma.session.delete({
			where: { id: session.id }
		});

		cookies.delete('session', { path: '/' });

		return {
			user: null
		};
	}

	// ✅ utilisateur connecté
	return {
		user: {
			id: session.volunteer.id,
			role: session.volunteer.role,
			profil: session.volunteer.profil
		}
	};
};
