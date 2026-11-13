<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { FORM_SECTION_CONFIG, ageLabels, furLabels } from '#lib/constants/forms.ts';
	import { getSexIcon } from '#lib/utils/catHelpers.ts';
	import type { AdoptionFormJson } from '#lib/types/form.ts';

	// Demande libre : le chat que l'adoptant RECHERCHE (ses préférences)
	let { data }: { data: AdoptionFormJson } = $props();

	const sexIcon = $derived(getSexIcon(data.catSex));
</script>

<SectionCard
	icon={FORM_SECTION_CONFIG.cat.icon}
	title={FORM_SECTION_CONFIG.cat.label}
	color={FORM_SECTION_CONFIG.cat.color}
>
	<div class="grid gap-4 text-xs">
		<div class="flex items-center justify-between">
			<p class="text-muted-foreground">Âge</p>
			<Badge variant="outline" class="text-xs">
				{data.catAge ? ageLabels[data.catAge] : '—'}
			</Badge>
		</div>
		<div class="flex items-center justify-between" title={sexIcon.label}>
			<p class="text-muted-foreground">Sexe</p>
			<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
		</div>
		<div class="flex items-center justify-between">
			<p class="text-muted-foreground">Couleur</p>
			<p>{data.color || '—'}</p>
		</div>
		<div class="flex items-center justify-between">
			<p class="text-muted-foreground">Longueur poil</p>
			<Badge variant="outline" class="text-xs">
				{data.furLength ? furLabels[data.furLength] : '—'}
			</Badge>
		</div>
	</div>
</SectionCard>
