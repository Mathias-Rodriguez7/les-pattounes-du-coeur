<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.ts';
	import { X } from '@lucide/svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';

	// =====================================================================
	// Mise en page « liste + détail » des pages du dashboard :
	// - PC : la liste à gauche (2/5), le détail à droite (3/5)
	// - Téléphone et tablette : la liste seule ; le détail s'ouvre en plein écran
	// Le détail n'est écrit qu'UNE fois (snippet `detail`), affiché à l'un ou l'autre endroit.
	// =====================================================================

	interface Props {
		/** La colonne de gauche. Son élément racine porte `lg:col-span-2` */
		list: Snippet;
		/** Le panneau de détail */
		detail: Snippet;
		/** Plein écran ouvert (téléphone et tablette) : la page l'ouvre quand on choisit une ligne */
		open?: boolean;
		/** Titre de la barre du plein écran (le nom de l'élément choisi) */
		title: string;
	}

	let { list, detail, open = $bindable(false), title }: Props = $props();
</script>

<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
	{@render list()}

	{#if desktop.current}
		<div class="min-w-0 lg:col-span-3">
			{@render detail()}
		</div>
	{/if}
</section>

{#if !desktop.current}
	<Sheet.Root bind:open>
		<Sheet.Content
			side="right"
			showCloseButton={false}
			class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
		>
			<!-- Barre du haut : reste visible pendant le défilement -->
			<header class="sticky top-0 z-10 flex items-center gap-2 bg-card/95 px-4 py-2 backdrop-blur">
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">{title}</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				{@render detail()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
