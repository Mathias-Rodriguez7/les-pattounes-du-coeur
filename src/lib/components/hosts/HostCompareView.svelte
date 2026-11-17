<script lang="ts">
	import PlaceName from '#lib/components/places/PlaceName.svelte';
	import type { Snippet } from 'svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import EntityLink from '#lib/components/links/EntityLink.svelte';
	import { Eye, X } from '@lucide/svelte';
	import {
		HOST_BABY_FEEDING,
		HOST_HEAL,
		HOST_SOCIALIZE,
		HOST_TYPES,
		levelColor
	} from '#lib/constants/host.ts';
	import { householdSummary } from '#lib/hosts/household.ts';
	import { animalsSummary, hostLocation, hostPlaces } from './columns';
	import type { HostFull } from '#lib/types/host.ts';

	// =====================================================================
	// La comparaison des FA cochées : le tableau « retourné ». Une COLONNE par FA, une LIGNE par
	// information, y compris les textes longs (domicile, présence, extérieur…) que le tableau
	// ne peut pas afficher. On lit de gauche à droite : « qui a un jardin ? qui est là le jour ? »
	// =====================================================================

	interface Props {
		hosts: HostFull[];
		/** Retirer une FA de la proposition (sa colonne disparaît) */
		onRemove: (hostId: string) => void;
		/** Ouvrir l'aperçu complet d'une FA */
		onPreview: (host: HostFull) => void;
	}

	let { hosts, onRemove, onPreview }: Props = $props();

	// « Masquer ce qui est identique » : on ne garde que les lignes où les FA diffèrent
	let onlyDifferences = $state(false);

	type Row = {
		label: string;
		/** La valeur comparée (pour « identique ») */
		key: (host: HostFull) => string;
		/** L'affichage, si différent du texte de `key` */
		cell?: Snippet<[HostFull]>;
		/** Texte long : aligné en haut, retour à la ligne */
		long?: boolean;
	};

	type Section = { title: string; rows: Row[] };

	const activeCats = (host: HostFull) =>
		host.placements
			.filter((p) => p.status === 'ACTIVE' && p.type !== 'PROPOSAL' && p.cat)
			.map((p) => p.cat!);

	const sections: Section[] = [
		{
			title: 'En bref',
			rows: [
				{ label: 'Lieu', key: hostLocation, cell: placeCell },
				{ label: 'Type', key: (h) => (h.type ? HOST_TYPES[h.type].label : '—') },
				{
					label: 'Places',
					key: (h) => {
						const p = hostPlaces(h);
						return p.capacity > 0 ? `${p.taken} / ${p.capacity}` : String(p.taken);
					},
					cell: placesCell
				},
				{
					label: 'Chats en ce moment',
					key: (h) =>
						activeCats(h)
							.map((c) => c.id)
							.join(','),
					cell: catsCell
				}
			]
		},
		{
			title: 'Foyer',
			rows: [
				{ label: 'Personnes', key: (h) => householdSummary(h) ?? 'Non renseigné' },
				{ label: 'Animaux', key: animalsSummary }
			]
		},
		{
			title: 'Capacités',
			rows: [
				{
					label: 'Accueille',
					key: (h) =>
						[
							h.catAdult
								? `${h.catAdult} chat${h.catAdult > 1 ? 's' : ''} adulte${h.catAdult > 1 ? 's' : ''}`
								: null,
							h.kitten ? `${h.kitten} chaton${h.kitten > 1 ? 's' : ''}` : null,
							h.kittyAndKitten ? 'mère + petits' : null
						]
							.filter(Boolean)
							.join(' · ') || '—'
				},
				{ label: 'Sociabilisation', key: (h) => h.socialize, cell: socializeCell },
				{ label: 'Soins', key: (h) => h.heal, cell: healCell },
				{ label: 'Biberonnage', key: (h) => h.babyFeeding, cell: babyCell }
			]
		},
		{
			title: 'Logement',
			rows: [
				{ label: 'Espace', key: (h) => (h.space ? `${h.space} m²` : '—') },
				{ label: 'Extérieur', key: (h) => String(h.outside), cell: outsideCell },
				{ label: 'Voiture', key: (h) => String(h.car), cell: carCell },
				{ label: 'Stock de nourriture', key: (h) => String(h.isStockFeed), cell: stockCell },
				{ label: 'Le domicile', key: (h) => h.homeDescription || '—', long: true },
				{ label: 'Présence', key: (h) => h.presence || '—', long: true },
				{ label: 'Infos', key: (h) => h.additionalInformation || '—', long: true }
			]
		}
	];

	/** Toutes les FA ont-elles la même valeur sur cette ligne ? */
	const isSame = (row: Row) => new Set(hosts.map(row.key)).size <= 1;

	const visibleSections = $derived(
		sections
			.map((section) => ({
				...section,
				rows: onlyDifferences ? section.rows.filter((row) => !isSame(row)) : section.rows
			}))
			.filter((section) => section.rows.length > 0)
	);
