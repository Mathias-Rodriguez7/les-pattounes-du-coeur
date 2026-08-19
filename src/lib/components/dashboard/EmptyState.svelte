<script lang="ts">
	import type { Component } from 'svelte';

	type Props = {
		icon?: Component;
		message: string;
	};

	let { icon, message }: Props = $props();
</script>

<div
	class="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10 text-center"
>
	{#if icon}
		{@const Icon = icon}
		<Icon class="h-8 w-8 opacity-40" />
	{/if}
	<p class="text-sm">{message}</p>
</div>
