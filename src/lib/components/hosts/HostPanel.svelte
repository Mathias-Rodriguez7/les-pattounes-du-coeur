<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
	import type { HostFull } from '$lib/types/hosts';
	import {
		hostStatusLabel,
		spaceLabel,
		healLabel,
		socializeLabel,
		babyFeedingLabel
	} from '$lib/types/hosts';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { truncate } from '$lib/utils/string';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { getGradientStyle } from '$lib/utils/iconThemes';

	interface Props {
		host: HostFull | null;
		isAdmin?: boolean;
	}

	const { host, isAdmin = false }: Props = $props();

	let editing = $state(false);

	const STATUS_CONFIG: Record<string, { label: string; icon: string; theme: string }> = {
		ACTIVE: { label: 'En activité', icon: 'CirclePlay', theme: 'activ' },
		BREAK: { label: 'En pause', icon: 'CirclePause', theme: 'break' },
		STOP: { label: 'Arrêté', icon: 'CircleX', theme: 'stop' }
	};

	const TYPE_COLORS: Record<string, { label: string; color: string }> = {
		CLASSIC: { label: 'Accueil Long', color: 'bg-purple-100 text-purple-800' },
		RELAY: { label: 'Relais', color: 'bg-pink-100 text-pink-800' }
	};

	const SECTION_CONFIG = {
		address: { icon: '📍', label: 'Adresse', color: 'slate' },
		home: { icon: '🏠', label: 'Domicile', color: 'blue' },
		animals: { icon: '🐾', label: 'Animaux', color: 'orange' },
		capacity: { icon: '⭐', label: 'Capacités', color: 'indigo' },
		availability: { icon: '⏱️', label: 'Colaboration', color: 'emerald' }
	};

	// États dérivés
	const fullName = $derived(`${host?.profil.firstName} ${host?.profil.lastName}`);
	const location = $derived(
		host?.profil.district
			? DISTRICT_LABELS[host.profil.district as keyof typeof DISTRICT_LABELS]
			: host?.profil.city || '—'
	);
	const currentStatus = $derived(
		host?.actif && host.actif in STATUS_CONFIG ? STATUS_CONFIG[host.actif] : STATUS_CONFIG.ACTIVE
	);
