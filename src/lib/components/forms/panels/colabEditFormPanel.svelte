<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import SaveCancelButtons from '$lib/components/buttons/SaveCancelButtons.svelte';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';
	import BlacklistButton from '$lib/components/buttons/BlacklistButton.svelte';
	import { COLAB_SECTION_CONFIG } from '$lib/constants/colab';
	import type { FormEditData, CollabFormData } from '$lib/types/form';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import { FORM_STATUS_OPTIONS } from '$lib/constants/forms';

	let {
		editData = $bindable<FormEditData<CollabFormData> | null>(),
		formId = '',
		onSuccess,
		onCancel
	} = $props();

	// États
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isBlacklisting = $state(false);

	let formErrors = $state({
		firstName: '',
		lastName: '',
		companyName: '',
		phone: '',
		email: '',
		presentation: '',
		partnershipProposal: ''
	});

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		formData.append('formId', formId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Formulaire partenaire mis à jour avec succès ! ✅');
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				console.error('Erreur mise à jour:', result.data);
				toast.error(result.data?.error || 'Erreur lors de la mise à jour');
			}

			await update();
			isSaving = false;
		};
	};

	const handleCancelClick = () => {
		if (onCancel) {
			onCancel();
		}
	};

	const handleDeleted = () => {
		isDeleting = false;
		if (onSuccess) {
			onSuccess();
		}
	};

	const handleBlacklisted = () => {
		isBlacklisting = false;
		if (onSuccess) {
			onSuccess();
		}
	};
</script>

{#if editData && editData.data}
	<form method="POST" action="?/updateForm" use:enhance={handleUpdateEnhance} class="space-y-6">
		<!-- 🔑 HIDDEN INPUTS -->
		<input type="hidden" name="formId" value={formId} />
		<input type="hidden" name="status" value={editData.status} />

		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">
				Éditer: {editData.data.firstName || 'Sans nom'}
				{editData.data.lastName || 'Sans nom'}
			</h2>

			<Button variant="ghost" size="icon" onclick={handleCancelClick}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<!-- 👤 SECTION 1: Identité & Contact -->
		<section class="grid grid-cols-8 gap-4">
			<SectionCard
				icon={COLAB_SECTION_CONFIG.status.icon}
				title={COLAB_SECTION_CONFIG.status.label}
				color={COLAB_SECTION_CONFIG.status.color}
				class="col-span-2"
			>
				<div class="space-y-4">
					<SelectField
						id="status"
						name="status"
						label="Status"
						bind:value={editData.status}
						options={FORM_STATUS_OPTIONS}
						size="sm"
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={COLAB_SECTION_CONFIG.profile.icon}
				title={COLAB_SECTION_CONFIG.profile.label}
				color={COLAB_SECTION_CONFIG.profile.color}
				class="col-span-3"
			>
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<InputField
							id="firstName"
							name="firstName"
							label="Prénom"
							bind:value={editData.data.firstName}
							placeholder="Jean"
							error={formErrors.firstName}
							required
							size="sm"
						/>

						<InputField
							id="lastName"
							name="lastName"
							label="Nom"
							bind:value={editData.data.lastName}
							placeholder="Dupont"
							error={formErrors.lastName}
							required
							size="sm"
						/>
					</div>

					<InputField
						id="companyName"
						name="companyName"
						label="Entreprise"
						bind:value={editData.data.companyName}
						placeholder="Nom de l'entreprise ou de l'activité"
						error={formErrors.companyName}
						size="sm"
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={COLAB_SECTION_CONFIG.contact.icon}
				title={COLAB_SECTION_CONFIG.contact.label}
				color={COLAB_SECTION_CONFIG.contact.color}
				class="col-span-3"
			>
				<div class="grid gap-2">
					<InputField
						id="phone"
						name="phone"
						label="Téléphone"
						bind:value={editData.data.phone}
						placeholder="06 12 34 56 78"
						error={formErrors.phone}
						required
						size="sm"
					/>

					<InputField
						id="email"
						name="email"
						label="Email"
						type="email"
						bind:value={editData.email}
						placeholder="jean@example.com"
						error={formErrors.email}
						required
						size="sm"
					/>
				</div>
			</SectionCard>
		</section>

		<Separator />

		<!-- 🤝 SECTION 2: Partenariat -->
		<SectionCard
			icon={COLAB_SECTION_CONFIG.presentation.icon}
			title={COLAB_SECTION_CONFIG.presentation.label}
			color={COLAB_SECTION_CONFIG.presentation.color}
		>
			<TextareaField
				id="presentation"
				name="presentation"
				label="Présentation de l'activité"
				bind:value={editData.data.presentation}
				placeholder="Présentez votre activité ou votre projet..."
				error={formErrors.presentation}
				required
			/>
		</SectionCard>

		<SectionCard
			icon={COLAB_SECTION_CONFIG.partnership.icon}
			title={COLAB_SECTION_CONFIG.partnership.label}
			color={COLAB_SECTION_CONFIG.partnership.color}
		>
			<TextareaField
				id="partnershipProposal"
				name="partnershipProposal"
				label="Proposition de partenariat"
				bind:value={editData.data.partnershipProposal}
				placeholder="Décrivez votre proposition de partenariat..."
				error={formErrors.partnershipProposal}
				required
			/>
		</SectionCard>

		<Separator />

		<!-- 📝 SECTION 3: Notes -->
		<SectionCard
			icon={COLAB_SECTION_CONFIG.notes.icon}
			title={COLAB_SECTION_CONFIG.notes.label}
			color={COLAB_SECTION_CONFIG.notes.color}
		>
			<TextareaField
				id="notes"
				name="notes"
				bind:value={editData.notes}
				placeholder="Remarques, points importants..."
			/>
		</SectionCard>

		<Separator />

		<!-- ✅ SECTION 4: Actions -->
		<section class="flex justify-between">
			<div class="flex gap-4">
				<BlacklistButton
					profileId=""
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					email=""
					{isBlacklisting}
					{isSaving}
					{isDeleting}
					showBlacklist={false}
					actionName="?/blacklistColabForm"
					buttonLabel="Ajouter à la liste noire"
					onSuccess={handleBlacklisted}
				/>

				<DeleteButton
					entityId={formId}
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					{isDeleting}
					{isSaving}
					showDelete={true}
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce formulaire ?"
					onSuccess={handleDeleted}
				/>
			</div>

			<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
		</section>
	</form>
{/if}
