<script lang="ts">
	import { createAdoptionSchema } from '$lib/schemas/adoption';
	import { getFieldError, flattenErrors } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import MediaUpload from '$lib/components/media/MediaUpload.svelte';
	import { HOST_SECTION_CONFIG } from '$lib/constants/host';
	import SaveCancelButtons from '$lib/components/buttons/SaveCancelButtons.svelte';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';
	import type { AdoptionFormJson } from '$lib/types/form';
	import { untrack } from 'svelte';

	interface Props {
		open?: boolean;
		onCancel?: () => void;
		/** Les coordonnées de la demande, pour pré-remplir le profil de l'adoptant */
		initialData?: (AdoptionFormJson & { email?: string }) | null;
		formId: string;
		/** Le chat adopté : celui de la demande précise, ou celui choisi pour une demande libre */
		catId: string;
	}

	let { open = $bindable(false), onCancel, initialData = null, formId, catId }: Props = $props();

	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// ✅ Profil de l'adoptant
	let firstName = $state('');
	let lastName = $state('');
	let birthDate = $state<Date | undefined>(undefined);
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('Montpellier');
	let postalCode = $state('34000');
	let selectedDistrict = $state<string>('');

	// ✅ Le contrat (obligatoire)
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([value, label]) => ({
		value,
		label
	}));

	// Le serveur renvoie { champ: ['message', …] } (flatten de Zod) : on garde le 1er message
	function firstMessages(errors: unknown): FlattenedErrors {
		if (!errors || typeof errors !== 'object') return {};
		const flat: FlattenedErrors = {};
		for (const [key, messages] of Object.entries(errors as Record<string, string[] | undefined>)) {
			if (messages?.[0]) flat[key] = messages[0];
		}
		return flat;
	}

	function resetForm() {
		firstName = '';
		lastName = '';
		birthDate = undefined;
		email = '';
		phone = '';
		address = '';
		city = 'Montpellier';
		postalCode = '34000';
		selectedDistrict = '';
		files = [];
		progress = {};
		fieldErrors = {};
	}

	// À chaque ouverture : on repart des coordonnées de la demande
	// untrack : seul `open` déclenche l'effet. Le parent recrée l'objet initialData à chaque
	// rendu ({ ...adoptionData, email }) : sans untrack, la saisie serait effacée en cours de route
	$effect(() => {
		if (!open) return;
		untrack(() => fill(initialData));
	});

	function fill(initialData: Props['initialData']) {
		resetForm();
		if (initialData) {
			firstName = initialData.firstName ?? '';
			lastName = initialData.lastName ?? '';
			email = initialData.email ?? '';
			phone = initialData.phone ?? '';
			address = initialData.address ?? '';
			city = initialData.city ?? 'Montpellier';
			postalCode = initialData.postalCode ?? '34000';
			birthDate = initialData.birthDate ? new Date(initialData.birthDate) : undefined;
			selectedDistrict = initialData.district ?? '';
		}
	}

	// ✅ Validation côté navigateur : les MÊMES règles que le serveur (sauf le contrat, vérifié à part)
	function validateForm(): boolean {
		const result = createAdoptionSchema.safeParse({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,
			// Avant, ces deux-là manquaient : la validation échouait toujours
			formId,
			catId
		});

		if (!result.success) {
			fieldErrors = flattenErrors(result.error);
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		fieldErrors = {};
		return true;
	}

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}

		const file = files[0];
		if (!file) {
			fieldErrors = { media: 'Le contrat signé est obligatoire' };
			toast.error('Ajoutez le contrat signé');
			cancel();
			return;
		}

		isSubmitting = true;

		// 1. Le contrat part sur S3 (bucket privé, dossier des documents de CE chat)
		try {
			const uploaded = await uploadFile(file, {
				purpose: 'catDocument',
				targetId: catId,
				onProgress: (percent) => (progress = { [fileKey(file)]: percent })
			});
			formData.set('mediaStorageKey', uploaded.storageKey);
			formData.set('mediaOriginalName', uploaded.originalName);
		} catch (e) {
			isSubmitting = false;
			progress = {};
			toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi du contrat");
			cancel();
			return;
		}

		// 2. Le formulaire part avec la clé du contrat (pas le fichier)
		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Adoption créée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				fieldErrors = firstMessages(result.data?.errors);
				toast.error((result.data?.error as string) ?? "Erreur lors de la création de l'adoption");
				progress = {};
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};

	const handleCancelClick = () => {
		onCancel?.();
		open = false;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content size="lg" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Valider l'adoption</Dialog.Title>
			<Dialog.Description>
				Vérifiez les coordonnées de l'adoptant, puis joignez le contrat signé. L'adoption commencera
				par une période d'essai de 6 mois.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createAdoption" use:enhance={handleEnhance} class="space-y-6">
			<input type="hidden" name="catId" value={catId} />
			<input type="hidden" name="formId" value={formId} />

			<!-- 📋 Identité & contact -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SectionCard
					icon={HOST_SECTION_CONFIG.profile.icon}
					title={HOST_SECTION_CONFIG.profile.label}
					color={HOST_SECTION_CONFIG.profile.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<InputField
							id="adoption-firstName"
							name="firstName"
							label="Prénom"
							bind:value={firstName}
							placeholder="Jean"
							error={getFieldError(fieldErrors, 'firstName')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="adoption-lastName"
							name="lastName"
							label="Nom"
							bind:value={lastName}
							placeholder="Dupont"
							error={getFieldError(fieldErrors, 'lastName')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<DatePicker
							name="birthDate"
							value={birthDate}
							onSelect={(date) => (birthDate = date)}
							label="Date de naissance"
							error={getFieldError(fieldErrors, 'birthDate')}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={HOST_SECTION_CONFIG.contact.icon}
					title={HOST_SECTION_CONFIG.contact.label}
					color={HOST_SECTION_CONFIG.contact.color}
				>
					<div class="grid gap-4">
						<InputField
							id="adoption-email"
							name="email"
							label="Email"
							type="email"
							bind:value={email}
							placeholder="jean@example.com"
							error={getFieldError(fieldErrors, 'email')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="adoption-phone"
							name="phone"
							label="Téléphone"
							bind:value={phone}
							placeholder="06 12 34 56 78"
							error={getFieldError(fieldErrors, 'phone')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={HOST_SECTION_CONFIG.address.icon}
					title={HOST_SECTION_CONFIG.address.label}
					color={HOST_SECTION_CONFIG.address.color}
					class="sm:col-span-2"
				>
					<div class="space-y-4">
						<InputField
							id="adoption-address"
							name="address"
							label="Rue"
							bind:value={address}
							placeholder="123 rue de la Paix"
							error={getFieldError(fieldErrors, 'address')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
						<div class="grid grid-cols-3 gap-4">
							<InputField
								id="adoption-city"
								name="city"
								label="Ville"
								bind:value={city}
								placeholder="Montpellier"
								error={getFieldError(fieldErrors, 'city')}
								required
								size="sm"
								disabled={isSubmitting}
							/>

							<InputField
								id="adoption-postalCode"
								name="postalCode"
								label="Code postal"
								bind:value={postalCode}
								placeholder="34000"
								error={getFieldError(fieldErrors, 'postalCode')}
								required
								size="sm"
								disabled={isSubmitting}
							/>

							{#if city.toLowerCase() === 'montpellier'}
								<SelectField
									id="adoption-district"
									name="district"
									label="Quartier"
									bind:value={selectedDistrict}
									placeholder="Quartier"
									options={districtOptions}
									size="sm"
									disabled={isSubmitting}
								/>
							{/if}
						</div>
					</div>
				</SectionCard>
			</section>

			<!-- 📄 Le contrat signé (obligatoire) -->
			<MediaUpload
				id="adoption-contract"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				label="Contrat d'adoption signé (PDF) *"
				disabled={isSubmitting}
				error={getFieldError(fieldErrors, 'media') ?? getFieldError(fieldErrors, 'mediaStorageKey')}
			/>

			<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
		</form>
	</Dialog.Content>
</Dialog.Root>
