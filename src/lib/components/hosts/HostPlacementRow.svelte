<script lang="ts">
	import PlaceName from '#lib/components/places/PlaceName.svelte';
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
	import { Eye, PawPrint } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import * as Popover from '#lib/components/ui/popover/index.js';

	interface Props {
		host: HostFull;
		/** Les colonnes affichées (sans les colonnes « filtre seul ») */
		columns: ColumnDef[];
		selected: boolean;
		onToggle: (hostId: string, checked: boolean) => void;
		/** Clic sur le nom : l'aperçu complet de la FA (sans cocher la ligne) */
		onPreview?: (host: HostFull) => void;
	}

	let { host, columns, selected, onToggle, onPreview }: Props = $props();

	// Soins, socia, biberon : la couleur vient du niveau (même échelle pour les trois)
	const NEUTRAL = 'bg-muted text-muted-foreground';

	const unavailable = $derived(!host.isAvailable);
	const places = $derived(hostPlaces(host));
</script>

<!-- Une ligne sur deux légèrement teintée (zébrage), des traits clairs : l'œil suit la ligne -->
<Table.Row
	class="border-b border-foreground/15 {selected
		? 'bg-accent hover:bg-accent'
		: 'even:bg-muted/80 hover:bg-muted'} cursor-pointer transition-colors"
	onclick={() => onToggle(host.id, !selected)}
>
	<Table.Cell class="w-10 py-1" onclick={(e) => e.stopPropagation()}>
		<Checkbox checked={selected} onCheckedChange={(checked) => onToggle(host.id, !!checked)} />
	</Table.Cell>

	<!-- L'œil : l'aperçu complet de la FA (le clic ne coche pas la ligne) -->
	<Table.Cell class="w-8 px-0 py-1" onclick={(e) => e.stopPropagation()}>
		<Button
			variant="ghost"
			size="icon-sm"
			onclick={() => onPreview?.(host)}
			aria-label="Voir la fiche de {host.profil.firstName} {host.profil.lastName}"
			title="Voir la fiche"
		>
			<Eye class="size-4 text-muted-foreground" />
		</Button>
	</Table.Cell>

	{#each columns as col, i (col.id)}
		{@const value = col.accessor(host)}
		<!-- Une FA indisponible est grisée (sauf son nom, suivi de « · indispo ») -->
		<Table.Cell
			class="py-1 tabular-nums {i === 0
				? 'font-medium'
				: unavailable
					? 'opacity-50'
					: ''} {(col.group && columns[i - 1]?.group !== col.group) || col.separatorBefore
				? 'border-l border-foreground/10'
				: ''} {col.compact ? 'px-1.5 text-center' : ''} {col.center ? 'text-center' : ''}"
		>
			{#if col.compact === 'count'}
				<!-- Petite colonne de chiffres : « — » non renseigné, « · » pour 0 -->
				{#if typeof value === 'number' && value > 0}
					{value}
				{:else}
					<span class="text-muted-foreground/60">{value === -1 ? '—' : '·'}</span>
				{/if}
			{:else if col.compact === 'other'}
				{#if value === 1}
					<!-- Le texte libre (« deux poules ») : au survol sur PC, à l'appui sur mobile.
					     stopPropagation : l'appui ne coche pas la ligne -->
					<Popover.Root>
						<Popover.Trigger
							class="inline-flex rounded-sm p-0.5 hover:bg-muted"
							title={host.otherAnimalsAtHome}
							aria-label="Autres animaux : {host.otherAnimalsAtHome}"
							onclick={(e) => e.stopPropagation()}
						>
							<PawPrint class="size-4 text-emerald-600" />
						</Popover.Trigger>
						<Popover.Content class="w-auto max-w-64 p-2 text-sm">
							{host.otherAnimalsAtHome}
						</Popover.Content>
					</Popover.Root>
				{:else}
					<span class="text-muted-foreground/60">·</span>
				{/if}
			{:else if col.compact === 'check'}
				<!-- Oui / non : la même icône que Extérieur et Voiture -->
				<BooleanIcon value={value === 1} />
			{:else if col.id === 'name'}
				<!-- Le nom ouvre l'aperçu de la fiche ; stopPropagation : la ligne n'est pas cochée -->
				<button
					type="button"
					class="rounded-sm underline decoration-current/40 decoration-dotted underline-offset-3 hover:text-primary hover:decoration-solid"
					title="Voir la fiche"
					onclick={(e) => {
						e.stopPropagation();
						onPreview?.(host);
					}}
				>
					{value}
				</button>
				{#if unavailable}<span class="text-xs font-normal text-muted-foreground">· indispo</span
					>{/if}
			{:else if col.id === 'location'}
				<!-- La ville en italique, le quartier en droit -->
				<PlaceName city={host.profil.city} district={host.profil.district} />
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
