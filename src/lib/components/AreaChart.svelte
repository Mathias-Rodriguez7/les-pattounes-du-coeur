<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { scaleUtc } from 'd3-scale';
	import { Area, AreaChart, ChartClipPath } from 'layerchart';
	import { curveNatural } from 'd3-shape';
	import ChartContainer from '$lib/components/ui/chart/chart-container.svelte';
	import { cubicInOut } from 'svelte/easing';

	const chartData = [
		{ date: new Date('2024-04-01'), expenses: 222, don: 150 },
		{ date: new Date('2024-04-02'), expenses: 97, don: 180 },
		{ date: new Date('2024-04-03'), expenses: 167, don: 120 },
		{ date: new Date('2024-04-04'), expenses: 242, don: 260 },
		{ date: new Date('2024-04-05'), expenses: 373, don: 290 },
		{ date: new Date('2024-04-06'), expenses: 301, don: 340 },
		{ date: new Date('2024-04-07'), expenses: 245, don: 180 },
		{ date: new Date('2024-04-08'), expenses: 409, don: 320 },
		{ date: new Date('2024-04-09'), expenses: 59, don: 110 },
		{ date: new Date('2024-04-10'), expenses: 261, don: 190 },
		{ date: new Date('2024-04-11'), expenses: 327, don: 350 },
		{ date: new Date('2024-04-12'), expenses: 292, don: 210 },
		{ date: new Date('2024-04-13'), expenses: 342, don: 380 },
		{ date: new Date('2024-04-14'), expenses: 137, don: 220 },
		{ date: new Date('2024-04-15'), expenses: 120, don: 170 },
		{ date: new Date('2024-04-16'), expenses: 138, don: 190 },
		{ date: new Date('2024-04-17'), expenses: 446, don: 360 },
		{ date: new Date('2024-04-18'), expenses: 364, don: 410 },
		{ date: new Date('2024-04-19'), expenses: 243, don: 180 },
		{ date: new Date('2024-04-20'), expenses: 89, don: 150 },
		{ date: new Date('2024-04-21'), expenses: 137, don: 200 },
		{ date: new Date('2024-04-22'), expenses: 224, don: 170 },
		{ date: new Date('2024-04-23'), expenses: 138, don: 230 },
		{ date: new Date('2024-04-24'), expenses: 387, don: 290 },
		{ date: new Date('2024-04-25'), expenses: 215, don: 250 },
		{ date: new Date('2024-04-26'), expenses: 75, don: 130 },
		{ date: new Date('2024-04-27'), expenses: 383, don: 420 },
		{ date: new Date('2024-04-28'), expenses: 122, don: 180 },
		{ date: new Date('2024-04-29'), expenses: 315, don: 240 },
		{ date: new Date('2024-04-30'), expenses: 454, don: 380 },
		{ date: new Date('2024-05-01'), expenses: 165, don: 220 },
		{ date: new Date('2024-05-02'), expenses: 293, don: 310 },
		{ date: new Date('2024-05-03'), expenses: 247, don: 190 },
		{ date: new Date('2024-05-04'), expenses: 385, don: 420 },
		{ date: new Date('2024-05-05'), expenses: 481, don: 390 },
		{ date: new Date('2024-05-06'), expenses: 498, don: 520 },
		{ date: new Date('2024-05-07'), expenses: 388, don: 300 },
		{ date: new Date('2024-05-08'), expenses: 149, don: 210 },
		{ date: new Date('2024-05-09'), expenses: 227, don: 180 },
		{ date: new Date('2024-05-10'), expenses: 293, don: 330 },
		{ date: new Date('2024-05-11'), expenses: 335, don: 270 },
		{ date: new Date('2024-05-12'), expenses: 197, don: 240 },
		{ date: new Date('2024-05-13'), expenses: 197, don: 160 },
		{ date: new Date('2024-05-14'), expenses: 448, don: 490 },
		{ date: new Date('2024-05-15'), expenses: 473, don: 380 },
		{ date: new Date('2024-05-16'), expenses: 338, don: 400 },
		{ date: new Date('2024-05-17'), expenses: 499, don: 420 },
		{ date: new Date('2024-05-18'), expenses: 315, don: 350 },
		{ date: new Date('2024-05-19'), expenses: 235, don: 180 },
		{ date: new Date('2024-05-20'), expenses: 177, don: 230 },
		{ date: new Date('2024-05-21'), expenses: 82, don: 140 },
		{ date: new Date('2024-05-22'), expenses: 81, don: 120 },
		{ date: new Date('2024-05-23'), expenses: 252, don: 290 },
		{ date: new Date('2024-05-24'), expenses: 294, don: 220 },
		{ date: new Date('2024-05-25'), expenses: 201, don: 250 },
		{ date: new Date('2024-05-26'), expenses: 213, don: 170 },
		{ date: new Date('2024-05-27'), expenses: 420, don: 460 },
		{ date: new Date('2024-05-28'), expenses: 233, don: 190 },
		{ date: new Date('2024-05-29'), expenses: 78, don: 130 },
		{ date: new Date('2024-05-30'), expenses: 340, don: 280 },
		{ date: new Date('2024-05-31'), expenses: 178, don: 230 },
		{ date: new Date('2024-06-01'), expenses: 178, don: 200 },
		{ date: new Date('2024-06-02'), expenses: 470, don: 410 },
		{ date: new Date('2024-06-03'), expenses: 103, don: 160 },
		{ date: new Date('2024-06-04'), expenses: 439, don: 380 },
		{ date: new Date('2024-06-05'), expenses: 88, don: 140 },
		{ date: new Date('2024-06-06'), expenses: 294, don: 250 },
		{ date: new Date('2024-06-07'), expenses: 323, don: 370 },
		{ date: new Date('2024-06-08'), expenses: 385, don: 320 },
		{ date: new Date('2024-06-09'), expenses: 438, don: 480 },
		{ date: new Date('2024-06-10'), expenses: 155, don: 200 },
		{ date: new Date('2024-06-11'), expenses: 92, don: 150 },
		{ date: new Date('2024-06-12'), expenses: 492, don: 420 },
		{ date: new Date('2024-06-13'), expenses: 81, don: 130 },
		{ date: new Date('2024-06-14'), expenses: 426, don: 380 },
		{ date: new Date('2024-06-15'), expenses: 307, don: 350 },
		{ date: new Date('2024-06-16'), expenses: 371, don: 310 },
		{ date: new Date('2024-06-17'), expenses: 475, don: 520 },
		{ date: new Date('2024-06-18'), expenses: 107, don: 170 },
		{ date: new Date('2024-06-19'), expenses: 341, don: 290 },
		{ date: new Date('2024-06-20'), expenses: 408, don: 450 },
		{ date: new Date('2024-06-21'), expenses: 169, don: 210 },
		{ date: new Date('2024-06-22'), expenses: 317, don: 270 },
		{ date: new Date('2024-06-23'), expenses: 480, don: 530 },
		{ date: new Date('2024-06-24'), expenses: 132, don: 180 },
		{ date: new Date('2024-06-25'), expenses: 141, don: 190 },
		{ date: new Date('2024-06-26'), expenses: 434, don: 380 },
		{ date: new Date('2024-06-27'), expenses: 448, don: 490 },
		{ date: new Date('2024-06-28'), expenses: 149, don: 200 },
		{ date: new Date('2024-06-29'), expenses: 103, don: 160 },
		{ date: new Date('2024-06-30'), expenses: 446, don: 400 }
	];

	let timeRange = $state('90d');

	const selectedLabel = $derived.by(() => {
		switch (timeRange) {
			case '90d':
				return 'Last 3 months';
			case '30d':
				return 'Last 30 days';
			case '7d':
				return 'Last 7 days';
			default:
				return 'Last 3 months';
		}
	});

	const filteredData = $derived(
		chartData.filter((item) => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const referenceDate = new Date('2024-06-30');
			let daysToSubtract = 90;
			if (timeRange === '30d') {
				daysToSubtract = 30;
			} else if (timeRange === '7d') {
				daysToSubtract = 7;
			}

			referenceDate.setDate(referenceDate.getDate() - daysToSubtract);
			return item.date >= referenceDate;
		})
	);

	const chartConfig = {
		expenses: { label: 'expenses', color: 'red' },
		don: { label: 'don', color: 'green' }
	} satisfies Chart.ChartConfig;
