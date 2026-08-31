import { invalidateAll } from '$app/navigation';
import { toast } from 'svelte-sonner';

export async function handleActionResult(
	result: any,
	options?: {
		successMessage?: string;
		errorMessage?: string;
		onSuccess?: () => void; // ← Callback pour mise à jour local
	}
) {
	const {
		successMessage = 'Action réussie',
		errorMessage = 'Une erreur est survenue',
		onSuccess
	} = options || {};

	try {
		if (result.success) {
			// ✅ 1. Mise à jour locale IMMÉDIATE
			if (onSuccess) onSuccess();

			toast.success(successMessage);

			// ✅ 2. Reload en background pour la sécurité
			await invalidateAll();

			return true;
		} else {
			toast.error(result.message || errorMessage);
			return false;
		}
	} catch (error) {
		toast.error(errorMessage);
		console.error('Action error:', error);
		return false;
	}
}
