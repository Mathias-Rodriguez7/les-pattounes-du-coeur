<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { districtLabel } from '#lib/utils/districts.ts';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// Expérience (nombre de placements), adresse et contact d'une FA
	interface Props {
		host: HostFull;
	}

	let { host }: Props = $props();

	const location = $derived(
		host.profil.district ? districtLabel(host.profil.district) : host.profil.city || '—'
	);
	const placementStats = $derived(host.placementStats || { long: 0, short: 0, total: 0 });
</script>

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
