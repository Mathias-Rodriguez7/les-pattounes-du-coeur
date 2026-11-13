<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Pencil } from '@lucide/svelte';
	import type { CatFull, CatEditData } from '#lib/types/cat.ts';
	import type { HostFull } from '#lib/types/host.ts';
	import type { VolunteerBasic } from '#lib/types/volunteer.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { hairLabel, getLabel } from '#lib/utils/catHelpers.ts';
	import CatEditForm from './CatEditForm.svelte';
	import { formatAge } from '#lib/utils/age.ts';
	import SectionCard from '../cards/SectionCard.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import CatMediaGallery from './CatMediaGallery.svelte';
	import CatDocuments from './CatDocuments.svelte';
	import CatCares from './CatCares.svelte';
	import CatSicknesses from './panel/CatSicknesses.svelte';
	import CatVolunteers from './panel/CatVolunteers.svelte';
	import CatPanelHeader from './panel/CatPanelHeader.svelte';
	import CatAdoptionRequests from './panel/CatAdoptionRequests.svelte';
	import CatPlacements from './panel/CatPlacements.svelte';
	import CatPlacementHistory from './panel/CatPlacementHistory.svelte';
	import { ADOPTABLE_STATUSES } from '#lib/constants/adoption.ts';
	import AdoptionCreateDialog from '../forms/panels/AdoptionCreateDialog.svelte';
	import AdoptionFormPanel from '../forms/panels/AdoptionFormPanel.svelte';
	import CatCompatibilityCard from './profile/CatCompatibilityCard.svelte';
	import CatHealthCard from './profile/CatHealthCard.svelte';

	interface Props {
		cat: CatFull | null;
		hosts?: HostFull[] | null;
		volunteers?: VolunteerBasic[] | null;
		isAdmin?: boolean;
	}

	const { cat, hosts = [], volunteers = [], isAdmin = false }: Props = $props();

	let isEditing = $state(false);
	let editingImage = $state(false);

	// Champs modifiables du chat (uniquement les siens)
	let editData = $state<CatEditData>({
		catNumber: '',
		name: '',
		sex: 'MALE',
		birthDate: new Date(),
		isVisible: true,
		status: 'AVAILABLE',
		hairLength: 'SHORT',
		color: '',
		origin: '',
		isSterilize: false,
		isAlreadySterilized: false,
		vaccinate: 'NO',
		isFivTest: false,
		isDeworming: false,
		description: '',
		isOkCat: false,
		isOkDog: false,
		isOkChild: false,
		isOutside: false,
		isIdentify: false,
		chipId: ''
	});

	const startEditing = () => {
		if (!cat) return;

		editData = {
			catNumber: cat.catNumber,
			name: cat.name,
			sex: cat.sex,
			birthDate: cat.birthDate ? new Date(cat.birthDate) : new Date(),
			isVisible: cat.isVisible,
			status: cat.status,
			hairLength: cat.hairLength ?? '',
			color: cat.color ?? '',
			origin: cat.origin ?? '',
			isSterilize: cat.isSterilize,
			isAlreadySterilized: cat.isAlreadySterilized,
			vaccinate: cat.vaccinate ?? '',
			isFivTest: cat.isFivTest,
			isDeworming: cat.isDeworming,
			description: cat.description ?? '',
			isOkCat: cat.isOkCat ?? false,
			isOkDog: cat.isOkDog ?? false,
			isOkChild: cat.isOkChild ?? false,
			isOutside: cat.isOutside ?? false,
			isIdentify: cat.isIdentify ?? false,
			chipId: cat.chipId ?? ''
		};

		isEditing = true;
	};

	// CatEditForm appelle update() : les données sont rechargées depuis le serveur
	const handleSuccessfulSave = () => {
		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	const handleCloseImageEditor = () => {
		editingImage = false;
	};

	// ===== DROITS =====
	// Même règle que le serveur : admin, ou bénévole assigné à ce chat
	// (maladies, documents, soins, adoption : tout ce qui concerne le chat)
	const canManageCat = $derived(isAdmin || !!cat?.isMine);

	// ===== ADOPTION =====
	// La section 2 affiche l'adoption à la place des placements si le chat est adopté.
	// Si l'adoption est annulée (statut changé), les placements reviennent automatiquement.
	const adoption = $derived(cat?.adoptions?.[0] ?? null);
	const isAdopted = $derived(cat?.status === 'ADOPTED' && adoption !== null);
	// ===== DEMANDES D'ADOPTION DU CHAT (précises, en attente) =====
	// Les traiter depuis la fiche : le panneau de la page Formulaires s'ouvre à la place de la fiche.
	// Une demande traitée (acceptée ou refusée) quitte la liste : le panneau se referme tout seul.
	const pendingRequests = $derived(cat?.forms ?? []);
	let openRequestId = $state<string | null>(null);
	const openRequest = $derived(pendingRequests.find((f) => f.id === openRequestId) ?? null);
	// Adopter depuis la fiche : chat adoptable (disponible OU en socialisation), et droits sur le chat
	let showAdoptDialog = $state(false);
	const canAdopt = $derived(
		canManageCat && !!cat && ADOPTABLE_STATUSES.includes(cat.status) && !isAdopted
	);

	// ===== DÉRIVÉS =====
</script>

{#if cat}
	{#if openRequest}
		<!-- Traiter une demande : le même panneau que la page Formulaires (modifier, refuser, adopter) -->
		<AdoptionFormPanel
			form={openRequest}
			catData={openRequest.cat}
			{isAdmin}
			onClose={() => (openRequestId = null)}
		/>
	{:else}
		<Card.Root class={!isEditing && !editingImage ? 'overflow-hidden pt-0' : ''}>
			{#if !isEditing && !editingImage}
				<!-- ============================================================ -->
				<!-- 1. EN-TÊTE : qui est ce chat ?                                 -->
				<!-- ============================================================ -->
				<CatPanelHeader
					{cat}
					{adoption}
					{isAdopted}
					{isAdmin}
					canManage={canManageCat}
					{canAdopt}
					onEditPhoto={() => (editingImage = true)}
					onAdopt={() => (showAdoptDialog = true)}
				/>

				<Card.Content class="flex flex-col gap-4 text-sm">
					<Separator />

					<!-- ============================================================ -->
					<!-- 2. QUI S'EN OCCUPE : bénévoles + placements (ou adoption)      -->
					<!-- ============================================================ -->
					<section class="grid gap-4">
						<!-- Bénévoles référents (toujours affichés, même après adoption) -->
						<CatVolunteers {cat} volunteers={volunteers ?? []} {isAdmin} />

						<!-- Demandes d'adoption en attente pour ce chat (tant qu'il n'est pas adopté) -->
						{#if !isAdopted}
							<CatAdoptionRequests
								requests={pendingRequests}
								onOpen={(formId) => (openRequestId = formId)}
							/>
						{/if}

						<!-- Familles d'accueil -->
						<CatPlacements {cat} hosts={hosts ?? []} {isAdmin} />
					</section>

					<Separator />

					<!-- ============================================================ -->
					<!-- 3. PROFIL DU CHAT : comment est-il ?                           -->
					<!-- ============================================================ -->
					<SectionCard title="Profil du chat" variant="plain">
						{#snippet action()}
							<Button
								variant="ghost"
								size="icon"
								onclick={startEditing}
								aria-label="Modifier le chat"
							>
								<Pencil class="h-5 w-5" />
							</Button>
						{/snippet}
						<div class="grid gap-4">
							<!-- PC : 1 + 1 + 2 | Tablette : 2 colonnes | Mobile : 1 -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<SectionCard
									icon={CAT_SECTION_CONFIG.profile.icon}
									title={CAT_SECTION_CONFIG.profile.label}
									color={CAT_SECTION_CONFIG.profile.color}
									class="lg:col-span-1"
								>
									<div class="ml-6 space-y-1">
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Âge</span>
											<span>{formatAge(cat.birthDate)}</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Couleur</span>
											<span>{cat.color ?? '—'}</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Poil</span>
											<span>{getLabel(hairLabel, cat.hairLength)}</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Origine</span>
											<span>{cat.origin ?? '—'}</span>
										</div>
									</div>
								</SectionCard>

								<!-- Les mêmes cartes que le panneau d'une demande d'adoption -->
								<CatCompatibilityCard {cat} class="lg:col-span-1" />
								<CatHealthCard {cat} class="sm:col-span-2" />
							</div>

							{#if cat.description}
								<SectionCard
									icon={CAT_SECTION_CONFIG.description.icon}
									title={CAT_SECTION_CONFIG.description.label}
									color={CAT_SECTION_CONFIG.description.color}
								>
									<p class="ml-6 text-xs whitespace-pre-line text-muted-foreground">
										{cat.description}
									</p>
								</SectionCard>
							{/if}
						</div>
					</SectionCard>

					<Separator />

					<!-- ============================================================ -->
					<!-- 4. MALADIES                                                   -->
					<!-- ============================================================ -->
					<!-- Même règle que les documents et les soins : admin, ou bénévole associée au chat -->
					<CatSicknesses {cat} canManage={canManageCat} />

					<Separator />

					<!-- ============================================================ -->
					<!-- 5. DOCUMENTS                                                  -->
					<!-- ============================================================ -->
					<!-- Même règle que les maladies : admin, ou bénévole associée au chat -->
					<CatDocuments {cat} canManage={canManageCat} />

					<Separator />

					<!-- ============================================================ -->
					<!-- 6. SOINS VÉTÉRINAIRES                                         -->
					<!-- ============================================================ -->
					<!-- Même règle que les maladies : admin, ou bénévole associée au chat -->
					<CatCares {cat} canManage={canManageCat} />

					<Separator />

					<!-- ============================================================ -->
					<!-- 7. HISTORIQUE                                                 -->
					<!-- ============================================================ -->
					<CatPlacementHistory {cat} />
				</Card.Content>
			{:else if editingImage}
				<Card.Content>
					<CatMediaGallery {cat} onClose={handleCloseImageEditor} />
				</Card.Content>
			{:else}
				<Card.Content class="space-y-6">
					<CatEditForm
						bind:editData
						catId={cat.id}
						{isAdmin}
						onSuccess={handleSuccessfulSave}
						onCancel={handleCancelEdit}
					/>
				</Card.Content>
			{/if}
		</Card.Root>
	{/if}
	<!-- Le même dialogue que la page Formulaires, sans demande imposée :
	     la bénévole peut en lier une (pré-remplissage) ou adopter « hors formulaire » -->
	{#if canAdopt}
		<AdoptionCreateDialog
			bind:open={showAdoptDialog}
			onCancel={() => (showAdoptDialog = false)}
			catId={cat.id}
			requests={cat.forms ?? []}
			canOverrideBlacklist={isAdmin}
		/>
	{/if}
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="cat" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un chat pour voir ses détails</p>
		</Card.Content>
	</Card.Root>
{/if}
