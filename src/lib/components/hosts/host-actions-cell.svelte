<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import Eye from '@lucide/svelte/icons/eye';

	let { hostId }: { hostId: string } = $props();
</script>

<Button variant="ghost" size="sm" onclick={() => goto(`/hosts/${hostId}`)}>
	<Eye class="h-4 w-4" />
</Button>
