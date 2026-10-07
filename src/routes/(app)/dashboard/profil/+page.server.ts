import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { hash, verify } from 'argon2';
import { z } from 'zod';

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
				role: volunteer.role,
				actif: volunteer.actif
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
			const newEmail = formData.get('newEmail') as string;
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

			// 🔍 Vérifier que le volunteer existe
			const volunteer = await prisma.volunteer.findUnique({
				where: { id: locals.user.id },
				include: { profil: true }
			});

			if (!volunteer) {
				return fail(404, { success: false, error: 'Volunteer non trouvé', action: 'updateEmail' });
			}

			// 🔐 Vérifier le mot de passe actuel
			const passwordValid = await verify(volunteer.password, currentPassword);
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

	updatePassword: async ({ request, locals }) => {
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
				where: { id: locals.user.id }
			});

			if (!volunteer) {
				return fail(404, {
					success: false,
					error: 'Volunteer non trouvé',
					action: 'updatePassword'
				});
			}

			// 🔐 Vérifier le mot de passe actuel
			const passwordValid = await verify(volunteer.password, currentPassword);
			if (!passwordValid) {
				return fail(400, {
					success: false,
					error: 'Mot de passe incorrect',
					errors: { currentPassword: ['Mot de passe incorrect'] },
					action: 'updatePassword'
				});
			}

			// 🔐 Hasher le nouveau mot de passe
			const newPasswordHash = await hash(newPassword);

			// ✅ Mettre à jour le mot de passe
			await prisma.volunteer.update({
				where: { id: locals.user.id },
				data: { password: newPasswordHash }
			});

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
	}
};
