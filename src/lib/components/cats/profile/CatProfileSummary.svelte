<script lang="ts">
	import type { CatProfile } from '$lib/types/catProfile';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { getSexIcon } from '$lib/utils/catHelpers';
	import { getAgeBadge } from '$lib/utils/age';
	import { formatDateNum } from '$lib/utils/date';
	import CatCompatibilityCard from './CatCompatibilityCard.svelte';
	import CatHealthCard from './CatHealthCard.svelte';

	/**
	 * Tout ce qui concerne le CHAT demandé, regroupé : identité, compatibilité, santé, maladies.
	 * Sert dans le panneau d'une demande précise, séparé des infos de l'adoptant.
	 */
	interface Props {
		cat: CatProfile;
	}

	let { cat }: Props = $props();

	const sexIcon = $derived(getSexIcon(cat.sex));
	const lifelongSicknesses = $derived(cat.sicknesses.filter((s) => s.status === 'ACTIVE'));
	const treatedSicknesses = $derived(cat.sicknesses.filter((s) => s.status === 'TREATED'));
</script>

<!-- @container : 3 colonnes dès que le PANNEAU est assez large (comme les blocs au-dessus),
     sinon empilées. On mesure le panneau, pas l'écran : il ne fait que 3/5 de la page.
     Les maladies passent sur leur propre ligne, en dessous -->
<div class="@container">
	<div class="grid grid-cols-1 gap-4 text-sm @2xl:grid-cols-3">
		<SectionCard
			icon={CAT_SECTION_CONFIG.profile.icon}
			title={CAT_SECTION_CONFIG.profile.label}
			color={CAT_SECTION_CONFIG.profile.color}
		>
			<div class="ml-6 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
				<span class="text-muted-foreground">Nom</span>
				<span class="truncate font-medium">{cat.name ?? '—'}</span>
				<span class="text-muted-foreground">Sexe</span>
				<span class="flex items-center gap-1.5">
					<Icon name={sexIcon.icon} class="size-5 shrink-0 {sexIcon.color}" />
					{sexIcon.label}
				</span>
				<span class="text-muted-foreground">Naissance</span>
				<span>{formatDateNum(cat.birthDate)}</span>
				<span class="text-muted-foreground">Âge</span>
				<span>{getAgeBadge(cat.birthDate)}</span>
			</div>
		</SectionCard>

		<CatCompatibilityCard {cat} />

		<CatHealthCard {cat} />

		<SectionCard
			icon={CAT_SECTION_CONFIG.sicknesses.icon}
			title={CAT_SECTION_CONFIG.sicknesses.label}
			color={CAT_SECTION_CONFIG.sicknesses.color}
			class="@2xl:col-span-3"
		>
			{#if cat.sicknesses.length === 0}
				<p class="ml-6 text-muted-foreground">Aucune maladie</p>
			{:else}
				<div class="ml-6 grid gap-3">
					{#if lifelongSicknesses.length > 0}
						<div>
							<p class="text-muted-foreground">Maladies à vie</p>
							<p class="flex flex-wrap gap-x-4 font-medium">
								{#each lifelongSicknesses as sickness (sickness.id)}
									<span>{sickness.name}</span>
								{/each}
							</p>
						</div>
					{/if}
					{#if treatedSicknesses.length > 0}
						<div>
							<p class="text-muted-foreground">Maladies en traitement</p>
							<p class="flex flex-wrap gap-x-4 font-medium">
								{#each treatedSicknesses as sickness (sickness.id)}
									<span>{sickness.name}</span>
								{/each}
							</p>
						</div>
					{/if}
				</div>
			{/if}
		</SectionCard>
	</div>
</div>
