<script lang="ts">
	import {
		getLocalTimeZone,
		CalendarDate,
		type CalendarDate as CalendarDateType
	} from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import RangeCalendar from '$lib/components/ui/range-calendar/range-calendar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { fr } from 'date-fns/locale';
	import { format } from 'date-fns';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		startValue?: Date;
		endValue?: Date;
		startName?: string;
		endName?: string;
		onSelect?: (dates: { start: Date; end: Date }) => void;
		error?: string;
		label?: string;
		minDate?: Date;
		maxDate?: Date;
	}

	const {
		startValue,
		endValue,
		startName = 'startDate',
		endName = 'endDate',
		onSelect,
		error,
		label = 'Sélectionner une plage de dates',
		minDate,
		maxDate
	}: Props = $props();

	const id = crypto.getRandomValues(new Uint8Array(4)).reduce((acc, x) => acc + x.toString(16), '');

	let open = $state(false);

	let rangeValue = $state<{
		start: CalendarDateType | undefined;
		end: CalendarDateType | undefined;
	}>({
		start: undefined,
		end: undefined
	});

	let hiddenStartValue = $state<string>('');
	let hiddenEndValue = $state<string>('');

	let minCalendarDate = $state<CalendarDateType | undefined>();
	let maxCalendarDate = $state<CalendarDateType | undefined>();

	// ✅ REACTIVE : Met à jour rangeValue si startValue ou endValue changent
	$effect(() => {
		const newStart = startValue
			? new CalendarDate(startValue.getFullYear(), startValue.getMonth() + 1, startValue.getDate())
			: undefined;

		const newEnd = endValue
			? new CalendarDate(endValue.getFullYear(), endValue.getMonth() + 1, endValue.getDate())
			: undefined;

		// ✅ Réinitialise complètement si les props changent
		rangeValue = {
			start: newStart,
			end: newEnd
		};
	});

	// ✅ Sync les valeurs hidden avec rangeValue
	$effect(() => {
		if (rangeValue.start) {
			const date = rangeValue.start.toDate(getLocalTimeZone());
			// 🔧 Ajoute T12:00:00 pour éviter le décalage UTC
			const isoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
			hiddenStartValue = isoDate.toISOString();
		} else {
			hiddenStartValue = '';
		}

		if (rangeValue.end) {
			const date = rangeValue.end.toDate(getLocalTimeZone());
			const isoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
			hiddenEndValue = isoDate.toISOString();
		} else {
			hiddenEndValue = '';
		}
	});

	// ✅ REACTIVE : Convertir minDate/maxDate en CalendarDate
	$effect(() => {
		if (minDate) {
			minCalendarDate = new CalendarDate(
				minDate.getFullYear(),
				minDate.getMonth() + 1,
				minDate.getDate()
			);
		} else {
			minCalendarDate = undefined;
		}

		if (maxDate) {
			maxCalendarDate = new CalendarDate(
				maxDate.getFullYear(),
				maxDate.getMonth() + 1,
				maxDate.getDate()
			);
		} else {
			maxCalendarDate = undefined;
		}
	});

	// ✅ HANDLER : Ne ferme que si les deux dates sont sélectionnées
	const handleValueChange = () => {
		// ✅ Ferme SEULEMENT si start ET end sont définis
		if (rangeValue.start && rangeValue.end) {
			if (onSelect) {
				const startDate = rangeValue.start.toDate(getLocalTimeZone());
				const endDate = rangeValue.end.toDate(getLocalTimeZone());
				onSelect({ start: startDate, end: endDate });
			}
			open = false;
		}
		// ✅ Sinon reste ouvert pour sélectionner la deuxième date
	};

	// 🔧 Fonction pour réinitialiser les dates
	const clearDates = () => {
		rangeValue = { start: undefined, end: undefined };
		hiddenStartValue = '';
		hiddenEndValue = '';
	};

	// 🔧 NEW: Fonction pour définir "pas de fin"
	const setNoEndDate = () => {
		if (rangeValue.start) {
			// Envoie la date de début avec une date de fin très loin dans le futur
			// ou on peut utiliser une valeur spéciale
			if (onSelect) {
				const startDate = rangeValue.start.toDate(getLocalTimeZone());
				onSelect({ start: startDate, end: startDate }); // Ou une date très loin
			}
			open = false;
		}
	};
</script>

<div class="space-y-2">
	{#if label}
		<Label for="{id}-range" class="text-xs font-medium text-gray-700">{label}</Label>
	{/if}

	<!-- ✅ INPUTS HIDDEN POUR ENVOYER LES DATES AU SERVER -->
	<input type="hidden" name={startName} value={hiddenStartValue} />
	<input type="hidden" name={endName} value={hiddenEndValue} />

	<Popover.Root bind:open>
		<Popover.Trigger id="{id}-range">
			{#snippet child({ props })}
				<Button {...props} variant="outline" class="w-full justify-between font-normal">
					{#if rangeValue.start && rangeValue.end}
						{format(rangeValue.start.toDate(getLocalTimeZone()), 'dd MMM yyyy', { locale: fr })}
						→
						{format(rangeValue.end.toDate(getLocalTimeZone()), 'dd MMM yyyy', { locale: fr })}
					{:else if rangeValue.start}
						{format(rangeValue.start.toDate(getLocalTimeZone()), 'dd MMM yyyy', { locale: fr })}
						→ ∞
					{:else}
						Sélectionner une plage
					{/if}
					<ChevronDownIcon class="h-4 w-4" />
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="flex w-auto flex-col gap-2 overflow-hidden p-2" align="start">
			<RangeCalendar
				bind:value={rangeValue}
				captionLayout="dropdown"
				onValueChange={handleValueChange}
				minValue={minCalendarDate}
				maxValue={maxCalendarDate}
				locale="fr"
			/>
			<Separator />
			<!-- 🔧 NEW: Boutons d'action -->
			<div class="flex flex-col gap-2">
				{#if rangeValue.start && !rangeValue.end}
					<!-- Si une date de début est sélectionnée mais pas de fin -->
					<Button
						variant="outline"
						size="sm"
						onclick={setNoEndDate}
						class="w-full text-green-600 hover:bg-green-50 hover:text-green-700"
					>
						Pas de date de fin (∞)
					</Button>
					<Separator />
				{/if}

				{#if rangeValue.start || rangeValue.end}
					<!-- Si au moins une date est sélectionnée -->
					<Button
						variant="ghost"
						size="sm"
						onclick={clearDates}
						class="w-full text-red-500 hover:bg-red-50 hover:text-red-700"
					>
						Réinitialiser les dates
					</Button>
				{/if}
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
