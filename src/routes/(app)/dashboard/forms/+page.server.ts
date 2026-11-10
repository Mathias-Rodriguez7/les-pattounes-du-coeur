import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { FormType, FormStatus, type Prisma } from '@prisma/client';
import { updateForm, assignVolunteer, setFlexibleDispatcher } from '$lib/server/forms/mutations';
import { createVolunteer } from '$lib/server/volunteers/mutations';
import { createHost } from '$lib/server/hosts/mutations';
import { createAdoptionWithContractSchema } from '$lib/schemas/adoption';
import { createAdoption } from '$lib/server/adoptions/mutations';
import { canManageForm, myFormsWhere } from '$lib/server/permissions/form';
import { catPickerSelect } from '$lib/types/cat';
import { canManageCat } from '$lib/server/permissions/cat';
import { prepareMedia, discardUpload } from '$lib/server/media/mutations';

/** 🆕 Une demande, avec juste ce que les panneaux affichent */
const formInclude = {
	assignedTo: {
		select: { id: true, profil: { select: { firstName: true, lastName: true } } }
	},
	cat: {
		select: {
			id: true,
			name: true,
			catNumber: true,
			sex: true,
			birthDate: true,
			status: true,
			// La référente en premier (la plus ancienne bénévole associée)
			volunteers: {
				orderBy: { createdAt: 'asc' },
				select: {
					volunteer: {
						select: { id: true, profil: { select: { firstName: true, lastName: true } } }
					}
				}
			}
		}
	}
} satisfies Prisma.FormInclude;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const volunteerId = locals.user.id;
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { role: true, isFlexibleDispatcher: true }
	});

	if (!volunteer) {
		redirect(302, '/');
	}

	const isAdmin = volunteer.role === 'ADMIN';
	const isFlexibleDispatcher = volunteer.isFlexibleDispatcher;
	// Vue « Tous » : l'admin voit toutes les demandes, la répartitrice toutes les demandes libres
	const canSeeAll = isAdmin || isFlexibleDispatcher;

	// 🔍 Filtres
	const typeParam = url.searchParams.get('type');
	const statusParam = url.searchParams.get('status');
	const scopeParam = url.searchParams.get('scope');

	const typeFilter =
		typeParam && Object.values(FormType).includes(typeParam as FormType)
			? (typeParam as FormType)
			: undefined;

	const statusFilter =
		statusParam && Object.values(FormStatus).includes(statusParam as FormStatus)
			? (statusParam as FormStatus)
			: undefined;

	// 🔀 Mode d'affichage : 'mine' par défaut, 'all' seulement si autorisé
	const scope: 'mine' | 'all' = scopeParam === 'all' && canSeeAll ? 'all' : 'mine';

	const baseFilters: Prisma.FormWhereInput = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter })
	};

	// 🏗️ Condition WHERE selon le mode
	// - mine : mes demandes (assignées OU de mes chats), pour tout le monde, admin compris
	// - all + admin : toutes les demandes
	// - all + répartitrice : toutes les demandes libres
	let whereCondition: Prisma.FormWhereInput;
	if (scope === 'mine') {
		whereCondition = { AND: [baseFilters, myFormsWhere(volunteerId)] };
	} else if (isAdmin) {
		whereCondition = baseFilters;
	} else {
		whereCondition = { ...baseFilters, type: FormType.ADOPTION_FLEXIBLE };
	}

	// 📊 Stats
	const [totalForms, pendingForms, approvedForms, rejectedForms] = await Promise.all([
		prisma.form.count({ where: whereCondition }),
		prisma.form.count({ where: { ...whereCondition, status: 'PENDING' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'APPROVED' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'REJECTED' } })
	]);

	// 📋 Forms
	// 🆕 Le chat et la bénévole assignée arrivent avec la demande, en une seule requête
	// (avant : une requête de plus par demande pour retrouver son chat)
	const forms = await prisma.form.findMany({
		where: whereCondition,
		include: formInclude,
		orderBy: { createdAt: 'desc' }
	});

	// 📋 Volunteers pour l'assignation : admin, et répartitrice des demandes libres
	const canAssign = isAdmin || isFlexibleDispatcher;
	const volunteers = canAssign
		? await prisma.volunteer.findMany({
				select: {
					id: true,
					isFlexibleDispatcher: true,
					profil: { select: { firstName: true, lastName: true } }
				},
				orderBy: { profil: { firstName: 'asc' } }
			})
		: [];

	// 🐱 Les chats qu'on peut proposer pour une demande libre :
	// adoptables, et seulement ceux dont la personne connectée est en charge (admin compris)
	const cats = await prisma.cat.findMany({
		where: {
			status: 'AVAILABLE',
			isVisible: true,
			volunteers: { some: { volunteerId } }
		},
		select: catPickerSelect,
		orderBy: { name: 'asc' }
	});

	return {
		forms,
		volunteers,
		cats,
		stats: { totalForms, pendingForms, approvedForms, rejectedForms },
		isAdmin,
		canAssign,
		canSeeAll,
		scope,
		filters: {
			type: typeFilter || null,
			status: statusFilter || null
		}
	};
};

