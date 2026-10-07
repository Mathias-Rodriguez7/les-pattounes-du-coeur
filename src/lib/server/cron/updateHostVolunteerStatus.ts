// src/lib/server/cron/updateHostVolunteerStatus.ts
import prisma from '$lib/server/prisma';

/**
 * Vérifie et met à jour le statut des hosts/volunteers
 * dont la période de pause est terminée
 */
export async function updateExpiredBreaks() {
	const now = new Date();

	try {
		// Mettre à jour les HOSTS
		const updatedHosts = await prisma.host.updateMany({
			where: {
				actif: 'BREAK',
				breakEnd: {
					lte: now // breakEnd <= maintenant
				}
			},
			data: {
				actif: 'ACTIVE',
				breakStart: null,
				breakEnd: null
			}
		});

		// Mettre à jour les VOLUNTEERS
		const updatedVolunteers = await prisma.volunteer.updateMany({
			where: {
				actif: 'BREAK',
				breakEnd: {
					lte: now // breakEnd <= maintenant
				}
			},
			data: {
				actif: 'ACTIVE',
				breakStart: null,
				breakEnd: null
			}
		});

		console.log(`✅ Hosts mis à jour: ${updatedHosts.count}`);
		console.log(`✅ Volunteers mis à jour: ${updatedVolunteers.count}`);

		return {
			hosts: updatedHosts.count,
			volunteers: updatedVolunteers.count
		};
	} catch (error) {
		console.error('❌ Erreur lors de la mise à jour des statuts:', error);
		throw error;
	}
}
