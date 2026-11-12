import prisma from '#lib/server/prisma.ts';

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
