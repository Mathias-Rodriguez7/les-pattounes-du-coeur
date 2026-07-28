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

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each taskGroups as group (group.theme)}
			<div class="border-border bg-card py4 rounded-xl border px-6 pt-6">
				<div class="flex items-center gap-4">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
						style="background: {getGradientStyle(group.iconTheme)}"
					>
						<Icon name={group.icon} iconClass="h-5 w-5 text-white" />
					</div>
					<h3 class="font-semibold">{group.theme}</h3>
				</div>

				{#if group.tasks.length > 0}
					<div class="flex flex-col gap-3">
						{#each group.tasks as task (task.label)}
							<a
								href={task.href || '#'}
								class="hover:border-primary/50 flex flex-col gap-2 rounded-lg p-4 transition-all hover:shadow-md"
							>
								<div class="flex items-center justify-between">
									<p class="text-sm font-medium">{task.label}</p>
									<span
										class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
										style="background: {getGradientStyle(group.iconTheme)}"
									>
										{task.value}
									</span>
								</div>
								<p class="text-muted-foreground text-xs">{task.description}</p>
							</a>
							<Separator />
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-xs">Aucune tâche</p>
				{/if}
			</div>
		{/each}
	</div>
</section>
