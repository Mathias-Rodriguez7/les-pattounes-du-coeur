<script lang="ts">
	import type { Component } from 'svelte';

	type InfoItem = {
		label: string;
		value: number;
		icon: Component;
		subtitle?: string;
		href?: string;
	};

	type Props = {
		title: string;
		items: InfoItem[];
		emptyLabel?: string;
	};

	let { title, items, emptyLabel = 'Rien à afficher' }: Props = $props();
</script>

<div class="bg-card border-border overflow-hidden rounded-3xl border">
	<div class="flex flex-col gap-3 p-6">
		<h2 class="text-xl font-bold tracking-tight">{title}</h2>

		<div class="divide-border flex flex-col divide-y">
			{#each items as item (item.label)}
				{@const Icon = item.icon}
				<svelte:element
					this={item.href ? 'a' : 'div'}
					href={item.href}
					class="group flex items-center justify-between py-3 {item.href
						? 'hover:bg-accent/40 -mx-2 rounded-xl px-2 transition'
						: ''}"
				>
					<div class="flex items-center gap-4">
						<div
							class="from-accent to-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Icon class="h-5 w-5 text-white" />
						</div>

						<div class="flex flex-col">
							<p class="text-sm font-medium">{item.label}</p>
							{#if item.subtitle}
								<p class="text-muted-foreground text-xs">{item.subtitle}</p>
							{/if}
						</div>
					</div>

					<p
						class="text-3xl font-black tracking-tight {item.value > 0 && item.href
							? 'text-primary'
							: item.value === 0
								? 'text-muted-foreground/40'
								: ''}"
					>
						{item.value}
					</p>
				</svelte:element>
			{:else}
				<p class="text-muted-foreground py-4 text-sm">{emptyLabel}</p>
			{/each}
		</div>
	</div>
</div>
