// src/lib/server/adoptions/actions.ts
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { createAdoptionWithContractSchema } from '$lib/schemas/adoption';
import { createAdoption } from './mutations';
import { canManageForm } from '$lib/server/permissions/form';
import { canManageCat } from '$lib/server/permissions/cat';
import { prepareMedia, discardUpload } from '$lib/server/media/mutations';

type Args = { request: Request; locals: App.Locals };

/**
 * L'action « créer une adoption », partagée par deux pages :
 * - Formulaires : depuis une demande (formId obligatoire côté interface) ;
 * - Chats (CatPanel) : depuis la fiche du chat, avec ou sans demande liée.
 * Un seul code : une règle corrigée ici l'est pour les deux pages.
 */
export async function createAdoptionAction({ request, locals }: Args) {
	// Le load protège l'affichage, pas les actions : on vérifie ici
	if (!locals.user) {
		return fail(401, { error: 'Vous devez être connecté' });
	}
	const user = locals.user;

	const parsed = createAdoptionWithContractSchema.safeParse(
		Object.fromEntries(await request.formData())
	);
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
		// 1. Le chat proposé est bien sous sa responsabilité
		if (!(await canManageCat(user, catId))) {
			return fail(403, { error: "Ce chat n'est pas sous votre responsabilité" });
		}

		// 2. Une demande liée ? Elle doit exister, être traitable, et concerner ce chat
		if (formId) {
			const adoptionRequest = await prisma.form.findUnique({
				where: { id: formId },
				select: { type: true, catId: true, assignedToId: true, status: true }
			});
			if (!adoptionRequest || !adoptionRequest.type.startsWith('ADOPTION')) {
				return fail(404, { error: 'Demande introuvable' });
			}
			if (adoptionRequest.status !== 'PENDING') {
				return fail(400, { error: 'Cette demande a déjà été traitée' });
			}
			if (!(await canManageForm(user, adoptionRequest))) {
				return fail(403, { error: "Vous n'êtes pas autorisée à traiter cette demande" });
			}

			// Une demande précise ne peut aboutir qu'à l'adoption de SON chat
			if (adoptionRequest.type === 'ADOPTION_SPECIFIC' && adoptionRequest.catId !== catId) {
				return fail(400, { error: 'Cette demande concerne un autre chat' });
			}

			// Une demande libre : on ne propose QUE ses propres chats, même en admin
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
		}

		// 3. Le contrat : vérifié sur S3, dans le dossier de CE chat, bucket privé
		const prepared = await prepareMedia(
			'catDocument',
			{ storageKey: mediaStorageKey, originalName: mediaOriginalName },
			catId
		);
		if (!prepared.ok) {
			return fail(400, { error: prepared.error, errors: { media: [prepared.error] } });
		}

		// 4. Tout est vérifié : on crée l'adoption (et tout le reste) en une transaction
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
			// Les messages de createAdoption sont écrits pour l'utilisatrice (« Le chat … n'est pas adoptable »)
			const message = err instanceof Error ? err.message : 'Erreur inconnue';
			return fail(400, { error: message });
		}
	} finally {
		if (!contractAttached) {
			await discardUpload(user, 'catDocument', mediaStorageKey, catId);
		}
	}
}
