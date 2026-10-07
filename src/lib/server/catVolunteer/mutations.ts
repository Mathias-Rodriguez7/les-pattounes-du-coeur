import prisma from '$lib/server/prisma';

function convertFormData(formData: FormData): Record<string, string | null> {
	const data: Record<string, string | null> = {};

	for (const [key, value] of formData.entries()) {
		data[key] = (value as string) || null;
	}

	return data;
}

// ✅ Autorisation centralisée (ADMIN uniquement ici, car assigner un bénévole
// est une action réservée aux admins — adapte si besoin)
function canManageCatVolunteer(locals: App.Locals): { authorized: boolean; error?: string } {
	if (!locals.user) {
		return { authorized: false, error: 'Non autorisé' };
	}

	if (locals.user.role === 'ADMIN') {
		return { authorized: true };
	}

	return { authorized: false, error: 'Non autorisé' };
}

// ==========================================
// CREATE (assign)
// ==========================================
export async function createCatVolunteer({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const rawData = convertFormData(formData);

		const catId = rawData.catId;
		const volunteerId = rawData.volunteerId;

		if (!catId || !volunteerId) {
			return { success: false, error: 'Données manquantes', errors: {} };
		}

		const { authorized, error } = canManageCatVolunteer(locals);
		if (!authorized) {
			return { success: false, error: error ?? 'Non autorisé', errors: {} };
		}

		const existing = await prisma.catVolunteer.findUnique({
			where: {
				catId_volunteerId: { catId, volunteerId }
			}
		});

		if (existing) {
			return { success: false, error: 'Ce bénévole est déjà associé à ce chat', errors: {} };
		}

		const catVolunteer = await prisma.catVolunteer.create({
			data: { catId, volunteerId },
			include: {
				volunteer: {
					include: {
						profil: {
							select: { firstName: true, lastName: true }
						}
					}
				}
			}
		});

		return {
			success: true,
			message: 'Bénévole associé avec succès',
			catVolunteer,
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR CREATE CatVolunteer:', error);
		return {
			success: false,
			error: "Erreur lors de l'association du bénévole",
			errors: {}
		};
	}
}

// ==========================================
// DELETE (remove)
// ==========================================
export async function deleteCatVolunteer({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const catId = formData.get('catId') as string;
		const volunteerId = formData.get('volunteerId') as string;

		if (!catId || !volunteerId) {
			return { success: false, error: 'Données manquantes', errors: {} };
		}

		const { authorized, error } = canManageCatVolunteer(locals);
		if (!authorized) {
			return { success: false, error: error ?? 'Non autorisé', errors: {} };
		}

		const existing = await prisma.catVolunteer.findUnique({
			where: {
				catId_volunteerId: { catId, volunteerId }
			}
		});

		if (!existing) {
			return { success: false, error: 'Association non trouvée', errors: {} };
		}

		await prisma.catVolunteer.delete({
			where: {
				catId_volunteerId: { catId, volunteerId }
			}
		});

		return {
			success: true,
			message: 'Bénévole retiré avec succès',
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR DELETE CatVolunteer:', error);
		return {
			success: false,
			error: 'Erreur lors du retrait du bénévole',
			errors: {}
		};
	}
}
