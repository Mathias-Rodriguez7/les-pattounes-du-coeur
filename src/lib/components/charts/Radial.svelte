<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { PieChart } from 'layerchart';

	interface Props {
		title: string;
		description: string;
		volunteerValue: number;
		totalValue: number;
		unit: string;
		volunteerColor?: string;
		otherColor?: string;
	}

	let {
		title,
		description,
		volunteerValue,
		totalValue,
		unit,
		volunteerColor = '#3b82f6',
		otherColor = '#e5e7eb'
	}: Props = $props();

	const chartConfig = {
		volunteer: {
			label: 'Vos stats',
			color: volunteerColor
		},
		other: {
			label: "Total dans l'asso",
			color: otherColor
		}
	};

	const percentage = $derived(totalValue > 0 ? Math.round((volunteerValue / totalValue) * 100) : 0);
</script>

<div class="grid h-full grid-rows-[auto_max-content_auto] gap-8">
	<div class="text-center">
		<h3 class="text-lg font-semibold">{title}</h3>
		<p class="text-muted-foreground text-sm">{description}</p>
	</div>

	<div class="relative flex items-center justify-center">
		<div class="aspect-square h-48 w-full max-w-48">
			<Chart.Container config={chartConfig} class="h-full w-full">
				<PieChart
					data={[
						{ platform: 'volunteer', visitors: volunteerValue, color: chartConfig.volunteer.color },
						{
							platform: 'other',
							visitors: totalValue - volunteerValue,
							color: chartConfig.other.color
						}
					]}
					key="platform"
					value="visitors"
					c="color"
					innerRadius={76}
					outerRadius={110}
					padding={29}
					range={[-90, 90]}
					props={{ pie: { sort: null } }}
					cornerRadius={4}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</PieChart>
			</Chart.Container>
		</div>
		<div class="absolute flex flex-col items-center justify-center">
			<div class="text-2xl font-bold">{percentage}%</div>
			<div class="text-muted-foreground text-sm">{unit}</div>
		</div>
	</div>

	<div class="text-muted-foreground -mt-16 text-center text-sm">
		{volunteerValue}/{totalValue}
		{unit.toLowerCase()}
	</div>
</div>
