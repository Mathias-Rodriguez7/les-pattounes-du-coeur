<script lang="ts">
	import {
		getLocalTimeZone,
		today,
		CalendarDate,
		type CalendarDate as CalendarDateType
	} from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { fr } from 'date-fns/locale';
	import { format } from 'date-fns';

	interface Props {
		value?: Date;
		name?: string;
		onSelect?: (date: Date) => void;
		error?: string;
		label?: string;
	}

	const {
		value,
		name = 'birthDate',
		onSelect,
		error,
		label = "Date d'anniversaire"
	}: Props = $props();

	const id = crypto.getRandomValues(new Uint8Array(4)).reduce((acc, x) => acc + x.toString(16), '');

	let open = $state(false);
	let calendarValue = $state<CalendarDateType | undefined>(
		value ? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) : undefined
	);

	let hiddenValue = $state<string>('');

	$effect(() => {
		if (calendarValue) {
			const date = calendarValue.toDate(getLocalTimeZone());
			hiddenValue = date.toISOString().split('T')[0]; // ✅ Format YYYY-MM-DD
		}
	});

	const handleValueChange = () => {
		if (calendarValue && onSelect) {
			const date = calendarValue.toDate(getLocalTimeZone());
			onSelect(date);
		}
		open = false;
	};
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
						{format(calendarValue.toDate(getLocalTimeZone()), 'dd MMMM yyyy', { locale: fr })}
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
				maxValue={today(getLocalTimeZone())}
			/>
		</Popover.Content>
	</Popover.Root>

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