export const actions: Actions = {
	createVolunteer: async ({ request, locals }) => {
		try {
			const formData = await request.clone().formData();
			const formId = formData.get('formId')?.toString();

			const result = await createVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}

			if (formId) {
				await prisma.form.update({
					where: { id: formId },
					data: { status: 'APPROVED' }
				});
			}

			return result;
		} catch (error) {
			console.error('Erreur création bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	createHost: async ({ request, locals }) => {
		try {
			const formData = await request.clone().formData();
			const formId = formData.get('formId')?.toString();

			const result = await createHost({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			if (formId) {
				await prisma.form.update({
					where: { id: formId },
					data: { status: 'APPROVED' }
				});
			}
			return result;
		} catch (error) {
			console.error("Erreur création famille d'accueil:", error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateForm: async ({ request, locals }) => {
		try {
			const result = await updateForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour form:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	assignVolunteer: async ({ request, locals }) => {
		try {
			const result = await assignVolunteer({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur assignation bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	setFlexibleDispatcher: async ({ request, locals }) => {
		try {
			const result = await setFlexibleDispatcher({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour dispatcher flexible:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	createAdoption: async ({ request, locals }) => {
		// Le load protège l'affichage, pas les actions : on vérifie ici
		if (!locals.user) {
			return fail(401, { error: 'Vous devez être connecté' });
		}
		const user = locals.user;

		const formData = await request.formData();
		const parsed = createAdoptionWithContractSchema.safeParse(Object.fromEntries(formData));
		if (!parsed.success) {
			return fail(400, {
				error: 'Erreur de validation',
				errors: parsed.error.flatten().fieldErrors
			});
		}
		const { formId, catId, mediaStorageKey, mediaOriginalName } = parsed.data;

		// À partir d'ici, le contrat est déjà sur S3. Quelle que soit la sortie
		// (refus, erreur, exception), le `finally` le supprime s'il n'a pas été rattaché.
		let contractAttached = false;

		try {
			// 1. La demande existe, c'est une demande d'adoption, et la bénévole peut la traiter
			const adoptionRequest = await prisma.form.findUnique({
				where: { id: formId },
				select: { type: true, catId: true, assignedToId: true }
			});
			if (!adoptionRequest || !adoptionRequest.type.startsWith('ADOPTION')) {
				return fail(404, { error: 'Demande introuvable' });
			}
			if (!(await canManageForm(user, adoptionRequest))) {
				return fail(403, { error: "Vous n'êtes pas autorisée à traiter cette demande" });
			}

			// 2. Le chat proposé est bien sous sa responsabilité
			if (!(await canManageCat(user, catId))) {
				return fail(403, { error: "Ce chat n'est pas sous votre responsabilité" });
			}

			// 3. Une demande précise ne peut aboutir qu'à l'adoption de SON chat
			if (adoptionRequest.type === 'ADOPTION_SPECIFIC' && adoptionRequest.catId !== catId) {
				return fail(400, { error: 'Cette demande concerne un autre chat' });
			}

			// 4. Une demande libre : on ne propose QUE ses propres chats, même en admin
			// (canManageCat laisse l'admin passer sur tous les chats, d'où ce contrôle en plus)
			if (adoptionRequest.type === 'ADOPTION_FLEXIBLE') {
				const isOwnCat = await prisma.catVolunteer.count({
					where: { catId, volunteerId: user.id }
				});
				if (isOwnCat === 0) {
					return fail(403, {
						error: 'Vous ne pouvez proposer que les chats dont vous avez la charge'
					});
				}
			}

			// 5. Le contrat : vérifié sur S3, dans le dossier de CE chat, bucket privé
			const prepared = await prepareMedia(
				'catDocument',
				{ storageKey: mediaStorageKey, originalName: mediaOriginalName },
				catId
			);
			if (!prepared.ok) {
				return fail(400, { error: prepared.error, errors: { media: [prepared.error] } });
			}

			// 6. Tout est vérifié : on crée l'adoption (et tout le reste) en une transaction
			try {
				const { adoption, rejectedCount } = await createAdoption(parsed.data, prepared.data);
				contractAttached = true;

				const rejectedMessage =
					rejectedCount === 0
						? ''
						: rejectedCount === 1
							? ' 1 autre demande a été refusée.'
							: ` ${rejectedCount} autres demandes ont été refusées.`;

				return {
					success: true,
					adoptionId: adoption.id,
					message: `Adoption créée (période d'essai de 6 mois).${rejectedMessage}`
				};
			} catch (err) {
				// Les messages de createAdoption sont écrits pour l'utilisatrice (« Le chat … n'est plus disponible »)
				const message = err instanceof Error ? err.message : 'Erreur inconnue';
				return fail(400, { error: message });
			}
		} finally {
			if (!contractAttached) {
				await discardUpload(user, 'catDocument', mediaStorageKey, catId);
			}
		}
	}
};
