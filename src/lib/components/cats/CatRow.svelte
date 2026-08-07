<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import type { CatFull } from '$lib/types/cat';
	import { statusLabel, sexLabel, focalPointClass } from '$lib/utils/catHelpers';
	import { formatAge } from '$lib/utils/age';
	import BooleanIcon from '../icons/BooleanIcon.svelte';

	const { cat, onclick }: { cat: CatFull; onclick: () => void } = $props();

	const statusColors = {
		AVAILABLE: 'bg-emerald-100 text-emerald-800',
		ADOPTED: 'bg-rose-100 text-rose-800',
		SOCIALIZE: 'bg-sky-100 text-sky-800',
		FREE: 'bg-orange-100 text-orange-800'
	};

	const badgeClass =
		statusColors[cat.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
</script>

<Table.Row class="cursor-pointer" {onclick}>
	<Table.Cell>
		<img
			src={cat.media?.[0]?.picture ?? '/img/logo.png'}
			alt={cat.name}
			class="h-12 w-12 rounded-full object-cover {focalPointClass[cat.focalPoint ?? 'MID']}"
		/>
	</Table.Cell>
	<Table.Cell class="font-medium">{cat.name}</Table.Cell>
	<Table.Cell>{sexLabel[cat.sex ?? ''] ?? cat.sex}</Table.Cell>
	<Table.Cell class="text-sm">{formatAge(cat.birthDate)}</Table.Cell>
	<Table.Cell>
		<Badge class={badgeClass}>{statusLabel[cat.status] ?? cat.status}</Badge>
	</Table.Cell>
	<Table.Cell class="text-center">
		<BooleanIcon value={cat.isOkDog} />
	</Table.Cell>
	<Table.Cell class="text-center">
		<BooleanIcon value={cat.isOkCat} />
	</Table.Cell>
	<Table.Cell class="text-center">
		<BooleanIcon value={cat.isOkChild} />
	</Table.Cell>
	<Table.Cell class="text-center">
		<BooleanIcon value={cat.isOutside} />
	</Table.Cell>
</Table.Row>
