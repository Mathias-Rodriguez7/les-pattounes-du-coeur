export interface FormState {
	isDirty: boolean;
	isSaving: boolean;
	errors: Record<string, string>;
}

export interface FormConfig<T> {
	endpoint: string;
	method?: 'PUT' | 'POST';
	data: T;
	onSuccess?: (data: T) => void | Promise<void>;
	onError?: (error: Error) => void;
}

/**
 * Gère l'enregistrement uniforme des formulaires
 */
export async function handleFormSave<T>(config: FormConfig<T>) {
	const { endpoint, method = 'PUT', data, onSuccess, onError } = config;

	try {
		console.log(`📝 Sauvegarde sur ${endpoint}`, data);

		const response = await fetch(endpoint, {
			method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		console.log('✅ Sauvegarde réussie');

		if (onSuccess) {
			await onSuccess(result);
		}

		return result;
	} catch (error) {
		console.error('❌ Erreur lors de la sauvegarde:', error);

		if (onError && error instanceof Error) {
			onError(error);
		}

		throw error;
	}
}

/**
 * Gère l'annulation (reset des données)
 */
export function handleFormCancel<T>(originalData: T, onCancel?: () => void) {
	console.log('⚪ Annulation');

	if (onCancel) {
		onCancel();
	}

	return originalData;
}

/**
 * Crée un objet d'état de formulaire initial
 */
export function createFormState(): FormState {
	return {
		isDirty: false,
		isSaving: false,
		errors: {}
	};
}
