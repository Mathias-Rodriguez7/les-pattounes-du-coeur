<script lang="ts">
	import SectionHeader from '#lib/components/dashboard/SectionHeader.svelte';
	import { resolve } from '$app/paths';
	import type { Path } from '$app/types';
	import Icon from '#lib/components/Icon.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';

	interface TaskGroup {
		theme: string;
		icon: string;
		iconTheme: string;
		tasks: Array<{
			label: string;
			description: string;
			value: number;
			/** Une route existante : vérifié côté serveur par link() (le type se perd en sérialisant) */
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
			<div class="rounded-xl border border-border bg-card px-4 py-6 sm:px-6">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
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
								href={resolve(task.href as Path)}
								class="flex flex-col gap-2 rounded-lg border border-transparent px-2 py-2 transition-all hover:border-primary/50 hover:shadow-md"
							>
								<div class="flex items-center justify-between gap-2">
									<p class="text-xs font-semibold">{task.label}</p>
									<span
										class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
										style="background: {getGradientStyle(group.iconTheme)}"
									>
										{task.value}
									</span>
								</div>
								<p class="text-xs text-muted-foreground">{task.description}</p>
							</a>
							{#if group.tasks.indexOf(task) < group.tasks.length - 1}
								<Separator />
							{/if}
						{/each}
					</div>
				{:else}
					<p class="mt-4 text-xs text-muted-foreground">Aucune tâche</p>
				{/if}
			</div>
		{/each}
	</div>
</section>
