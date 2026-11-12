<script lang="ts">
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import { createVolunteerSchema } from '#lib/schemas/volunteer.ts';
	import { flattenErrors, firstMessages } from '#lib/utils/zodErrors.ts';
	import type { FlattenedErrors } from '#lib/utils/zodErrors.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
	import SectionCard from '../cards/SectionCard.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { VOLUNTEER_SECTION_CONFIG, VOLUNTEER_ROLE_OPTIONS } from '#lib/constants/volunteer.ts';
	import type { PersonInitialData } from '#lib/person/personForm.ts';
	import {
		emptyNewVolunteerForm,
		newVolunteerFormFrom,
		toCreateVolunteerInput,
		type NewVolunteerForm
	} from './newVolunteerForm.ts';

	interface Props {
		open?: boolean;
		onCancel?: () => void;
		/** Une demande bénévole : le formulaire est pré-rempli avec ses réponses */
		initialData?: PersonInitialData | null;
		/** L'identifiant de cette demande, envoyé avec la création */
		formId?: string;
	}

	let { open = $bindable(false), onCancel, initialData = null, formId = '' }: Props = $props();

	// Tous les champs dans UN objet (voir newVolunteerForm.ts)
	let form = $state<NewVolunteerForm>(emptyNewVolunteerForm());

	// Pré-remplissage avec la demande, à chaque ouverture
	$effect(() => {
		if (open && initialData) form = newVolunteerFormFrom(initialData);
	});

	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const result = createVolunteerSchema.safeParse(toCreateVolunteerInput(form));

		if (!result.success) {
			fieldErrors = flattenErrors(result.error);
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		fieldErrors = {};
		return true;
	}

	function resetForm() {
		form = emptyNewVolunteerForm();
		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}
		formData.append('formId', formId);
		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Bénévole créé avec succès');
				resetForm();
				open = false;
				await update();
			} else if (result.type === 'failure') {
				// ✅ Erreurs serveur (double validation)
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
		if (onCancel) {
			onCancel();
		}
		resetForm();
	};
</script>

<!-- Template -->
<Dialog.Root bind:open>
	<!-- Hauteur limitée à l'écran visible : le contenu défile, le bouton reste en bas -->
	<Dialog.Content size="md" class="flex max-h-[90dvh] flex-col gap-0 p-0">
		<Dialog.Header class="p-4 sm:p-6">
			<Dialog.Title>Créer un nouveau bénévole</Dialog.Title>
			<Dialog.Description>
				Un email avec un mot de passe temporaire lui sera envoyé.
			</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<form
			method="POST"
			action="?/createVolunteer"
			use:enhance={handleEnhance}
			class="flex min-h-0 flex-1 flex-col"
		>
			<!-- Zone qui défile -->
			<div class="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
				<!-- PROFIL -->
				<PersonProfileFields
					bind:firstName={form.firstName}
					bind:lastName={form.lastName}
					bind:birthDate={form.birthDate}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>

				<!-- CONTACT -->
				<PersonContactFields
					bind:phone={form.phone}
					bind:email={form.email}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>

				<!-- ADRESSE -->
				<PersonAddressFields
					bind:address={form.address}
					bind:city={form.city}
					bind:postalCode={form.postalCode}
					bind:district={form.district}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>

				<!-- RÔLE -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.statuts.icon}
					title={VOLUNTEER_SECTION_CONFIG.statuts.label}
					color={VOLUNTEER_SECTION_CONFIG.statuts.color}
				>
					<SelectField
						id="role"
						name="role"
						label="Rôle"
						bind:value={form.role}
						options={VOLUNTEER_ROLE_OPTIONS}
						class="w-full sm:w-64"
						size="sm"
						disabled={isSubmitting}
					/>
				</SectionCard>
			</div>

			<Separator />

			<!-- Pied fixe : toujours visible, même en faisant défiler le formulaire -->
			<div class="bg-muted/40 p-4 sm:px-6">
				<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
