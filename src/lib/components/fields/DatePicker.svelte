<script lang="ts">
	import {
		getLocalTimeZone,
		today,
		CalendarDate,
		type CalendarDate as CalendarDateType
	} from '@internationalized/date';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import Calendar from '#lib/components/ui/calendar/calendar.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { fr } from 'date-fns/locale';
	import { format } from 'date-fns';

	interface Props {
		value?: Date;
		name?: string;
		onSelect?: (date: Date) => void;
		error?: string;
		label?: string;
		/** La première date permise (rien : pas de limite) */
		minValue?: Date;
		/**
		 * La dernière date permise. Par défaut aujourd'hui (une date de naissance, un soin passé…) ;
		 * une date à venir (rappel de vaccin) passe la sienne
		 */
		maxValue?: Date;
	}

	const {
		value,
		name = 'birthDate',
		onSelect,
		error,
		label = "Date d'anniversaire",
		minValue,
		maxValue
	}: Props = $props();

	const toCalendarDate = (date: Date) =>
		new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
	const calendarMin = $derived(minValue ? toCalendarDate(minValue) : undefined);
	const calendarMax = $derived(maxValue ? toCalendarDate(maxValue) : today(getLocalTimeZone()));

	const id = crypto.getRandomValues(new Uint8Array(4)).reduce((acc, x) => acc + x.toString(16), '');

	let open = $state(false);

	// Se recalcule quand `value` change, mais l'utilisateur peut la modifier via le calendrier
	let calendarValue = $derived<CalendarDateType | undefined>(
		value ? toCalendarDate(value) : undefined
	);

	// Valeur envoyée au serveur, au format AAAA-MM-JJ, sans conversion de fuseau horaire
	const hiddenValue = $derived(calendarValue ? calendarValue.toString() : '');

	const handleValueChange = () => {
		if (calendarValue && onSelect) {
			onSelect(calendarValue.toDate(getLocalTimeZone()));
		}
		open = false;
	};
	import FieldError from './FieldError.svelte';
</script>

<div class="space-y-2">
	{#if label}
		<Label for="{id}-date" class="text-xs font-medium text-gray-700">{label}</Label>
	{/if}

	<!-- ✅ INPUT HIDDEN POUR ENVOYER LA DATE AU SERVER -->
	<input type="hidden" {name} value={hiddenValue} />

	<Popover.Root bind:open>
		<Popover.Trigger id="{id}-date">
			{#snippet child({ props })}
				<Button {...props} variant="outline" class="w-full justify-between font-normal">
					{#if calendarValue}
						{format(calendarValue.toDate(getLocalTimeZone()), 'dd. MM. yyyy', { locale: fr })}
					{:else}
						Sélectionner une date
					{/if}
					<ChevronDownIcon class="h-4 w-4" />
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar
				type="single"
				bind:value={calendarValue}
				captionLayout="dropdown"
				onValueChange={handleValueChange}
				minValue={calendarMin}
				maxValue={calendarMax}
				locale="fr"
			/>
		</Popover.Content>
	</Popover.Root>

	<FieldError {error} />
</div>
