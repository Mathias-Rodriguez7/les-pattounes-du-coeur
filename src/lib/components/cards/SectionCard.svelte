<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	type ColorVariant = 'blue' | 'orange' | 'indigo' | 'emerald' | 'red' | 'gray' | 'green';

	type ColorConfig = {
		border: string;
		bg: string;
		icon: string;
	};

	type Props = {
		icon: string;
		title: string;
		color?: ColorVariant;
		separator?: boolean;
		children?: import('svelte').Snippet;
	};

	const { icon, title, color = 'gray', separator = false, children }: Props = $props();

	const colorConfig: Record<ColorVariant, ColorConfig> = {
		blue: { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'text-blue-700' },
		orange: { border: 'border-orange-200', bg: 'bg-orange-50', icon: 'text-orange-700' },
		indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'text-indigo-700' },
		emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', icon: 'text-emerald-700' },
		red: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-700' },
		gray: { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-slate-700' },
		green: { border: 'border-green-200', bg: 'bg-green-50', icon: 'text-emerald-700' }
	};

	const current = $derived(colorConfig[color]);
</script>

<div class={`rounded-lg border ${current.border} ${current.bg} p-4`}>
	<div class="mb-4 flex items-center gap-2">
		<Icon name={icon} class={`h-5 w-5 ${current.icon}`} />
		<h4 class="text-sm font-semibold text-gray-900">{title}</h4>
	</div>

	<div>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if separator}
		<Separator class="mt-4" />
	{/if}
</div>
