<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Camera, HeartHandshake } from '@lucide/svelte';
	import type { CatFull, CatEditData } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import type { VolunteerBasic } from '$lib/types/volunteer';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { statusLabel, hairLabel, getLabel, getSexIcon } from '$lib/utils/catHelpers';
	import CatEditForm from './CatEditForm.svelte';
	import { getAgeBadge, formatAge } from '$lib/utils/age';
	import SectionCard from '../cards/SectionCard.svelte';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { formatDateNum } from '$lib/utils/date';
	import { truncate } from '$lib/utils/string';
	import { sicknessStatus } from '$lib/constants/sickness';
	import type { SicknessStatus } from '@prisma/client';
	import { getPlacementTypeClass } from '$lib/constants/placement';
	import * as Accordion from '$lib/components/ui/accordion';
	import CatMediaGallery from './CatMediaGallery.svelte';
	import PlacementCreateForm from '../placements/PlacementCreateForm.svelte';
	import PlacementEditForm from '../placements/PlacementEditForm.svelte';
	import CatVolunteerCreateForm from '../catVolunteer/CatVolunteerCreateForm.svelte';
	import CatVolunteerRemoveButton from '../catVolunteer/CatVolunteerRemoveButton.svelte';
	import SicknessEditForm from '../sickness/SicknessEditForm.svelte';
	import { focalPointStyle } from '$lib/utils/catHelpers';
	import CatDocuments from './CatDocuments.svelte';
	import CatCares from './CatCares.svelte';
	import { publicMediaUrl } from '$lib/media/urls';
	import { getTrialInfo } from '$lib/utils/adoption';
	import AdoptionFinalizeDialog from '../adoptions/AdoptionFinalizeDialog.svelte';
	import { ADOPTABLE_STATUSES, ADOPTION_STATUS } from '$lib/constants/adoption';
	import AdoptionCreateDialog from '../forms/panels/AdoptionCreateDialog.svelte';
	import AdoptionFormPanel from '../forms/panels/AdoptionFormPanel.svelte';
	import CatCompatibilityCard from './profile/CatCompatibilityCard.svelte';
	import CatHealthCard from './profile/CatHealthCard.svelte';
	import type { AdoptionFormJson } from '$lib/types/form';

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

	// Photo principale : celle marquée isPrimary, sinon la première image
	const primaryMedia = $derived(cat?.media?.find((m) => m.file.type === 'IMAGE') ?? null);
	const primaryStyle = $derived(primaryMedia ? focalPointStyle(primaryMedia) : '');

	// ===== DROITS =====
	// Même règle que le serveur : admin, ou bénévole assigné à ce chat
	// (maladies, documents, soins, adoption : tout ce qui concerne le chat)
	const canManageCat = $derived(isAdmin || !!cat?.isMine);

	// ===== ADOPTION =====
	// La section 2 affiche l'adoption à la place des placements si le chat est adopté.
	// Si l'adoption est annulée (statut changé), les placements reviennent automatiquement.
	const adoption = $derived(cat?.adoptions?.[0] ?? null);
	const isAdopted = $derived(cat?.status === 'ADOPTED' && adoption !== null);
	const trial = $derived(adoption ? getTrialInfo(adoption) : null);
	const isSterilized = $derived(!!cat && (cat.isSterilize || cat.isAlreadySterilized));
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
	// L'adresse de l'adoptant sur une seule ligne : « 12 rue X, 34000 Montpellier »
	const adopterAddress = $derived.by(() => {
		const profil = adoption?.profil;
		if (!profil) return '';
		const town = [profil.postalCode, profil.city].filter(Boolean).join(' ');
		return [profil.address, town].filter(Boolean).join(', ');
	});

	// Ce que le ménage de la finalisation supprimera : tout sauf UNE photo (les PDF ne bougent pas)
	const galleryPhotos = $derived(cat?.media?.filter((m) => m.file.type === 'IMAGE').length ?? 0);
	const galleryVideos = $derived(cat?.media?.filter((m) => m.file.type === 'VIDEO').length ?? 0);

	// ===== DÉRIVÉS =====
	const activeSicknesses = $derived(cat?.sicknesses?.filter((s) => s.status !== 'RESOLVED') ?? []);

	// On garde le lien complet (volunteerId + profil) pour pouvoir le retirer
	const assignedVolunteers = $derived((cat?.volunteers ?? []).filter((cv) => cv.volunteer?.profil));

	const activePlacements = $derived(
		(cat?.placements ?? []).filter(
			(p) =>
				(p.type === 'LONG' && (p.status === 'ACTIVE' || p.status === 'BREAK')) ||
				(p.type === 'SHORT' && p.status === 'ACTIVE') ||
				(p.type === 'PROPOSAL' && p.status === 'ACTIVE') ||
				(p.type === 'TRANSFER' && p.status === 'ACTIVE')
		)
	);

	const activeProposalPlacements = $derived(activePlacements.filter((p) => p.type === 'PROPOSAL'));
	const activeTransferPlacements = $derived(activePlacements.filter((p) => p.type === 'TRANSFER'));
	const activeLongPlacement = $derived(activePlacements.find((p) => p.type === 'LONG') ?? null);
	const activeShortPlacement = $derived(activePlacements.find((p) => p.type === 'SHORT') ?? null);

	const stoppedPlacements = $derived(
		(cat?.placements ?? [])
			.filter((p) => p.status === 'STOP')
			.sort((a, b) => {
				const dateA = new Date(a.endDate ?? a.startDate ?? 0).getTime();
				const dateB = new Date(b.endDate ?? b.startDate ?? 0).getTime();
				return dateB - dateA;
			})
	);

	const sexIcon = $derived(cat ? getSexIcon(cat.sex) : null);

	type Placement = NonNullable<CatFull['placements']>[number];

	const PLACEMENT_LABEL: Record<string, string> = {
		LONG: 'Classic',
		SHORT: 'Relais',
		PROPOSAL: 'Proposition',
		TRANSFER: 'Transfert'
	};
