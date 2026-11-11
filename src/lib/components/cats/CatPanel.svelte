<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Camera } from '@lucide/svelte';
	import type { CatFull, CatEditData } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import type { VolunteerBasic } from '$lib/types/volunteer';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		statusLabel,
		hairLabel,
		vaccinateLabel,
		getLabel,
		getSexIcon
	} from '$lib/utils/catHelpers';
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
	const canManageSicknesses = $derived(isAdmin || !!cat?.isMine);

	// ===== ADOPTION =====
	// La section 2 affiche l'adoption à la place des placements si le chat est adopté.
	// Si l'adoption est annulée (statut changé), les placements reviennent automatiquement.
	const adoption = $derived(cat?.adoptions?.[0] ?? null);
	const isAdopted = $derived(cat?.status === 'ADOPTED' && adoption !== null);

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
						class="hover:text-primary text-xs text-blue-500 underline"
					>
						{placement.host.profil.phone}
					</a>
				</div>
				<div class="flex min-w-0 gap-2">
					<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
					<a
						href={`mailto:${placement.host.profil.email}`}
						class="hover:text-primary block text-xs break-all text-blue-500 underline"
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
				<span class="text-muted-foreground block text-xs">{label}</span>
				{#each list as placement (placement.id)}
					{@render placementCard(placement)}
				{/each}
			</div>
		{/if}
	{/snippet}

	<Card.Root class={!isEditing && !editingImage ? 'overflow-hidden pt-0' : ''}>
		{#if !isEditing && !editingImage}
			<!-- ============================================================ -->
			<!-- 1. EN-TÊTE : qui est ce chat ?                                 -->
			<!-- ============================================================ -->
			<Card.Header class="flex items-stretch gap-4 pl-0 sm:gap-6">
				<!-- Photo : collée au bord gauche, bord droit en arc de cercle -->
				<!-- Photo : clic = galerie. Souris : icône au survol | Tactile : pastille toujours visible -->
				<button
					type="button"
					onclick={() => (editingImage = true)}
					class="group bg-muted relative min-h-32 w-32 shrink-0 overflow-hidden rounded-r-full sm:w-40"
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
						<span class="text-muted-foreground flex h-full items-center justify-center">
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

				<!-- Infos + boutons -->
				<!-- Infos -->
				<div class="grid min-w-0 flex-1 content-start gap-2 pt-6 pr-6">
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
						<Card.Title class="text-xl sm:text-2xl">{cat.name ?? 'Sans nom'}</Card.Title>
						<span class="text-muted-foreground text-sm">{getAgeBadge(cat.birthDate)}</span>
						{#if sexIcon}
							<p class="flex items-center gap-1.5 font-medium">
								<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
								{sexIcon.label}
							</p>
						{/if}
					</div>

					<p class="text-muted-foreground text-sm">
						N° de suivi : <span class="text-foreground font-medium">{cat.catNumber}</span>
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
				</div>
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
												class="hover:text-primary text-xs text-blue-500 underline"
											>
												{profil.phone}
											</a>
										</div>
										<div class="flex min-w-0 gap-2">
											<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
											<a
												href={`mailto:${profil.email}`}
												class="hover:text-primary block text-xs break-all text-blue-500 underline"
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

					{#if isAdopted && adoption}
						<!-- Adoption : remplace les placements -->
						<SectionCard
							icon={CAT_SECTION_CONFIG.adoptions.icon}
							title={CAT_SECTION_CONFIG.adoptions.label}
							color={CAT_SECTION_CONFIG.adoptions.color}
						>
							<div class="ml-0 grid grid-cols-1 gap-6 text-sm sm:ml-6 sm:grid-cols-2">
								<div class="min-w-0 space-y-2">
									<h4 class="font-semibold">Adoptant</h4>
									{#if adoption.profil}
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Nom</span>
											<span>{adoption.profil.firstName} {adoption.profil.lastName}</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Téléphone</span>
											{#if adoption.profil.phone}
												<a
													href={`tel:${adoption.profil.phone}`}
													class="hover:text-primary text-blue-500 underline"
												>
													{adoption.profil.phone}
												</a>
											{:else}
												<span>—</span>
											{/if}
										</div>
										<div class="flex min-w-0 items-center justify-between gap-2">
											<span class="text-muted-foreground">Email</span>
											{#if adoption.profil.email}
												<a
													href={`mailto:${adoption.profil.email}`}
													class="hover:text-primary truncate text-blue-500 underline"
												>
													{adoption.profil.email}
												</a>
											{:else}
												<span>—</span>
											{/if}
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Adresse</span>
											<span class="text-right">{adoption.profil.address ?? '—'}</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="text-muted-foreground">Ville</span>
											<span>
												{adoption.profil.postalCode ?? ''}
												{adoption.profil.city ?? '—'}
											</span>
										</div>
									{:else}
										<p class="text-muted-foreground">Profil non disponible</p>
									{/if}
								</div>

								<div class="space-y-2">
									<h4 class="font-semibold">Adoption</h4>
									<div class="flex items-center justify-between gap-2">
										<span class="text-muted-foreground">Date d'adoption</span>
										<span>{formatDateNum(adoption.createdAt)}</span>
									</div>
								</div>
							</div>
						</SectionCard>
					{:else}
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
					{/if}
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

							<SectionCard
								icon={CAT_SECTION_CONFIG.compatibility.icon}
								title={CAT_SECTION_CONFIG.compatibility.label}
								color={CAT_SECTION_CONFIG.compatibility.color}
								class="lg:col-span-1"
							>
								<div class="ml-6 space-y-1">
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Chien</span>
										<BooleanIcon value={cat.isOkDog ?? false} />
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Chat</span>
										<BooleanIcon value={cat.isOkCat ?? false} />
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Enfant</span>
										<BooleanIcon value={cat.isOkChild ?? false} />
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Jardin</span>
										<BooleanIcon value={cat.isOutside ?? false} />
									</div>
								</div>
							</SectionCard>

							<SectionCard
								icon={CAT_SECTION_CONFIG.health.icon}
								title={CAT_SECTION_CONFIG.health.label}
								color={CAT_SECTION_CONFIG.health.color}
								class="sm:col-span-2"
							>
								<div class="ml-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
									<div class="grid grid-cols-2 gap-2 text-sm">
										<span class="text-muted-foreground">Vaccin</span>
										<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
										<span class="text-muted-foreground">Test FIV</span>
										<div class="flex justify-start">
											<BooleanIcon value={cat.isFivTest ?? false} />
										</div>
										<span class="text-muted-foreground">Vermifuge</span>
										<div class="flex justify-start">
											<BooleanIcon value={cat.isDeworming ?? false} />
										</div>
									</div>
									<div class="grid grid-cols-2 gap-2 text-sm">
										<span class="text-muted-foreground">Stérilisé·e</span>
										<div class="flex justify-start">
											<BooleanIcon
												value={(cat.isSterilize ?? false) || (cat.isAlreadySterilized ?? false)}
											/>
										</div>
										<span class="text-muted-foreground">Identifié·e</span>
										<div class="flex justify-start">
											<BooleanIcon value={cat.isIdentify ?? false} />
										</div>
										<span class="text-muted-foreground">Puce</span>
										<span class="break-all">{cat.chipId ?? '—'}</span>
									</div>
								</div>
							</SectionCard>
						</div>

						{#if cat.description}
							<SectionCard
								icon={CAT_SECTION_CONFIG.description.icon}
								title={CAT_SECTION_CONFIG.description.label}
								color={CAT_SECTION_CONFIG.description.color}
							>
								<p class="text-muted-foreground ml-6 text-xs whitespace-pre-line">
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
						{#if canManageSicknesses}
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
										<span class="text-muted-foreground block text-xs">
											Maladie {sicknessStatus[sickness.status as SicknessStatus]}
										</span>
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
										<div class="sm:col-span-2">
											<span class="text-muted-foreground block text-xs">Description</span>
											<p class="text-xs whitespace-pre-line">{sickness.description}</p>
										</div>
									{/if}
									<div class="sm:col-span-2">
										<span class="text-muted-foreground block text-xs">Traitement</span>
										<span class="text-xs">{sickness.treatment ?? '—'}</span>
									</div>

									{#if canManageSicknesses}
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
				<CatDocuments {cat} canManage={canManageSicknesses} />

				<Separator />

				<!-- ============================================================ -->
				<!-- 6. SOINS VÉTÉRINAIRES                                         -->
				<!-- ============================================================ -->
				<!-- Même règle que les maladies : admin, ou bénévole associée au chat -->
				<CatCares {cat} canManage={canManageSicknesses} />

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
								<p class="text-muted-foreground py-2 text-sm">Aucun placement terminé.</p>
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
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="cat" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un chat pour voir ses détails</p>
		</Card.Content>
	</Card.Root>
{/if}
