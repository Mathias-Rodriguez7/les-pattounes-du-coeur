<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { addDays, format } from 'date-fns';
	import { ClockArrowUp, LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { MAX_SNOOZE_DAYS, SNOOZE_CHOICES } from '#lib/tasks/snooze.ts';
	import { resumeTask } from './resumeTask.ts';
	import type { Task } from '#lib/tasks/tasks.ts';

	// « Plus tard » : mettre la tâche de côté, pour soi seule, jusqu'à une date (au plus 3 mois).
	// Elle revient à cette date, ou plus tôt si elle devient plus urgente.
	interface Props {
		task: Task;
	}

	let { task }: Props = $props();

	let open = $state(false);
	let submitting = $state(false);
	let note = $state('');
	let customDay = $state('');

	const today = new Date();
	const ymd = (date: Date) => format(date, 'yyyy-MM-dd');
	const minDay = ymd(addDays(today, 1));
	const maxDay = ymd(addDays(today, MAX_SNOOZE_DAYS));

	const choices = SNOOZE_CHOICES.map((choice) => {
		const date = addDays(today, choice.days);
		return { ...choice, value: ymd(date), shown: format(date, 'dd/MM') };
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				open = false;
				const until = result.data?.until as Date | undefined;
				toast.success(`Mise de côté jusqu'au ${until ? format(new Date(until), 'dd/MM') : '…'}`, {
					action: { label: 'Annuler', onClick: () => resumeTask(task.id) }
				});
				note = '';
				customDay = '';
				await update({ reset: false });
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				type="button"
				title="Plus tard"
				aria-label="Mettre « {task.title} » de côté"
				class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<ClockArrowUp class="size-4" />
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-64 p-2" align="end">
		<form method="POST" action="?/snoozeTask" use:enhance={handleEnhance} class="grid gap-1">
			<input type="hidden" name="taskId" value={task.id} />
			<input type="hidden" name="urgency" value={task.urgency} />
			<p class="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">Me le rappeler…</p>

			{#each choices as choice (choice.days)}
				<button
					type="submit"
					name="quick"
					value={choice.value}
					disabled={submitting}
					class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
				>
					{choice.label}
					<span class="text-xs text-muted-foreground">{choice.shown}</span>
				</button>
			{/each}

			<div class="mt-1 flex items-center gap-2 border-t border-border px-2 pt-2">
				<Input
					type="date"
					name="until"
					min={minDay}
					max={maxDay}
					bind:value={customDay}
					class="h-8 text-xs"
					aria-label="Choisir une date"
				/>
				<Button type="submit" size="sm" variant="outline" disabled={submitting || !customDay}>
					{#if submitting}<LoaderCircle class="size-4 animate-spin" />{:else}OK{/if}
				</Button>
			</div>
			<div class="px-2 pt-1 pb-1">
				<Input
					name="note"
					bind:value={note}
					maxlength={255}
					placeholder="Pourquoi ? (rdv véto le…)"
					class="h-8 text-xs"
				/>
			</div>
		</form>
	</Popover.Content>
</Popover.Root>
