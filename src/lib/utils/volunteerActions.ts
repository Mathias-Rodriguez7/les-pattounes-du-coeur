import { toast } from 'svelte-sonner';
import { invalidateAll } from '$app/navigation';

interface UpdateVolunteerParams {
	volunteerId: string;
	data: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		district: string;
		address: string;
		city: string;
		postalCode: string;
		actif: string;
		role: string;
	};
	onLocalUpdate?: (volunteer: any) => void;
}

export const createVolunteerAction = async (data: {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	district: string;
	role: string;
}) => {
	try {
		const formData = new FormData();
		formData.append('firstName', data.firstName);
		formData.append('lastName', data.lastName);
		formData.append('email', data.email);
		formData.append('phone', data.phone);
		formData.append('address', data.address);
		formData.append('city', data.city);
		formData.append('postalCode', data.postalCode);

		if (data.district && data.district.trim() !== '') {
			formData.append('district', data.district);
		}

		formData.append('role', data.role);

		const response = await fetch('?/createVolunteer', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'failure') {
			try {
				const parsed = JSON.parse(result.data);

				if (typeof parsed === 'object' && parsed.error) {
					toast.error(parsed.error);
				} else if (Array.isArray(parsed) && parsed[2]) {
					toast.error(parsed[2]);
				} else {
					toast.error('Erreur lors de la création');
				}
			} catch {
				toast.error(result.data?.error || 'Erreur lors de la création');
			}
			return { success: false };
		}

		if (result.type === 'success') {
			toast.success('Bénévole créé avec succès');
			await invalidateAll();
			return { success: true, data: result.data };
		}

		toast.error('Erreur inconnue');
		return { success: false };
	} catch (error) {
		toast.error('Erreur réseau ou serveur');
		return { success: false };
	}
};

export const updateVolunteerAction = async ({
	volunteerId,
	data,
	onLocalUpdate
}: UpdateVolunteerParams) => {
	try {
		const formData = new FormData();
		formData.append('volunteerId', volunteerId);
		formData.append('firstName', data.firstName);
		formData.append('lastName', data.lastName);
		formData.append('email', data.email);
		formData.append('phone', data.phone);
		formData.append('district', data.district);
		formData.append('address', data.address);
		formData.append('city', data.city);
		formData.append('postalCode', data.postalCode);
		formData.append('actif', data.actif);
		formData.append('role', data.role);

		const response = await fetch('?/updateVolunteer', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'failure') {
			try {
				const parsed = JSON.parse(result.data);

				if (typeof parsed === 'object' && parsed.error) {
					toast.error(parsed.error);
					return false;
				}
			} catch {
				toast.error('Erreur de validation: ' + result.data);
			}

			return false;
		}

		if (result.type === 'redirect') {
			window.location.href = result.location;
			return true;
		}

		if (result.type === 'success') {
			toast.success('Bénévole mis à jour avec succès');

			if (onLocalUpdate && result.data) {
				onLocalUpdate(result.data);
			}

			await invalidateAll();
			return true;
		}

		toast.error('Erreur inconnue');
		return false;
	} catch (error) {
		toast.error('Erreur réseau ou serveur');
		return false;
	}
};

export const deleteVolunteerAction = async (volunteerId: string, onSuccess?: () => void) => {
	try {
		const formData = new FormData();
		formData.append('volunteerId', volunteerId);

		const response = await fetch('?/deleteVolunteer', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'failure') {
			toast.error('Erreur lors de la suppression');
			return false;
		}

		if (result.type === 'success') {
			toast.success('Bénévole supprimé avec succès');

			if (onSuccess) {
				onSuccess();
			}

			await invalidateAll();
			return true;
		}

		toast.error('Erreur inconnue');
		return false;
	} catch (error) {
		toast.error('Erreur réseau ou serveur');
		return false;
	}
};
