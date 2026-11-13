<script lang="ts">
	import { firstMessages } from '#lib/utils/zodErrors.ts';
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { VolunteerEditData } from '#lib/types/volunteer.ts';
	import {
		VOLUNTEER_STATUS_OPTIONS,
		VOLUNTEER_ROLE_OPTIONS,
		VOLUNTEER_SECTION_CONFIG
	} from '#lib/constants/volunteer.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import DateRangePicker from '../fields/DateRangePicker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';

	let {
		editData = $bindable<VolunteerEditData>(),
		volunteerId,
		profileId,
		/** Déjà blacklisté : le bouton « Blacklister » est masqué */
		isBlacklisted = false,
		onSuccess,
		onCancel
	} = $props();

	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Erreurs renvoyées par le serveur (format Zod : { champ: ['message'] })
	let serverErrors = $state<Record<string, string[] | undefined>>({});

	const showBreakDateRange = $derived(editData.actif === 'BREAK');

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;
		serverErrors = {};
		formData.append('volunteerId', volunteerId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Bénévole mis à jour avec succès');
				await update();
				onSuccess?.();
			} else if (result.type === 'failure') {
				serverErrors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) || 'Erreur lors de la mise à jour');
				await update({ reset: false });
			}
			isSaving = false;
		};
	};

	const handleCancelClick = () => onCancel?.();

	const handleDeleted = () => {
		isDeleting = false;
		onSuccess?.();
	};

	const handleBlacklisted = () => onSuccess?.();

	const handleBreakDateRangeSelect = (dates: { start: Date; end: Date }) => {
		editData.breakStartDate = dates.start;
		editData.breakEndDate = dates.end;
	};
</script>

<form method="POST" action="?/updateVolunteer" use:enhance={handleUpdateEnhance} class="space-y-6">
	<!-- EN-TÊTE -->
	<div class="flex items-center justify-between gap-2">
		<h2 class="min-w-0 truncate text-lg font-semibold">
			Modifier : {editData.firstName || 'Sans prénom'}
			{editData.lastName || 'Sans nom'}
		</h2>
		<Button
			variant="ghost"
			size="icon"
			class="shrink-0"
			onclick={handleCancelClick}
			aria-label="Annuler la modification"
		>
			<X class="size-5" />
		</Button>
	</div>

	<!-- STATUT + PROFIL : empilés, ou côte à côte si le panneau est large -->
	<section class="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.statuts.icon}
			title={VOLUNTEER_SECTION_CONFIG.statuts.label}
			color={VOLUNTEER_SECTION_CONFIG.statuts.color}
		>
			<div class="grid grid-cols-1 gap-4 @md:grid-cols-2">
				<SelectField
					id="actif"
					name="actif"
					label="Statut d'activité"
					bind:value={editData.actif}
					options={VOLUNTEER_STATUS_OPTIONS}
					class="w-full"
					size="sm"
					required
				/>
				<SelectField
					id="role"
					name="role"
					label="Rôle"
					bind:value={editData.role}
					options={VOLUNTEER_ROLE_OPTIONS}
					class="w-full"
					size="sm"
					required
				/>

				{#if showBreakDateRange}
					<div class="@md:col-span-2">
						<DateRangePicker
							startValue={editData.breakStart}
							endValue={editData.breakEnd}
							startName="breakStart"
							endName="breakEnd"
							label="Période de pause"
							onSelect={handleBreakDateRangeSelect}
						/>
					</div>
				{/if}
			</div>
		</SectionCard>

		<PersonProfileFields
			bind:firstName={editData.firstName}
			bind:lastName={editData.lastName}
			bind:birthDate={editData.birthDate}
			errors={firstMessages(serverErrors)}
		/>
	</section>

	<Separator />

	<!-- ADRESSE + CONTACT -->
	<section class="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
		<PersonAddressFields
			bind:address={editData.address}
			bind:city={editData.city}
			bind:postalCode={editData.postalCode}
			bind:district={editData.district}
			errors={firstMessages(serverErrors)}
		/>

		<PersonContactFields
			bind:phone={editData.phone}
			bind:email={editData.email}
			errors={firstMessages(serverErrors)}
		/>
	</section>

	<Separator />

	<!-- ACTIONS -->
	<!-- Étroit : Enregistrer en haut, actions dangereuses en dessous | Large : sur une ligne -->
	<section class="flex flex-col-reverse gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
		<div class="flex flex-wrap gap-2">
			{#if !isBlacklisted}
				<!-- Même module que la page Blacklist : le compte est retrouvé par son email -->
				<BlacklistAddDialog
					email={editData.email}
					name={`${editData.firstName} ${editData.lastName}`}
					trigger="button"
					onSuccess={handleBlacklisted}
				/>
			{/if}
			<DeleteButton
				entityId={profileId}
				firstName={editData.firstName}
				lastName={editData.lastName}
				{isDeleting}
				{isSaving}
				showDelete={true}
				deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce bénévole ?"
				onSuccess={handleDeleted}
			/>
		</div>
		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
