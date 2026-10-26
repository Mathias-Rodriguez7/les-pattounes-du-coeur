<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import type { FormEditData, AdoptionFormData } from '$lib/types/form';
	import {
		FORM_SECTION_CONFIG,
		statusColors,
		ageLabels,
		furLabels,
		ADOPTION_SECTION_CONFIG
	} from '$lib/constants/forms';
	import { formatAge, getAgeBadge } from '$lib/utils/age';
	import { formatDate } from '$lib/utils/date';
	import AdoptionEditFormPanel from './AdoptionEditFormPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Pencil } from '@lucide/svelte';
	import { getSexIcon } from '$lib/utils/catHelpers';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import AssignVolunteerDialog from '../AssignVolunteerDialog.svelte';
	import AdoptionCreateDialog from './AdoptionCreateDialog.svelte';
	import CatPicker from '$lib/components/cats/CatPicker.svelte';

	const { form, catData, volunteers = [], isAdmin = false, cats = [] } = $props();

	let isEditing = $state(false);
	let showCreateDialog = $state(false);
	let showCatPicker = $state(false);
	let selectedCatId = $state<string>('');

	// Type guard pour les données d'adoption
	const adoptionData = $derived(form.data as Record<string, any>);

	// catId résolu selon le type de formulaire
	const adoptionCatId = $derived(
		form?.type === 'ADOPTION_SPECIFIC' ? (catData?.id ?? '') : selectedCatId
	);

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);

	// Infos du volunteer responsable du chat (depuis CatVolunteer)
	const catVolunteerName = $derived(
		catData?.volunteers?.[0]?.volunteer
			? `${catData.volunteers[0].volunteer.profil.firstName} ${catData.volunteers[0].volunteer.profil.lastName}`
			: 'Non assigné'
	);

	let editData = $state<FormEditData<AdoptionFormData> | null>(null);

	const sexIcon = $derived(
		catData ? getSexIcon(catData.sex) : adoptionData ? getSexIcon(adoptionData.catSex) : null
	);

	const startEditing = () => {
		if (!form) return;

		const adoptionDataCopy = structuredClone(adoptionData as AdoptionFormData);

		// Convertir la date de string à Date
		if (typeof adoptionDataCopy.birthDate === 'string') {
			adoptionDataCopy.birthDate = new Date(adoptionDataCopy.birthDate);
		}

		editData = {
			status: form.status,
			email: form.email,
			data: adoptionDataCopy,
			notes: form.notes || ''
		};

		isEditing = true;
	};

	const handleSuccessfulSave = () => {
		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	function handleCatSelected(catId: string) {
		selectedCatId = catId;
		showCatPicker = false;
		showCreateDialog = true;
	}

	function handleCancelCreate() {
		showCreateDialog = false;
		selectedCatId = '';
	}
</script>

{#if form}
	<Card.Root>
		{#if isEditing}
			<Card.Content class="space-y-6 overflow-y-auto">
				<AdoptionEditFormPanel
					bind:editData
					formId={form.id}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{:else if showCatPicker}
			<Card.Content class="space-y-6">
				<CatPicker {cats} {form} onSelect={handleCatSelected} onCancel={handleCancelCreate} />
			</Card.Content>
		{:else}
			<Card.Header>
				<section class="flex justify-between gap-6">
					<div class="grid gap-2 text-base">
						<Card.Title class="text-2xl">
							{adoptionData.firstName}
							{adoptionData.lastName}
							<Badge class="bg-blue-100 text-sm text-blue-700">
								{formatAge(adoptionData.birthDate)}
							</Badge>
						</Card.Title>
						<Card.Description class="flex gap-2">
							<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
								{statusColors[form.status]?.label}
							</Badge>
							<Badge variant="outline" class="text-xs">
								{form.type === 'ADOPTION_SPECIFIC' ? 'Chat Spécifique' : 'Adoption Flexible'}
							</Badge>
						</Card.Description>
					</div>

					<div class="text-muted-foreground flex flex-col justify-center gap-2 text-right text-sm">
						<p>{formatDate(form.createdAt)}</p>
						{#if form.assignedTo}
							<p class="text-muted-foreground">
								Assigné à: <span class="font-medium">{assignedName || 'N/A'}</span>
							</p>
						{/if}
						{#if form.type === 'ADOPTION_FLEXIBLE' && isAdmin}
							<AssignVolunteerDialog
								formId={form.id}
								currentVolunteerId={form.assignedToId}
								{volunteers}
							/>
						{/if}
					</div>

					<div class="grid justify-items-end gap-2">
						<Button variant="ghost" size="icon" onclick={startEditing} class="shrink-0">
							<Pencil class="h-5 w-5" />
						</Button>

						{#if form.type === 'ADOPTION_SPECIFIC'}
							<Button
								type="button"
								disabled={!adoptionCatId}
								onclick={() => (showCreateDialog = true)}
							>
								Créer l'adoption
							</Button>
						{:else if form.type === 'ADOPTION_FLEXIBLE'}
							<Button type="button" onclick={() => (showCatPicker = true)}>Choisir un chat</Button>
						{/if}
					</div>
				</section>
			</Card.Header>

			<Card.Content class="flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-10 gap-4">
					<!-- SECTION CANDIDAT -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.profile.icon}
						title={FORM_SECTION_CONFIG.profile.label}
						color={FORM_SECTION_CONFIG.profile.color}
						class="col-span-3"
					>
						<div class="ml-6 space-y-3">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-muted-foreground">Prénom</p>
									<p class="font-medium">{adoptionData.firstName || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Nom</p>
									<p class="font-medium">{adoptionData.lastName || '—'}</p>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground">Date de naissance</p>
								<div class="flex items-center gap-2">
									<p>{formatDate(adoptionData.birthDate)}</p>
									<Badge class="bg-blue-100 text-sm text-blue-700">
										{formatAge(adoptionData.birthDate)}
									</Badge>
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- SECTION CONTACT -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.contact.icon}
						title={FORM_SECTION_CONFIG.contact.label}
						color={FORM_SECTION_CONFIG.contact.color}
						class="col-span-3"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Tel</p>
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`tel:${adoptionData.phone}`}
										class="hover:text-primary text-xs text-blue-500 underline"
									>
										{adoptionData.phone}
									</a>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground font-medium">Mail</p>
								<div class="flex items-center gap-2">
									<Icon name="mail" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`mailto:${form.email}`}
										class="hover:text-primary text-xs text-blue-500 underline"
									>
										{form.email}
									</a>
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- SECTION ADRESSE -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.address.icon}
						title={FORM_SECTION_CONFIG.address.label}
						color={FORM_SECTION_CONFIG.address.color}
						class="col-span-4"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Rue</p>
								<p class="font-medium text-gray-900">{adoptionData.address || '—'}</p>
							</div>

							<div class="flex gap-4">
								<div>
									<p class="text-muted-foreground font-medium">Ville</p>
									<p class="font-medium text-gray-900">{adoptionData.city || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">CP</p>
									<p class="font-medium text-gray-900">{adoptionData.postalCode || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">Quartier</p>
									<p class="font-medium">{adoptionData.district}</p>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<section class="grid grid-cols-3 gap-4">
					{#if form.type === 'ADOPTION_SPECIFIC' && catData}
						<!-- SECTION CHAT SPÉCIFIQUE -->
						<SectionCard
							icon={FORM_SECTION_CONFIG.catSpecific.icon}
							title={FORM_SECTION_CONFIG.catSpecific.label}
							color={FORM_SECTION_CONFIG.catSpecific.color}
						>
							<div class="grid gap-4 text-xs">
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Nom</p>
									<p class="font-medium">{catData.name || '—'}</p>
								</div>
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Date de naissance</p>
									<p class="font-medium">{formatDate(catData.birthDate) || '—'}</p>
								</div>
								{#if sexIcon}
									<div class="flex items-center justify-between" title={sexIcon.label}>
										<p class="text-muted-foreground">Sex</p>
										<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
									</div>
								{/if}
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Âge</p>
									{getAgeBadge(catData.birthDate) || catData.birthDate}
								</div>

								{#if catData.volunteers && catData.volunteers.length > 0}
									<div class="flex items-center justify-between">
										<p class="text-muted-foreground text-xs">Responsable du chat</p>
										<p class="font-medium">{catVolunteerName}</p>
									</div>
								{/if}
							</div>
						</SectionCard>
					{:else if form.type === 'ADOPTION_FLEXIBLE'}
						<!-- SECTION CHAT RECHERCHÉ (FLEXIBLE) -->
						<SectionCard
							icon={FORM_SECTION_CONFIG.cat.icon}
							title={FORM_SECTION_CONFIG.cat.label}
							color={FORM_SECTION_CONFIG.cat.color}
						>
							<div class="grid gap-4 text-xs">
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Âge</p>
									<Badge variant="outline" class="text-xs">
										{ageLabels[adoptionData.catAge] || adoptionData.catAge}
									</Badge>
								</div>
								{#if sexIcon}
									<div class="flex items-center justify-between" title={sexIcon.label}>
										<p class="text-muted-foreground">Sex</p>
										<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
									</div>
								{/if}
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Couleur</p>
									<p>{adoptionData.color}</p>
								</div>
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground">Longueur poil</p>
									<Badge variant="outline" class="text-xs">
										{furLabels[adoptionData.furLength] || adoptionData.furLength}
									</Badge>
								</div>
							</div>
						</SectionCard>
					{/if}
					<!-- SECTION LOGEMENT -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.home.icon}
						title={FORM_SECTION_CONFIG.home.label}
						color={FORM_SECTION_CONFIG.home.color}
					>
						<div class="grid gap-4 text-xs">
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{adoptionData.housingSize || '—'} m²
								</Badge>
							</div>

							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">Exterieur</span>
									<BooleanIcon value={adoptionData.hasGarden} />
								</div>
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">Espace exterieur</span>
									<Badge class="bg-blue-100 text-xs text-blue-800">
										{adoptionData.gardenSize || '—'} m²
									</Badge>
								</div>
							</div>

							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Nombre d'enfants</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{adoptionData.numberOfChildren}
								</Badge>
							</div>
						</div>
					</SectionCard>

					<!-- SECTION ANIMAUX -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.animals.icon}
						title={FORM_SECTION_CONFIG.animals.label}
						color={FORM_SECTION_CONFIG.animals.color}
					>
						<div class="ml-6 space-y-3">
							<div class="flex items-center justify-between border-b border-orange-100 pb-2">
								<span class="text-muted-foreground font-medium">Animaux dans le foyer</span>
								<BooleanIcon value={adoptionData.hasPets} />
							</div>

							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">🐱 Chats</span>
									<Badge class="bg-blue-100 text-xs text-blue-800">
										{adoptionData.numberOfCats}
									</Badge>
								</div>
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">🐕 Chiens</span>
									<Badge class="bg-blue-100 text-xs text-blue-800">
										{adoptionData.numberOfDogs}
									</Badge>
								</div>
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">🐾 Autres</span>
									<p class="bg-muted rounded-md p-2 text-xs">{adoptionData.otherPets || '—'}</p>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				{#if form.type === 'ADOPTION_FLEXIBLE'}
					<SectionCard
						icon={ADOPTION_SECTION_CONFIG.temperament.icon}
						title={ADOPTION_SECTION_CONFIG.temperament.label}
						color={ADOPTION_SECTION_CONFIG.temperament.color}
					>
						<div class="space-y-1">
							<p class="text-muted-foreground font-medium">Caractère recherché</p>
							<p class="font-medium">{adoptionData.temperament}</p>
						</div>
					</SectionCard>
				{/if}

				<Separator />

				<SectionCard
					icon={FORM_SECTION_CONFIG.notes.icon}
					title={FORM_SECTION_CONFIG.notes.label}
					color={FORM_SECTION_CONFIG.notes.color}
				>
					<div class="ml-6 space-y-3">
						<p class="font-medium">{form.notes || '—'}</p>
					</div>
				</SectionCard>
			</Card.Content>
		{/if}
	</Card.Root>

	<AdoptionCreateDialog
		bind:open={showCreateDialog}
		onCancel={() => (showCreateDialog = false)}
		initialData={{ ...adoptionData, email: form.email }}
		formId={form.id}
		catId={adoptionCatId}
	/>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
