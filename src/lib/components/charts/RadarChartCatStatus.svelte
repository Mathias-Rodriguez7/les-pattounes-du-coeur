<script lang="ts">
	import { Axis, LineChart, Text } from 'layerchart';
	import { curveLinearClosed } from 'd3-shape';
	import { scaleBand } from 'd3-scale';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils';

	interface Props {
		allCatsData: {
			AVAILABLE: number;
			SOCIALIZE: number;
			ADOPTED: number;
			FREE: number;
		};
		volunteerCatsData: {
			AVAILABLE: number;
			SOCIALIZE: number;
			ADOPTED: number;
			FREE: number;
		};
		class?: string;
	}

	let { allCatsData, volunteerCatsData, class: className }: Props = $props();

	const categories = ['AVAILABLE', 'SOCIALIZE', 'ADOPTED', 'FREE'] as const;

	const categoryLabels: Record<(typeof categories)[number], string> = {
		AVAILABLE: 'Disponibles',
		SOCIALIZE: 'Sociabilisation',
		ADOPTED: 'Adoptés',
		FREE: 'Libres'
	};

	const chartData = $derived(
		categories.map((category) => ({
			category,
			categoryLabel: categoryLabels[category],
			association: allCatsData[category],
			volunteer: volunteerCatsData[category]
		}))
	);

	const chartConfig = $derived({
		association: {
			label: 'Association',
			color: 'hsl(var(--primary))'
		},
		volunteer: {
			label: 'Bénévole',
			color: 'hsl(var(--secondary))'
		}
	} satisfies Chart.ChartConfig);
</script>

<Card.Root class={cn('w-full', className)}>
	<Card.Header class="items-center">
		<Card.Title>Répartition des statuts</Card.Title>
		<Card.Description>Comparaison : association vs vos chats gérés</Card.Description>
	</Card.Header>
	<Card.Content class="flex-1">
		<Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-75">
			<LineChart
				data={chartData}
				series={[
					{
						key: 'association',
						label: 'Association',
						color: chartConfig.association.color,
						props: {
							fill: chartConfig.association.color,
							fillOpacity: 0.6
						}
					},
					{
						key: 'volunteer',
						label: 'Bénévole',
						color: chartConfig.volunteer.color,
						props: {
							fill: chartConfig.volunteer.color,
							fillOpacity: 0.6
						}
					}
				]}
				radial
				x="categoryLabel"
				xScale={scaleBand()}
				padding={12}
				props={{
					spline: {
						curve: curveLinearClosed,
						stroke: '0',
						motion: 'tween'
					},
					xAxis: {
						tickLength: 0
					},
					yAxis: {
						format: () => ''
					},
					grid: {
						radialY: 'linear'
					},
					tooltip: {
						context: {
							mode: 'voronoi'
						}
					},
					highlight: {
						lines: false,
						points: { r: 4 }
					}
				}}
			>
				{#snippet axis()}
					<Axis placement="angle" tickLength={0}>
						{#snippet tickLabel({ props, index })}
							{@const y = props.y
								? typeof props.y === 'number'
									? props.y
									: typeof props.y === 'string'
										? Number.parseInt(props.y)
										: 0
								: 0}
							{@const data = chartData[index]}
							<Text {...props} {y} value={data.categoryLabel} class="fill-foreground text-xs" />
						{/snippet}
					</Axis>
					<Axis placement="radius" format={() => ''} />
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip />
				{/snippet}
			</LineChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer class="flex-col gap-2 text-sm">
		<div class="text-muted-foreground flex items-center gap-2 leading-none">
			Comparaison des statuts de chats
		</div>
	</Card.Footer>
</Card.Root>
