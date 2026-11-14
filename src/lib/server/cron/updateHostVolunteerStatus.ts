// src/lib/server/cron/updateHostVolunteerStatus.ts
import prisma from '#lib/server/prisma.ts';
import { endOfDay } from '#lib/volunteers/breaks.ts';

/**
 * Vérifie et met à jour le statut des hosts/volunteers
 * dont la période de pause est terminée
 */
export async function endFinishedBreaks() {
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

/**
 * Pauses PRÉVUES par les bénévoles (depuis leur Profil) : le jour du début, elles passent
 * en pause. (La fin, elle, est gérée par endFinishedBreaks.)
 * Même règle que le Profil : une pause commence dès son jour de début.
 */
export async function startScheduledBreaks() {
	const now = new Date();
	const { count } = await prisma.volunteer.updateMany({
		where: {
			actif: 'ACTIVE',
			breakStart: { lte: endOfDay(now) },
			breakEnd: { gt: now }
		},
		data: { actif: 'BREAK' }
	});
	console.log(`✅ Pauses commencées : ${count}`);
	return count;
}
