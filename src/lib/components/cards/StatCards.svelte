<script lang="ts" module>
	/** Une carte du bandeau : un libellé, un chiffre, une icône (iconMap) et sa couleur (iconThemes) */
	export type StatCard = {
		label: string;
		value: number | string;
		icon: string;
		theme: string;
	};
</script>

<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';

	interface Props {
		cards: StatCard[];
		/**
		 * Les colonnes de la grille, selon le nombre de cartes de la page.
		 * À écrire EN ENTIER dans la page (ex : "grid-cols-2 sm:grid-cols-4") :
		 * Tailwind ne génère que les classes qu'il lit telles quelles dans le code.
		 */
		class?: string;
		/** La 1ʳᵉ carte (le total) prend toute la largeur sur téléphone : utile avec 5 cartes (1 + 2 + 2) */
		featureFirst?: boolean;
	}

	let {
		cards,
		class: columns = 'grid-cols-2 sm:grid-cols-4',
		featureFirst = false
	}: Props = $props();
</script>

<section class="grid gap-3 sm:gap-4 {columns}">
	{#each cards as card, i (card.label)}
		<Card.Root class="gap-2 py-4 {featureFirst && i === 0 ? 'col-span-2 sm:col-span-1' : ''}">
			<Card.Header class="flex flex-row items-start justify-between gap-2 px-4">
				<Card.Title class="text-xs font-medium text-muted-foreground sm:text-sm">
					{card.label}
				</Card.Title>
				<Icon
					name={card.icon}
					withWrapper={true}
					wrapperClass="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:size-10 sm:rounded-2xl"
					style="background: {getGradientStyle(card.theme)}"
					iconClass="size-4 sm:size-5"
				/>
			</Card.Header>
			<Card.Content class="px-4">
				<p class="text-xl font-bold sm:text-2xl">{card.value}</p>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
