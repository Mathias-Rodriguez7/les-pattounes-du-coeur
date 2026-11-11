<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';

	interface Action {
		label: string;
		description: string;
		icon: string;
		iconTheme: string;
		/** Une route existante : vérifié côté serveur par link() (le type se perd en sérialisant) */
		href: string;
	}

	interface Props {
		actions: Action[];
	}

	let { actions }: Props = $props();
</script>

<section class="flex flex-col gap-4">
	<SectionHeader title="Actions rapides" />
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each actions as action (action.label)}
			<a href={resolve(action.href as Pathname)} class="group">
				<div
					class="rounded-xl border border-border bg-card px-4 py-6 transition-all hover:border-primary/50 hover:shadow-md sm:px-6 sm:py-8"
				>
					<div class="flex items-start gap-3 sm:gap-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
							style="background: {getGradientStyle(action.iconTheme)}"
						>
							<Icon name={action.icon} iconClass="h-5 w-5 text-white" />
						</div>
						<div class="flex min-w-0 flex-col gap-1">
							<span
								class="text-xs font-semibold transition-colors group-hover:text-primary sm:text-sm"
								>{action.label}</span
							>
							<span class="line-clamp-2 text-xs text-muted-foreground">{action.description}</span>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
