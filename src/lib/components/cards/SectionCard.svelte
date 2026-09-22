<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	type ColorVariant =
		| 'red'
		| 'orange'
		| 'amber'
		| 'yellow'
		| 'lime'
		| 'gray'
		| 'green'
		| 'emerald'
		| 'teal'
		| 'cyan'
		| 'sky'
		| 'blue'
		| 'indigo'
		| 'violet'
		| 'purple'
		| 'fuchsia'
		| 'pink'
		| 'rose'
		| 'slate'
		| 'gray'
		| 'zinc'
		| 'neutral'
		| 'stone'
		| 'taupe'
		| 'mauve'
		| 'mist'
		| 'olive';

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
		red: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-700' },
		orange: { border: 'border-orange-200', bg: 'bg-orange-50', icon: 'text-orange-700' },
		amber: { border: 'border-amber-200', bg: 'bg-amber-50', icon: 'text-amber-700' },
		yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', icon: 'text-yellow-700' },
		lime: { border: 'border-lime-200', bg: 'bg-lime-50', icon: 'text-lime-700' },
		green: { border: 'border-green-200', bg: 'bg-green-50', icon: 'text-green-700' },
		emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', icon: 'text-emerald-700' },
		teal: { border: 'border-teal-200', bg: 'bg-teal-50', icon: 'text-teal-700' },
		cyan: { border: 'border-cyan-200', bg: 'bg-cyan-50', icon: 'text-cyan-700' },
		sky: { border: 'border-sky-200', bg: 'bg-sky-50', icon: 'text-sky-700' },
		blue: { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'text-blue-700' },
		indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'text-indigo-700' },
		violet: { border: 'border-violet-200', bg: 'bg-violet-50', icon: 'text-violet-700' },
		purple: { border: 'border-purple-200', bg: 'bg-purple-50', icon: 'text-purple-700' },
		fuchsia: { border: 'border-fuchsia-200', bg: 'bg-fuchsia-50', icon: 'text-fuchsia-700' },
		pink: { border: 'border-pink-200', bg: 'bg-pink-50', icon: 'text-pink-700' },
		rose: { border: 'border-rose-200', bg: 'bg-rose-50', icon: 'text-rose-700' },
		slate: { border: 'border-slate-200', bg: 'bg-slate-50', icon: 'text-slate-700' },
		gray: { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-gray-700' },
		zinc: { border: 'border-zinc-200', bg: 'bg-zinc-50', icon: 'text-zinc-700' },
		neutral: { border: 'border-neutral-200', bg: 'bg-neutral-50', icon: 'text-neutral-700' },
		stone: { border: 'border-stone-200', bg: 'bg-stone-50', icon: 'text-stone-700' },
		taupe: { border: 'border-stone-200', bg: 'bg-stone-50', icon: 'text-stone-700' },
		mauve: { border: 'border-purple-200', bg: 'bg-purple-50', icon: 'text-purple-700' },
		mist: { border: 'border-slate-200', bg: 'bg-slate-50', icon: 'text-slate-700' },
		olive: { border: 'border-lime-200', bg: 'bg-lime-50', icon: 'text-lime-700' }
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
