<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import PlacementEditForm from '#lib/components/placements/PlacementEditForm.svelte';
	import { PLACEMENT_TYPE_LABELS, getPlacementTypeClass } from '#lib/constants/placement.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { truncate } from '#lib/utils/string.ts';
	import type { CatFull, CatPlacement } from '#lib/types/cat.ts';

	// Un placement vu depuis la fiche du CHAT : la FA et ses coordonnées.
	// (À ne pas confondre avec components/PlacementCard : vu depuis la fiche de la FA, il montre le chat)
	interface Props {
		placement: CatPlacement;
		/** Le chat : le formulaire de modification en a besoin */
		cat: CatFull;
		/** Placement terminé : grisé, sans badge « En pause » ni bouton modifier */
		isHistory?: boolean;
		/** Seule l'admin modifie un placement */
		canEdit?: boolean;
	}

	let { placement, cat, isHistory = false, canEdit = false }: Props = $props();
</script>

<div
	class="grid items-center gap-2 rounded border px-2 py-1 text-xs {getPlacementTypeClass(
		placement.type
	)} {isHistory ? 'opacity-70' : ''}"
>
	<div class="flex items-center justify-between gap-2">
		<p class="text-sm font-semibold">
			{placement.host.profil.firstName}
			{truncate(placement.host.profil.lastName, 1)}.
		</p>
		{#if !isHistory && placement.status === 'BREAK'}
			<Badge variant="outline" class="ml-1 text-xs">En pause</Badge>
		{/if}
		<div class="flex items-center gap-1">
			<Badge variant="outline" class="text-xs">
				{PLACEMENT_TYPE_LABELS[placement.type]}
			</Badge>
			{#if canEdit && !isHistory}
				<PlacementEditForm {cat} {placement} />
			{/if}
		</div>
	</div>

	<div class="ml-6 flex min-w-0 flex-wrap gap-2">
		<div class="flex gap-2">
			<Icon name="phone" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
			<a
				href={`tel:${placement.host.profil.phone}`}
				class="text-xs text-blue-500 underline hover:text-primary"
			>
				{placement.host.profil.phone}
			</a>
		</div>
		<div class="flex min-w-0 gap-2">
			<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
			<a
				href={`mailto:${placement.host.profil.email}`}
				class="block text-xs break-all text-blue-500 underline hover:text-primary"
			>
				{placement.host.profil.email}
			</a>
		</div>
		<p class="block text-xs">
			{placement.host.profil.address}
			{placement.host.profil.city}
		</p>
	</div>

	{#if placement.startDate}
		<div class="flex flex-wrap justify-between gap-x-4">
			<p>Début {formatDateNum(placement.startDate)}</p>
			<p>Fin {placement.endDate ? formatDateNum(placement.endDate) : '—'}</p>
		</div>
	{/if}
</div>
