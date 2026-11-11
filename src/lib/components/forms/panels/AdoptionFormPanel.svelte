<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import {
		FORM_SECTION_CONFIG,
		statusColors,
		ageLabels,
		furLabels,
		ADOPTION_SECTION_CONFIG
	} from '$lib/constants/forms';
	import { formatAge } from '$lib/utils/age';
	import { formatDate } from '$lib/utils/date';
	import AdoptionEditFormPanel from './AdoptionEditFormPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getSexIcon } from '$lib/utils/catHelpers';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import AssignVolunteerDialog from '../AssignVolunteerDialog.svelte';
	import AdoptionCreateDialog from './AdoptionCreateDialog.svelte';
	import CatPicker from '$lib/components/cats/CatPicker.svelte';
	import type {
		FormEditData,
		AdoptionFormData,
		AdoptionFormJson,
		FormWithRelations
	} from '$lib/types/form';
	import type { VolunteerBasic } from '$lib/types/volunteer';
	import type { CatPickerItem } from '$lib/types/cat';
	import { ArrowLeft, Pencil } from '@lucide/svelte';
	import RejectFormDialog from '../RejectFormDialog.svelte';
	import CatProfileSummary from '$lib/components/cats/profile/CatProfileSummary.svelte';

	interface Props {
		form: FormWithRelations;
		/** Le chat de la demande (demande précise) : form.cat */
		catData?: FormWithRelations['cat'];
		/** Pour assigner une demande libre (admin, répartitrice) */
		volunteers?: VolunteerBasic[];
		/** Les chats proposables pour une demande libre (CatPicker) */
		cats?: CatPickerItem[];
		canAssign?: boolean;
		/** Présent quand le panneau est ouvert depuis la fiche du chat (bouton « Retour ») */
		onClose?: () => void;
	}

	const { form, catData, volunteers = [], cats = [], canAssign = false, onClose }: Props = $props();

	let isEditing = $state(false);
	let showCreateDialog = $state(false);
	let showCatPicker = $state(false);
	let selectedCatId = $state<string>('');

	// Form.data est du JSON : on dit à TypeScript ce qu'il contient vraiment
	const adoptionData = $derived(form.data as AdoptionFormJson);

	// La date est une chaîne dans le JSON : on la convertit une fois, ici
	const birthDate = $derived(adoptionData.birthDate ? new Date(adoptionData.birthDate) : null);

	// catId résolu selon le type de formulaire
	const adoptionCatId = $derived(
		form?.type === 'ADOPTION_SPECIFIC' ? (catData?.id ?? '') : selectedCatId
	);

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);

	let editData = $state<FormEditData<AdoptionFormData> | null>(null);

	const sexIcon = $derived(
		catData ? getSexIcon(catData.sex) : adoptionData ? getSexIcon(adoptionData.catSex) : null
	);

	const startEditing = () => {
		if (!form) return;

		// Une copie (pour ne pas modifier la demande affichée), avec la date déjà convertie.
		// `as` : certains champs peuvent manquer (demande précise) ; le formulaire d'édition les gère
		const adoptionDataCopy = {
			...structuredClone(adoptionData),
			birthDate: birthDate ?? undefined
		} as AdoptionFormData;

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

	// Fermer le CatPicker (croix ou « Annuler ») : on revient à la fiche de la demande
	function handleCancelPicker() {
		showCatPicker = false;
		selectedCatId = '';
	}

	function handleCancelCreate() {
		showCreateDialog = false;
		selectedCatId = '';
	}
</script>

{#if form}
	<Card.Root class="h-full">
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
			<Card.Content class="flex flex-1 flex-col gap-6">
				<CatPicker {cats} {form} onSelect={handleCatSelected} onCancel={handleCancelPicker} />
			</Card.Content>
		{:else}
			<Card.Header>
				{#if onClose}
					<Button variant="ghost" size="sm" class="w-fit" onclick={onClose}>
						<ArrowLeft class="size-4" />
						Retour à la fiche du chat
					</Button>
				{/if}
				<section class="flex flex-wrap justify-between gap-4">
					<div class="grid gap-2 text-base">
						<Card.Title class="text-2xl">
							{adoptionData.firstName}
							{adoptionData.lastName}
							<Badge class="bg-blue-100 text-sm text-blue-700">
								{formatAge(birthDate)}
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

					<div class="flex flex-col justify-center gap-2 text-right text-sm text-muted-foreground">
						<p>{formatDate(form.createdAt)}</p>
						{#if form.assignedTo}
							<p class="text-muted-foreground">
								Assigné à: <span class="font-medium">{assignedName || 'N/A'}</span>
							</p>
						{/if}
						{#if form.type === 'ADOPTION_FLEXIBLE' && canAssign}
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
					</div>
				</section>
			</Card.Header>

			<Card.Content class="@container flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-10">
					<!-- SECTION CANDIDAT -->
					<SectionCard
						icon={FORM_SECTION_CONFIG.profile.icon}
						title={FORM_SECTION_CONFIG.profile.label}
						color={FORM_SECTION_CONFIG.profile.color}
						class="@2xl:col-span-3"
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
									<p>{formatDate(birthDate)}</p>
									<Badge class="bg-blue-100 text-sm text-blue-700">
										{formatAge(birthDate)}
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
						class="@2xl:col-span-3"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="font-medium text-muted-foreground">Tel</p>
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`tel:${adoptionData.phone}`}
										class="text-xs text-blue-500 underline hover:text-primary"
									>
										{adoptionData.phone}
									</a>
								</div>
							</div>

							<div>
								<p class="font-medium text-muted-foreground">Mail</p>
								<div class="flex items-center gap-2">
									<Icon name="mail" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`mailto:${form.email}`}
										class="text-xs text-blue-500 underline hover:text-primary"
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
						class="@2xl:col-span-4"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="font-medium text-muted-foreground">Rue</p>
								<p class="font-medium text-gray-900">{adoptionData.address || '—'}</p>
							</div>

							<div class="flex gap-4">
								<div>
									<p class="font-medium text-muted-foreground">Ville</p>
									<p class="font-medium text-gray-900">{adoptionData.city || '—'}</p>
								</div>
								<div>
									<p class="font-medium text-muted-foreground">CP</p>
									<p class="font-medium text-gray-900">{adoptionData.postalCode || '—'}</p>
								</div>
								<div>
									<p class="font-medium text-muted-foreground">Quartier</p>
									<p class="font-medium">{adoptionData.district}</p>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- Uniquement l'ADOPTANT ici : 3 blocs (demande libre) ou 2 (demande précise) -->
				<section
					class="grid grid-cols-1 gap-4 @lg:grid-cols-2 {form.type === 'ADOPTION_FLEXIBLE'
						? '@2xl:grid-cols-3'
						: ''}"
				>
					<!-- Demande libre : le chat que l'adoptant RECHERCHE (ses préférences).
					     Demande précise : le chat demandé a sa propre section, plus bas -->
					{#if form.type === 'ADOPTION_FLEXIBLE'}
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
										{adoptionData.catAge ? ageLabels[adoptionData.catAge] : '—'}
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
										{adoptionData.furLength ? furLabels[adoptionData.furLength] : '—'}
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
								<span class="font-medium text-muted-foreground">Animaux dans le foyer</span>
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
									<p class="rounded-md bg-muted p-2 text-xs">{adoptionData.otherPets || '—'}</p>
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
							<p class="font-medium text-muted-foreground">Caractère recherché</p>
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

				<!-- Demande précise : le profil du chat demandé, pour juger si l'adoptant lui convient -->
				{#if form.type === 'ADOPTION_SPECIFIC' && catData}
					<Separator />
					<SectionCard title="Le chat demandé : {catData.name ?? 'sans nom'}" variant="plain">
						<CatProfileSummary cat={catData} />
					</SectionCard>
				{/if}

				<!-- Les décisions en bas : la bénévole a tout lu avant d'accepter ou de refuser.
				     Une demande déjà acceptée ou refusée ne se traite plus -->
				{#if form.status === 'PENDING'}
					<Separator />
					<div class="flex flex-wrap justify-end gap-2">
						<RejectFormDialog
							formId={form.id}
							requesterName={`${adoptionData.firstName ?? ''} ${adoptionData.lastName ?? ''}`.trim()}
						/>
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
				{/if}
			</Card.Content>
		{/if}
	</Card.Root>

	<AdoptionCreateDialog
		bind:open={showCreateDialog}
		onCancel={handleCancelCreate}
		initialData={{ ...adoptionData, email: form.email }}
		formId={form.id}
		catId={adoptionCatId}
	/>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
