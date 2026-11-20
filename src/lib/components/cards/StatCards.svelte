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
	}

	let { cards, class: columns = 'grid-cols-2 sm:grid-cols-4' }: Props = $props();
</script>

<!-- Cartes compactes, sur une ligne : icône, puis le chiffre et son libellé.
     Avant, chaque carte faisait deux fois cette hauteur et la liste commençait plus bas. -->
<!-- Téléphone : une seule ligne qui défile sur le côté (la liste commence tout de suite) ;
     à partir de 640 px : la grille habituelle -->
<section
	class="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 {columns}"
>
	{#each cards as card (card.label)}
		<Card.Root
			class="min-w-40 shrink-0 snap-start flex-row items-center gap-3 px-3 py-3 sm:min-w-0 sm:px-4"
		>
			<Icon
				name={card.icon}
				withWrapper={true}
				wrapperClass="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:size-10"
				style="background: {getGradientStyle(card.theme)}"
				iconClass="size-4 sm:size-5"
			/>
			<div class="min-w-0">
				<p class="text-xl leading-tight font-bold sm:text-2xl">{card.value}</p>
				<p class="truncate text-xs text-muted-foreground sm:text-sm" title={card.label}>
					{card.label}
				</p>
			</div>
		</Card.Root>
	{/each}
</section>
