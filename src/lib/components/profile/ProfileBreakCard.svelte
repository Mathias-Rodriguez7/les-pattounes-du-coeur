<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import DateRangePicker from '#lib/components/fields/DateRangePicker.svelte';
	import { enhance } from '$app/forms';
	import { CalendarOff, LoaderCircle } from '@lucide/svelte';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import type { ColabActivity } from '@prisma/client';

	// La pause de la bénévole : choisir des dates, annuler, ou reprendre plus tôt.
	// Les actions setBreak / cancelBreak sont dans profil/+page.server.ts
	interface Props {
		actif: ColabActivity | null;
		breakStart: Date | null;
		breakEnd: Date | null;
		/** Erreur renvoyée par le serveur pour ces dates */
		error?: string;
	}

	let { actif, breakStart, breakEnd, error = '' }: Props = $props();

	// ===== PAUSE =====
	const formatDay = (date: Date) => format(date, 'd MMMM yyyy', { locale: fr });
	const isOnBreak = $derived(actif === 'BREAK');
	// Une pause en cours, ou prévue (le cron la commencera le jour venu)
	const breakSummary = $derived.by(() => {
		if (isOnBreak && breakEnd) return `En pause jusqu'au ${formatDay(breakEnd)} inclus.`;
		if (breakStart && breakEnd) {
			return `Pause prévue du ${formatDay(breakStart)} au ${formatDay(breakEnd)}.`;
		}
		return 'Aucune pause prévue. Votre statut passera en « Pause » automatiquement aux dates choisies.';
	});
	// Les dates choisies dans le calendrier (rien tant qu'on n'a pas choisi début ET fin)
	let pickedBreak = $state<{ start: Date; end: Date } | null>(null);
	let breakIsSubmitting = $state(false);
	const today = new Date();
</script>

<Card.Root class="gap-0 py-0">
	<Card.Header class="px-6 py-4">
		<Card.Title class="flex items-center gap-2 text-base">
			<CalendarOff class="size-4 text-primary" />
			Pause
		</Card.Title>
	</Card.Header>

	<Separator />

	<Card.Content class="grid gap-3 p-4">
		<p class="text-sm text-muted-foreground">{breakSummary}</p>

		<form
			method="POST"
			action="?/setBreak"
			class="grid gap-3"
			use:enhance={() => {
				breakIsSubmitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					breakIsSubmitting = false;
					pickedBreak = null;
				};
			}}
		>
			<DateRangePicker
				label="Dates de la pause"
				startName="breakStart"
				endName="breakEnd"
				startValue={breakStart ?? undefined}
				endValue={breakEnd ?? undefined}
				minDate={today}
				onSelect={(dates) => (pickedBreak = dates)}
				{error}
			/>
			<Button type="submit" size="sm" disabled={!pickedBreak || breakIsSubmitting}>
				{#if breakIsSubmitting}
					<LoaderCircle class="size-4 animate-spin" />
				{/if}
				{breakStart ? 'Modifier la pause' : 'Enregistrer la pause'}
			</Button>
		</form>

		{#if breakStart || isOnBreak}
			<form
				method="POST"
				action="?/cancelBreak"
				use:enhance={() => {
					breakIsSubmitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						breakIsSubmitting = false;
					};
				}}
			>
				<Button
					type="submit"
					variant="outline"
					size="sm"
					class="w-full"
					disabled={breakIsSubmitting}
				>
					{isOnBreak ? 'Reprendre dès aujourd’hui' : 'Annuler la pause'}
				</Button>
			</form>
		{/if}
	</Card.Content>
</Card.Root>
