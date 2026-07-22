<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { ArcChart, Text } from 'layerchart';
	import { cn } from '$lib/utils';

	interface Props {
		/** Nombre total de chats adoptés dans l'association */
		totalAdoptions: number;
		/** Nombre de chats adoptés par le bénévole */
		volunteerAdoptions: number;
		class?: string;
	}

	let { totalAdoptions, volunteerAdoptions, class: className }: Props = $props();

	const chartData = [
		{
			browser: 'volunteer',
			visitors: volunteerAdoptions,
			color: 'hsl(var(--primary))'
		}
	];

	const chartConfig = {
		visitors: { label: 'Adoptions' },
		volunteer: { label: 'Vos adoptions', color: 'hsl(var(--secondary))' }
	} satisfies Chart.ChartConfig;

	// Calcul du pourcentage
	const percentage = $derived(
		totalAdoptions > 0 ? Math.round((volunteerAdoptions / totalAdoptions) * 100) : 0
	);
</script>

<Card.Root class={cn('w-full', className)}>
	<Card.Header class="items-center">
		<Card.Title>Chats adoptés</Card.Title>
		<Card.Description>Vos adoptions vs association</Card.Description>
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
				maxValue={totalAdoptions}
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
						{volunteerAdoptions}
						<tspan class="fill-muted-foreground text-lg! font-normal">
							/ {totalAdoptions}
						</tspan>
					</text>
					<Text
						value="adoptions"
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
			Vous avez fait {percentage}% des adoptions de l'association
		</div>
		<div class="text-muted-foreground flex items-center gap-2 leading-none">
			Total : {totalAdoptions} chats adoptés
		</div>
	</Card.Footer>
</Card.Root>
