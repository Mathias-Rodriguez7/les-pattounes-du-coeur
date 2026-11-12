<script lang="ts">
	import PersonProfileView from '#lib/components/person/PersonProfileView.svelte';
	import PersonContactView from '#lib/components/person/PersonContactView.svelte';
	import PersonAddressView from '#lib/components/person/PersonAddressView.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { FORM_SECTION_CONFIG, ADOPTION_SECTION_CONFIG } from '#lib/constants/forms.ts';
	import AdoptionEditFormPanel from './AdoptionEditFormPanel.svelte';
	import AdoptionRequestHeader from '#lib/components/adoptions/panel/AdoptionRequestHeader.svelte';
	import AdoptionBlacklistAlert from '#lib/components/adoptions/panel/AdoptionBlacklistAlert.svelte';
	import AdoptionCatWanted from '#lib/components/adoptions/panel/AdoptionCatWanted.svelte';
	import AdoptionHomeSummary from '#lib/components/adoptions/panel/AdoptionHomeSummary.svelte';
	import AdoptionRequestActions from '#lib/components/adoptions/panel/AdoptionRequestActions.svelte';
	import AdoptionCreateDialog from './AdoptionCreateDialog.svelte';
	import CatPicker from '#lib/components/cats/CatPicker.svelte';
	import type {
		FormEditData,
		AdoptionFormData,
		AdoptionFormJson,
		FormWithRelations,
		BlacklistInfo
	} from '#lib/types/form.ts';
	import type { VolunteerBasic } from '#lib/types/volunteer.ts';
	import type { CatPickerItem } from '#lib/types/cat.ts';
	import CatProfileSummary from '#lib/components/cats/profile/CatProfileSummary.svelte';

	interface Props {
		/** blacklist : la raison si l'email est blacklisté (ajoutée par le load) */
		form: FormWithRelations & { blacklist?: BlacklistInfo | null };
		/** Le chat de la demande (demande précise) : form.cat */
		catData?: FormWithRelations['cat'];
		/** Pour assigner une demande libre (admin, répartitrice) */
		volunteers?: VolunteerBasic[];
		/** Les chats proposables pour une demande libre (CatPicker) */
		cats?: CatPickerItem[];
		canAssign?: boolean;
		/** Seule l'admin peut autoriser une adoption malgré la blacklist */
		isAdmin?: boolean;
		/** Présent quand le panneau est ouvert depuis la fiche du chat (bouton « Retour ») */
		onClose?: () => void;
	}

	const {
		form,
		catData,
		volunteers = [],
		cats = [],
		canAssign = false,
		isAdmin = false,
		onClose
	}: Props = $props();

	// Blacklist : la bénévole voit la raison ; seule l'admin peut quand même créer l'adoption
	const blacklist = $derived(form.blacklist ?? null);
	const isBlockedByBlacklist = $derived(!!blacklist && !isAdmin);

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

	let editData = $state<FormEditData<AdoptionFormData> | null>(null);

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
					{isAdmin}
					isBlacklisted={!!form.blacklist}
					isFlexible={form.type === 'ADOPTION_FLEXIBLE'}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{:else if showCatPicker}
			<Card.Content class="flex flex-1 flex-col gap-6">
				<CatPicker {cats} {form} onSelect={handleCatSelected} onCancel={handleCancelPicker} />
			</Card.Content>
		{:else}
			<AdoptionRequestHeader {form} {volunteers} {canAssign} {onClose} onEdit={startEditing} />

			<Card.Content class="@container flex flex-col gap-6 text-sm">
				<Separator />

				<!-- Blacklist : tout en haut, impossible à manquer -->
				{#if blacklist}
					<AdoptionBlacklistAlert {blacklist} {isAdmin} />
				{/if}

				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-10">
					<PersonProfileView
						firstName={adoptionData.firstName}
						lastName={adoptionData.lastName}
						birthDate={adoptionData.birthDate}
						class="@2xl:col-span-3"
					/>
					<PersonContactView
						phone={adoptionData.phone}
						email={form.email}
						class="@2xl:col-span-3"
					/>
					<PersonAddressView
						address={adoptionData.address}
						city={adoptionData.city}
						postalCode={adoptionData.postalCode}
						district={adoptionData.district}
						class="@2xl:col-span-4"
					/>
				</section>

				<Separator />

				<!-- Uniquement l'ADOPTANT ici : 3 blocs (demande libre) ou 2 (demande précise) -->
				<section
					class="grid grid-cols-1 gap-4 @lg:grid-cols-2 {form.type === 'ADOPTION_FLEXIBLE'
						? '@2xl:grid-cols-3'
						: ''}"
				>
					<!-- Demande libre : le chat RECHERCHÉ. Demande précise : le chat a sa section, plus bas -->
					{#if form.type === 'ADOPTION_FLEXIBLE'}
						<AdoptionCatWanted data={adoptionData} />
					{/if}
					<AdoptionHomeSummary data={adoptionData} />
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
					<AdoptionRequestActions
						{form}
						hasCat={!!adoptionCatId}
						isBlocked={isBlockedByBlacklist}
						onCreate={() => (showCreateDialog = true)}
						onPickCat={() => (showCatPicker = true)}
					/>
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
		{blacklist}
		canOverrideBlacklist={isAdmin}
	/>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
