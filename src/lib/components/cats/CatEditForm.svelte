<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { CatEditData } from '$lib/types/cat';
	import {
		CAT_SEX,
		CAT_STATUS,
		CAT_HAIR_LENGTH,
		CAT_VACCINATE,
		CAT_SECTION_CONFIG
	} from '$lib/constants/cat';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SwitchField from '../fields/SwitchField.svelte';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';

	let {
		editData = $bindable<CatEditData>(),
		catId = '',
		isAdmin = false,
		onSuccess,
		onCancel
	} = $props();

	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Erreurs renvoyées par le serveur (format Zod : { champ: ['message'] })
	let serverErrors = $state<Record<string, string[] | undefined>>({});

	function fieldError(field: string): string {
		return serverErrors[field]?.[0] ?? '';
	}

	const handleUpdateEnhance: SubmitFunction = () => {
		isSaving = true;
		serverErrors = {};

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Le chat a été mis à jour avec succès');
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
</script>

<form method="POST" action="?/updateCat" use:enhance={handleUpdateEnhance} class="space-y-6">
	<input type="hidden" name="catId" value={catId} />

	<div class="flex items-center justify-between gap-2">
		<h2 class="min-w-0 truncate text-lg font-semibold">
			Éditer le chat : {editData.name || 'Sans nom'}
		</h2>
		<Button
			variant="ghost"
			size="icon"
			class="shrink-0"
			onclick={handleCancelClick}
			aria-label="Annuler la modification"
		>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- ============================================================ -->
	<!-- 3. PROFIL DU CHAT (= section 3 du panneau)                     -->
	<!-- ============================================================ -->
	<!-- PC : Profil 1 + Compatibilité 1 + Santé 2 | Tablette : 2 colonnes | Mobile : 1 -->
	<!-- PC : colonne étroite (Statut, Compatibilité) + colonne large (Profil, Santé) -->
	<!-- Mobile et tablette : blocs empilés -->
	<section class="grid grid-cols-1 gap-4 lg:grid-cols-4">
		<!-- ===== STATUT : situation dans l'association ===== -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.statuts.icon}
			title={CAT_SECTION_CONFIG.statuts.label}
			color={CAT_SECTION_CONFIG.statuts.color}
			class="lg:col-span-1"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
				<SelectField
					id="status"
					name="status"
					label="Statut"
					bind:value={editData.status}
					options={CAT_STATUS}
					size="sm"
					required
				/>
				<SwitchField
					id="isVisible"
					name="isVisible"
					label="Visibilité sur le site"
					checked={editData.isVisible ?? false}
					checkedLabel="✓ Visible"
					uncheckedLabel="✗ Masqué"
					onChange={(value) => (editData.isVisible = value)}
				/>
			</div>
		</SectionCard>

		<!-- ===== PROFIL : qui est le chat ===== -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.profile.icon}
			title={CAT_SECTION_CONFIG.profile.label}
			color={CAT_SECTION_CONFIG.profile.color}
			class="lg:col-span-3"
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<InputField
					id="name"
					name="name"
					label="Nom"
					bind:value={editData.name}
					placeholder="Minou"
					error={fieldError('name')}
					size="sm"
				/>
				<InputField
					id="catNumber"
					name="catNumber"
					label="Numéro de suivi"
					bind:value={editData.catNumber}
					placeholder="C2509026"
					error={fieldError('catNumber')}
					required
					size="sm"
				/>
				<SelectField
					id="sex"
					name="sex"
					label="Sexe"
					bind:value={editData.sex}
					options={CAT_SEX}
					size="sm"
					required
				/>
				<DatePicker
					name="birthDate"
					value={editData.birthDate}
					onSelect={(date) => (editData.birthDate = date)}
					label="Date de naissance"
					error={fieldError('birthDate')}
				/>
				<InputField
					id="color"
					name="color"
					label="Couleur / Robe"
					bind:value={editData.color}
					placeholder="Roux tigré"
					size="sm"
				/>
				<SelectField
					id="hairLength"
					name="hairLength"
					label="Longueur de poil"
					bind:value={editData.hairLength}
					options={CAT_HAIR_LENGTH}
					size="sm"
				/>
				<InputField
					id="origin"
					name="origin"
					label="Origine"
					bind:value={editData.origin}
					placeholder="Trouvé rue..."
					size="sm"
				/>
			</div>
		</SectionCard>

		<!-- ===== COMPATIBILITÉ ===== -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.compatibility.icon}
			title={CAT_SECTION_CONFIG.compatibility.label}
			color={CAT_SECTION_CONFIG.compatibility.color}
			class="lg:col-span-1"
		>
			<!-- 2 colonnes quand le bloc est large (mobile, tablette), 1 quand il est étroit (PC) -->
			<div class="grid grid-cols-2 gap-2 lg:grid-cols-1">
				<CheckboxField
					id="isOkDog"
					name="isOkDog"
					label="OK chiens"
					checked={editData.isOkDog ?? false}
					onChange={(value) => (editData.isOkDog = value)}
				/>
				<CheckboxField
					id="isOkCat"
					name="isOkCat"
					label="OK chats"
					checked={editData.isOkCat ?? false}
					onChange={(value) => (editData.isOkCat = value)}
				/>
				<CheckboxField
					id="isOkChild"
					name="isOkChild"
					label="OK enfants"
					checked={editData.isOkChild ?? false}
					onChange={(value) => (editData.isOkChild = value)}
				/>
				<CheckboxField
					id="isOutside"
					name="isOutside"
					label="Accès extérieur"
					checked={editData.isOutside ?? false}
					onChange={(value) => (editData.isOutside = value)}
				/>
			</div>
		</SectionCard>

		<!-- ===== SANTÉ ===== -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.health.icon}
			title={CAT_SECTION_CONFIG.health.label}
			color={CAT_SECTION_CONFIG.health.color}
			class="lg:col-span-3"
		>
			<div class="grid gap-4">
				<div class="sm:w-1/2 lg:w-1/3">
					<SelectField
						id="vaccinate"
						name="vaccinate"
						label="Vaccination"
						bind:value={editData.vaccinate}
						options={CAT_VACCINATE}
						size="sm"
					/>
				</div>

				<div class="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
					<CheckboxField
						id="isSterilize"
						name="isSterilize"
						label="À stériliser"
						checked={editData.isSterilize}
						onChange={(value) => (editData.isSterilize = value)}
					/>
					<CheckboxField
						id="isAlreadySterilized"
						name="isAlreadySterilized"
						label="Déjà stérilisé"
						checked={editData.isAlreadySterilized}
						onChange={(value) => (editData.isAlreadySterilized = value)}
					/>
					<CheckboxField
						id="isFivTest"
						name="isFivTest"
						label="Test FIV/FeLV fait"
						checked={editData.isFivTest}
						onChange={(value) => (editData.isFivTest = value)}
					/>
					<CheckboxField
						id="isDeworming"
						name="isDeworming"
						label="Vermifugé"
						checked={editData.isDeworming}
						onChange={(value) => (editData.isDeworming = value)}
					/>
					<CheckboxField
						id="isIdentify"
						name="isIdentify"
						label="Identifié"
						checked={editData.isIdentify}
						onChange={(value) => (editData.isIdentify = value)}
					/>
				</div>

				{#if editData.isIdentify}
					<div class="sm:w-1/2 lg:w-1/3">
						<InputField
							id="chipId"
							name="chipId"
							label="Numéro de puce"
							bind:value={editData.chipId}
							placeholder="250269..."
							error={fieldError('chipId')}
							size="sm"
						/>
					</div>
				{/if}
			</div>
		</SectionCard>
	</section>

	<SectionCard
		icon={CAT_SECTION_CONFIG.description.icon}
		title={CAT_SECTION_CONFIG.description.label}
		color={CAT_SECTION_CONFIG.description.color}
	>
		<TextareaField
			id="description"
			name="description"
			bind:value={editData.description}
			placeholder="Décrivez le caractère du chat..."
		/>
	</SectionCard>

	<Separator />

	<!-- ============================================================ -->
	<!-- ACTIONS                                                       -->
	<!-- ============================================================ -->
	<!-- PC : une ligne | Mobile : Enregistrer au-dessus de Supprimer -->
	<section class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			{#if isAdmin}
				<DeleteButton
					entityId={catId}
					firstName={editData.name ?? 'Chat sans nom'}
					lastName={editData.catNumber}
					{isDeleting}
					{isSaving}
					showDelete={true}
					actionName="?/deleteCat"
					fieldName="catId"
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce chat ? Toutes ses données (maladies, placements, médias...) seront perdues."
					onSuccess={handleDeleted}
				/>
			{/if}
		</div>

		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
