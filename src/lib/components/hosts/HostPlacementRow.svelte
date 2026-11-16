<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import type { HostFull } from '#lib/types/host.ts';
	import { hostPlaces, type ColumnDef } from './columns';
	import {
		HOST_TYPES,
		healColors,
		socializeColors,
		babyFeedingColors
	} from '#lib/constants/host.ts';
	import { healLabel, socializeLabel, babyFeedingLabel } from '#lib/types/labels.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Cat, Dog, PawPrint } from '@lucide/svelte';

	interface Props {
		host: HostFull;
		/** Les colonnes affichées (sans les colonnes « filtre seul ») */
		columns: ColumnDef[];
		selected: boolean;
		onToggle: (hostId: string, checked: boolean) => void;
	}

	let { host, columns, selected, onToggle }: Props = $props();

	// Soins, socia, biberon : la couleur vient du niveau (même échelle pour les trois)
	const NEUTRAL = 'bg-muted text-muted-foreground';

	const unavailable = $derived(!host.isAvailable);
	const places = $derived(hostPlaces(host));
</script>

<Table.Row
	class="{selected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} cursor-pointer transition-colors"
	onclick={() => onToggle(host.id, !selected)}
>
	<Table.Cell class="w-10" onclick={(e) => e.stopPropagation()}>
		<Checkbox checked={selected} onCheckedChange={(checked) => onToggle(host.id, !!checked)} />
	</Table.Cell>

	{#each columns as col, i (col.id)}
		{@const value = col.accessor(host)}
		<!-- Une FA indisponible est grisée (sauf son nom, suivi de « · indispo ») -->
		<Table.Cell
			class="py-1.5 {i === 0 ? 'font-medium' : unavailable ? 'opacity-50' : ''} {col.group &&
			columns[i - 1]?.group !== col.group
				? 'border-l'
				: ''}"
		>
			{#if col.id === 'name'}
				{value}
				{#if unavailable}<span class="text-xs font-normal text-muted-foreground">· indispo</span
					>{/if}
			{:else if col.id === 'type'}
				{@const type = host.type ? HOST_TYPES[host.type] : null}
				<Badge class={type?.color ?? NEUTRAL} title={type?.label}>{type?.short ?? '—'}</Badge>
			{:else if col.id === 'socialize'}
				<Badge
					class={socializeColors[host.socialize]?.color ?? NEUTRAL}
					title={socializeLabel[host.socialize]}
				>
					{socializeColors[host.socialize]?.label ?? host.socialize}
				</Badge>
			{:else if col.id === 'heal'}
				<Badge class={healColors[host.heal]?.color ?? NEUTRAL} title={healLabel[host.heal]}>
					{healColors[host.heal]?.label ?? host.heal}
				</Badge>
			{:else if col.id === 'babyFeeding'}
				<Badge
					class={babyFeedingColors[host.babyFeeding]?.color ?? NEUTRAL}
					title={babyFeedingLabel[host.babyFeeding]}
				>
					{babyFeedingColors[host.babyFeeding]?.label ?? host.babyFeeding}
				</Badge>
			{:else if col.id === 'animals'}
				{#if !host.hasAnimalsAtHome}
					<span class="text-muted-foreground">Aucun</span>
				{:else}
					<!-- Une icône de couleur par sorte d'animal (chat ambre, chien bleu, autres vert) ; « autres » est un texte libre : coupé, en entier au survol -->
					<span class="flex max-w-56 items-center gap-3" title={String(value)}>
						{#if host.numberOfCatsAtHome}
							<span class="flex items-center gap-1">
								<Cat class="size-4 text-amber-600" aria-label="Chats" />
								{host.numberOfCatsAtHome}
							</span>
						{/if}
						{#if host.numberOfDogsAtHome}
							<span class="flex items-center gap-1">
								<Dog class="size-4 text-sky-600" aria-label="Chiens" />
								{host.numberOfDogsAtHome}
							</span>
						{/if}
						{#if host.otherAnimalsAtHome}
							<span class="flex min-w-0 items-center gap-1">
								<PawPrint class="size-4 shrink-0 text-emerald-600" aria-label="Autres" />
								<span class="truncate">{host.otherAnimalsAtHome}</span>
							</span>
						{/if}
					</span>
				{/if}
			{:else if col.id === 'household' || col.id === 'catTypes'}
				<span class={value === '—' ? 'text-muted-foreground' : ''}>{value}</span>
			{:else if col.id === 'places'}
				<!-- Pleine : en rouge. Sans capacité renseignée : juste le nombre de chats -->
				<span class="font-medium {places.isFull ? 'text-destructive' : ''}">
					{places.capacity > 0 ? `${places.taken} / ${places.capacity}` : places.taken}
				</span>
			{:else if col.id === 'space'}
				{value ? `${value} m²` : '—'}
			{:else if col.id === 'outside' || col.id === 'car'}
				<BooleanIcon value={value === true} />
			{:else}
				{value}
			{/if}
		</Table.Cell>
	{/each}
</Table.Row>
