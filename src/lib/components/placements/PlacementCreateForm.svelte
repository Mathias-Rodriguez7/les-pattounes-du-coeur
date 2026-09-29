<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import SectionCard from '../cards/SectionCard.svelte';
	import { Plus } from '@lucide/svelte';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { getAgeBadge } from '$lib/utils/age';
	import { getLabel, sexLabel, vaccinateLabel } from '$lib/utils/catHelpers';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { sicknessStatus } from '$lib/constants/sickness';
	import type { SicknessStatus } from '@prisma/client';
	import HostDataTable from '../hosts/HostDataTable.svelte';

	interface Props {
		catId: string;
		cat: CatFull;
		placement: PlacementFull;
		hosts: HostFull[];
		onSuccess?: () => void;
	}

	let { catId, cat, placement = null, hosts, onSuccess }: Props = $props();

	let selectedHostId = $state<string | null>(placement?.hostId ?? null);

	let open = $state(false);

	const activeSicknesses = $derived((cat.sicknesses ?? []).filter((s) => s.status === 'ACTIVE'));
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" size="sm">
			<Plus class="mr-1 h-4 w-4" />
			Ajouter un placement
		</Button>
	</Dialog.Trigger>

	<Dialog.Content size="xxl" class="max-w-5xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				Imformation de {cat.name}
			</Dialog.Title>
		</Dialog.Header>

		<!-- Chat -->
		<section class="grid grid-cols-1 gap-4 md:grid-cols-5">
			<!-- Profile -->
			<SectionCard
				icon={CAT_SECTION_CONFIG.profile.icon}
				title={CAT_SECTION_CONFIG.profile.label}
				color={CAT_SECTION_CONFIG.profile.color}
				class="col-span-1"
			>
				<div class="space-y-3">
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div>
							<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
								<span>Nom</span>
							</div>
							<p class="font-medium">{cat.name}</p>
						</div>
						<div>
							<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
								<span>Sexe</span>
							</div>
							<p class="font-medium">{getLabel(sexLabel, cat.sex)}</p>
						</div>

						<div>
							<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
								<span>Âge</span>
							</div>
							<p class="font-medium">{getAgeBadge(cat.birthDate)}</p>
						</div>
					</div>
				</div>
			</SectionCard>

			<!-- Compatibilité -->
			<SectionCard
				icon={CAT_SECTION_CONFIG.compatibility.icon}
				title={CAT_SECTION_CONFIG.compatibility.label}
				color={CAT_SECTION_CONFIG.compatibility.color}
				class="col-span-1"
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

			<!-- Santé -->
			<SectionCard
				icon={CAT_SECTION_CONFIG.health.icon}
				title={CAT_SECTION_CONFIG.health.label}
				color={CAT_SECTION_CONFIG.health.color}
				class="col-span-2"
			>
				<section class="ml-6 grid grid-cols-2 gap-6">
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
						<span>{cat.chipId ?? '—'}</span>
					</div>
				</section>
			</SectionCard>

			<!-- Maladies -->
			<SectionCard
				icon={CAT_SECTION_CONFIG.sicknesses.icon}
				title={CAT_SECTION_CONFIG.sicknesses.label}
				color={CAT_SECTION_CONFIG.sicknesses.color}
				class="col-span-1"
			>
				<div class="space-y-3">
					<div class="space-y-2">
						{#if activeSicknesses.length > 0}
							<div class="grid gap-2">
								{#each activeSicknesses as sickness (sickness.id ?? sickness.name)}
									<div>
										<span class="text-muted-foreground block text-xs"
											>Maladie {sicknessStatus[sickness.status as SicknessStatus]}</span
										>
										<span class="font-medium">{sickness.name}</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-muted-foreground rounded border border-dashed p-3 text-sm">
								Aucune maladie active.
							</p>
						{/if}
					</div>
				</div>
			</SectionCard>
		</section>

		<section class="space-y-2">
			<h3 class="text-sm font-semibold">Choisir une famille d'accueil</h3>
			<HostDataTable {hosts} {selectedHostId} onSelectHost={(id) => (selectedHostId = id)} />
		</section>
	</Dialog.Content>
</Dialog.Root>
