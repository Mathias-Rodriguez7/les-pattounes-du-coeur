<script lang="ts">
	import { iconMap } from '$lib/config/iconMap';

	interface Props {
		name: string;
		class?: string;
		style?: string;
		withWrapper?: boolean;
		wrapperClass?: string;
		iconClass?: string;
	}

	let {
		name,
		class: className = '',
		style = '',
		withWrapper = false,
		wrapperClass = 'from-accent to-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg',
		iconClass = 'h-5 w-5 text-white'
	}: Props = $props();

	const IconComponent = $derived(iconMap[name]);
	const finalClass = $derived(className || iconClass);
</script>

{#if IconComponent}
	{#if withWrapper}
		<div {style} class={wrapperClass}>
			<IconComponent class={iconClass} />
		</div>
	{:else}
		<IconComponent class={finalClass} />
	{/if}
{/if}
