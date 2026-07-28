<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';

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

	const iconMap: Record<string, string> = {
		cat: 'cat',
		house: 'house',
		mail: 'mail',
		users: 'users',
		clipboard: 'clipboard',
		news: 'news'
	};
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
						<Icon
							name={iconMap[action.icon] || 'plus'}
							withWrapper={true}
							wrapperClass="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg"
							iconClass="h-5 w-5 text-white"
							style="background: linear-gradient(135deg, var(--icon-{action.iconTheme}-from), var(--icon-{action.iconTheme}-to))"
						/>
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
