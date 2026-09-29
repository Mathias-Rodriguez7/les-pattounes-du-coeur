<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Pencil } from '@lucide/svelte';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import type { HostBasic } from '$lib/types/host';

	interface Props {
		catId: string;
		cat: CatFull;
		placement: PlacementFull;
		hosts: HostBasic;
		onSuccess?: () => void;
	}

	let { catId, cat, placement = null, hosts, onSuccess }: Props = $props();

	const isEdit = $derived(!!placement);

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="ghost" size="icon">
			<Pencil class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>

	<Dialog.Content size="xxl" class="max-w-5xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				Imformation de {cat.name}
			</Dialog.Title>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
