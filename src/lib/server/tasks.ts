import prisma from '#lib/server/prisma.ts';
import type { AppUser } from '#lib/types/user.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { buildTasks, volunteerTasks, type TaskSources } from '#lib/tasks/tasks.ts';

// =====================================================================
// Les tâches de l'asso : lues en base ICI, calculées dans lib/tasks/tasks.ts.
// Une seule source pour le dashboard (et plus tard les pastilles et les bandeaux).
// =====================================================================

/** « Jean D. » : le nom d'une personne dans une tâche */
function shortName(firstName?: unknown, lastName?: unknown, fallback = 'Sans nom') {
	const first = typeof firstName === 'string' ? firstName.trim() : '';
	const last = typeof lastName === 'string' ? lastName.trim() : '';
	if (!first && !last) return fallback;
	return last ? `${first} ${last.charAt(0).toUpperCase()}.`.trim() : first;
}

const catName = (cat: { name: string | null; catNumber: string | null }) =>
	cat.name ?? cat.catNumber ?? 'un chat sans nom';

/** Tout ce qu'il faut pour calculer les tâches : des requêtes ciblées, en parallèle */
async function loadTaskSources(): Promise<TaskSources> {
	const [sos, adoptions, forms, cats, invitations, volunteers] = await Promise.all([
		prisma.sos.findMany({
			where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
			select: {
				id: true,
				reportedAt: true,
				updatedAt: true,
				status: true,
				handledById: true,
				city: true,
				_count: { select: { cats: true } }
			}
		}),
		prisma.adoption.findMany({
			where: { status: 'TRIAL' },
			select: {
				catId: true,
				trialEndsAt: true,
				cat: {
					select: {
						name: true,
						catNumber: true,
						volunteers: { select: { volunteerId: true } }
					}
				}
			}
		}),
		prisma.form.findMany({
			where: {
				status: 'PENDING',
				type: { in: ['ADOPTION_SPECIFIC', 'ADOPTION_FLEXIBLE', 'HOST', 'VOLUNTEER'] }
			},
			select: {
				id: true,
				type: true,
				createdAt: true,
				assignedToId: true,
				email: true,
				data: true,
				cat: { select: { name: true, catNumber: true } }
			}
		}),
		prisma.cat.findMany({
			where: { status: { in: ['AVAILABLE', 'SOCIALIZE'] } },
			select: {
				id: true,
				name: true,
				catNumber: true,
				status: true,
				createdAt: true,
				isVisible: true,
				publishedAt: true,
				birthDate: true,
				sex: true,
				color: true,
				hairLength: true,
				origin: true,
				description: true,
				vaccinate: true,
				isSterilize: true,
				isAlreadySterilized: true,
				isIdentify: true,
				chipId: true,
				tattooId: true,
				volunteers: { select: { volunteerId: true } },
				placements: {
					where: { status: { in: ['ACTIVE', 'BREAK'] } },
					select: { type: true, status: true, createdAt: true }
				},
				_count: { select: { forms: { where: { status: 'PENDING' } }, media: true } }
			}
		}),
		prisma.invitation.findMany({
			select: { id: true, kind: true, email: true, data: true, expiresAt: true }
		}),
		prisma.volunteer.findMany({
			select: { id: true, profil: { select: { firstName: true, lastName: true } } }
		})
	]);

	return {
		sos: sos.map(({ _count, ...row }) => ({ ...row, catCount: _count.cats })),
		adoptions: adoptions.map((adoption) => ({
			catId: adoption.catId,
			catName: catName(adoption.cat),
			trialEndsAt: adoption.trialEndsAt,
			volunteerIds: adoption.cat.volunteers.map((cv) => cv.volunteerId)
		})),
		forms: forms.map((form) => {
			const data = (form.data ?? {}) as Record<string, unknown>;
			return {
				id: form.id,
				type: form.type,
				createdAt: form.createdAt,
				assignedToId: form.assignedToId,
				personName: shortName(data.firstName, data.lastName, form.email),
				catName: form.cat ? catName(form.cat) : null
			};
		}),
		cats: cats.map((cat) => ({
			id: cat.id,
			name: catName(cat),
			status: cat.status,
			createdAt: cat.createdAt,
			isVisible: cat.isVisible,
			publishedAt: cat.publishedAt,
			realName: cat.name,
			hasPhoto: cat._count.media > 0,
			birthDate: cat.birthDate,
			sex: cat.sex,
			color: cat.color,
			hairLength: cat.hairLength,
			origin: cat.origin,
			description: cat.description,
			vaccinate: cat.vaccinate,
			isSterilized: cat.isSterilize || cat.isAlreadySterilized,
			// Identifié : la case, ou un numéro de puce / tatouage saisi
			isIdentified: cat.isIdentify || !!cat.chipId || !!cat.tattooId,
			volunteerIds: cat.volunteers.map((cv) => cv.volunteerId),
			// Dans une FA : un placement long (actif ou en pause), court ou transfert actif
			hasHome: cat.placements.some(
				(p) => p.type !== 'PROPOSAL' && (p.status === 'ACTIVE' || p.type === 'LONG')
			),
			openProposals: cat.placements
				.filter((p) => p.type === 'PROPOSAL' && p.status === 'ACTIVE')
				.map((p) => p.createdAt),
			pendingRequests: cat._count.forms
		})),
		invitations: invitations.map((invitation) => {
			const data = (invitation.data ?? {}) as Record<string, unknown>;
			return {
				id: invitation.id,
				kind: invitation.kind,
				name: shortName(data.firstName, data.lastName, invitation.email),
				expiresAt: invitation.expiresAt
			};
		}),
		volunteers: volunteers.map((v) => ({
			id: v.id,
			name: `${v.profil.firstName} ${v.profil.lastName}`
		}))
	};
}

/** Toutes les tâches de l'asso, maintenant */
export async function allTasks() {
	return buildTasks(await loadTaskSources(), new Date());
}

/**
 * Les tâches envoyées au navigateur.
 * Une bénévole : seulement les siennes (et celles de l'asso).
 * L'admin : toutes ; la page les range en vues « Admin » et « Bénévole ».
 */
export async function tasksFor(user: AppUser) {
	const tasks = await allTasks();
	return hasAdminRole(user) ? tasks : volunteerTasks(tasks, user);
}
