<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import SicknessEditForm from '#lib/components/sickness/SicknessEditForm.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import { sicknessStatus } from '#lib/constants/sickness.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { SicknessStatus } from '@prisma/client';
	import type { CatFull } from '#lib/types/cat.ts';

	// Section « Maladies » de la fiche d'un chat : les maladies en cours, ajouter, modifier
	interface Props {
		cat: CatFull;
		/** Admin, ou bénévole associée au chat (même règle que le serveur) */
		canManage: boolean;
	}

	let { cat, canManage }: Props = $props();

	// Une maladie guérie (RESOLVED) n'apparaît plus dans la fiche
	const activeSicknesses = $derived(cat.sicknesses.filter((s) => s.status !== 'RESOLVED'));
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.sicknesses.icon}
	title={CAT_SECTION_CONFIG.sicknesses.label}
	color={CAT_SECTION_CONFIG.sicknesses.color}
>
	{#snippet action()}
		{#if canManage}
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

					{#if canManage}
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
