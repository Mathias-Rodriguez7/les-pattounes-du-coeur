import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { hashPassword, verifyPassword } from '$lib/server/hashing';
import { z } from 'zod';
import { updateVolunteer } from '$lib/server/volunteers/mutations';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	try {
		const volunteerId = locals.user.id;

		const volunteer = await prisma.volunteer.findUnique({
			where: { id: volunteerId },
			include: {
				profil: true
			}
		});

		if (!volunteer) {
			redirect(302, '/login');
		}

		return {
			volunteer: {
				id: volunteer.id,
				firstName: volunteer.profil.firstName,
				lastName: volunteer.profil.lastName,
				email: volunteer.profil.email,
				phone: volunteer.profil.phone,
				birthDate: volunteer.profil.birthDate,
				address: volunteer.profil.address,
				city: volunteer.profil.city,
				postalCode: volunteer.profil.postalCode,
				district: volunteer.profil.district ?? '',
				role: volunteer.role,
				actif: volunteer.actif,
				breakEnd: volunteer.breakEnd,
				createdAt: volunteer.createdAt
			},
			isAuthenticated: true
		};
	} catch (error) {
		console.error('Erreur lors du chargement du profil:', error);
		throw error;
	}
};

const updateEmailSchema = z.object({
	newEmail: z.email('Email invalide'),
	currentPassword: z.string().min(1, 'Le mot de passe est obligatoire')
});

const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Le mot de passe actuel est obligatoire'),
		newPassword: z
			.string()
			.min(8, 'Le mot de passe doit contenir au moins 8 caractères')
			.regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
			.regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
			.regex(/[!@#$%^&*]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword']
	});

export const actions: Actions = {
	updateEmail: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non authentifié', action: 'updateEmail' });
		}

		try {
			const formData = await request.formData();
			const newEmail = formData.get('newEmail')?.toString().trim().toLowerCase() ?? '';
			const currentPassword = formData.get('currentPassword') as string;

			const result = updateEmailSchema.safeParse({ newEmail, currentPassword });
			if (!result.success) {
				return fail(400, {
					success: false,
					error: 'Validation échouée',
					errors: result.error.flatten().fieldErrors,
					action: 'updateEmail'
				});
			}

			// 🔍 Vérifier que le volunteer existe (avec son mot de passe chiffré, pour le comparer)
			const volunteer = await prisma.volunteer.findUnique({
				where: { id: locals.user.id },
				omit: { password: false },
				include: { profil: true }
			});

			if (!volunteer) {
				return fail(404, { success: false, error: 'Volunteer non trouvé', action: 'updateEmail' });
			}

			// 🔐 Vérifier le mot de passe actuel
			const passwordValid = await verifyPassword(volunteer.password, currentPassword);
			if (!passwordValid) {
				return fail(400, {
					success: false,
					error: 'Mot de passe incorrect',
					errors: { currentPassword: ['Mot de passe incorrect'] },
					action: 'updateEmail'
				});
			}

			// 🔍 Vérifier que le nouvel email n'existe pas déjà
			const emailExists = await prisma.profil.findFirst({
				where: {
					email: newEmail,
					NOT: { id: volunteer.profilId }
				}
			});

			if (emailExists) {
				return fail(400, {
					success: false,
					error: 'Cet email est déjà utilisé',
					errors: { newEmail: ['Email déjà utilisé'] },
					action: 'updateEmail'
				});
			}

			// ✅ Mettre à jour l'email
			await prisma.profil.update({
				where: { id: volunteer.profilId },
				data: { email: newEmail }
			});

			return {
				success: true,
				message: '✅ Email mis à jour avec succès',
				action: 'updateEmail'
			};
		} catch (error) {
			console.error('Erreur updateEmail:', error);
			return fail(500, {
				success: false,
				error: 'Erreur serveur',
				action: 'updateEmail'
			});
		}
	},

	updatePassword: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non authentifié', action: 'updatePassword' });
		}

		try {
			const formData = await request.formData();
			const currentPassword = formData.get('currentPassword') as string;
			const newPassword = formData.get('newPassword') as string;
			const confirmPassword = formData.get('confirmPassword') as string;

			const result = updatePasswordSchema.safeParse({
				currentPassword,
				newPassword,
				confirmPassword
			});

			if (!result.success) {
				return fail(400, {
					success: false,
					error: 'Validation échouée',
					errors: result.error.flatten().fieldErrors,
					action: 'updatePassword'
				});
			}

			const volunteer = await prisma.volunteer.findUnique({
				where: { id: locals.user.id },
				omit: { password: false }
			});

			if (!volunteer) {
				return fail(404, {
					success: false,
					error: 'Volunteer non trouvé',
					action: 'updatePassword'
				});
			}

			// 🔐 Vérifier le mot de passe actuel
			const passwordValid = await verifyPassword(volunteer.password, currentPassword);
			if (!passwordValid) {
				return fail(400, {
					success: false,
					error: 'Mot de passe incorrect',
					errors: { currentPassword: ['Mot de passe incorrect'] },
					action: 'updatePassword'
				});
			}

			// 🔐 Hasher le nouveau mot de passe
			const newPasswordHash = await hashPassword(newPassword);
			const currentToken = cookies.get('session');

			// Mise à jour du mot de passe + déconnexion des AUTRES appareils
			await prisma.$transaction([
				prisma.volunteer.update({
					where: { id: locals.user.id },
					data: { password: newPasswordHash }
				}),
				prisma.session.deleteMany({
					where: {
						volunteerId: locals.user.id,
						token: { not: currentToken }
					}
				})
			]);

			return {
				success: true,
				message: '🔐 Mot de passe mis à jour avec succès',
				action: 'updatePassword'
			};
		} catch (error) {
			console.error('Erreur updatePassword:', error);
			return fail(500, {
				success: false,
				error: 'Erreur serveur',
				action: 'updatePassword'
			});
		}
	},

	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non authentifié', action: 'updateProfile' });
		}

		const formData = await request.formData();

		// L'id vient de la session, JAMAIS du navigateur
		formData.set('volunteerId', locals.user.id);

		const result = await updateVolunteer({ formData, locals });

		if (!result.success) {
			return fail(400, { ...result, action: 'updateProfile' });
		}

		return { success: true, message: 'Profil mis à jour', action: 'updateProfile' };
	}
};
