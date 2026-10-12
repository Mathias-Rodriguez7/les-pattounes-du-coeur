import prisma from '$lib/server/prisma';

export async function deleteProfile(profileId: string) {
	try {
		// ✅ Vérifie que le profil existe
		const profil = await prisma.profil.findUnique({
			where: { id: profileId }
		});

		if (!profil) {
			return {
				success: false,
				error: 'Profil non trouvé'
			};
		}

		// ✅ Supprime le profil (et cascade automatiquement volunteer/host)
		await prisma.profil.delete({
			where: { id: profileId }
		});

		return {
			success: true,
			message: 'Profil supprimé avec succès',
			data: { profileId }
		};
	} catch (error) {
		console.error('❌ Erreur suppression profil:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Erreur inconnue'
		};
	}
}

export async function blacklistProfile(profileId: string, email: string, description: string) {
	try {
		// ✅ Vérifie que le profil existe
		const profil = await prisma.profil.findUnique({
			where: { id: profileId }
		});

		if (!profil) {
			return {
				success: false,
				error: 'Profil non trouvé'
			};
		}

		// ✅ Vérifie que l'email n'est pas déjà en blacklist
		const existingBlacklist = await prisma.blacklistHistoric.findFirst({
			where: {
				profilId: profileId,
				email,
				isBlacklisted: true
			}
		});

		if (existingBlacklist) {
			return {
				success: false,
				error: 'Cet email est déjà en liste noire'
			};
		}

		// ✅ Crée une entrée dans la blacklist
		await prisma.blacklistHistoric.create({
			data: {
				profilId: profileId,
				email,
				description,
				isBlacklisted: true
			}
		});

		// ✅ Met à jour le profil (ou volunteer/host selon ton modèle)
		await prisma.profil.update({
			where: { id: profileId },
			data: {
				isBlacklisted: true // ou un champ similaire
			}
		});

		return {
			success: true,
			message: 'Profil blacklisté avec succès',
			data: { profileId, email }
		};
	} catch (error) {
		console.error('❌ Erreur blacklist profil:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Erreur inconnue'
		};
	}
}
