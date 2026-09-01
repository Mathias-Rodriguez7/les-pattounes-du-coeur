import prisma from '$lib/server/prisma';
import { District, VolunteerRole, ColabActivity } from '@prisma/client';
import { createVolunteerSchema, updateVolunteerSchema } from './schema';
import { ZodError } from 'zod';

interface PrismaErrorWithCode {
	code?: string;
	meta?: {
		target?: string[];
	};
}

export const createVolunteer = async ({ request, locals }: any) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		return { success: false, error: 'Non autorisé' };
	}

	const formData = await request.formData();
	const data = {
		firstName: formData.get('firstName')?.toString().trim(),
		lastName: formData.get('lastName')?.toString().trim(),
		email: formData.get('email')?.toString().trim(),
		phone: formData.get('phone')?.toString().trim(),
		address: formData.get('address')?.toString().trim(),
		city: formData.get('city')?.toString().trim(),
		postalCode: formData.get('postalCode')?.toString().trim(),
		district: formData.get('district')?.toString().trim(),
		role: formData.get('role')?.toString().trim() || 'MANAGER'
	};

	try {
		const validatedData = createVolunteerSchema.parse(data);

		const profil = await prisma.profil.create({
			data: {
				firstName: validatedData.firstName,
				lastName: validatedData.lastName,
				email: validatedData.email,
				phone: validatedData.phone,
				address: validatedData.address,
				city: validatedData.city,
				postalCode: validatedData.postalCode,
				...(validatedData.district && { district: validatedData.district as District })
			}
		});

		const volunteer = await prisma.volunteer.create({
			data: {
				profilId: profil.id,
				password: 'TempPassword123!',
				role: validatedData.role as VolunteerRole,
				actif: 'ACTIVE'
			},
			include: {
				profil: true,
				cats: true,
				assignedForms: true
			}
		});

		// ✅ RETOURNER le volunteer créé
		return {
			success: true,
			data: { volunteer }
		};
	} catch (error) {
		if (error instanceof ZodError) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: error.issues.map((issue) => ({
					path: issue.path,
					message: issue.message
				}))
			};
		}

		const prismaError = error as PrismaErrorWithCode;
		if (prismaError.code === 'P2002') {
			const field = prismaError.meta?.target?.[0] || 'données';
			return { success: false, error: `Ce ${field} est déjà utilisé` };
		}

		console.error('Erreur création volunteer:', error);
		return { success: false, error: 'Erreur lors de la création' };
	}
};

