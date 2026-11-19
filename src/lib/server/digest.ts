import prisma from '#lib/server/prisma.ts';
import { SITE_URL } from '$app/env/private';
import { allTasks, snoozesByVolunteer } from '#lib/server/tasks.ts';
import { sendWeeklyDigestEmail } from '#lib/server/mailer.ts';
import { adminTasks, volunteerTasks, type Task, type TaskLink } from '#lib/tasks/tasks.ts';
import { applySnoozes } from '#lib/tasks/snooze.ts';
import { sortTasks } from '#lib/tasks/board.ts';
import { ENTITY_PAGES, ENTITY_PARAM } from '#lib/navigation/entityPages.ts';

// =====================================================================
// Le récapitulatif du lundi : à chaque bénévole qui le veut, ses tâches de la semaine.
// Les mêmes tâches que son dashboard (sans ce qu'elle a mis de côté). Rien à faire : pas d'email.
// Déclenché par une tâche planifiée du serveur : routes/api/cron/weekly-digest
// =====================================================================

/** Le lien d'une tâche, depuis un email (l'adresse complète du site) */
function taskUrl(link: TaskLink, isAdmin: boolean) {
	const base = SITE_URL.replace(/\/+$/, '');
	const id = encodeURIComponent(link.id);
	if (link.kind === 'form') {
		return `${base}/dashboard/forms?${ENTITY_PARAM}=${id}${link.allForms || isAdmin ? '&scope=all' : ''}`;
	}
	return `${base}/${ENTITY_PAGES[link.kind]}?${ENTITY_PARAM}=${id}`;
}

export type DigestSection = {
	title: string;
	tasks: { title: string; detail: string; urgency: Task['urgency']; url: string }[];
};

/** Envoie le récapitulatif à toutes les bénévoles actives qui le veulent */
export async function sendWeeklyDigests(now = new Date()) {
	if (!SITE_URL) throw new Error('SITE_URL manquant : les liens des emails seraient faux');

	const [tasks, snoozes, volunteers] = await Promise.all([
		allTasks(),
		snoozesByVolunteer(),
		prisma.volunteer.findMany({
			where: { weeklyDigest: true, OR: [{ actif: 'ACTIVE' }, { actif: null }] },
			select: { id: true, role: true, profil: { select: { firstName: true, email: true } } }
		})
	]);

	let sent = 0;
	let skipped = 0;
	const failures: string[] = [];

	for (const volunteer of volunteers) {
		const isAdmin = volunteer.role === 'ADMIN';
		const mySnoozes = snoozes[volunteer.id] ?? [];
		const toSection = (title: string, list: Task[]): DigestSection => ({
			title,
			tasks: sortTasks(applySnoozes(list, mySnoozes, now).active).map((task) => ({
				title: task.title,
				detail: task.detail,
				urgency: task.urgency,
				url: taskUrl(task.link, isAdmin)
			}))
		});

		const sections = [
			...(isAdmin ? [toSection("Vos tâches d'admin", adminTasks(tasks, volunteer.id))] : []),
			toSection(isAdmin ? 'Vos tâches de bénévole' : 'Vos tâches', volunteerTasks(tasks, volunteer))
		].filter((section) => section.tasks.length > 0);

		if (sections.length === 0) {
			skipped++;
			continue;
		}
		try {
			await sendWeeklyDigestEmail({
				to: volunteer.profil.email,
				firstName: volunteer.profil.firstName,
				sections,
				dashboardUrl: `${SITE_URL.replace(/\/+$/, '')}/dashboard`,
				profileUrl: `${SITE_URL.replace(/\/+$/, '')}/dashboard/profil`
			});
			sent++;
		} catch (error) {
			// Une adresse en erreur n'empêche pas les autres : on note, on continue
			console.error('Récapitulatif non envoyé :', volunteer.id, error);
			failures.push(volunteer.id);
		}
	}

	return { sent, skipped, failed: failures.length };
}
