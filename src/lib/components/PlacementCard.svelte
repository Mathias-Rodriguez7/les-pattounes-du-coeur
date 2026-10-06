<script lang="ts">
	import type { Placement } from '$lib/types/';
	import { formatDateNum } from '$lib/utils/date';
	import {
		PLACEMENT_TYPE_COLORS,
		PLACEMENT_TYPE_LABELS,
		getPlacementTypeClass
	} from '$lib/constants/placement';

	interface Props {
		placement: Placement;
		isHistory?: boolean;
	}

	let { placement, isHistory = false }: Props = $props();

	const colors = $derived(PLACEMENT_TYPE_COLORS[placement.type]);
	const label = $derived(PLACEMENT_TYPE_LABELS[placement.type]);

	const displayName = $derived(placement.cat?.name || 'Chat');
	const startDate = $derived(formatDateNum(placement.startDate));
	const endDate = $derived(formatDateNum(placement.endDate));
</script>

<div
	class="rounded-lg border p-3 transition hover:shadow-sm {getPlacementTypeClass(
		placement.type
	)} {isHistory ? 'opacity-70' : ''}"
>
	<div class="mb-2 flex items-start justify-between gap-2">
		<p class="text-sm font-semibold text-gray-900">{displayName}</p>
		<div class="flex items-center gap-2">
			<span class="inline-block rounded px-2 py-1 text-xs font-medium {colors.badge}">
				{label}
			</span>
			{#if isHistory}
				<span class="text-xs font-medium text-gray-400">Terminé</span>
			{/if}
		</div>
	</div>

	<div class="flex justify-between text-xs text-gray-600">
		{#if placement.startDate}
			<p>
				<span class="font-medium">Début :</span>
				{startDate}
			</p>
		{/if}
		{#if placement.endDate}
			<p>
				<span class="font-medium">Fin :</span>
				{endDate}
			</p>
		{/if}
	</div>
</div>
