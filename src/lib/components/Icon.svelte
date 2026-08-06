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

	const IconComponent = iconMap[name];
	const finalClass = className || iconClass;
</script>

{#if withWrapper}
	<div {style} class={wrapperClass}>
		<svelte:component this={IconComponent} class={iconClass} />
	</div>
{:else}
	<svelte:component this={IconComponent} class={finalClass} />
{/if}
