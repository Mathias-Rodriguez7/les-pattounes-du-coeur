<script lang="ts">
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import HostAnimalsFields from '#lib/components/hosts/fields/HostAnimalsFields.svelte';
	import HostHomeFields from '#lib/components/hosts/fields/HostHomeFields.svelte';
	import HostCapacityFields from '#lib/components/hosts/fields/HostCapacityFields.svelte';
	import HostCatTypeFields from '#lib/components/hosts/fields/HostCatTypeFields.svelte';
	import HostDescriptionFields from '#lib/components/hosts/fields/HostDescriptionFields.svelte';
	import { createHostSchema } from '#lib/schemas/host.ts';
	import { getFieldError, flattenErrors, firstMessages } from '#lib/utils/zodErrors.ts';
	import type { FlattenedErrors } from '#lib/utils/zodErrors.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
	import SelectField from '../fields/SelectField.svelte';
	import SwitchField from '../fields/SwitchField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import { HOST_TYPE_OPTIONS, HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import {
		emptyNewHostForm,
		newHostFormFrom,
		toCreateHostInput,
		type NewHostForm,
		type NewHostInitialData
	} from './newHostForm.ts';

	interface Props {
		open?: boolean;
		onCancel?: () => void;
		/** Une demande FA : le formulaire est pré-rempli avec ses réponses */
		initialData?: NewHostInitialData | null;
		/** L'identifiant de cette demande, envoyé avec la création */
		formId?: string;
	}

	let { open = $bindable(false), onCancel, initialData = null, formId = '' }: Props = $props();

	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// Tous les champs dans UN objet (voir newHostForm.ts)
	let form = $state<NewHostForm>(emptyNewHostForm());

	// Pré-remplissage avec la demande FA, à chaque ouverture
	$effect(() => {
		if (open && initialData) form = newHostFormFrom(initialData);
	});

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const result = createHostSchema.safeParse(toCreateHostInput(form));

		if (!result.success) {
			// Un message par champ : la forme qu'attend getFieldError
			fieldErrors = flattenErrors(result.error);
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		fieldErrors = {};
		return true;
	}

	function resetForm() {
		form = emptyNewHostForm();
		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}

		// Booléens envoyés explicitement, indépendamment du rendu DOM
		formData.set('actif', form.actif);
		formData.set('isAvailable', String(form.isAvailable));
		formData.set('outside', String(form.outside));
		formData.set('car', String(form.car));
		formData.set('isStockFeed', String(form.isStockFeed));
		formData.set('hasAnimalsAtHome', String(form.hasAnimalsAtHome));
		formData.set('kittyAndKitten', String(form.kittyAndKitten));
		formData.set('formId', formId);

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('FA créé avec succès ✅');
				resetForm();
				open = false;
				await update();
			} else if (result.type === 'failure') {
				if (result.data?.errors) {
					// Le serveur renvoie { champ: ['message'] } : on garde le 1er message
					fieldErrors = firstMessages(result.data.errors);
					toast.error('Erreurs de validation du serveur');
				} else {
					toast.error('Erreur lors de la création');
				}
				await update();
			} else if (result.type === 'error') {
				toast.error('Erreur serveur');
				console.error('Erreur:', result.error);
			}

			isSubmitting = false;
		};
	};

	const handleCancelClick = () => {
		open = false;
		onCancel?.();
	};
</script>

<!-- Template -->
<Dialog.Root bind:open>
	<Dialog.Content size="xl" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer une nouvelle famille d'accueil</Dialog.Title>
			<Dialog.Description>
				Remplissez les champs obligatoires (*) pour ajouter une nouvelle famille d'accueil
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createHost" use:enhance={handleEnhance} class="space-y-6">
			<!-- SECTION 1 : PC 4 colonnes (comme avant) | Tablette 2 | Mobile 1 -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Statut -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.statuts.icon}
					title={HOST_SECTION_CONFIG.statuts.label}
					color={HOST_SECTION_CONFIG.statuts.color}
				>
					<div class="grid gap-4">
						<SelectField
							id="type"
							name="type"
							label="Type d'accueil"
							bind:value={form.type}
							options={HOST_TYPE_OPTIONS}
							size="sm"
							disabled={isSubmitting}
						/>

						<SwitchField
							id="isAvailable"
							name="isAvailable"
							label="Disponibilité"
							checked={form.isAvailable ?? false}
							checkedLabel="✓ Disponible"
							uncheckedLabel="✗ Indisponible"
							onChange={(value) => (form.isAvailable = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Profil -->
				<PersonProfileFields
					bind:firstName={form.firstName}
					bind:lastName={form.lastName}
					bind:birthDate={form.birthDate}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>

				<!-- Adresse -->
				<PersonAddressFields
					bind:address={form.address}
					bind:city={form.city}
					bind:postalCode={form.postalCode}
					bind:district={form.district}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>

				<!-- Contact -->
				<PersonContactFields
					bind:phone={form.phone}
					bind:email={form.email}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>
			</section>

			<Separator />

			<!-- SECTION 2 : PC 4 colonnes (comme avant) | Tablette 2 | Mobile 1 -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Zone d'accueil -->
				<HostHomeFields bind:data={form} errors={fieldErrors} disabled={isSubmitting} />

				<!-- Animaux -->
				<HostAnimalsFields bind:data={form} errors={fieldErrors} disabled={isSubmitting} />

				<!-- Capacités -->
				<HostCapacityFields bind:data={form} disabled={isSubmitting} />

				<!-- Chats -->
				<HostCatTypeFields bind:data={form} errors={fieldErrors} disabled={isSubmitting} />
			</div>

			<Separator />

			<!-- SECTION 3 : Descriptions (inchangé) -->
			<section class="space-y-4">
				<HostDescriptionFields bind:data={form} errors={fieldErrors} disabled={isSubmitting} />

				<SectionCard
					icon={HOST_SECTION_CONFIG.additionalInformation.icon}
					title={HOST_SECTION_CONFIG.additionalInformation.label}
					color={HOST_SECTION_CONFIG.additionalInformation.color}
				>
					<TextareaField
						id="additionalInformation"
						name="additionalInformation"
						label="Informations additionnelles"
						bind:value={form.additionalInformation}
						placeholder="Informations additionnelles..."
						error={getFieldError(fieldErrors, 'additionalInformation')}
						disabled={isSubmitting}
					/>
				</SectionCard>
			</section>

			<Separator />

			<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
		</form>
	</Dialog.Content>
</Dialog.Root>
