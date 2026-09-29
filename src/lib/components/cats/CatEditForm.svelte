<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
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
	import SicknessEditForm from '../sickness/SicknessEditForm.svelte';
	import { sicknessStatus } from '$lib/constants/sickness';
	import type { SicknessStatus, PlacementStatus } from '@prisma/client';
	import { formatDateNum } from '$lib/utils/date';
	import PlacementCreateForm from '../placements/PlacementCreateForm.svelte';
	import { PLACEMENT_STATUS } from '$lib/constants/placement';
	import type { HostBasic } from '$lib/types/host';
	import type { CatEditFormProps } from '$lib/types/cat';
	import PlacementEditForm from '../placements/PlacementEditForm.svelte';

	let {
		editData = $bindable<CatEditData>(),
		catId = '',
		hosts = [] as HostBasic[],
		onSuccess,
		onCancel
	} = $props();

	// États
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let formErrors = $state({
		name: '',
		sex: '',
		catNumber: ''
	});

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		formData.append('catId', catId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Le chat a été mis à jour avec succès ! ✅');
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				console.error('Erreur mise à jour:', result.data);
				toast.error(result.data?.message || 'Erreur lors de la mise à jour');
			}

			await update();
			isSaving = false;
		};
	};

	const handleCancelClick = () => {
		console.log('❌ Édition annulée');
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
</script>

<form method="POST" action="?/updateCat" use:enhance={handleUpdateEnhance} class="space-y-6">
	<!-- 🔑 HIDDEN INPUTS -->
	<input type="hidden" name="catId" value={catId} />

	<div class="flex justify-end">
		<Button variant="ghost" size="icon" onclick={handleCancelClick}>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- 📋 SECTION 1: Statuts + Profil -->
	<section class="grid grid-cols-4 gap-4">
		<!-- Statuts -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.statuts.icon}
			title={CAT_SECTION_CONFIG.statuts.label}
			color={CAT_SECTION_CONFIG.statuts.color}
			class="col-span-1"
		>
			<div class="grid gap-4">
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
					label="Visibilité"
					checked={editData.isVisible ?? false}
					checkedLabel="✓ Visible"
					uncheckedLabel="✗ Masqué"
					onChange={(value) => (editData.isVisible = value)}
				/>
			</div>
		</SectionCard>

		<SectionCard
			icon={CAT_SECTION_CONFIG.relations.icon}
			title={CAT_SECTION_CONFIG.relations.label}
			color={CAT_SECTION_CONFIG.relations.color}
			class="col-span-3"
		>
			<div class="mb-4 flex justify-end">
				<PlacementCreateForm {catId} cat={editData} {hosts} {onSuccess} />
			</div>

			<div class="grid grid-cols-3 gap-4">
				<!-- Volunteer -->
				<div class="space-y-2">
					<span class="text-muted-foreground block text-xs font-semibold">FA proposé/transfer</span>
					{#each (editData.placements ?? []).filter((p) => p.type === 'PROPOSAL') as placement (placement.id)}
						<div class="flex justify-between rounded border border-sky-500 bg-sky-100 p-3">
							<div class="flex flex-col">
								<span class="text-muted-foreground block text-xs">
									{PLACEMENT_STATUS[placement.status as PlacementStatus]}
								</span>
								<span class="font-medium">
									{placement.host?.profil?.firstName}
									{placement.host?.profil?.lastName}
								</span>
							</div>

							<div class="mt-2 flex justify-end">
								<PlacementEditForm {catId} cat={editData} {placement} {hosts} {onSuccess} />
							</div>
						</div>
					{/each}
				</div>
				<!-- Colonne LONG -->
				<div class="space-y-2">
					<span class="text-muted-foreground block text-xs font-semibold">FA Classique</span>
					{#each (editData.placements ?? []).filter((p) => p.type === 'LONG') as placement (placement.id)}
						<div class="flex justify-between rounded border border-sky-500 bg-sky-100 p-3">
							<div class="flex flex-col">
								<span class="text-muted-foreground block text-xs">
									{PLACEMENT_STATUS[placement.status as PlacementStatus]}
								</span>
								<span class="font-medium">
									{placement.host?.profil?.firstName}
									{placement.host?.profil?.lastName}
								</span>

								<div class="flex gap-2 pt-2">
									<div>
										<span class="text-muted-foreground block text-xs">Début</span>
										<span class="text-xs">{formatDateNum(placement.startDate)}</span>
									</div>
									{#if placement.endDate}
										<div>
											<span class="text-muted-foreground block text-xs">Fin</span>
											<span class="text-xs">{formatDateNum(placement.endDate)}</span>
										</div>
									{/if}
								</div>
							</div>

							<div class="mt-2 flex justify-end">
								<PlacementEditForm {catId} cat={editData} {placement} {hosts} {onSuccess} />
							</div>
						</div>
					{/each}
				</div>

				<!-- Colonne SHORT -->
				<div class="space-y-2">
					<span class="text-muted-foreground block text-xs font-semibold">FA Relais</span>
					{#each (editData.placements ?? []).filter((p) => p.type === 'SHORT') as placement (placement.id)}
						<div class="flex justify-between rounded border border-amber-500 bg-amber-100 p-3">
							<div class="flex flex-col">
								<span class="text-muted-foreground block text-xs">
									{PLACEMENT_STATUS[placement.status as PlacementStatus]}
								</span>
								<span class="font-medium">
									{placement.host?.profil?.firstName}
									{placement.host?.profil?.lastName}
								</span>

								<div class="flex gap-2 pt-2">
									<div>
										<span class="text-muted-foreground block text-xs">Début</span>
										<span class="text-xs">{formatDateNum(placement.startDate)}</span>
									</div>
									{#if placement.endDate}
										<div>
											<span class="text-muted-foreground block text-xs">Fin</span>
											<span class="text-xs">{formatDateNum(placement.endDate)}</span>
										</div>
									{/if}
								</div>
							</div>

							<div class="mt-2 flex">
								<PlacementEditForm {catId} cat={editData} {placement} {hosts} {onSuccess} />
							</div>
						</div>
					{/each}
				</div>
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- 🐾 SECTION 2: Santé + Compatibilité -->
	<section class="grid grid-cols-5 gap-4">
		<!-- Profil -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.profile.icon}
			title={CAT_SECTION_CONFIG.profile.label}
			color={CAT_SECTION_CONFIG.profile.color}
			class="col-span-2"
		>
			<div class="grid grid-cols-2 gap-4">
				<InputField
					id="catNumber"
					name="catNumber"
					label="Numéro"
					bind:value={editData.catNumber}
					placeholder="C2509026"
					error={formErrors.catNumber}
					required
					size="sm"
				/>

				<InputField
					id="name"
					name="name"
					label="Nom"
					bind:value={editData.name}
					placeholder="Minou"
					error={formErrors.name}
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
				/>

				<InputField
					id="color"
					name="color"
					label="Couleur/Robe"
					bind:value={editData.color}
					placeholder="Roux tigré"
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
		<!-- Compatibilité -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.compatibility.icon}
			title={CAT_SECTION_CONFIG.compatibility.label}
			color={CAT_SECTION_CONFIG.compatibility.color}
			class="col-span-1"
		>
			<div class="grid gap-2">
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
		<!-- Santé -->
		<SectionCard
			icon={CAT_SECTION_CONFIG.health.icon}
			title={CAT_SECTION_CONFIG.health.label}
			color={CAT_SECTION_CONFIG.health.color}
			class="col-span-2"
		>
			<div class="grid grid-cols-2 gap-4">
				<SelectField
					id="hairLength"
					name="hairLength"
					label="Longueur de poil"
					bind:value={editData.hairLength}
					options={CAT_HAIR_LENGTH}
					size="sm"
				/>

				<SelectField
					id="vaccinate"
					name="vaccinate"
					label="Vaccination"
					bind:value={editData.vaccinate}
					options={CAT_VACCINATE}
					size="sm"
				/>

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

				{#if editData.isIdentify}
					<InputField
						id="chipId"
						name="chipId"
						label="Numéro de puce"
						bind:value={editData.chipId}
						placeholder="250269..."
						size="sm"
					/>
				{/if}
			</div>
		</SectionCard>
	</section>

	<Separator />

	<section class="space-y-4">
		<SectionCard
			icon={CAT_SECTION_CONFIG.sicknesses.icon}
			title={CAT_SECTION_CONFIG.sicknesses.label}
			color={CAT_SECTION_CONFIG.sicknesses.color}
		>
			<div class="mb-4 flex justify-end">
				<SicknessEditForm {catId} {onSuccess} />
			</div>

			<div class="space-y-2">
				{#each editData.sicknesses ?? [] as sickness (sickness.id)}
					<div
						class="flex items-center justify-between rounded border border-lime-500 bg-lime-100 p-3"
					>
						<div class="col-span-1">
							<span class="text-muted-foreground block text-xs"
								>Maladie {sicknessStatus[sickness.status as SicknessStatus]}</span
							>
							<span class="font-medium">{sickness.name}</span>

							<div class="flex gap-2 pt-2">
								<div>
									<span class="text-muted-foreground block text-xs">Début</span>
									<span class="text-xs">{formatDateNum(sickness.startDate)}</span>
								</div>
								{#if sickness.endDate}
									<div>
										<span class="text-muted-foreground block text-xs">Fin</span>
										<span class="text-xs">{formatDateNum(sickness.endDate)}</span>
									</div>
								{/if}
							</div>
						</div>
						{#if sickness.description}
							<div class="col-span-2">
								<span class="text-muted-foreground block text-xs">Description</span>
								<p class="text-xs">{sickness.description}</p>
							</div>
						{/if}
						<div class="col-span-2">
							<span class="text-muted-foreground block text-xs">Traitement</span>
							<span class="text-xs">{sickness.treatment ?? '—'}</span>
						</div>
						<SicknessEditForm {catId} {sickness} {onSuccess} />
					</div>
				{/each}
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- 📝 SECTION 3: Description -->
	<section class="space-y-4">
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
	</section>

	<Separator />

	<!-- ✅ SECTION Actions -->
	<section class="flex justify-between">
		<div class="flex gap-4">
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
		</div>

		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