</script>

<Card.Root class="flex h-full flex-col">
	<Card.Header class="flex flex-col gap-4 sm:flex-row sm:items-center">
		<div class="grid flex-1 gap-1 text-center sm:text-start">
			<Card.Title>Area Chart - Interactive</Card.Title>
			<Card.Description>Showing total visitors for the last 3 months</Card.Description>
		</div>
		<Select.Root type="single" bind:value={timeRange}>
			<Select.Trigger class="w-40 rounded-lg sm:ms-auto" aria-label="Select a value">
				{selectedLabel}
			</Select.Trigger>
			<Select.Content class="rounded-xl">
				<Select.Item value="90d" class="rounded-lg">Last 3 months</Select.Item>
				<Select.Item value="30d" class="rounded-lg">Last 30 days</Select.Item>
				<Select.Item value="7d" class="rounded-lg">Last 7 days</Select.Item>
			</Select.Content>
		</Select.Root>
	</Card.Header>
	<Card.Content class="flex flex-1">
		<ChartContainer config={chartConfig} class="-ml-3 aspect-video max-h-100 w-full">
			<AreaChart
				legend
				data={filteredData}
				x="date"
				xScale={scaleUtc()}
				series={[
					{
						key: 'don',
						label: 'don',
						color: chartConfig.don.color
					},
					{
						key: 'expenses',
						label: 'expenses',
						color: chartConfig.expenses.color
					}
				]}
				seriesLayout="stack"
				props={{
					xAxis: {
						ticks: timeRange === '7d' ? 7 : undefined,
						format: (v) => {
							return v.toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric'
							});
						}
					},
					yAxis: { format: () => '' }
				}}
			>
				{#snippet marks({ context })}
					<defs>
						<linearGradient id="fillexpenses" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stop-color="var(--color-expenses)" stop-opacity={1.0} />
							<stop offset="95%" stop-color="var(--color-expenses)" stop-opacity={0.1} />
						</linearGradient>
						<linearGradient id="filldon" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stop-color="var(--color-don)" stop-opacity={0.8} />
							<stop offset="95%" stop-color="var(--color-don)" stop-opacity={0.1} />
						</linearGradient>
					</defs>
					<ChartClipPath
						initialWidth={0}
						motion={{
							width: { type: 'tween', duration: 1000, easing: cubicInOut }
						}}
					>
						{#each context.series.visibleSeries as s (s.key)}
							<Area
								seriesKey={s.key}
								curve={curveNatural}
								fillOpacity={0.4}
								line={{ class: 'stroke-1' }}
								motion="tween"
								{...s.props}
								fill={s.key === 'expenses' ? 'url(#fillexpenses)' : 'url(#filldon)'}
							/>
						{/each}
					</ChartClipPath>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip
						labelFormatter={(v: Date) => {
							return v.toLocaleDateString('en-US', {
								month: 'long'
							});
						}}
						indicator="line"
					/>
				{/snippet}
			</AreaChart>
		</ChartContainer>
	</Card.Content>
</Card.Root>
