<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import { FORM_SECTION_CONFIG } from '#lib/constants/forms.ts';
	import type { AdoptionFormJson } from '#lib/types/form.ts';

	// Le foyer de l'adoptant, en lecture : 2 cartes (logement, animaux) à placer dans la grille du parent
	let { data }: { data: AdoptionFormJson } = $props();
</script>

<SectionCard
	icon={FORM_SECTION_CONFIG.home.icon}
	title={FORM_SECTION_CONFIG.home.label}
	color={FORM_SECTION_CONFIG.home.color}
>
	<div class="grid gap-4 text-xs">
		<div class="flex items-center justify-between">
			<span class="flex items-center gap-1 text-sm">Espace</span>
			<Badge class="bg-blue-100 text-xs text-blue-800">{data.housingSize || '—'} m²</Badge>
		</div>

		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<span class="flex items-center gap-1 text-sm">Extérieur</span>
				<BooleanIcon value={data.hasGarden} />
			</div>
			{#if data.hasGarden}
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1 text-sm">Espace extérieur</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">{data.gardenSize || '—'} m²</Badge>
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-between">
			<span class="flex items-center gap-1 text-sm">Nombre d'enfants</span>
			<Badge class="bg-blue-100 text-xs text-blue-800">{data.numberOfChildren ?? '—'}</Badge>
		</div>
	</div>
</SectionCard>

<SectionCard
	icon={FORM_SECTION_CONFIG.animals.icon}
	title={FORM_SECTION_CONFIG.animals.label}
	color={FORM_SECTION_CONFIG.animals.color}
>
	<div class="ml-6 space-y-3">
		<div class="flex items-center justify-between border-b border-orange-100 pb-2">
			<span class="font-medium text-muted-foreground">Animaux dans le foyer</span>
			<BooleanIcon value={data.hasPets} />
		</div>

		{#if data.hasPets}
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1 text-sm">🐱 Chats</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">{data.numberOfCats ?? 0}</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1 text-sm">🐕 Chiens</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">{data.numberOfDogs ?? 0}</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1 text-sm">🐾 Autres</span>
					<p class="rounded-md bg-muted p-2 text-xs">{data.otherPets || '—'}</p>
				</div>
			</div>
		{/if}
	</div>
</SectionCard>
