<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { ArcChart, Text } from 'layerchart';

	// -------------------------
	// PROPS (rune mode)
	// -------------------------
	const {
		value,
		maxValue,
		label,
		color,
		unit = '€'
	} = $props<{
		value: number;
		maxValue: number;
		label: string;
		color: string;
		unit?: string;
	}>();

	// -------------------------
	// DATA DERIVÉE
	// -------------------------
	const chartData = $derived(() => [
		{
			type: label,
			amount: value,
			color
		}
	]);

	const chartConfig = {
		[label]: {
			label,
			color
		}
	};

	const percentage = $derived(() => (maxValue ? Math.round((value / maxValue) * 100) : 0));

	const displayValue = $derived(() => (maxValue ? `${percentage}%` : `${value} ${unit}`));
</script>

<Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-60">
	<ArcChart
		label="type"
		value="amount"
		outerRadius={-20}
		innerRadius={-12}
		padding={40}
		range={[0, 360]}
		{maxValue}
		cornerRadius={20}
		series={chartData().map((d) => ({
			key: d.type,
			color: d.color,
			data: [d]
		}))}
		props={{
			arc: {
				track: { fill: '#929492' },
				motion: 'tween'
			}
		}}
		tooltipContext={false}
	>
		{#snippet belowMarks()}
			<circle cx="0" cy="0" r="60" class="fill-background" />
		{/snippet}

		{#snippet aboveMarks()}
			<Text
				value={displayValue}
				textAnchor="middle"
				verticalAnchor="middle"
				class="fill-foreground text-3xl font-bold"
				dy={-5}
			/>

			<Text
				value={label}
				textAnchor="middle"
				verticalAnchor="middle"
				class="fill-muted-foreground text-sm"
				dy={20}
			/>
		{/snippet}
	</ArcChart>
</Chart.Container>
