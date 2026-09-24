<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: RangeCalendarPrimitive.DayProps = $props();
</script>

<RangeCalendarPrimitive.Day
	bind:ref
	class={cn(
		'flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none',
		'not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground',
		// ✅ Today SEULEMENT si pas dans la range
		'[&[data-today]:not([data-range-middle]):not([data-range-start]):not([data-range-end])]:bg-accent [&[data-today]:not([data-range-middle]):not([data-range-start]):not([data-range-end])]:text-accent-foreground',
		'[&[data-today][data-disabled]]:text-muted-foreground',
		// Range middle
		'[&[data-range-middle]]:bg-accent/30 [&[data-range-middle]]:text-foreground [&[data-range-middle]]:rounded-none',
		// Range start/end
		'data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-[range-start]:hover:text-foreground',
		'data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[range-end]:hover:text-foreground',
		// Outside months
		'[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground',
		// Disabled
		'data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[unavailable]:line-through',
		'dark:data-[range-middle]:hover:bg-accent/0',
		'focus:border-ring focus:ring-ring/50 focus:relative',
		'[&>span]:text-xs [&>span]:opacity-70',
		className
	)}
	{...restProps}
/>
