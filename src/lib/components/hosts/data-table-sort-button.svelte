<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

	let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<Button variant="ghost" size="sm" {onclick} class="-ml-3 h-8">
	{label}
	<ArrowUpDown class="ml-2 h-4 w-4" />
</Button>
