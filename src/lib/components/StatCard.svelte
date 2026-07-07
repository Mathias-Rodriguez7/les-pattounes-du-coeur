<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { ComponentType } from 'svelte';

	interface Props {
		label: string;
		value: number;
		icon: ComponentType;
		description: string;
		trend?: {
			value: number;
			isPositive: boolean;
		};
	}

	let { label, value, icon: Icon, description, trend }: Props = $props();
</script>

<Card.Root
	class="group hover:border-primary/50 relative overflow-hidden transition-all hover:shadow-md"
>
	<Card.Content class="space-y-4 p-6">
		<!-- Header: Icon + Label -->
		<div class="flex items-start justify-between">
			<div class="flex-1 space-y-1">
				<p class="text-muted-foreground text-sm font-medium">{label}</p>
				<h3 class="text-2xl font-bold tracking-tight">{value.toLocaleString('fr-FR')}</h3>
			</div>

			<div class="bg-primary/10 text-primary shrink-0 rounded-lg p-3">
				<svelte:component this={Icon} class="h-5 w-5" />
			</div>
		</div>

		<!-- Description + Trend -->
		<div class="flex items-center justify-between">
			<p class="text-muted-foreground text-xs">{description}</p>

			{#if trend}
				<div
					class="rounded-full px-2 py-1 text-xs font-semibold"
					class:bg-green-100={trend.isPositive}
					class:text-green-700={trend.isPositive}
					class:bg-red-100={!trend.isPositive}
					class:text-red-700={!trend.isPositive}
				>
					{trend.isPositive ? '+' : '-'}{trend.value}%
				</div>
			{/if}
		</div>
	</Card.Content>

	<!-- Gradient background subtil au hover -->
	<div
		class="from-primary pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-5"
	></div>
</Card.Root>
