<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';

	interface Action {
		label: string;
		description: string;
		icon: string;
		iconTheme: string;
		href: string;
	}

	interface Props {
		actions: Action[];
	}

	let { actions }: Props = $props();
</script>

<section class="flex flex-col gap-4">
	<SectionHeader title="Actions rapides" />
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
		{#each actions as action (action.label)}
			<a href={action.href} class="group">
				<div
					class="border-border bg-card hover:border-primary/50 rounded-xl border px-6 py-8 transition-all hover:shadow-md"
				>
					<div class="flex items-start gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
							style="background: {getGradientStyle(action.iconTheme)}"
						>
							<Icon name={action.icon} iconClass="h-5 w-5 text-white" />
						</div>
						<div class="flex min-w-0 flex-col gap-1">
							<span class="group-hover:text-primary text-sm font-semibold transition-colors"
								>{action.label}</span
							>
							<span class="text-muted-foreground text-xs">{action.description}</span>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
