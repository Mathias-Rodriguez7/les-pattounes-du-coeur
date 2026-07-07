<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { ArcChart, Text } from 'layerchart';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { cn } from '$lib/utils';

	interface Props {
		/** Nombre total de chats en gestion dans l'association */
		totalCats: number;
		/** Nombre de chats en gestion par le bénévole */
		volunteerCats: number;
		class?: string;
	}

	let { totalCats, volunteerCats, class: className }: Props = $props();

	const chartData = [
		{
			browser: 'volunteer',
			visitors: volunteerCats,
			color: 'hsl(var(--primary))'
		}
	];

	const chartConfig = {
		visitors: { label: 'Chats' },
		volunteer: { label: 'Vos chats', color: 'hsl(var(--secondary))' }
	} satisfies Chart.ChartConfig;

	// Calcul du pourcentage
	const percentage = $derived(totalCats > 0 ? Math.round((volunteerCats / totalCats) * 100) : 0);
</script>

<Card.Root class={cn('w-full', className)}>
	<Card.Header class="items-center">
		<Card.Title>Chats en gestion</Card.Title>
		<Card.Description>Vos chats vs association</Card.Description>
	</Card.Header>
	<Card.Content class="flex-1">
		<Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-62.5">
			<ArcChart
				label="browser"
				value="visitors"
				outerRadius={120}
				innerRadius={-20}
				padding={40}
				range={[90, -270]}
				maxValue={totalCats}
				cornerRadius={20}
				series={chartData.map((d) => ({
					key: d.browser,
					color: d.color,
					data: [d]
				}))}
				props={{
					arc: { track: { fill: 'hsl(var(--muted))' }, motion: 'tween' },
					tooltip: { context: { hideDelay: 350 } }
				}}
				tooltipContext={false}
			>
				{#snippet belowMarks()}
					<circle cx="0" cy="0" r="110" class="fill-background" />
				{/snippet}

				{#snippet aboveMarks()}
					<text textAnchor="start" x="-45" y="10" class="fill-foreground text-4xl! font-bold">
						{volunteerCats}
						<tspan class="fill-muted-foreground text-lg! font-normal">
							/ {totalCats}
						</tspan>
					</text>
					<Text
						value="chats"
						textAnchor="middle"
						verticalAnchor="start"
						class="fill-muted-foreground!"
						dy={22}
					/>
				{/snippet}
			</ArcChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer class="flex-col gap-2 text-sm">
		<div class="flex items-center gap-2 leading-none font-medium">
			{percentage}% des chats de l'association
			<TrendingUpIcon class="size-4" />
		</div>
		<div class="text-muted-foreground flex items-center gap-2 leading-none">
			Total : {totalCats} chats en gestion
		</div>
	</Card.Footer>
</Card.Root>
