<script module lang="ts">
	import type { Component } from 'svelte';

	/** Une ligne de chiffre à droite de la carte */
	export interface StatRow {
		id: string;
		label: string;
		/** Une précision sous le libellé (« en ligne depuis +2 mois ») */
		hint?: string;
		value: number | string;
		icon: Component<{ class?: string }>;
		/** Les couleurs de la pastille de l'icône (classes Tailwind) */
		tone: string;
		/** todo = à faire (ambre), alert = à surveiller (rouge) : seulement s'il y en a */
		emphasis?: 'todo' | 'alert';
		/** La page qui liste ces chats / ces demandes */
		href?: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronRight } from '@lucide/svelte';
	import MonthBars, { type MonthSeries } from '#lib/components/charts/MonthBars.svelte';

	// La carte « Mes stats », la même pour tous les rôles : seul le contenu change.
	// À gauche : depuis quand, une phrase, un résumé et deux séries mois par mois.
	// À droite : les chiffres du moment, chacun ouvre la liste concernée.
	interface Props {
		since: Date | string | null;
		headline: Snippet;
		summary: Snippet;
		series: MonthSeries[];
		rows: StatRow[];
	}

	let { since, headline, summary, series, rows }: Props = $props();

	const sinceLabel = $derived(
		since ? new Date(since).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null
	);

	const EMPHASIS = { todo: 'text-amber-700', alert: 'text-red-700' };
	const valueClass = (row: StatRow) =>
		row.emphasis && row.value !== 0 ? EMPHASIS[row.emphasis] : '';
</script>

<section
	class="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-10"
>
	<div class="flex flex-col gap-3">
		{#if sinceLabel}
			<p class="text-sm text-muted-foreground first-letter:uppercase">
				Bénévole depuis {sinceLabel}
			</p>
		{/if}
		<p class="text-xl font-semibold">{@render headline()}</p>
		<div class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
			<p>{@render summary()}</p>
			<p class="flex items-center gap-3 text-xs" aria-hidden="true">
				{#each series as s (s.label)}
					<span class="flex items-center gap-1.5">
						<span class="size-2.5 rounded-sm {s.currentClass}"></span>
						{s.label.toLowerCase()}
					</span>
				{/each}
			</p>
		</div>
		<MonthBars {series} heightClass="h-20" />
	</div>

	<ul class="flex flex-col divide-y self-center">
		{#each rows as row (row.id)}
			<li>
				<svelte:element
					this={row.href ? 'a' : 'div'}
					href={row.href}
					class="flex items-center gap-3 rounded-md py-2.5 {row.href
						? '-mx-2 px-2 transition-colors hover:bg-muted/60'
						: ''}"
				>
					<span class="flex size-8 shrink-0 items-center justify-center rounded-lg {row.tone}">
						<row.icon class="size-4" />
					</span>
					<span class="flex min-w-0 flex-1 flex-col text-sm text-muted-foreground">
						{row.label}
						{#if row.hint}<span class="text-xs">{row.hint}</span>{/if}
					</span>
					<span class="text-2xl leading-none font-bold tabular-nums {valueClass(row)}">
						{row.value}
					</span>
					{#if row.href}
						<ChevronRight class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					{:else}
						<span class="size-4 shrink-0" aria-hidden="true"></span>
					{/if}
				</svelte:element>
			</li>
		{/each}
	</ul>
</section>
