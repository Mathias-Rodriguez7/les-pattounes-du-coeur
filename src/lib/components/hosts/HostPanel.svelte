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
	import { truncate } from '$lib/utils/string';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import HostEditForm from './HostEditForm.svelte';
	import { formatAge } from '$lib/utils/age';
	import PlacementCard from '../PlacementCard.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { HOST_SECTION_CONFIG } from '$lib/constants/host';
	import SectionCard from '../cards/SectionCard.svelte';
	import { formatDate } from '$lib/utils/date';

	const { host = $bindable<HostFull | undefined>(), isAdmin = false } = $props();

	let isEditing = $state(false);

	// 1️⃣ DÉCLARER TOUS LES CHAMPS ÉDITABLES ICI
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

		// Host spécifiques
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

		// Cat
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

	// 2️⃣ REMPLIR editData À PARTIR DU host
	const startEditing = () => {
		if (!host) return;

		editData = {
			// Profil
			firstName: host.profil.firstName,
			lastName: host.profil.lastName,
			birthDate: host.profil.birthDate ? new Date(host.profil.birthDate) : new Date(),
			email: host.profil.email,
			phone: host.profil.phone,
			district: host.profil.district || '',
			address: host.profil.address,
			city: host.profil.city,
			postalCode: host.profil.postalCode,

			// Host spécifiques
			actif: host.actif || '',
			breakStart: host.breakStart ? new Date(host.breakStart) : null,
			breakEnd: host.breakEnd ? new Date(host.breakEnd) : null,
			type: host.type || '',
			isAvailable: host.isAvailable,

			// Zone d'accueil
			space: host.space,
			outside: host.outside,
			car: host.car,
			isStockFeed: host.isStockFeed,

			// Animaux
			hasAnimalsAtHome: host.hasAnimalsAtHome,
			numberOfCatsAtHome: host.numberOfCatsAtHome || 0,
			numberOfDogsAtHome: host.numberOfDogsAtHome || 0,
			otherAnimalsAtHome: host.otherAnimalsAtHome || '',

			// Capacités
			heal: host.heal,
			socialize: host.socialize,
			babyFeeding: host.babyFeeding,

			// Cat
			catAdult: host.catAdult || 0,
			kittyAndKitten: host.kittyAndKitten,
			kitten: host.kitten || 0,

			// Descriptions
			homeDescription: host.homeDescription,
			presence: host.presence,
			outsideDescription: host.outsideDescription || '',
			stopActivity: host.stopActivity,
			additionalInformation: host.additionalInformation
		};

		isEditing = true;
	};

	// 3️⃣ METTRE À JOUR host APRÈS SUCCÈS
	const handleSuccessfulSave = () => {
		if (!host) return;

		// Profil
		host.profil.firstName = editData.firstName;
		host.profil.lastName = editData.lastName;
		host.profil.birthDate = editData.birthDate;
		host.profil.email = editData.email;
		host.profil.phone = editData.phone;
		host.profil.district = editData.district;
		host.profil.address = editData.address;
		host.profil.city = editData.city;
		host.profil.postalCode = editData.postalCode;

		// Host
		host.actif = editData.actif;
		host.breakStart = editData.breakStart;
		host.breakEnd = editData.breakEnd;
		host.type = editData.type;
		host.isAvailable = editData.isAvailable;
		host.space = editData.space;
		host.presence = editData.presence;
		host.outside = editData.outside;
		host.car = editData.car;
		host.isStockFeed = editData.isStockFeed;
		host.hasAnimalsAtHome = editData.hasAnimalsAtHome;
		host.numberOfCatsAtHome = editData.numberOfCatsAtHome;
		host.numberOfDogsAtHome = editData.numberOfDogsAtHome;
		host.otherAnimalsAtHome = editData.otherAnimalsAtHome;
		host.heal = editData.heal;
		host.socialize = editData.socialize;
		host.babyFeeding = editData.babyFeeding;
		host.homeDescription = editData.homeDescription;
		host.outsideDescription = editData.outsideDescription;
		host.stopActivity = editData.stopActivity;
		host.additionalInformation = editData.additionalInformation;

		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	const placementStats = $derived(host?.placementStats || { long: 0, short: 0, total: 0 });

	const STATUS_CONFIG: Record<string, { label: string; icon: string; theme: string }> = {
		ACTIVE: { label: 'En activité', icon: 'CirclePlay', theme: 'activ' },
		BREAK: { label: 'En pause', icon: 'CirclePause', theme: 'break' },
		STOP: { label: 'Arrêté', icon: 'CircleX', theme: 'stop' }
	};

	const TYPE_COLORS: Record<string, { label: string; color: string }> = {
		CLASSIC: { label: 'Accueil Long', color: 'bg-purple-100 text-purple-800' },
		SOS: { label: 'Sos', color: 'bg-orange-100 text-orange-800' },
		ADOPT: { label: 'Adoption', color: 'bg-green-100 text-green-800' },
		PROPRIO: { label: 'Propriétaire', color: 'bg-cyan-100 text-cyan-800' },
		RELAY: { label: 'Relais', color: 'bg-pink-100 text-pink-800' }
	};

	// États dérivés
	const fullName = $derived(host ? `${host.profil.firstName} ${host.profil.lastName}` : '');

	const location = $derived(
		host?.profil.district
			? DISTRICT_LABELS[host.profil.district as keyof typeof DISTRICT_LABELS]
			: host?.profil.city || '—'
	);

	const currentStatus = $derived(
		host?.actif && host.actif in STATUS_CONFIG ? STATUS_CONFIG[host.actif] : STATUS_CONFIG.ACTIVE
	);

	const getPlacementsByType = (type: string, isActive: boolean) => {
		return (
			host?.placements?.filter(
				(p: (typeof host.placements)[number]) => p.type === type && p.isActive === isActive
			) || []
		);
	};

	const activePlacements = $derived(
		host?.placements?.filter((p: (typeof host.placements)[number]) => p.isActive) || []
	);

	const historicalPlacements = $derived(
		host?.placements?.filter(
			(p: (typeof host.placements)[number]) =>
				!p.isActive && (p.type === 'LONG' || p.type === 'SHORT')
		) || []
	);

	const longShortActivePlacements = $derived(
		host?.placements?.filter(
			(p: (typeof host.placements)[number]) =>
				(p.type === 'LONG' || p.type === 'SHORT') && p.isActive
		) || []
	);
</script>

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<section class="flex h-25 justify-between">
					<div class="flex gap-8">
						<!-- Status Icon -->
						<div class="flex flex-col items-center justify-around">
							{#key host?.actif}
								<Icon
									name={currentStatus.icon}
									withWrapper={true}
									wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle(currentStatus.theme)}"
									iconClass="h-6 w-6"
								/>
							{/key}
							<Badge class={TYPE_COLORS[host.type]?.color || 'bg-gray-100 text-gray-800'}>
								{TYPE_COLORS[host.type]?.label}
							</Badge>
						</div>

						<!-- Infos personnelles -->
						<div class="flex flex-col justify-between">
							<Card.Title class="text-2xl">{fullName}</Card.Title>

							<div class="flex gap-4">
								<Card.Description class="text-xl">
									{formatAge(host.profil.birthDate)}
								</Card.Description>
								<Badge
									variant={host.isAvailable ? 'default' : 'secondary'}
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

						<!-- PAUSE / BREAK -->
						{#if host.actif === 'BREAK' && (host.breakStart || host.breakEnd)}
							<SectionCard
								icon={HOST_SECTION_CONFIG.pause.icon}
								title={HOST_SECTION_CONFIG.pause.label}
								color={HOST_SECTION_CONFIG.pause.color}
							>
								<div class="ml-6 grid gap-4">
									<div class="text-sm">
										{#if host.breakStart}
											<p class="font-medium text-gray-900">
												Début: {formatDate(new Date(host.breakStart))}
											</p>
										{/if}
										{#if host.breakEnd}
											<p class="font-medium text-gray-900">
												Fin: {formatDate(new Date(host.breakEnd))}
											</p>
										{/if}
									</div>
								</div>
							</SectionCard>
						{:else}{/if}
					</div>

					<!-- Bouton édition -->
					{#if isAdmin}
						<Button variant="ghost" size="icon" onclick={startEditing} class="shrink-0">
							<Pencil class="h-5 w-5" />
						</Button>
					{/if}
				</section>
			</Card.Header>

			<!-- Contenu principal -->
			<Card.Content class="space-y-6 overflow-y-auto">
				<Separator />
				<section class="grid grid-cols-5 gap-4">
					<!-- Experience -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.Experience.icon}
						title={HOST_SECTION_CONFIG.Experience.label}
						color={HOST_SECTION_CONFIG.Experience.color}
					>
						<!-- Experience -->
						<div class="col-span-1 flex flex-col justify-between">
							<div>
								<div class="ml-6 grid gap-4">
									<Badge class="bg-purple-100 text-xs text-purple-800">
										🔵 Long: {placementStats.long}
									</Badge>
									<Badge class="bg-orange-100 text-xs text-orange-800">
										🟠 Relais: {placementStats.short}
									</Badge>
									<Badge class="bg-blue-100 text-xs text-blue-800">
										Total: {placementStats.total}
									</Badge>
								</div>
							</div>
						</div>
					</SectionCard>

					<div class="col-span-4 grid grid-cols-2 gap-4">
						<!-- Adresse -->
						<SectionCard
							icon={HOST_SECTION_CONFIG.address.icon}
							title={HOST_SECTION_CONFIG.address.label}
							color={HOST_SECTION_CONFIG.address.color}
						>
							<div class="grid gap-4">
								<div class="col-span-2 ml-6 gap-4 space-y-2 text-sm">
									<div>
										<p class="text-muted-foreground font-medium">Rue</p>
										<p class="font-medium text-gray-900">{host.profil.address || '—'}</p>
									</div>
									<div class="flex gap-4">
										<div>
											<p class="text-muted-foreground font-medium">Ville</p>
											<p class="font-medium text-gray-900">{host.profil.city || '—'}</p>
										</div>
										<div>
											<p class="text-muted-foreground font-medium">CP</p>
											<p class="font-medium text-gray-900">{host.profil.postalCode || '—'}</p>
										</div>

										<div>
											<p class="text-muted-foreground font-medium">Quartier</p>
											<Badge variant="secondary" class="mt-1 h-fit text-xs">{location}</Badge>
										</div>
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
							<div class="ml-6 grid gap-4">
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-6 w-6 text-muted-foreground" />
									<a href="tel:{host.profil.phone}" class="text-sm text-blue-600 hover:underline">
										{host.profil.phone || '—'}
									</a>
								</div>

								<div class="flex items-center gap-2">
									<Icon name="mail" iconClass="h-6 w-6 text-muted-foreground" />
									<a
										href="mailto:{host.profil.email}"
										class="truncate text-sm text-blue-600 hover:underline"
										title={host.profil.email}
									>
										{truncate(host.profil.email, 28)}
									</a>
								</div>
							</div>
						</SectionCard>
					</div>
				</section>
				<Separator />

				<!-- Grille 2 colonnes : Adresse & Infos maison + Capacités -->
				<section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<!-- Zone d'accueil -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.home.icon}
						title={HOST_SECTION_CONFIG.home.label}
						color={HOST_SECTION_CONFIG.home.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{host.space || '—'} m2
								</Badge>
							</div>

							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">Exterieur</span>
									<BooleanIcon value={host.outside} />
								</div>
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">Voiture</span>
									<BooleanIcon value={host.car} />
								</div>
								<div class="flex items-center justify-between">
									<span class="items-centern flex gap-1 text-sm">Stock</span>
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
							<div class="flex items-center justify-between border-b border-orange-100 pb-2">
								<span class="text-muted-foreground font-medium">Animeaux dans le foyer</span>
								<BooleanIcon value={host.hasAnimalsAtHome} />
							</div>
							{#if host.hasAnimalsAtHome}
								<div class="space-y-1">
									<div class="flex items-center justify-between">
										<span class="items-centern flex gap-1 text-sm">🐱 Chats</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfCatsAtHome || 0}
										</Badge>
									</div>
									<div class="flex items-center justify-between">
										<span class="items-centern flex gap-1 text-sm">🐕 Chiens</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfDogsAtHome || 0}
										</Badge>
									</div>
									{#if host.otherAnimalsAtHome}
										<div class="flex items-center justify-between">
											<span class="items-centern flex gap-1 text-sm">🐾 Autres</span>
											<Badge variant="outline" class="h-fit text-xs">
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
								<p class="text-muted-foregroundfont-medium">Soins</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[host.heal as Heal]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground font-medium">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[host.socialize as Socialize]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground font-medium">Biberonnage</p>
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
								<span class="text-muted-foreground font-medium">Chat adulte</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{host.catAdult || '—'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Chatte avec portée</span>
								<BooleanIcon value={host.kittyAndKitten} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Chaton</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{host.kitten || '—'}
								</Badge>
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
							<p class="text-sm text-gray-700">{host.homeDescription}</p>
						</SectionCard>
					{/if}

					{#if host.presence}
						<SectionCard
							icon={HOST_SECTION_CONFIG.presence.icon}
							title={HOST_SECTION_CONFIG.presence.label}
							color={HOST_SECTION_CONFIG.presence.color}
						>
							<p class="text-sm text-gray-700">{host.presence}</p>
						</SectionCard>
					{/if}

					{#if host.outside && host.outsideDescription}
						<SectionCard
							icon={HOST_SECTION_CONFIG.outsideDescription.icon}
							title={HOST_SECTION_CONFIG.outsideDescription.label}
							color={HOST_SECTION_CONFIG.outsideDescription.color}
						>
							<p class="text-sm text-gray-700">{host.outsideDescription}</p>
						</SectionCard>
					{/if}

					{#if host.stopActivity && host.actif === 'STOP'}
						<SectionCard
							icon={HOST_SECTION_CONFIG.stopActivity.icon}
							title={HOST_SECTION_CONFIG.stopActivity.label}
							color={HOST_SECTION_CONFIG.stopActivity.color}
						>
							<p class="text-sm text-gray-700">{host.stopActivity}</p>
						</SectionCard>
					{/if}

					{#if host.additionalInformation}
						<SectionCard
							icon={HOST_SECTION_CONFIG.additionalInformation.icon}
							title={HOST_SECTION_CONFIG.additionalInformation.label}
							color={HOST_SECTION_CONFIG.additionalInformation.color}
						>
							<p class="text-sm text-gray-700">{host.additionalInformation}</p>
						</SectionCard>
					{/if}
				</section>

				<Separator />

				<!-- Placement -->
				<section class="space-y-8">
					{#if activePlacements.length > 0}
						<!-- PLACEMENTS ACTIFS -->
						<div>
							<h3 class="mb-4 text-lg font-semibold text-gray-900">Placements actifs</h3>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<!-- PROPOSAL -->
								<div class="space-y-3">
									<h4 class="flex items-center gap-2 text-sm font-semibold text-purple-700">
										<span class="h-3 w-3 rounded-full bg-purple-500"></span>
										Proposition
									</h4>
									<div class="space-y-2">
										{#each getPlacementsByType('PROPOSAL', true) as placement (placement.id)}
											<PlacementCard {placement} type="proposal" />
										{/each}
										{#if getPlacementsByType('PROPOSAL', true).length === 0}
											<p class="text-xs text-gray-500 italic">Aucun</p>
										{/if}
									</div>
								</div>

								<!-- TRANSFER -->
								<div class="space-y-3">
									<h4 class="flex items-center gap-2 text-sm font-semibold text-blue-700">
										<span class="h-3 w-3 rounded-full bg-blue-500"></span>
										Transfert
									</h4>
									<div class="space-y-2">
										{#each getPlacementsByType('TRANSFER', true) as placement (placement.id)}
											<PlacementCard {placement} type="transfer" />
										{/each}
										{#if getPlacementsByType('TRANSFER', true).length === 0}
											<p class="text-xs text-gray-500 italic">Aucun</p>
										{/if}
									</div>
								</div>

								<!-- LONG & SHORT -->
								<div class="space-y-3">
									<h4 class="flex items-center gap-2 text-sm font-semibold text-green-700">
										<span class="h-3 w-3 rounded-full bg-green-500"></span>
										Accueil (Long/Relais)
									</h4>
									<div class="space-y-2">
										{#each longShortActivePlacements as placement (placement.id)}
											<PlacementCard {placement} type={placement.type.toLowerCase()} />
										{/each}
										{#if longShortActivePlacements.length === 0}
											<p class="text-xs text-gray-500 italic">Aucun</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12"
						>
							<Icon name="FileText" class="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
							<p class="text-muted-foreground text-sm">Aucun placement pour cet accueillant</p>
						</div>
					{/if}
				</section>
				<Separator />

				<!-- HISTORIQUE DES PLACEMENTS -->
				<section class="mt-6">
					{#if historicalPlacements.length > 0}
						<Accordion.Root type="single">
							<Accordion.Item value="history">
								<Accordion.Trigger class="py-4 text-lg font-semibold hover:no-underline">
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
											<PlacementCard
												{placement}
												type={placement.type.toLowerCase()}
												isHistory={true}
											/>
										{/each}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					{/if}
				</section>
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6 overflow-y-auto">
				<!-- ===== ÉDITION ===== -->
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
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="house" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une famille d'accueil</p>
		</Card.Content>
	</Card.Root>
{/if}
