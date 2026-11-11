<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';

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
		fill: string;
	};

	type Props = {
		icon?: string;
		title: string;
		color?: ColorVariant;
		/** 'card' : bloc encadré et coloré | 'plain' : titre seul, qui regroupe d'autres blocs */
		variant?: 'card' | 'plain';
		class?: string;
		separator?: boolean;
		action?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	};

	const {
		icon,
		title,
		color = 'gray',
		variant = 'card',
		separator = false,
		children,
		action,
		class: classList = ''
	}: Props = $props();

	const colorConfig: Record<ColorVariant, ColorConfig> = {
		red: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-700', fill: 'fill-red-500' },
		orange: {
			border: 'border-orange-200',
			bg: 'bg-orange-50',
			icon: 'text-orange-700',
			fill: 'fill-orange-500'
		},
		amber: {
			border: 'border-amber-200',
			bg: 'bg-amber-50',
			icon: 'text-amber-700',
			fill: 'fill-amber-500'
		},
		yellow: {
			border: 'border-yellow-200',
			bg: 'bg-yellow-50',
			icon: 'text-yellow-700',
			fill: 'fill-yellow-500'
		},
		lime: {
			border: 'border-lime-200',
			bg: 'bg-lime-50',
			icon: 'text-lime-700',
			fill: 'fill-lime-500'
		},
		green: {
			border: 'border-green-200',
			bg: 'bg-green-50',
			icon: 'text-green-700',
			fill: 'fill-green-500'
		},
		emerald: {
			border: 'border-emerald-200',
			bg: 'bg-emerald-50',
			icon: 'text-emerald-700',
			fill: 'fill-emerald-500'
		},
		teal: {
			border: 'border-teal-200',
			bg: 'bg-teal-50',
			icon: 'text-teal-700',
			fill: 'fill-teal-500'
		},
		cyan: {
			border: 'border-cyan-200',
			bg: 'bg-cyan-50',
			icon: 'text-cyan-700',
			fill: 'fill-cyan-500'
		},
		sky: { border: 'border-sky-200', bg: 'bg-sky-50', icon: 'text-sky-700', fill: 'fill-sky-500' },
		blue: {
			border: 'border-blue-200',
			bg: 'bg-blue-50',
			icon: 'text-blue-700',
			fill: 'fill-blue-500'
		},
		indigo: {
			border: 'border-indigo-200',
			bg: 'bg-indigo-50',
			icon: 'text-indigo-700',
			fill: 'fill-indigo-500'
		},
		violet: {
			border: 'border-violet-200',
			bg: 'bg-violet-50',
			icon: 'text-violet-700',
			fill: 'fill-violet-500'
		},
		purple: {
			border: 'border-purple-200',
			bg: 'bg-purple-50',
			icon: 'text-purple-700',
			fill: 'fill-purple-500'
		},
		fuchsia: {
			border: 'border-fuchsia-200',
			bg: 'bg-fuchsia-50',
			icon: 'text-fuchsia-700',
			fill: 'fill-fuchsia-500'
		},
		pink: {
			border: 'border-pink-200',
			bg: 'bg-pink-50',
			icon: 'text-pink-700',
			fill: 'fill-pink-500'
		},
		rose: {
			border: 'border-rose-200',
			bg: 'bg-rose-50',
			icon: 'text-rose-700',
			fill: 'fill-rose-500'
		},
		slate: {
			border: 'border-slate-200',
			bg: 'bg-slate-50',
			icon: 'text-slate-700',
			fill: 'fill-slate-500'
		},
		gray: {
			border: 'border-gray-200',
			bg: 'bg-gray-50',
			icon: 'text-gray-700',
			fill: 'fill-gray-500'
		},
		zinc: {
			border: 'border-zinc-200',
			bg: 'bg-zinc-50',
			icon: 'text-zinc-700',
			fill: 'fill-zinc-500'
		},
		neutral: {
			border: 'border-neutral-200',
			bg: 'bg-neutral-50',
			icon: 'text-neutral-700',
			fill: 'fill-neutral-500'
		},
		stone: {
			border: 'border-stone-200',
			bg: 'bg-stone-50',
			icon: 'text-stone-700',
			fill: 'fill-stone-500'
		},
		taupe: {
			border: 'border-stone-200',
			bg: 'bg-stone-50',
			icon: 'text-stone-700',
			fill: 'fill-stone-500'
		},
		mauve: {
			border: 'border-purple-200',
			bg: 'bg-purple-50',
			icon: 'text-purple-700',
			fill: 'fill-purple-500'
		},
		mist: {
			border: 'border-slate-200',
			bg: 'bg-slate-50',
			icon: 'text-slate-700',
			fill: 'fill-slate-500'
		},
		olive: {
			border: 'border-lime-200',
			bg: 'bg-lime-50',
			icon: 'text-lime-700',
			fill: 'fill-lime-500'
		}
	};

	const current = $derived(colorConfig[color]);
</script>

<div
	class="{variant === 'card'
		? `rounded-lg border p-4 ${current.border} ${current.bg}`
		: ''} {classList}"
>
	<!-- flex-wrap : si l'action ne tient pas à côté du titre, elle passe dessous (au lieu d'écraser le titre) -->
	<div class="flex flex-wrap items-center gap-2 {variant === 'card' ? 'mb-4' : 'mb-3'}">
		{#if icon}
			<Icon
				name={icon}
				class="h-5 w-5 shrink-0 {variant === 'card' ? current.icon : 'text-muted-foreground'}"
			/>
		{/if}
		<h4
			class="font-semibold {variant === 'card'
				? 'text-sm text-gray-900'
				: 'text-base text-foreground'}"
		>
			{title}
		</h4>
		{#if action}
			<div class="ml-auto flex shrink-0 items-center gap-1">
				{@render action()}
			</div>
		{/if}
	</div>

	<div>
		{@render children?.()}
	</div>

	{#if separator}
		<Separator class="mt-4" />
	{/if}
</div>
