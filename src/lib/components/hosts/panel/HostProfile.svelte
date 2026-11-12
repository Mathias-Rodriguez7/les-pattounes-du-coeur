<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { healLabel, socializeLabel, babyFeedingLabel } from '#lib/types/index.ts';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// Ce que la FA peut accueillir : logement, animaux, capacités, chats acceptés
	interface Props {
		host: HostFull;
	}

	let { host }: Props = $props();
</script>

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
					{healLabel[host.heal]}
				</Badge>
			</div>
			<div class="flex items-center justify-between">
				<p class="font-medium text-muted-foreground">Socialisation</p>
				<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
					{socializeLabel[host.socialize]}
				</Badge>
			</div>
			<div class="flex items-center justify-between">
				<p class="font-medium text-muted-foreground">Biberonnage</p>
				<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
					{babyFeedingLabel[host.babyFeeding]}
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
