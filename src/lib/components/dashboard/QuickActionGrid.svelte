<script lang="ts">
	import type { Component } from 'svelte';

	type Action = {
		label: string;
		description: string;
		href: string;
		icon: Component;
	};

	type Props = {
		actions: Action[];
	};

	let { actions }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	{#each actions as action (action.href)}
		{@const Icon = action.icon}
		<a
			href={action.href}
			class="group bg-card border-border hover:border-primary flex flex-col gap-3 rounded-3xl border p-5 transition"
		>
			<div
				class="from-accent to-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg transition group-hover:scale-105"
			>
				<Icon class="h-5 w-5 text-white" />
			</div>

			<div class="flex flex-col gap-0.5">
				<p class="text-sm font-semibold">{action.label}</p>
				<p class="text-muted-foreground text-xs">{action.description}</p>
			</div>
		</a>
	{/each}
</div>