</script>

{#snippet placeCell(host: HostFull)}
	<PlaceName city={host.profil.city} district={host.profil.district} />
{/snippet}

{#snippet placesCell(host: HostFull)}
	{@const p = hostPlaces(host)}
	<span class="font-medium tabular-nums {p.isFull ? 'text-destructive' : ''}">
		{p.capacity > 0 ? `${p.taken} / ${p.capacity}` : p.taken}
	</span>
	{#if p.isFull}<span class="text-xs text-destructive"> · pleine</span>{/if}
{/snippet}

{#snippet catsCell(host: HostFull)}
	{@const cats = activeCats(host)}
	{#if cats.length === 0}
		<span class="text-muted-foreground">Aucun</span>
	{:else}
		<span class="flex flex-wrap gap-x-2">
			{#each cats as cat (cat.id)}
				<EntityLink kind="cat" id={cat.id}>{cat.name ?? cat.catNumber}</EntityLink>
			{/each}
		</span>
	{/if}
{/snippet}

{#snippet socializeCell(host: HostFull)}
	<Badge class={levelColor(HOST_SOCIALIZE[host.socialize])}
		>{HOST_SOCIALIZE[host.socialize].label}</Badge
	>
{/snippet}
{#snippet healCell(host: HostFull)}
	<Badge class={levelColor(HOST_HEAL[host.heal])}>{HOST_HEAL[host.heal].short}</Badge>
{/snippet}
{#snippet babyCell(host: HostFull)}
	<Badge class={levelColor(HOST_BABY_FEEDING[host.babyFeeding])}>
		{HOST_BABY_FEEDING[host.babyFeeding].label}
	</Badge>
{/snippet}

{#snippet outsideCell(host: HostFull)}
	<div class="grid justify-items-start gap-1">
		<BooleanIcon value={host.outside} />
		{#if host.outside && host.outsideDescription}
			<p class="text-xs whitespace-pre-line text-muted-foreground">{host.outsideDescription}</p>
		{/if}
	</div>
{/snippet}
{#snippet carCell(host: HostFull)}<BooleanIcon value={host.car} />{/snippet}
{#snippet stockCell(host: HostFull)}<BooleanIcon value={host.isStockFeed} />{/snippet}

<div class="space-y-3">
	<label class="flex w-fit cursor-pointer items-center gap-2 text-sm">
		<Switch bind:checked={onlyDifferences} aria-label="Masquer ce qui est identique" />
		Masquer ce qui est identique
	</label>

	<!-- Défile en largeur sur mobile ; la colonne des libellés reste fixe à gauche -->
	<div class="overflow-x-auto rounded-md">
		<table class="w-full border-collapse text-sm">
			<thead class="sticky top-0 z-10 bg-background">
				<tr class="border-b border-foreground/15">
					<th class="sticky left-0 z-20 w-40 min-w-32 bg-background p-2"></th>
					{#each hosts as host (host.id)}
						<th class="min-w-52 border-l border-foreground/10 p-2 text-left align-top">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<p class="truncate font-semibold">
										{host.profil.firstName}
										{host.profil.lastName}
									</p>
									{#if !host.isAvailable}
										<p class="text-xs font-normal text-muted-foreground">Non disponible</p>
									{/if}
								</div>
								<div class="flex shrink-0">
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => onPreview(host)}
										aria-label="Voir la fiche de {host.profil.firstName}"
										title="Voir la fiche"
									>
										<Eye class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => onRemove(host.id)}
										aria-label="Retirer {host.profil.firstName} de la proposition"
										title="Retirer de la proposition"
									>
										<X class="size-4" />
									</Button>
								</div>
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each visibleSections as section (section.title)}
					<!-- Titre de section : sur toute la largeur -->
					<tr class="bg-muted/60">
						<th
							colspan={hosts.length + 1}
							class="sticky left-0 px-2 py-1.5 text-left text-xs font-semibold tracking-wide text-foreground/70"
						>
							{section.title}
						</th>
					</tr>
					{#each section.rows as row (row.label)}
						{@const same = isSame(row)}
						<tr class="border-b border-foreground/10 {same ? '' : 'bg-amber-50/50'}">
							<th
								class="sticky left-0 bg-background p-2 text-left text-xs font-medium text-muted-foreground {row.long
									? 'align-top'
									: ''}"
								title={same ? undefined : 'Les FA diffèrent sur ce point'}
							>
								{row.label}
							</th>
							{#each hosts as host (host.id)}
								<td
									class="border-l border-foreground/10 p-2 {row.long
										? 'align-top whitespace-pre-line'
										: ''}"
								>
									{#if row.cell}
										{@render row.cell(host)}
									{:else}
										{row.key(host)}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan={hosts.length + 1} class="p-6 text-center text-muted-foreground">
							Ces FA sont identiques sur tous les points.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="text-xs text-muted-foreground">
		Les lignes en jaune pâle sont celles où les FA diffèrent.
	</p>
</div>
