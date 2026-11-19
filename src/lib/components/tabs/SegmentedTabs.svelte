<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';

	// Des onglets « pilule » : l'onglet choisi est plein (couleur de l'appli), avec une icône
	// et un nombre. Le même style partout (dashboard, page Chats…).
	interface Tab {
		key: T;
		label: string;
		icon?: Component<{ class?: string }>;
		/** Le nombre affiché dans l'onglet (rien si 0 ou absent) */
		count?: number;
		/** La couleur de la pastille du nombre (ex : rouge s'il y a de l'urgent) */
		countClass?: string;
	}

	interface Props {
		tabs: Tab[];
		value: T;
		/** Appelé quand on change d'onglet (ex : vider la sélection) */
		onChange?: (key: T) => void;
		label?: string;
	}

	let { tabs, value = $bindable(), onChange, label }: Props = $props();
</script>

<div
	role="tablist"
	aria-label={label}
	class="inline-flex gap-1 rounded-2xl border border-border bg-card p-1"
>
	{#each tabs as tab (tab.key)}
		{@const active = value === tab.key}
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onclick={() => {
				if (active) return;
				value = tab.key;
				onChange?.(tab.key);
			}}
			class="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium whitespace-nowrap transition-colors {active
				? 'bg-primary text-primary-foreground shadow-sm'
				: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
		>
			{#if tab.icon}<tab.icon class="size-4" />{/if}
			{tab.label}
			{#if tab.count}
				<span
					class="rounded-md px-1.5 text-xs font-semibold {tab.countClass ??
						(active
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-muted-foreground')}"
				>
					{tab.count}
				</span>
			{/if}
		</button>
	{/each}
</div>
