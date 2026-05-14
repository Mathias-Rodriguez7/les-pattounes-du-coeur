<script lang="ts">
	import type { Component } from 'svelte';

	type StatItem = {
		label: string;
		value: number;
		total?: number;
		icon: Component;
	};

	type Props = {
		title: string;
		stats: StatItem[];
	};

	let { title, stats }: Props = $props();
</script>

<div
	class="
		bg-popover
		border-border
		overflow-hidden
		rounded-3xl
		border
		shadow-md
	"
>
	<div class="flex flex-col gap-2 p-6">
		<!-- HEADER -->
		<div>
			<h2 class="text-xl font-bold tracking-tight">
				{title}
			</h2>
		</div>

		<!-- STATS -->
		<div class="divide-border flex flex-col divide-y">
			{#each stats as stat (stat.label)}
				<div class="flex items-center justify-between py-2">
					<!-- LEFT -->
					<div class="flex items-center gap-4">
						<div
							class="
								from-accent
								to-primary
								flex
								h-10
								w-10
								items-center
								justify-center
								rounded-2xl
								bg-linear-to-br
								shadow-lg
							"
						>
							<svelte:component this={stat.icon} class="h-5 w-5" />
						</div>

						<div>
							<p class="text-sm font-medium">
								{stat.label}
							</p>

							{#if stat.total}
								<p class="text-muted-foreground text-xs">
									sur {stat.total} au total
								</p>
							{/if}
						</div>
					</div>

					<!-- RIGHT -->
					<div class="flex flex-col items-end">
						<p class="text-3xl font-black tracking-tight">
							{stat.value}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
