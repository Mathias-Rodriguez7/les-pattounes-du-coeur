<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface TaskGroup {
		theme: string;
		icon: string;
		iconTheme: string;
		tasks: Array<{
			label: string;
			description: string;
			value: number;
			href: string;
		}>;
	}

	interface Props {
		taskGroups: TaskGroup[];
	}

	let { taskGroups }: Props = $props();
</script>

<section class="flex flex-col gap-4">
	<SectionHeader title="À traiter" />

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
		{#each taskGroups as group (group.theme)}
			<div class="border-border bg-card rounded-xl border px-4 py-6 sm:px-6">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
						style="background: {getGradientStyle(group.iconTheme)}"
					>
						<Icon name={group.icon} iconClass="h-5 w-5 text-white" />
					</div>
					<h3 class="text-sm font-semibold sm:text-base">{group.theme}</h3>
				</div>

				{#if group.tasks.length > 0}
					<div class="mt-4 flex flex-col gap-3">
						{#each group.tasks as task (task.label)}
							<a
								href={task.href || '#'}
								class="hover:border-primary/50 flex flex-col gap-2 rounded-lg border border-transparent px-3 py-3 transition-all hover:shadow-md sm:px-4 sm:py-4"
							>
								<div class="flex items-center justify-between gap-2">
									<p class="text-xs font-medium sm:text-sm">{task.label}</p>
									<span
										class="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white sm:h-8 sm:w-8"
										style="background: {getGradientStyle(group.iconTheme)}"
									>
										{task.value}
									</span>
								</div>
								<p class="text-muted-foreground text-xs">{task.description}</p>
							</a>
							{#if group.tasks.indexOf(task) < group.tasks.length - 1}
								<Separator />
							{/if}
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground mt-4 text-xs">Aucune tâche</p>
				{/if}
			</div>
		{/each}
	</div>
</section>
