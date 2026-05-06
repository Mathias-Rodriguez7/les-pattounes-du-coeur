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
		{ date: new Date('2024-01-01'), cats: 32, adoptions: 34, sterilizations: 0 },
		{ date: new Date('2024-02-01'), cats: 35, adoptions: 16, sterilizations: 5 },
		{ date: new Date('2024-03-01'), cats: 26, adoptions: 33, sterilizations: 2 },
		{ date: new Date('2024-04-01'), cats: 71, adoptions: 16, sterilizations: 2 },
		{ date: new Date('2024-05-01'), cats: 96, adoptions: 29, sterilizations: 5 },
		{ date: new Date('2024-06-01'), cats: 66, adoptions: 44, sterilizations: 5 },
		{ date: new Date('2024-07-01'), cats: 70, adoptions: 58, sterilizations: 1 },
		{ date: new Date('2024-08-01'), cats: 71, adoptions: 53, sterilizations: 4 },
		{ date: new Date('2024-09-01'), cats: 63, adoptions: 47, sterilizations: 10 },
		{ date: new Date('2024-10-01'), cats: 55, adoptions: 44, sterilizations: 8 },
		{ date: new Date('2024-11-01'), cats: 46, adoptions: 48, sterilizations: 12 },
		{ date: new Date('2024-12-01'), cats: 13, adoptions: 55, sterilizations: 5 },

		{ date: new Date('2025-01-01'), cats: 38, adoptions: 29, sterilizations: 6 },
		{ date: new Date('2025-02-01'), cats: 37, adoptions: 51, sterilizations: 6 },
		{ date: new Date('2025-03-01'), cats: 65, adoptions: 31, sterilizations: 18 },
		{ date: new Date('2025-04-01'), cats: 74, adoptions: 21, sterilizations: 13 },
		{ date: new Date('2025-05-01'), cats: 115, adoptions: 26, sterilizations: 21 },
		{ date: new Date('2025-06-01'), cats: 106, adoptions: 54, sterilizations: 16 },
		{ date: new Date('2025-07-01'), cats: 78, adoptions: 51, sterilizations: 17 },
		{ date: new Date('2025-08-01'), cats: 51, adoptions: 63, sterilizations: 5 },
		{ date: new Date('2025-09-01'), cats: 76, adoptions: 71, sterilizations: 11 },
		{ date: new Date('2025-10-01'), cats: 98, adoptions: 79, sterilizations: 15 },
		{ date: new Date('2025-11-01'), cats: 44, adoptions: 71, sterilizations: 9 },
		{ date: new Date('2025-12-01'), cats: 23, adoptions: 64, sterilizations: 8 },

		{ date: new Date('2026-01-01'), cats: 52, adoptions: 27, sterilizations: 0 },
		{ date: new Date('2026-02-01'), cats: 29, adoptions: 30, sterilizations: 0 },
		{ date: new Date('2026-03-01'), cats: 44, adoptions: 30, sterilizations: 0 },
		{ date: new Date('2026-04-01'), cats: 53, adoptions: 27, sterilizations: 0 }
	];

	type ChartKey = 'cats' | 'Adoadoptionspté' | 'sterilizations';

	let timeRange = $state('3y');

	const selectedLabel = $derived.by(() => {
		switch (timeRange) {
			case '1y':
				return '1 an';
			case '2y':
				return '2 ans';
			case '3y':
				return '3 ans';
			default:
				return '3 ans';
		}
	});

	const maxDate = chartData[chartData.length - 1].date;

	function subtractYears(date: Date, years: number) {
		return new Date(date.getFullYear() - years, date.getMonth(), date.getDate());
	}

	const filteredData = $derived.by(() => {
		let years = 3;
		if (timeRange === '2y') years = 2;
		if (timeRange === '1y') years = 1;

		const limit = subtractYears(maxDate, years);

		return chartData.filter((item) => item.date >= limit);
	});

	const chartConfig = {
		cats: {
			label: 'Chats pris en charge',
			color: 'hsl(35 85% 55%)'
		},
		adoptions: {
			label: 'Adopté',
			color: 'hsl(210 70% 55%)'
		},
		sterilizations: {
			label: 'Stérilisé et libre',
			color: 'hsl(270 60% 60%)'
		}
	} satisfies Chart.ChartConfig;
</script>

<Card.Root class="flex h-full flex-col">
	<Card.Header class="flex flex-col gap-4 sm:flex-row sm:items-center">
		<div class="grid flex-1 gap-1 text-center sm:text-start">
			<Card.Title>Suivi des chats</Card.Title>
			<Card.Description>Activité de l’association sur 1 à 3 ans</Card.Description>
		</div>
		<Select.Root type="single" bind:value={timeRange}>
			<Select.Trigger class="w-40 rounded-lg sm:ms-auto" aria-label="Select a value">
				{selectedLabel}
			</Select.Trigger>
			<Select.Content class="rounded-xl">
				<Select.Item value="3y" class="rounded-lg">3 ans</Select.Item>
				<Select.Item value="2y" class="rounded-lg">2 ans</Select.Item>
				<Select.Item value="1y" class="rounded-lg">1 ans</Select.Item>
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
					{ key: 'cats', label: chartConfig.cats.label, color: chartConfig.cats.color },
					{
						key: 'adoptions',
						label: chartConfig.adoptions.label,
						color: chartConfig.adoptions.color
					},
					{
						key: 'sterilizations',
						label: chartConfig.sterilizations.label,
						color: chartConfig.sterilizations.color
					}
				]}
				seriesLayout="overlap"
				props={{
					xAxis: {
						ticks: timeRange === '1y' ? 6 : timeRange === '2y' ? 8 : 10,
						format: (v: Date) =>
							v.toLocaleDateString('fr-FR', {
								month: 'short',
								year: timeRange === '1y' ? undefined : 'numeric'
							})
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
								fill={chartConfig[s.key as ChartKey]?.color ?? 'gray'}
							/>
						{/each}
					</ChartClipPath>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip
						labelFormatter={(v: Date) =>
							v.toLocaleDateString('fr-FR', {
								month: 'long',
								year: 'numeric'
							})}
						indicator="line"
					/>
				{/snippet}
			</AreaChart>
		</ChartContainer>
	</Card.Content>
</Card.Root>
