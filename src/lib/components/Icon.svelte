<!-- src/lib/components/Icon.svelte -->
<script lang="ts">
	import { iconMap } from '$lib/config/iconMap';

	interface Props {
		name: string;
		class?: string;
		withWrapper?: boolean;
		wrapperClass?: string;
		iconClass?: string;
	}

	let {
		name,
		class: className = '',
		withWrapper = false,
		wrapperClass = 'from-accent to-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg',
		iconClass = 'h-5 w-5 text-white'
	}: Props = $props();

	const IconComponent = $derived(iconMap[name]);
</script>

{#if IconComponent}
	{#if withWrapper}
		<div class={wrapperClass}>
			<IconComponent class={iconClass} />
		</div>
	{:else}
		<IconComponent class={className} />
	{/if}
{/if}
