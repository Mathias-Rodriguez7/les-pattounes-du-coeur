<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn, type WithoutChild } from '$lib/utils.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = 'default',
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: 'sm' | 'default';
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		[
			'border-input focus-visible:border-primary focus-visible:ring-primary/20',
			'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
			'dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50',
			'data-placeholder:text-muted-foreground',
			'flex w-full items-center justify-between gap-1.5',
			'dark:bg-input/30 rounded-4xl border bg-white',
			'py-2 pr-2 pl-3 text-sm whitespace-nowrap shadow-xs',
			'transition-[color,box-shadow] outline-none focus-visible:ring-3',
			'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
			'data-[size=default]:h-10 data-[size=sm]:h-8',
			'*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex',
			'*:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5',
			'[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4'
		],
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon class="text-muted-foreground pointer-events-none size-4 shrink-0" />
</SelectPrimitive.Trigger>