export const updateVolunteer = async ({ request }: any) => {
	const formData = await request.formData();
	const volunteerId = formData.get('volunteerId')?.toString().trim();

	console.log('📝 updateVolunteer - volunteerId reçu:', volunteerId);

	const data = {
		volunteerId,
		firstName: formData.get('firstName')?.toString().trim(),
		lastName: formData.get('lastName')?.toString().trim(),
		email: formData.get('email')?.toString().trim(),
		phone: formData.get('phone')?.toString().trim(),
		address: formData.get('address')?.toString().trim(),
		city: formData.get('city')?.toString().trim(),
		postalCode: formData.get('postalCode')?.toString().trim(),
		district: formData.get('district')?.toString().trim() || undefined,
		actif: formData.get('actif')?.toString().trim(),
		role: formData.get('role')?.toString().trim()
	};

	try {
		const validatedData = updateVolunteerSchema.parse(data);

		console.log('✅ Données validées:', validatedData);

		// 🔑 IMPORTANT: volunteerId est l'ID du VOLUNTEER, pas du PROFIL
		const existingVolunteer = await prisma.volunteer.findUnique({
			where: { id: validatedData.volunteerId },
			include: { profil: true }
		});

		if (!existingVolunteer) {
			console.error('❌ Volunteer non trouvé:', validatedData.volunteerId);
			return { success: false, error: 'Bénévole non trouvé' };
		}

		console.log('✅ Volunteer trouvé:', existingVolunteer.id);

		// ✅ Vérifier le téléphone (utiliser profilId pour vérifier l'unicité)
		if (validatedData.phone) {
			const phoneExists = await prisma.profil.findFirst({
				where: {
					phone: validatedData.phone,
					id: { not: existingVolunteer.profilId } // Comparer avec profilId
				}
			});

			if (phoneExists) {
				console.error('❌ Téléphone déjà utilisé');
				return { success: false, error: 'Ce numéro de téléphone est déjà utilisé' };
			}
		}

		// 🔄 Mettre à jour le PROFIL
		const profilUpdateData: any = {};
		if (validatedData.firstName) profilUpdateData.firstName = validatedData.firstName;
		if (validatedData.lastName) profilUpdateData.lastName = validatedData.lastName;
		if (validatedData.email) profilUpdateData.email = validatedData.email;
		if (validatedData.phone) profilUpdateData.phone = validatedData.phone;
		if (validatedData.address) profilUpdateData.address = validatedData.address;
		if (validatedData.city) profilUpdateData.city = validatedData.city;
		if (validatedData.postalCode) profilUpdateData.postalCode = validatedData.postalCode;
		if (validatedData.district) profilUpdateData.district = validatedData.district as District;

		console.log('📝 Mise à jour profil avec:', profilUpdateData);

		await prisma.profil.update({
			where: { id: existingVolunteer.profilId },
			data: profilUpdateData
		});

		console.log('✅ Profil mis à jour');

		// 🔄 Mettre à jour le VOLUNTEER
		const volunteerUpdateData: any = {};
		if (validatedData.role) volunteerUpdateData.role = validatedData.role as VolunteerRole;
		if (validatedData.actif) volunteerUpdateData.actif = validatedData.actif as ColabActivity;

		console.log('📝 Mise à jour volunteer avec:', volunteerUpdateData);

		const updatedVolunteer = await prisma.volunteer.update({
			where: { id: validatedData.volunteerId }, // ✅ Utiliser l'ID du volunteer
			data: volunteerUpdateData,
			include: {
				profil: true,
				cats: true,
				assignedForms: true
			}
		});

		console.log('✅ Volunteer mis à jour:', updatedVolunteer.id);

		// ✅ RETOURNER le volunteer mis à jour
		return {
			success: true,
			data: { volunteer: updatedVolunteer }
		};
	} catch (error) {
		console.error('❌ Erreur updateVolunteer:', error);

		if (error instanceof ZodError) {
			console.error('📋 Erreurs Zod:', error.issues);
			return {
				success: false,
				error: 'Erreur de validation',
				errors: error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message
				}))
			};
		}

		const prismaError = error as PrismaErrorWithCode;
		if (prismaError.code === 'P2002') {
			const field = prismaError.meta?.target?.[0] || 'données';
			return { success: false, error: `Ce ${field} est déjà utilisé` };
		}

		console.error('Erreur mise à jour volunteer:', error);
		return { success: false, error: 'Erreur lors de la mise à jour du bénévole' };
	}
};

export async function deleteVolunteer(volunteerId: string) {
	try {
		const volunteer = await prisma.volunteer.findUnique({
			where: { id: volunteerId }
		});

		if (!volunteer) {
			return {
				success: false,
				error: 'Bénévole non trouvé'
			};
		}

		// ⚠️ IMPORTANT: Supprimer le profil aussi (ou gérer la cascade)
		await prisma.volunteer.delete({
			where: { id: volunteerId }
		});

		// Optionnel: Supprimer aussi le profil orphelin
		await prisma.profil
			.delete({
				where: { id: volunteer.profilId }
			})
			.catch(() => {
				// Ignorer les erreurs si le profil n'existe pas
			});

		return {
			success: true,
			message: 'Bénévole supprimé avec succès',
			data: { volunteerId }
		};
	} catch (error) {
		console.error('Erreur suppression:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Erreur inconnue'
		};
	}
}
