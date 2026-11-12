import type { ColabActivity, VolunteerRole } from '@prisma/client';
import type { VolunteerEditData, VolunteerWithRelations } from '#lib/types/volunteer.ts';

// Passage « bénévole en base » → « champs du formulaire d'édition » (VolunteerEditForm).
// Ce n'est pas de l'affichage : c'est une transformation de données, d'où un fichier .ts.

/** Valeurs de départ (le formulaire n'est affiché qu'après volunteerToEditData) */
export function emptyVolunteerEditData(): VolunteerEditData {
	return {
		firstName: '',
		lastName: '',
		birthDate: new Date(),
		email: '',
		phone: '',
		district: '',
		address: '',
		city: '',
		postalCode: '',

		// Volunteer spécifiques
		actif: 'ACTIVE' as ColabActivity,
		role: 'MANAGER' as VolunteerRole,
		breakStart: null,
		breakEnd: null
	};
}

/** Les champs du formulaire, pré-remplis avec le bénévole */
export function volunteerToEditData(volunteer: VolunteerWithRelations): VolunteerEditData {
	return {
		firstName: volunteer.profil.firstName,
		lastName: volunteer.profil.lastName,
		birthDate: volunteer.profil.birthDate ? new Date(volunteer.profil.birthDate) : new Date(),
		email: volunteer.profil.email,
		phone: volunteer.profil.phone || '',
		district: volunteer.profil.district || '',
		address: volunteer.profil.address || '',
		city: volunteer.profil.city || '',
		postalCode: volunteer.profil.postalCode || '',
		actif: volunteer.actif || 'ACTIVE',
		breakStart: volunteer.breakStart ? new Date(volunteer.breakStart) : null,
		breakEnd: volunteer.breakEnd ? new Date(volunteer.breakEnd) : null,
		role: volunteer.role
	};
}
