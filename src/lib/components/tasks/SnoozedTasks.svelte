<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown, ClockArrowUp } from '@lucide/svelte';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { TASK_TAG } from '#lib/constants/tasks.ts';
	import type { SnoozedTask } from '#lib/tasks/snooze.ts';
	import { resumeTask } from './resumeTask.ts';

	// Les tâches mises de côté : repliées, avec leur date de retour et la petite note.
	// « Reprendre » seulement pour ses propres tâches (l'admin, dans un panneau, les voit seulement)
	interface Props {
		snoozed: SnoozedTask[];
		canResume?: boolean;
	}

	let { snoozed, canResume = false }: Props = $props();
	let open = $state(false);
</script>

{#if snoozed.length > 0}
	<div class="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-2">
		<button
			type="button"
			onclick={() => (open = !open)}
			aria-expanded={open}
			class="flex w-full items-center gap-2 py-1 text-sm text-muted-foreground"
		>
			<ClockArrowUp class="size-4" />
			{snoozed.length} tâche{snoozed.length > 1 ? 's' : ''} mise{snoozed.length > 1 ? 's' : ''} de côté
			<ChevronDown class="size-4 transition-transform {open ? 'rotate-180' : ''}" />
		</button>
		{#if open}
			<ul transition:slide={{ duration: 150 }} class="grid gap-1 pb-1">
				{#each snoozed as item (item.task.id)}
					<li class="flex items-center gap-3 rounded-md px-1 py-1.5 text-sm">
						<span class="w-16 shrink-0 text-xs text-muted-foreground"
							>{TASK_TAG[item.task.rule]}</span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate">{item.task.title}</span>
							<span class="block truncate text-xs text-muted-foreground">
								Revient le {formatDateNum(item.until)}{item.note ? ` · ${item.note}` : ''}
							</span>
						</span>
						{#if canResume}
							<button
								type="button"
								onclick={() => resumeTask(item.task.id)}
								class="shrink-0 text-xs font-medium text-primary hover:underline"
							>
								Reprendre
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
