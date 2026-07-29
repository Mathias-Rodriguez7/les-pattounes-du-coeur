<script lang="ts">
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { PieChart, Text } from 'layerchart';

	interface Props {
		title: string;
		description: string;
		volunteerValue: number;
		totalValue: number;
		unit: string;
		volunteerColor?: string;
		otherColor?: string;
		trend?: string;
		trendIcon?: boolean;
		footer?: string;
		details?: Array<{ label: string; value: number | string }>;
		class?: string;
	}

	let {
		title,
		description,
		volunteerValue,
		totalValue,
		unit,
		volunteerColor = 'var(--chart-1)',
		otherColor = 'var(--chart-2)',
		trend,
		trendIcon = false,
		footer,
		details,
		class: className
	}: Props = $props();

	const otherValue = totalValue - volunteerValue;
	const percentage = ((volunteerValue / totalValue) * 100).toFixed(1);

	const chartConfig = {
		volunteer: { label: 'Bénévole', color: volunteerColor },
		other: { label: 'Autres', color: otherColor }
	} satisfies Chart.ChartConfig;

	const pieData = [
		{ name: 'Bénévole', value: volunteerValue, color: volunteerColor },
		{ name: 'Autres', value: otherValue, color: otherColor }
	];
</script>

<div class="flex h-full flex-col gap-4 {className}">
	<!-- Header -->
	<div class="text-center">
		<h3 class="text-base font-semibold sm:text-lg">{title}</h3>
		<p class="text-muted-foreground text-xs sm:text-sm">{description}</p>
	</div>

	<!-- Chart -->
	<div class="flex flex-1 items-center justify-center px-2 sm:px-4">
		<Chart.Container
			config={chartConfig}
			class="aspect-square max-h-50 w-full sm:max-h-62.5 md:max-h-75"
		>
			<PieChart
				data={pieData}
				key="name"
				value="value"
				c="color"
				innerRadius={60}
				padding={20}
				range={[-90, 90]}
				props={{ pie: { sort: null } }}
				cornerRadius={4}
			>
				{#snippet aboveMarks()}
					<Text
						value={`${volunteerValue}/${totalValue}`}
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-foreground text-xl font-bold sm:text-2xl!"
						dy={-20}
					/>
					<Text
						value={unit}
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-muted-foreground! text-muted-foreground text-xs sm:text-sm"
						dy={-4}
					/>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel />
				{/snippet}
			</PieChart>
		</Chart.Container>
	</div>

	<!-- Footer Info -->
	<div class="space-y-2 text-sm">
		{#if trend && trendIcon}
			<div class="flex items-center gap-2 text-xs leading-none font-medium sm:text-sm">
				{trend}
				<TrendingUpIcon class="size-3 sm:size-4" />
			</div>
		{/if}

		{#if footer}
			<div class="text-muted-foreground text-xs leading-none">
				{footer}
			</div>
		{/if}

		{#if !footer && !trend}
			<div class="text-muted-foreground text-xs leading-none">
				{percentage}% des {unit.toLowerCase()} gérées par ce bénévole
			</div>
		{/if}

		{#if details && details.length > 0}
			<div class="flex flex-col gap-1 border-t pt-2">
				{#each details as detail, i (detail.label + i)}
					<div class="flex justify-between text-xs">
						<span class="text-muted-foreground">{detail.label}</span>
						<span class="font-medium">{detail.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
