<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import type { CatFull } from '$lib/types/cat';
	import { statusLabel, sexLabel, dot } from '$lib/utils/catHelpers';

	const { cat, onclick }: { cat: CatFull; onclick: () => void } = $props();
</script>

<Table.Row class="cursor-pointer" {onclick}>
	<Table.Cell>
		<img
			src={cat.media?.[0]?.picture ?? '/img/logo.png'}
			alt={cat.name}
			class="h-12 w-12 rounded-full object-cover"
		/>
	</Table.Cell>
	<Table.Cell class="font-medium">{cat.name}</Table.Cell>
	<Table.Cell>{sexLabel[cat.sex ?? ''] ?? cat.sex}</Table.Cell>
	<Table.Cell>{cat.formattedAge}</Table.Cell>
	<Table.Cell>
		<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
	</Table.Cell>
	<Table.Cell><span class={dot(cat.isOkDog)}></span></Table.Cell>
	<Table.Cell><span class={dot(cat.isOkCat)}></span></Table.Cell>
	<Table.Cell><span class={dot(cat.isOkChild)}></span></Table.Cell>
	<Table.Cell><span class={dot(cat.isOutside)}></span></Table.Cell>
</Table.Row>
