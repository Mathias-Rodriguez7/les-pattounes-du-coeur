<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
	import type { HostFull, HostEditData } from '$lib/types/';
	import type { ColabActivity, HostType, Heal, Socialize, BabyFeeding } from '@prisma/client';
	import { healLabel, socializeLabel, babyFeedingLabel } from '$lib/types/';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import HostEditForm from './HostEditForm.svelte';
	import { formatAge } from '$lib/utils/age';
	import PlacementCard from '../PlacementCard.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { HOST_SECTION_CONFIG, STATUS_CONFIG, TYPE_COLORS } from '$lib/constants/host';
	import SectionCard from '../cards/SectionCard.svelte';
	import { formatDate } from '$lib/utils/date';
	import { PLACEMENT_TYPE_COLORS, PLACEMENT_TYPE_LABELS } from '$lib/constants/placement';

	const { host, isAdmin = false }: { host: HostFull | null; isAdmin?: boolean } = $props();

	let isEditing = $state(false);

	let editData = $state<HostEditData>({
		// Profil
		firstName: '',
		lastName: '',
		birthDate: new Date(),
		email: '',
		phone: '',
		district: '',
		address: '',
		city: '',
		postalCode: '',
		// Host
		actif: 'ACTIVE' as ColabActivity,
		breakStart: null,
		breakEnd: null,
		type: 'CLASSIC' as HostType,
		isAvailable: false,
		// Zone d'accueil
		space: 0,
		outside: false,
		car: false,
		isStockFeed: false,
		// Animaux
		hasAnimalsAtHome: false,
		numberOfCatsAtHome: 0,
		numberOfDogsAtHome: 0,
		otherAnimalsAtHome: '',
		// Capacités
		heal: 'NO' as Heal,
		socialize: 'NO' as Socialize,
		babyFeeding: 'NO' as BabyFeeding,
		// Chats acceptés
		catAdult: 0,
		kittyAndKitten: false,
		kitten: 0,
		// Descriptions
		homeDescription: '',
		presence: '',
		outsideDescription: '',
		stopActivity: '',
		additionalInformation: ''
	});

	const startEditing = () => {
		if (!host) return;

		editData = {
			firstName: host.profil.firstName,
			lastName: host.profil.lastName,
			birthDate: host.profil.birthDate ? new Date(host.profil.birthDate) : new Date(),
			email: host.profil.email,
			phone: host.profil.phone,
			district: host.profil.district || '',
			address: host.profil.address,
			city: host.profil.city,
			postalCode: host.profil.postalCode,

			actif: host.actif ?? undefined,
			breakStart: host.breakStart ? new Date(host.breakStart) : null,
			breakEnd: host.breakEnd ? new Date(host.breakEnd) : null,
			type: host.type ?? undefined,
			isAvailable: host.isAvailable,

			space: host.space,
			outside: host.outside,
			car: host.car,
			isStockFeed: host.isStockFeed,

			hasAnimalsAtHome: host.hasAnimalsAtHome,
			numberOfCatsAtHome: host.numberOfCatsAtHome || 0,
			numberOfDogsAtHome: host.numberOfDogsAtHome || 0,
			otherAnimalsAtHome: host.otherAnimalsAtHome || '',

			heal: host.heal,
			socialize: host.socialize,
			babyFeeding: host.babyFeeding,

			catAdult: host.catAdult || 0,
			kittyAndKitten: host.kittyAndKitten,
			kitten: host.kitten || 0,

			homeDescription: host.homeDescription,
			presence: host.presence,
			outsideDescription: host.outsideDescription || '',
			// null en base, '' dans le formulaire (comme les valeurs de départ plus haut)
			stopActivity: host.stopActivity ?? '',
			additionalInformation: host.additionalInformation ?? ''
		};

		isEditing = true;
	};

	// HostEditForm appelle update() : les données sont rechargées depuis le serveur
	const handleSuccessfulSave = () => {
		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	// ===== DÉRIVÉS =====
	const fullName = $derived(host ? `${host.profil.firstName} ${host.profil.lastName}` : '');

	const location = $derived(
		host?.profil.district
			? DISTRICT_LABELS[host.profil.district as keyof typeof DISTRICT_LABELS]
			: host?.profil.city || '—'
	);

	const currentStatus = $derived(
		host?.actif && host.actif in STATUS_CONFIG ? STATUS_CONFIG[host.actif] : STATUS_CONFIG.ACTIVE
	);

	// Le type peut ne pas être renseigné en base
	const typeInfo = $derived(host?.type ? TYPE_COLORS[host.type] : null);

	const isOnBreak = $derived(host?.actif === 'BREAK' && !!(host.breakStart || host.breakEnd));

	const placementStats = $derived(host?.placementStats || { long: 0, short: 0, total: 0 });

	type Placement = NonNullable<HostFull['placements']>[number];

	const placements = $derived<Placement[]>(host?.placements ?? []);
	const isActive = (p: Placement) => p.status === 'ACTIVE' || p.status === 'BREAK';

	// Chaque liste est calculée UNE fois (avant : 2 appels de fonction par colonne)
	const activePlacements = $derived(placements.filter(isActive));
	const proposalPlacements = $derived(activePlacements.filter((p) => p.type === 'PROPOSAL'));
	const transferPlacements = $derived(activePlacements.filter((p) => p.type === 'TRANSFER'));
	const longShortPlacements = $derived(
		activePlacements.filter((p) => p.type === 'LONG' || p.type === 'SHORT')
	);
	const historicalPlacements = $derived(
		placements.filter((p) => p.status === 'STOP' && (p.type === 'LONG' || p.type === 'SHORT'))
	);
</script>

<!-- Une colonne de placements actifs (même rendu qu'avant, écrit une seule fois) -->
{#snippet placementColumn(title: string, dotClass: string, textClass: string, list: Placement[])}
	<div class="space-y-3">
		<h4 class="flex items-center gap-2 text-sm font-semibold {textClass}">
			<span class="h-3 w-3 rounded-full {dotClass}"></span>
			{title}
		</h4>
		<div class="space-y-2">
			{#each list as placement (placement.id)}
				<PlacementCard {placement} />
			{:else}
				<p class="text-xs text-gray-500 italic">Aucun</p>
			{/each}
		</div>
	</div>
{/snippet}

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<!-- PC : ta ligne d'origine (h-25) | Mobile : le bloc pause passe à la ligne -->
				<section class="flex justify-between gap-4 lg:h-25">
					<div class="flex min-w-0 flex-wrap gap-4 lg:flex-nowrap lg:gap-8">
						<!-- Status Icon -->
						<div class="flex flex-col items-center justify-around gap-2">
							{#key host.actif}
								<Icon
									name={currentStatus.icon}
									withWrapper={true}
									wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle(currentStatus.theme)}"
									iconClass="h-6 w-6"
								/>
							{/key}
							<Badge class={typeInfo?.color ?? 'bg-gray-100 text-gray-800'}>
								{typeInfo?.label ?? 'Type non renseigné'}
							</Badge>
						</div>

						<!-- Infos personnelles -->
						<div class="flex min-w-0 flex-col justify-between gap-1">
							<Card.Title class="text-xl sm:text-2xl">{fullName}</Card.Title>

							<div class="flex flex-wrap items-center gap-2 lg:gap-4">
								<Card.Description class="text-lg sm:text-xl">
									{formatAge(host.profil.birthDate)}
								</Card.Description>
								<Badge
									class={host.isAvailable
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}
								>
									{host.isAvailable ? '✓ Disponible' : '✗ Non disponible'}
								</Badge>

								{#if host.profil.volunteer}
									<div title="Cette FA est aussi bénévole">
										<Icon name="star" iconClass="h-6 w-6 text-amber-500 fill-amber-500" />
									</div>
								{/if}
							</div>
						</div>

						<!-- PAUSE : pleine largeur sur mobile, à côté des infos sur PC -->
						{#if isOnBreak}
							<div class="basis-full lg:basis-auto">
								<SectionCard
									icon={HOST_SECTION_CONFIG.pause.icon}
									title={HOST_SECTION_CONFIG.pause.label}
									color={HOST_SECTION_CONFIG.pause.color}
								>
									<div class="ml-6 grid gap-4">
										<div class="text-sm">
											{#if host.breakStart}
												<p class="font-medium text-gray-900">
													Début : {formatDate(new Date(host.breakStart))}
												</p>
											{/if}
											{#if host.breakEnd}
												<p class="font-medium text-gray-900">
													Fin : {formatDate(new Date(host.breakEnd))}
												</p>
											{/if}
										</div>
									</div>
								</SectionCard>
							</div>
						{/if}
					</div>

					<!-- Bouton édition -->
					{#if isAdmin}
						<Button
							variant="ghost"
							size="icon"
							onclick={startEditing}
							class="shrink-0"
							aria-label="Modifier la famille d'accueil"
						>
							<Pencil class="h-5 w-5" />
						</Button>
					{/if}
				</section>
			</Card.Header>

			<!-- Contenu principal -->
			<Card.Content class="space-y-6">
				<Separator />

				<!-- PC : Expérience (1/5) + Adresse et Contact (4/5) | Mobile : empilés -->
				<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
					<!-- Expérience -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.Experience.icon}
						title={HOST_SECTION_CONFIG.Experience.label}
						color={HOST_SECTION_CONFIG.Experience.color}
					>
						<div class="ml-6 flex flex-wrap gap-2 lg:grid lg:gap-4">
							<Badge class="bg-purple-100 text-xs text-purple-800">
								🔵 Long : {placementStats.long}
							</Badge>
							<Badge class="bg-orange-100 text-xs text-orange-800">
								🟠 Relais : {placementStats.short}
							</Badge>
							<Badge class="bg-blue-100 text-xs text-blue-800">
								Total : {placementStats.total}
							</Badge>
						</div>
					</SectionCard>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-4">
						<!-- Adresse -->
						<SectionCard
							icon={HOST_SECTION_CONFIG.address.icon}
							title={HOST_SECTION_CONFIG.address.label}
							color={HOST_SECTION_CONFIG.address.color}
						>
							<div class="ml-6 space-y-2 text-sm">
								<div>
									<p class="font-medium text-muted-foreground">Rue</p>
									<p class="font-medium text-gray-900">{host.profil.address || '—'}</p>
								</div>
								<div class="flex flex-wrap gap-x-4 gap-y-2">
									<div>
										<p class="font-medium text-muted-foreground">Ville</p>
										<p class="font-medium text-gray-900">{host.profil.city || '—'}</p>
									</div>
									<div>
										<p class="font-medium text-muted-foreground">CP</p>
										<p class="font-medium text-gray-900">{host.profil.postalCode || '—'}</p>
									</div>
									<div>
										<p class="font-medium text-muted-foreground">Quartier</p>
										<Badge variant="secondary" class="mt-1 h-fit text-xs">{location}</Badge>
									</div>
								</div>
							</div>
						</SectionCard>

						<!-- Contact -->
						<SectionCard
							icon={HOST_SECTION_CONFIG.contact.icon}
							title={HOST_SECTION_CONFIG.contact.label}
							color={HOST_SECTION_CONFIG.contact.color}
						>
							<div class="ml-6 grid min-w-0 gap-4">
								<div>
									<p class="font-medium text-muted-foreground">Tel</p>
									<div class="flex items-center gap-2">
										<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
										<a href="tel:{host.profil.phone}" class="text-sm text-blue-600 hover:underline">
											{host.profil.phone || '—'}
										</a>
									</div>
								</div>

								<div class="min-w-0">
									<p class="font-medium text-muted-foreground">Mail</p>
									<div class="flex min-w-0 items-center gap-2">
										<Icon name="mail" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
										<a
											href="mailto:{host.profil.email}"
											class="truncate text-sm text-blue-600 hover:underline"
											title={host.profil.email}
										>
											{host.profil.email}
										</a>
									</div>
								</div>
							</div>
						</SectionCard>
					</div>
				</section>

				<Separator />

				<!-- Placements -->
				<section class="space-y-8">
					<SectionCard
						icon={HOST_SECTION_CONFIG.placements.icon}
						title={HOST_SECTION_CONFIG.placements.label}
						color={HOST_SECTION_CONFIG.placements.color}
					>
						{#if activePlacements.length > 0}
							<div>
								<h3 class="mb-4 text-lg font-semibold text-gray-900">Placements actifs</h3>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
									{@render placementColumn(
										PLACEMENT_TYPE_LABELS.PROPOSAL,
										PLACEMENT_TYPE_COLORS.PROPOSAL.dot,
										PLACEMENT_TYPE_COLORS.PROPOSAL.text,
										proposalPlacements
									)}
									{@render placementColumn(
										PLACEMENT_TYPE_LABELS.TRANSFER,
										PLACEMENT_TYPE_COLORS.TRANSFER.dot,
										PLACEMENT_TYPE_COLORS.TRANSFER.text,
										transferPlacements
									)}
									{@render placementColumn(
										'Accueil (Long/Relais)',
										PLACEMENT_TYPE_COLORS.LONG.dot,
										PLACEMENT_TYPE_COLORS.LONG.text,
										longShortPlacements
									)}
								</div>
							</div>
						{:else}
							<div
								class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12"
							>
								<Icon name="FileText" class="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
								<p class="text-sm text-muted-foreground">Aucun placement pour cet accueillant</p>
							</div>
						{/if}
					</SectionCard>
				</section>

				<Separator />

				<!-- PC : 4 colonnes | Tablette : 2 | Mobile : 1 -->
				<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<!-- Zone d'accueil -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.home.icon}
						title={HOST_SECTION_CONFIG.home.label}
						color={HOST_SECTION_CONFIG.home.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="flex items-center gap-1 text-sm">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">{host.space || '—'} m²</Badge>
							</div>
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="flex items-center gap-1 text-sm">Extérieur</span>
									<BooleanIcon value={host.outside} />
								</div>
								<div class="flex items-center justify-between">
									<span class="flex items-center gap-1 text-sm">Voiture</span>
									<BooleanIcon value={host.car} />
								</div>
								<div class="flex items-center justify-between">
									<span class="flex items-center gap-1 text-sm">Stock</span>
									<BooleanIcon value={host.isStockFeed} />
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- Animaux -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.animals.icon}
						title={HOST_SECTION_CONFIG.animals.label}
						color={HOST_SECTION_CONFIG.animals.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between pb-2">
								<span class="font-medium text-muted-foreground">Animaux dans le foyer</span>
								<BooleanIcon value={host.hasAnimalsAtHome} />
							</div>
							<Separator />
							{#if host.hasAnimalsAtHome}
								<div class="space-y-1">
									<div class="flex items-center justify-between">
										<span class="flex items-center gap-1 text-sm">🐱 Chats</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfCatsAtHome || 0}
										</Badge>
									</div>
									<div class="flex items-center justify-between">
										<span class="flex items-center gap-1 text-sm">🐕 Chiens</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfDogsAtHome || 0}
										</Badge>
									</div>
									{#if host.otherAnimalsAtHome}
										<div class="flex items-center justify-between gap-2">
											<span class="flex items-center gap-1 text-sm">🐾 Autres</span>
											<Badge variant="outline" class="h-fit max-w-32 truncate text-xs">
												{host.otherAnimalsAtHome}
											</Badge>
										</div>
									{/if}
								</div>
							{:else}
								<p class="text-muted-foreground italic">Aucun animal</p>
							{/if}
						</div>
					</SectionCard>

					<!-- Capacités -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.capacity.icon}
						title={HOST_SECTION_CONFIG.capacity.label}
						color={HOST_SECTION_CONFIG.capacity.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Soins</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[host.heal as Heal]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[host.socialize as Socialize]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Biberonnage</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{babyFeedingLabel[host.babyFeeding as BabyFeeding]}
								</Badge>
							</div>
						</div>
					</SectionCard>

					<!-- Type de chat -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.cat.icon}
						title={HOST_SECTION_CONFIG.cat.label}
						color={HOST_SECTION_CONFIG.cat.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chat adulte</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">{host.catAdult || '—'}</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chatte avec portée</span>
								<BooleanIcon value={host.kittyAndKitten} />
							</div>
							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chaton</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">{host.kitten || '—'}</Badge>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- Descriptions -->
				<section class="grid grid-cols-1 gap-6">
					{#if host.homeDescription}
						<SectionCard
							icon={HOST_SECTION_CONFIG.homeDescription.icon}
							title={HOST_SECTION_CONFIG.homeDescription.label}
							color={HOST_SECTION_CONFIG.homeDescription.color}
						>
							<p class="text-sm whitespace-pre-line text-gray-700">{host.homeDescription}</p>
						</SectionCard>
					{/if}

					{#if host.presence}
						<SectionCard
							icon={HOST_SECTION_CONFIG.presence.icon}
							title={HOST_SECTION_CONFIG.presence.label}
							color={HOST_SECTION_CONFIG.presence.color}
						>
							<p class="text-sm whitespace-pre-line text-gray-700">{host.presence}</p>
						</SectionCard>
					{/if}

					{#if host.outside && host.outsideDescription}
						<SectionCard
							icon={HOST_SECTION_CONFIG.outsideDescription.icon}
							title={HOST_SECTION_CONFIG.outsideDescription.label}
							color={HOST_SECTION_CONFIG.outsideDescription.color}
						>
							<p class="text-sm whitespace-pre-line text-gray-700">{host.outsideDescription}</p>
						</SectionCard>
					{/if}

					{#if host.stopActivity && host.actif === 'STOP'}
						<SectionCard
							icon={HOST_SECTION_CONFIG.stopActivity.icon}
							title={HOST_SECTION_CONFIG.stopActivity.label}
							color={HOST_SECTION_CONFIG.stopActivity.color}
						>
							<p class="text-sm whitespace-pre-line text-gray-700">{host.stopActivity}</p>
						</SectionCard>
					{/if}

					{#if host.additionalInformation}
						<SectionCard
							icon={HOST_SECTION_CONFIG.additionalInformation.icon}
							title={HOST_SECTION_CONFIG.additionalInformation.label}
							color={HOST_SECTION_CONFIG.additionalInformation.color}
						>
							<p class="text-sm whitespace-pre-line text-gray-700">
								{host.additionalInformation}
							</p>
						</SectionCard>
					{/if}
				</section>

				<Separator />

				<!-- HISTORIQUE DES PLACEMENTS -->
				<section class="mt-6">
					<Accordion.Root type="single">
						<Accordion.Item value="history">
							<Accordion.Trigger class="py-4 text-base font-semibold hover:no-underline sm:text-lg">
								<div class="flex items-center gap-2">
									<Icon name="history" class="h-5 w-5 text-slate-600" />
									<span>Historique des placements</span>
									<Badge variant="secondary" class="ml-2">
										{historicalPlacements.length}
									</Badge>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
									{#each historicalPlacements as placement (placement.id)}
										<PlacementCard {placement} isHistory={true} />
									{/each}
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</section>
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6">
				<HostEditForm
					bind:editData
					hostId={host.id}
					profileId={host.profilId}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="house" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une famille d'accueil</p>
		</Card.Content>
	</Card.Root>
{/if}
