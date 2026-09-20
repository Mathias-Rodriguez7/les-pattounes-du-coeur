<script lang="ts">
	import type { Placement } from '$types';
	import { formatDate } from '$lib/utils/date';

	interface Props {
		placement: Placement;
		type: 'proposal' | 'transfer' | 'long' | 'short';
		isHistory?: boolean;
	}

	let { placement, type, isHistory = false }: Props = $props();

	const typeConfig = {
		proposal: {
			label: 'Proposition',
			color: 'bg-purple-50 border-purple-200',
			badgeColor: 'bg-purple-100 text-purple-800'
		},
		transfer: {
			label: 'Transfert',
			color: 'bg-blue-50 border-blue-200',
			badgeColor: 'bg-blue-100 text-blue-800'
		},
		long: {
			label: 'Long',
			color: 'bg-teal-50 border-teal-200',
			badgeColor: 'bg-teal-100 text-teal-800'
		},
		short: {
			label: 'Relais',
			color: 'bg-lime-50 border-lime-200',
			badgeColor: 'bg-lime-100 text-lime-800'
		}
	} as const;

	const config = $derived(typeConfig[type]);

	const displayName = $derived(placement.cat?.name || 'Chat');
	const startDate = $derived(formatDate(placement.started));
	const endDate = $derived(formatDate(placement.ended));
</script>

<div class={`rounded-lg border ${config.color} p-3 transition hover:shadow-sm`}>
	<div class="mb-2 flex items-start justify-between">
		<div class="flex-1">
			<p class="text-sm font-semibold text-gray-900">{displayName}</p>
			<span class={`inline-block rounded px-2 py-1 text-xs font-medium ${config.badgeColor}`}>
				{config.label}
			</span>
		</div>
		{#if isHistory}
			<span class="text-xs font-medium text-gray-400">Terminé</span>
		{/if}
	</div>

	<div class="space-y-1 text-xs text-gray-600">
		{#if placement.started}
			<p>
				<span class="font-medium">Début :</span>
				{startDate}
			</p>
		{/if}
		{#if placement.ended}
			<p>
				<span class="font-medium">Fin :</span>
				{endDate}
			</p>
		{/if}
	</div>
</div>