</script>

{#if cat}
	<!-- ===== SNIPPET : une carte de placement ===== -->
	{#snippet placementCard(placement: Placement, isHistory: boolean = false)}
		<div
			class="grid items-center gap-2 rounded border px-2 py-1 text-xs {getPlacementTypeClass(
				placement.type
			)} {isHistory ? 'opacity-70' : ''}"
		>
			<div class="flex items-center justify-between gap-2">
				<p class="text-sm font-semibold">
					{placement.host.profil.firstName}
					{truncate(placement.host.profil.lastName, 1)}.
				</p>
				{#if !isHistory && placement.status === 'BREAK'}
					<Badge variant="outline" class="ml-1 text-xs">En pause</Badge>
				{/if}
				<div class="flex items-center gap-1">
					<Badge variant="outline" class="text-xs">
						{PLACEMENT_LABEL[placement.type] ?? placement.type}
					</Badge>
					{#if isAdmin && !isHistory}
						<PlacementEditForm {cat} {placement} />
					{/if}
				</div>
			</div>

			<div class="ml-6 flex min-w-0 flex-wrap gap-2">
				<div class="flex gap-2">
					<Icon name="phone" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
					<a
						href={`tel:${placement.host.profil.phone}`}
						class="text-xs text-blue-500 underline hover:text-primary"
					>
						{placement.host.profil.phone}
					</a>
				</div>
				<div class="flex min-w-0 gap-2">
					<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
					<a
						href={`mailto:${placement.host.profil.email}`}
						class="block text-xs break-all text-blue-500 underline hover:text-primary"
					>
						{placement.host.profil.email}
					</a>
				</div>
				<p class="block text-xs">
					{placement.host.profil.address}
					{placement.host.profil.city}
				</p>
			</div>

			{#if placement.startDate}
				<div class="flex flex-wrap justify-between gap-x-4">
					<p>Début {formatDateNum(placement.startDate)}</p>
					<p>Fin {placement.endDate ? formatDateNum(placement.endDate) : '—'}</p>
				</div>
			{/if}
		</div>
	{/snippet}

	<!-- ===== SNIPPET : un groupe de placements avec son titre ===== -->
	{#snippet placementGroup(label: string, list: Placement[])}
		{#if list.length > 0}
			<div class="grid gap-2">
				<span class="block text-xs text-muted-foreground">{label}</span>
				{#each list as placement (placement.id)}
					{@render placementCard(placement)}
				{/each}
			</div>
		{/if}
	{/snippet}

	{#if openRequest}
		<!-- Traiter une demande : le même panneau que la page Formulaires (modifier, refuser, adopter) -->
		<AdoptionFormPanel
			form={openRequest}
			catData={openRequest.cat}
			onClose={() => (openRequestId = null)}
		/>
	{:else}
		<Card.Root class={!isEditing && !editingImage ? 'overflow-hidden pt-0' : ''}>
			{#if !isEditing && !editingImage}
				<!-- ============================================================ -->
				<!-- 1. EN-TÊTE : qui est ce chat ?                                 -->
				<!-- ============================================================ -->
				<Card.Header class="flex flex-wrap items-stretch gap-4 pl-0 sm:gap-6">
					<!-- Photo : collée au bord gauche, bord droit en arc de cercle -->
					<!-- Clic = galerie. Souris : icône au survol | Tactile : pastille toujours visible -->
					<button
						type="button"
						onclick={() => (editingImage = true)}
						class="group relative min-h-38 w-32 shrink-0 overflow-hidden rounded-r-[5rem] bg-muted sm:w-50"
						aria-label="Gérer les photos de {cat.name ?? 'ce chat'}"
					>
						{#if primaryMedia}
							<img
								src={publicMediaUrl(primaryMedia.file.storageKey)}
								alt={cat.name ?? cat.catNumber}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 pointer-fine:group-hover:scale-105"
								style={primaryStyle}
							/>
						{:else}
							<span class="flex h-full items-center justify-center text-muted-foreground">
								<Icon name="cat" class="size-10 opacity-40" />
							</span>
						{/if}

						<!-- Souris : voile sombre + appareil photo au survol (ou au focus clavier) -->
						<span
							class="absolute inset-0 hidden items-center justify-center bg-black/40 text-white opacity-0 transition-opacity pointer-fine:flex pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100"
						>
							<Camera class="size-7" />
						</span>

						<!-- Tactile : pas de survol, donc une petite pastille toujours visible -->
						<span
							class="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white pointer-fine:hidden"
						>
							<Camera class="size-4" />
						</span>
					</button>

					<!-- Infos : qui est ce chat, et où en est-il ? -->
					<div class="grid min-w-0 flex-1 content-start gap-2 pt-6 pr-6 lg:flex-initial">
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
							<Card.Title class="text-xl sm:text-2xl">{cat.name ?? 'Sans nom'}</Card.Title>
							<span class="text-sm text-muted-foreground">{getAgeBadge(cat.birthDate)}</span>
							{#if sexIcon}
								<p class="flex items-center gap-1.5 font-medium">
									<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
									{sexIcon.label}
								</p>
							{/if}
						</div>

						<p class="text-sm text-muted-foreground">
							N° de suivi : <span class="font-medium text-foreground">{cat.catNumber}</span>
						</p>

						<div class="flex flex-wrap gap-2">
							<Badge variant="outline" class="text-sm">
								{statusLabel[cat.status] ?? cat.status}
							</Badge>
							{#if cat.isVisible}
								<Badge class="bg-green-100 text-sm text-green-700">Visible</Badge>
							{:else}
								<Badge class="bg-red-100 text-sm text-red-700">Masqué</Badge>
							{/if}
						</div>

						<!-- L'état de l'adoption : sur sa propre ligne, c'est l'information du moment -->
						{#if isAdopted && adoption}
							{#if adoption.status === 'TRIAL' && trial}
								<Badge
									class="w-fit text-sm {trial.isDue
										? 'bg-red-100 text-red-700'
										: ADOPTION_STATUS.TRIAL.color}"
								>
									{trial.isDue ? 'À finaliser' : ADOPTION_STATUS.TRIAL.label}
									· fin {formatDateNum(adoption.trialEndsAt)}
									{#if !trial.isDue}
										· dans {trial.daysLeft} j
									{/if}
								</Badge>
							{:else if adoption.status === 'FINAL'}
								<Badge class="w-fit text-sm {ADOPTION_STATUS.FINAL.color}">
									{ADOPTION_STATUS.FINAL.label} · depuis le {formatDateNum(adoption.finalizedAt)}
								</Badge>
							{/if}
						{/if}
					</div>

					<!-- Adoptant + action : à droite sur PC, en dessous sur tablette et mobile.
				     Le {#if} englobe le conteneur : sans adoption, aucun bloc vide ne prend de place -->
					{#if isAdopted && adoption}
						<div class="w-full min-w-0 lg:w-auto lg:flex-1 lg:pt-6">
							<SectionCard
								icon={CAT_SECTION_CONFIG.adoptions.icon}
								title={adoption.profil
									? `Adoptant · ${adoption.profil.firstName} ${adoption.profil.lastName}`
									: 'Adoptant'}
								color={CAT_SECTION_CONFIG.adoptions.color}
							>
								{#snippet action()}
									{#if canManageCat && adoption.status === 'TRIAL'}
										<AdoptionFinalizeDialog
											adoptionId={adoption.id}
											catName={cat.name ?? 'ce chat'}
											{isSterilized}
											removedPhotos={Math.max(galleryPhotos - 1, 0)}
											removedVideos={galleryVideos}
											disabled={!trial?.isDue}
										/>
									{/if}
								{/snippet}

								{#if adoption.profil}
									{@const adopter = adoption.profil}
									<!-- flex-wrap : les infos se rangent selon la place disponible,
								     sur une ligne si la carte est large, sur plusieurs sinon -->
									<div class="flex min-w-0 flex-wrap gap-x-6 gap-y-3 text-xs">
										{#if adopter.phone}
											<div class="flex min-w-0 items-center gap-2">
												<Icon name="phone" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
												<a
													href={`tel:${adopter.phone}`}
													class="truncate text-blue-500 underline hover:text-primary"
												>
													{adopter.phone}
												</a>
											</div>
										{/if}
										<div class="flex max-w-full min-w-0 items-center gap-2">
											<Icon name="mail" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
											<a
												href={`mailto:${adopter.email}`}
												title={adopter.email}
												class="truncate text-blue-500 underline hover:text-primary"
											>
												{adopter.email}
											</a>
										</div>
										{#if adopterAddress}
											<div class="flex min-w-0 items-center gap-2">
												<Icon name="map" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
												<span>{adopterAddress}</span>
											</div>
										{/if}
									</div>
								{:else}
									<p class="text-muted-foreground">Profil non disponible</p>
								{/if}
							</SectionCard>
						</div>
					{:else if canAdopt}
						<!-- Pas encore adopté : l'action à la place de la carte Adoptant.
					     Une fois l'adoption créée, la carte la remplace (le load est relancé) -->
						<div class="ml-auto self-start pt-6 pr-6">
							<Button size="sm" onclick={() => (showAdoptDialog = true)}>
								<HeartHandshake class="size-4" />
								Adopter
							</Button>
						</div>
					{/if}
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 text-sm">
					<Separator />

					<!-- ============================================================ -->
					<!-- 2. QUI S'EN OCCUPE : bénévoles + placements (ou adoption)      -->
					<!-- ============================================================ -->
					<section class="grid gap-4">
						<!-- Bénévoles référents (toujours affichés, même après adoption) -->
						<SectionCard
							icon={CAT_SECTION_CONFIG.volunteer.icon}
							title={CAT_SECTION_CONFIG.volunteer.label}
							color={CAT_SECTION_CONFIG.volunteer.color}
						>
							{#snippet action()}
								{#if isAdmin}
									<CatVolunteerCreateForm
										catId={cat.id}
										volunteers={volunteers ?? []}
										assignedVolunteerIds={assignedVolunteers.map((cv) => cv.volunteerId)}
									/>
								{/if}
							{/snippet}

							{#if assignedVolunteers.length > 0}
								<div class="flex flex-wrap gap-4 text-sm">
									{#each assignedVolunteers as cv (cv.volunteerId)}
										{@const profil = cv.volunteer.profil}
										<div class="grid min-w-0 gap-2 rounded-xl border border-sky-400 bg-sky-100 p-2">
											<div class="flex items-center justify-between gap-2">
												<p class="font-semibold">
													{profil.firstName}
													{truncate(profil.lastName, 1)}.
												</p>
												{#if isAdmin}
													<CatVolunteerRemoveButton
														catId={cat.id}
														volunteerId={cv.volunteerId}
														volunteerName={`${profil.firstName} ${profil.lastName}`}
													/>
												{/if}
											</div>
											<div class="flex gap-2">
												<Icon name="phone" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
												<a
													href={`tel:${profil.phone}`}
													class="text-xs text-blue-500 underline hover:text-primary"
												>
													{profil.phone}
												</a>
											</div>
											<div class="flex min-w-0 gap-2">
												<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
												<a
													href={`mailto:${profil.email}`}
													class="block text-xs break-all text-blue-500 underline hover:text-primary"
												>
													{profil.email}
												</a>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
									<p>Aucun bénévole associé à ce chat</p>
								</div>
							{/if}
						</SectionCard>

						<!-- Demandes d'adoption en attente pour ce chat (tant qu'il n'est pas adopté) -->
						{#if !isAdopted && pendingRequests.length > 0}
							<SectionCard
								icon={CAT_SECTION_CONFIG.adoptions.icon}
								title="Demandes d'adoption ({pendingRequests.length})"
								color="amber"
							>
								<div class="flex flex-wrap gap-4">
									{#each pendingRequests as request (request.id)}
										{@const answers = request.data as AdoptionFormJson}
										{@const children = answers.numberOfChildren ?? 0}
										<div
											class="grid max-w-full min-w-0 gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs"
										>
											<div class="flex items-baseline justify-between gap-4">
												<p class="text-sm font-semibold">
													{answers.firstName ?? ''}
													{answers.lastName ?? ''}
												</p>
												<span class="text-muted-foreground">{formatDateNum(request.createdAt)}</span
												>
											</div>

											<div class="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
												{#if answers.phone}
													<a
														href={`tel:${answers.phone}`}
														class="text-blue-500 underline hover:text-primary"
													>
														{answers.phone}
													</a>
												{/if}
												<a
													href={`mailto:${request.email}`}
													title={request.email}
													class="max-w-full truncate text-blue-500 underline hover:text-primary"
												>
													{request.email}
												</a>
											</div>

											<!-- Le résumé qui aide à comparer les demandes d'un coup d'œil -->
											<p class="text-muted-foreground">
												{answers.housingSize ?? '—'} m² ·
												{answers.hasGarden ? 'extérieur' : 'sans extérieur'} ·
												{children} enfant{children > 1 ? 's' : ''} ·
												{answers.hasPets ? 'a des animaux' : "pas d'animaux"}
											</p>

											<Button
												size="sm"
												variant="outline"
												class="w-fit justify-self-end"
												onclick={() => (openRequestId = request.id)}
											>
												Traiter
											</Button>
										</div>
									{/each}
								</div>
							</SectionCard>
						{/if}

						<!-- Familles d'accueil -->
						<SectionCard
							icon={CAT_SECTION_CONFIG.host.icon}
							title={CAT_SECTION_CONFIG.host.label}
							color={CAT_SECTION_CONFIG.host.color}
						>
							{#snippet action()}
								{#if isAdmin}
									<PlacementCreateForm catId={cat.id} {cat} hosts={hosts ?? []} />
								{/if}
							{/snippet}

							{#if activePlacements.length > 0}
								<div class="ml-0 grid gap-4 sm:ml-6">
									{@render placementGroup('FA (Proposition)', activeProposalPlacements)}
									{@render placementGroup('FA (Transfert)', activeTransferPlacements)}
									{@render placementGroup(
										'FA (Classic)',
										activeLongPlacement ? [activeLongPlacement] : []
									)}
									{@render placementGroup(
										'FA (Relais)',
										activeShortPlacement ? [activeShortPlacement] : []
									)}
								</div>
							{:else}
								<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
									<p>Aucune FA associée à ce chat</p>
								</div>
							{/if}
						</SectionCard>
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
					<SectionCard
						icon={CAT_SECTION_CONFIG.sicknesses.icon}
						title={CAT_SECTION_CONFIG.sicknesses.label}
						color={CAT_SECTION_CONFIG.sicknesses.color}
					>
						{#snippet action()}
							{#if canManageCat}
								<SicknessEditForm catId={cat.id} />
							{/if}
						{/snippet}

						{#if activeSicknesses.length > 0}
							<div class="space-y-4">
								{#each activeSicknesses as sickness (sickness.id)}
									<!-- PC : 1 + 2 + 2 colonnes | Mobile : empilé -->
									<div
										class="relative grid grid-cols-1 gap-3 rounded-xl border border-lime-500 bg-lime-100 px-4 py-2 pr-12 text-sm sm:grid-cols-5 sm:gap-4"
									>
										<div class="sm:col-span-1">
											<span class="block text-xs text-muted-foreground">
												Maladie {sicknessStatus[sickness.status as SicknessStatus]}
											</span>
											<span class="font-medium">{sickness.name}</span>

											<div class="flex gap-2 pt-2">
												<div>
													<span class="block text-xs text-muted-foreground">Début</span>
													<span class="text-xs">{formatDateNum(sickness.startDate)}</span>
												</div>
												{#if sickness.endDate}
													<div>
														<span class="block text-xs text-muted-foreground">Fin</span>
														<span class="text-xs">{formatDateNum(sickness.endDate)}</span>
													</div>
												{/if}
											</div>
										</div>
										{#if sickness.description}
											<div class="sm:col-span-2">
												<span class="block text-xs text-muted-foreground">Description</span>
												<p class="text-xs whitespace-pre-line">{sickness.description}</p>
											</div>
										{/if}
										<div class="sm:col-span-2">
											<span class="block text-xs text-muted-foreground">Traitement</span>
											<span class="text-xs">{sickness.treatment ?? '—'}</span>
										</div>

										{#if canManageCat}
											<div class="absolute top-1 right-1">
												<SicknessEditForm catId={cat.id} {sickness} />
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
								<p>Aucune maladie active</p>
							</div>
						{/if}
					</SectionCard>

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
					<Accordion.Root type="single">
						<Accordion.Item value="history" class="border-0">
							<Accordion.Trigger class="py-2 text-base font-semibold hover:no-underline sm:text-lg">
								<div class="flex items-center gap-2">
									<Icon name="history" class="h-5 w-5 text-slate-600" />
									<span>Historique des placements</span>
									<Badge variant="secondary" class="ml-2">{stoppedPlacements.length}</Badge>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								{#if stoppedPlacements.length > 0}
									<div class="grid gap-2">
										{#each stoppedPlacements as placement (placement.id)}
											{@render placementCard(placement, true)}
										{/each}
									</div>
								{:else}
									<p class="py-2 text-sm text-muted-foreground">Aucun placement terminé.</p>
								{/if}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
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
