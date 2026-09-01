<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from '@lucide/svelte';

	type EditData = {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		postalCode: string;
		numberOfCats: number;
		notes: string;
	};

	const {
		editData = $bindable(),
		hostId,
		onSuccess,
		onCancel,
		isSaving = false
	}: {
		editData: EditData;
		hostId: string;
		onSuccess: () => void;
		onCancel: () => void;
		isSaving: boolean;
	} = $props();

	let errors = $state<Partial<EditData>>({});
	let isSubmitting = $state(false);

	// Validation
	const validateForm = (): boolean => {
		errors = {};

		if (!editData.firstName?.trim()) {
			errors.firstName = 'Le prénom est requis';
		}

		if (!editData.lastName?.trim()) {
			errors.lastName = 'Le nom est requis';
		}

		if (!editData.email?.trim()) {
			errors.email = "L'email est requis";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
			errors.email = 'Email invalide';
		}

		if (!editData.phone?.trim()) {
			errors.phone = 'Le téléphone est requis';
		} else if (!/^[\d\s\-\+()]+$/.test(editData.phone)) {
			errors.phone = 'Téléphone invalide';
		}

		if (!editData.address?.trim()) {
			errors.address = "L'adresse est requise";
		}

		if (!editData.city?.trim()) {
			errors.city = 'La ville est requise';
		}

		if (!editData.postalCode?.trim()) {
			errors.postalCode = 'Le code postal est requis';
		}

		if (editData.numberOfCats < 0) {
			errors.numberOfCats = 'Le nombre de chats doit être positif';
		}

		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error('Veuillez corriger les erreurs');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch(`/api/hosts/${hostId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					firstName: editData.firstName.trim(),
					lastName: editData.lastName.trim(),
					email: editData.email.trim(),
					phone: editData.phone.trim(),
					address: editData.address.trim(),
					city: editData.city.trim(),
					postalCode: editData.postalCode.trim(),
					numberOfCats: parseInt(String(editData.numberOfCats), 10),
					notes: editData.notes.trim()
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Erreur lors de la mise à jour');
			}

			toast.success("Famille d'accueil mise à jour avec succès");
			onSuccess();
		} catch (error) {
			console.error('Erreur:', error);
			toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
		} finally {
			isSubmitting = false;
		}
	};

	const handleCancel = () => {
		onCancel();
	};
</script>

<Form.Root>
	<div class="space-y-6">
		<!-- Prénom et Nom -->
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Prénom</label>
				<Input
					type="text"
					placeholder="Prénom"
					bind:value={editData.firstName}
					disabled={isSubmitting}
					class={errors.firstName ? 'border-red-500' : ''}
				/>
				{#if errors.firstName}
					<p class="text-sm text-red-500">{errors.firstName}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Nom</label>
				<Input
					type="text"
					placeholder="Nom"
					bind:value={editData.lastName}
					disabled={isSubmitting}
					class={errors.lastName ? 'border-red-500' : ''}
				/>
				{#if errors.lastName}
					<p class="text-sm text-red-500">{errors.lastName}</p>
				{/if}
			</div>
		</div>

		<!-- Email et Phone -->
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Email</label>
				<Input
					type="email"
					placeholder="Email"
					bind:value={editData.email}
					disabled={isSubmitting}
					class={errors.email ? 'border-red-500' : ''}
				/>
				{#if errors.email}
					<p class="text-sm text-red-500">{errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Téléphone</label>
				<Input
					type="tel"
					placeholder="Téléphone"
					bind:value={editData.phone}
					disabled={isSubmitting}
					class={errors.phone ? 'border-red-500' : ''}
				/>
				{#if errors.phone}
					<p class="text-sm text-red-500">{errors.phone}</p>
				{/if}
			</div>
		</div>

		<!-- Adresse -->
		<div class="space-y-2">
			<label class="text-sm font-medium text-gray-900">Adresse</label>
			<Input
				type="text"
				placeholder="Adresse"
				bind:value={editData.address}
				disabled={isSubmitting}
				class={errors.address ? 'border-red-500' : ''}
			/>
			{#if errors.address}
				<p class="text-sm text-red-500">{errors.address}</p>
			{/if}
		</div>

		<!-- Ville, Code Postal et Nombre de chats -->
		<div class="grid grid-cols-3 gap-4">
			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Ville</label>
				<Input
					type="text"
					placeholder="Ville"
					bind:value={editData.city}
					disabled={isSubmitting}
					class={errors.city ? 'border-red-500' : ''}
				/>
				{#if errors.city}
					<p class="text-sm text-red-500">{errors.city}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Code postal</label>
				<Input
					type="text"
					placeholder="Code postal"
					bind:value={editData.postalCode}
					disabled={isSubmitting}
					class={errors.postalCode ? 'border-red-500' : ''}
				/>
				{#if errors.postalCode}
					<p class="text-sm text-red-500">{errors.postalCode}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium text-gray-900">Nombre de chats</label>
				<Input
					type="number"
					placeholder="0"
					bind:value={editData.numberOfCats}
					disabled={isSubmitting}
					min="0"
					class={errors.numberOfCats ? 'border-red-500' : ''}
				/>
				{#if errors.numberOfCats}
					<p class="text-sm text-red-500">{errors.numberOfCats}</p>
				{/if}
			</div>
		</div>

		<!-- Notes -->
		<div class="space-y-2">
			<label class="text-sm font-medium text-gray-900">Notes</label>
			<Textarea
				placeholder="Notes supplémentaires..."
				bind:value={editData.notes}
				disabled={isSubmitting}
				rows={4}
				class="resize-none"
			/>
		</div>

		<!-- Boutons d'action -->
		<div class="flex gap-4 pt-4">
			<Button
				type="button"
				variant="outline"
				onclick={handleCancel}
				disabled={isSubmitting}
				class="flex-1"
			>
				Annuler
			</Button>
			<Button type="button" onclick={handleSubmit} disabled={isSubmitting} class="flex-1">
				{#if isSubmitting}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Sauvegarde...
				{:else}
					Sauvegarder
				{/if}
			</Button>
		</div>
	</div>
</Form.Root>

<style>
	/* Styles personnalisés si nécessaire */
</style>
