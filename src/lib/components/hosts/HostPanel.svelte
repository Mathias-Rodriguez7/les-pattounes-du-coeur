<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
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

	const { host = $bindable(), isAdmin = false } = $props();

	let isEditing = $state(false);

	// 1️⃣ DÉCLARER TOUS LES CHAMPS ÉDITABLES ICI
	let editData = $state({
		// Profil
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		district: '',
		address: '',
		city: '',
		postalCode: '',

		// Host spécifiques
		age: 0,
		job: '',
		actif: '',
		type: '',
		status: '',
		isAvailable: false,

		// Zone d'accueil
		space: '',
		presence: '',
		outside: false,
		car: false,
		isStockFeed: false,

		// Animaux
		hasAnimalsAtHome: false,
		numberOfCatsAtHome: 0,
		numberOfDogsAtHome: 0,
		otherAnimalsAtHome: '',

		// Capacités
		heal: '',
		socialize: '',
		babyFeeding: '',

		// Descriptions et durée
		homeDescription: '',
		outsideDescription: '',
		availabilityDuration: '',
		stopActivity: '',
		additionalInformation: ''
	});

	// 2️⃣ REMPLIR editData À PARTIR DU host
	const startEditing = () => {
		if (!host) return;

		editData = {
			firstName: host.profil.firstName,
			lastName: host.profil.lastName,
			email: host.profil.email,
			phone: host.profil.phone,
			district: host.profil.district || '',
			address: host.profil.address,
			city: host.profil.city,
			postalCode: host.profil.postalCode,
			age: host.age,
			job: host.job,
			actif: host.actif || '',
			type: host.type || '',
			status: host.status,
			isAvailable: host.isAvailable,
			space: host.space,
			presence: host.presence,
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
			homeDescription: host.homeDescription,
			outsideDescription: host.outsideDescription || '',
			availabilityDuration: host.availabilityDuration,
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
		host.profil.email = editData.email;
		host.profil.phone = editData.phone;
		host.profil.district = editData.district;
		host.profil.address = editData.address;
		host.profil.city = editData.city;
		host.profil.postalCode = editData.postalCode;

		// Host
		host.age = editData.age;
		host.job = editData.job;
		host.actif = editData.actif;
		host.type = editData.type;
		host.status = editData.status;
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
		host.availabilityDuration = editData.availabilityDuration;
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

	const SECTION_CONFIG = {
		address: { icon: 'map', label: 'Adresse' },
		home: { icon: 'house', label: "Zone d'acceuil" },
		animals: { icon: 'paw', label: 'Animaux' },
		capacity: { icon: 'heart', label: 'Capacités' },
		availability: { icon: 'Handshake', label: 'Colaboration' },
		homeDescription: { icon: 'house', label: 'Description du domicile' },
		outsideDescription: { icon: 'trees', label: 'Description du jardin' },
		stopActivity: { icon: 'CircleX', label: "Raison d'arrêt" },
		additionalInformation: { icon: 'plus', label: 'Infos additionnelles' }
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
		return host.placements?.filter((p) => p.type === type && p.isActive === isActive) || [];
	};

	const activePlacements = $derived(host.placements?.filter((p) => p.isActive) || []);
	const historicalPlacements = $derived(
		host.placements?.filter((p) => !p.isActive && (p.type === 'LONG' || p.type === 'SHORT')) || []
	);
</script>

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<section class="flex justify-between gap-8">
					<!-- Gauche : Statut + Infos -->
					<div class="flex flex-1 gap-8">
						<!-- Status Icon -->
						<div class="flex flex-col items-center gap-4">
							{#key host?.actif}
								<Icon
									name={currentStatus.icon}
									withWrapper={true}
									wrapperClass="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
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
							<Card.Title class="text-xl">{fullName}</Card.Title>

							<div class="flex gap-4">
								<Card.Description class="text-sm">
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
							</div>
						</div>

						<!-- Droite : Contact -->
						<div class="flex flex-col justify-between">
							<div>
								<span class="text-sm font-medium">Expérience d'accueil</span>
								<div class="mt-2 flex gap-2">
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

							<div class="flex items-end gap-6">
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
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-6 w-6 text-muted-foreground" />
									<a href="tel:{host.profil.phone}" class="text-sm text-blue-600 hover:underline">
										{host.profil.phone || '—'}
									</a>
								</div>
							</div>
						</div>
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

				<!-- Grille 2 colonnes : Adresse & Infos maison + Capacités -->
				<section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<!-- Adresse -->
					<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<Icon name={SECTION_CONFIG.address.icon} class="h-5 w-5 text-slate-700" />
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.address.label}</h4>
						</div>
						<div class="space-y-2 text-xs">
							<div>
								<p class="text-muted-foreground font-medium">Rue</p>
								<p class="font-medium text-gray-900">{host.profil.address || '—'}</p>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<p class="text-muted-foreground font-medium">Ville</p>
									<p class="font-medium text-gray-900">{host.profil.city || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">CP</p>
									<p class="font-medium text-gray-900">{host.profil.postalCode || '—'}</p>
								</div>
							</div>
							<div>
								<p class="text-muted-foreground font-medium">Quartier</p>
								<Badge variant="secondary" class="mt-1 h-fit text-xs">{location}</Badge>
							</div>
						</div>
					</div>

					<!-- Zone d'accueil -->
					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<Icon name={SECTION_CONFIG.home.icon} class="h-5 w-5 text-blue-700" />
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.home.label}</h4>
						</div>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{host.space || '—'} m2
								</Badge>
							</div>

							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground font-medium">Exterieur</span>
									<BooleanIcon value={host.outside} />
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground font-medium">Voiture</span>
									<BooleanIcon value={host.car} />
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground font-medium">Stock</span>
									<BooleanIcon value={host.isStockFeed} />
								</div>
							</div>
							<Separator />
							<div class="grid items-center gap-2">
								<span class="text-muted-foreground font-medium">Présence</span>
								<span class="font-medium text-gray-900">{host.presence || '—'}</span>
							</div>
						</div>
					</div>

					<!-- Animaux -->
					<div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<Icon name={SECTION_CONFIG.animals.icon} class="h-5 w-5 text-orange-700" />
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.animals.label}</h4>
						</div>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between border-b border-orange-100 pb-2">
								<span class="text-muted-foreground font-medium">Présents</span>
								<BooleanIcon value={host.hasAnimalsAtHome} />
							</div>
							{#if host.hasAnimalsAtHome}
								<div class="space-y-1">
									<div class="flex items-center justify-between">
										<span class="flex items-center gap-1">🐱 Chats</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfCatsAtHome || 0}
										</Badge>
									</div>
									<div class="flex items-center justify-between">
										<span class="flex items-center gap-1">🐕 Chiens</span>
										<Badge variant="outline" class="h-fit text-xs">
											{host.numberOfDogsAtHome || 0}
										</Badge>
									</div>
									{#if host.otherAnimalsAtHome}
										<div class="flex items-center justify-between">
											<span class="flex items-center gap-1">🐾 Autres</span>
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
					</div>

					<!-- Capacités -->
					<div class="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<Icon name={SECTION_CONFIG.capacity.icon} class="h-5 w-5 text-indigo-700" />
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.capacity.label}</h4>
						</div>
						<div class="grid gap-3">
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground mb-1 text-xs font-medium">Soins</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[host.heal]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground mb-1 text-xs font-medium">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[host.socialize]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground mb-1 text-xs font-medium">Biberonnage</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{babyFeedingLabel[host.babyFeeding]}
								</Badge>
							</div>
						</div>
					</div>
				</section>

				<Separator />

				<!-- Descriptions -->
				<section class="grid grid-cols-1 gap-6">
					{#if host.homeDescription}
						<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
							<div class="mb-3 flex items-center gap-2">
								<Icon name={SECTION_CONFIG.homeDescription.icon} class="h-5 w-5 text-blue-700" />
								<h4 class="text-sm font-semibold text-gray-900">
									{SECTION_CONFIG.homeDescription.label}
								</h4>
							</div>
							<p class="text-xs text-gray-700">{host.homeDescription}</p>
						</div>
					{/if}

					{#if host.outside && host.outsideDescription}
						<div class="rounded-lg border border-green-200 bg-green-50 p-3">
							<div class="mb-3 flex items-center gap-2">
								<Icon
									name={SECTION_CONFIG.outsideDescription.icon}
									class="h-5 w-5 text-emerald-700"
								/>
								<h4 class="text-sm font-semibold text-gray-900">
									{SECTION_CONFIG.outsideDescription.label}
								</h4>
							</div>
							<p class="text-xs text-gray-700">{host.outsideDescription}</p>
						</div>
					{/if}

					{#if host.stopActivity && host.actif === 'STOP'}
						<div class="rounded-lg border border-yellow-200 bg-red-50 p-3">
							<div class="mb-3 flex items-center gap-2">
								<Icon name={SECTION_CONFIG.stopActivity.icon} class="h-5 w-5 text-red-700" />
								<h4 class="text-sm font-semibold text-gray-900">
									{SECTION_CONFIG.stopActivity.label}
								</h4>
							</div>
							<p class="text-xs text-gray-700">{host.stopActivity}</p>
						</div>
					{/if}

					{#if host.additionalInformation}
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
							<div class="mb-3 flex items-center gap-2">
								<Icon
									name={SECTION_CONFIG.additionalInformation.icon}
									class="h-5 w-5 text-slate-700"
								/>
								<h4 class="text-sm font-semibold text-gray-900">
									{SECTION_CONFIG.additionalInformation.label}
								</h4>
							</div>
							<p class="text-xs text-gray-700">{host.additionalInformation}</p>
						</div>
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
										{#each host.placements?.filter((p) => (p.type === 'LONG' || p.type === 'SHORT') && p.isActive) || [] as placement (placement.id)}
											<PlacementCard {placement} type={placement.type.toLowerCase()} />
										{/each}
										{#if host.placements?.filter((p) => (p.type === 'LONG' || p.type === 'SHORT') && p.isActive).length === 0}
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
			<Icon name="home" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une famille d'accueil</p>
		</Card.Content>
	</Card.Root>
{/if}