</script>

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !editing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<div class="flex items-start justify-between gap-4">
					<!-- Gauche : Statut + Infos -->
					<div class="flex flex-1 gap-6">
						<!-- Status Icon -->
						<div class="flex flex-col items-center gap-2">
							{#key host?.actif}
								<Icon
									name={currentStatus.icon}
									withWrapper={true}
									wrapperClass="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle(currentStatus.theme)}"
									iconClass="h-6 w-6"
								/>
							{/key}
							<span class="text-muted-foreground text-center text-xs font-medium">
								{currentStatus.label}
							</span>
						</div>

						<!-- Infos personnelles -->
						<div>
							<Card.Title class="text-2xl">{fullName}</Card.Title>
							<Card.Description class="text-sm">
								{host.age} ans · {host.job || '—'}
							</Card.Description>

							<div class="mt-3 flex items-center gap-2">
								<Badge class={TYPE_COLORS[host.type]?.color || 'bg-gray-100 text-gray-800'}>
									{TYPE_COLORS[host.type]?.label}
								</Badge>
								<Badge
									variant={host.isAvailable ? 'default' : 'secondary'}
									class={host.isAvailable
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}
								>
									{host.isAvailable ? '✓ Disponible' : '✗ Non disponible'}
								</Badge>
								<Badge variant="outline" class="text-xs">
									{hostStatusLabel[host.status]}
								</Badge>
							</div>
						</div>
					</div>

					<!-- Droite : Contact -->
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2">
							<Icon name="mail" iconClass="h-5 w-5 text-muted-foreground flex-shrink-0" />
							<a
								href="mailto:{host.profil.email}"
								class="truncate text-sm text-blue-600 hover:underline"
								title={host.profil.email}
							>
								{truncate(host.profil.email, 28)}
							</a>
						</div>
						<div class="flex items-center gap-2">
							<Icon name="phone" iconClass="h-5 w-5 text-muted-foreground flex-shrink-0" />
							<a href="tel:{host.profil.phone}" class="text-sm text-blue-600 hover:underline">
								{host.profil.phone || '—'}
							</a>
						</div>
					</div>

					<!-- Bouton édition -->
					{#if isAdmin}
						<Button variant="ghost" size="icon" onclick={() => (editing = true)} class="shrink-0">
							<Pencil class="h-5 w-5" />
						</Button>
					{/if}
				</div>
			</Card.Header>

			<!-- Contenu principal -->
			<Card.Content class="space-y-6 overflow-y-auto">
				<Separator />

				<!-- Grille 2 colonnes : Adresse & Infos maison + Capacités -->
				<div class="grid grid-cols-2 gap-6 lg:grid-cols-3">
					<!-- Adresse -->
					<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<span class="text-lg">{SECTION_CONFIG.address.icon}</span>
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.address.label}</h4>
						</div>
						<div class="ml-6 space-y-2 text-xs">
							<div>
								<p class="text-muted-foreground font-medium">Rue</p>
								<p class="font-medium text-gray-900">{host.profil.address || '—'}</p>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<p class="text-muted-foreground font-medium">CP</p>
									<p class="font-medium text-gray-900">{host.profil.postalCode || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">Ville</p>
									<p class="font-medium text-gray-900">{host.profil.city || '—'}</p>
								</div>
							</div>
							<div>
								<p class="text-muted-foreground font-medium">Quartier</p>
								<Badge variant="secondary" class="mt-1 h-fit text-xs">{location}</Badge>
							</div>
						</div>
					</div>

					<!-- Domicile -->
					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<span class="text-lg">{SECTION_CONFIG.home.icon}</span>
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.home.label}</h4>
						</div>
						<div class="ml-6 space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{spaceLabel[host.space]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Présence</span>
								<span class="font-medium text-gray-900">{host.presence || '—'}</span>
							</div>
							<div class="space-y-1 border-t border-blue-100 pt-2">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground font-medium">Jardin</span>
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
						</div>
					</div>

					<!-- Animaux -->
					<div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<span class="text-lg">{SECTION_CONFIG.animals.icon}</span>
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.animals.label}</h4>
						</div>
						<div class="ml-6 space-y-2 text-xs">
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
					<div class="rounded-lg border border-indigo-200 bg-indigo-50 p-4 lg:col-span-2">
						<div class="mb-3 flex items-center gap-2">
							<span class="text-lg">{SECTION_CONFIG.capacity.icon}</span>
							<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.capacity.label}</h4>
						</div>
						<div class="ml-6 grid grid-cols-3 gap-3">
							<div>
								<p class="text-muted-foreground mb-1 text-xs font-medium">Soins médicaux</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[host.heal]}
								</Badge>
							</div>
							<div>
								<p class="text-muted-foreground mb-1 text-xs font-medium">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[host.socialize]}
								</Badge>
							</div>
							<div>
								<p class="text-muted-foreground mb-1 text-xs font-medium">Nourrissage</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{babyFeedingLabel[host.babyFeeding]}
								</Badge>
							</div>
						</div>
					</div>

					<!-- Colaboration -->
					<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
						<div class="mb-3 flex items-center gap-2">
							<span class="text-lg">{SECTION_CONFIG.availability.icon}</span>
							<h4 class="text-sm font-semibold text-gray-900">
								{SECTION_CONFIG.availability.label}
							</h4>
						</div>
						<div class="ml-6">
							<p class="text-muted-foreground mb-1 text-xs font-medium">Durée</p>
							<p class="text-sm font-medium text-gray-900">{host.availabilityDuration || '—'}</p>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Descriptions -->
				<div class="space-y-2">
					{#if host.homeDescription}
						<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
							<p class="mb-1 text-sm font-semibold text-gray-900">📝 Description du domicile</p>
							<p class="text-xs text-gray-700">{host.homeDescription}</p>
						</div>
					{/if}

					{#if host.outside && host.outsideDescription}
						<div class="rounded-lg border border-green-200 bg-green-50 p-3">
							<p class="mb-1 text-sm font-semibold text-gray-900">🌿 Description du jardin</p>
							<p class="text-xs text-gray-700">{host.outsideDescription}</p>
						</div>
					{/if}

					{#if host.stopActivity && host.actif === 'STOP'}
						<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
							<p class="mb-1 text-sm font-semibold text-gray-900">⛔ Raison d'arrêt</p>
							<p class="text-xs text-gray-700">{host.stopActivity}</p>
						</div>
					{/if}

					{#if host.additionalInformation}
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
							<p class="mb-1 text-sm font-semibold text-gray-900">ℹ️ Infos additionnelles</p>
							<p class="text-xs text-gray-700">{host.additionalInformation}</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		{:else}
			<!-- ===== ÉDITION ===== -->
			<Card.Header>
				<h3 class="text-2xl font-bold">Éditer la famille d'accueil</h3>
			</Card.Header>
			<Card.Content class="flex items-center justify-center p-8">
				<p class="text-muted-foreground">HostEditForm sera intégré ici</p>
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
