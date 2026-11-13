<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import {
		VOLUNTEER_AVAILABILITY_OPTIONS,
		VOLUNTEER_AVAILABILITY_DURATION_OPTIONS
	} from '#lib/constants/volunteer.ts';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerFormData } from '#lib/types/form.ts';

	// « Infos » (voiture, semaine, week-end, urgences) et « Disponibilités » d'une demande bénévole
	interface Props {
		/** Les réponses de la demande (bind:data) */
		data: VolunteerFormData;
	}

	let { data = $bindable() }: Props = $props();
</script>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.infos.icon}
	title={VOLUNTEER_SECTION_CONFIG.infos.label}
	color={VOLUNTEER_SECTION_CONFIG.infos.color}
>
	<div class="space-y-4">
		<CheckboxField
			id="car"
			name="car"
			label="Voiture"
			checked={data.car}
			onChange={(value) => (data.car = value)}
		/>

		<CheckboxField
			id="canHelpWeekdays"
			name="canHelpWeekdays"
			label="Disponible en semaine"
			checked={data.canHelpWeekdays}
			onChange={(value) => (data.canHelpWeekdays = value)}
		/>

		<CheckboxField
			id="canHelpWeekends"
			name="canHelpWeekends"
			label="Disponible le weekend"
			checked={data.canHelpWeekends}
			onChange={(value) => (data.canHelpWeekends = value)}
		/>

		<CheckboxField
			id="canHelpEmergencies"
			name="canHelpEmergencies"
			label="Peut aider en cas d'urgence"
			checked={data.canHelpEmergencies}
			onChange={(value) => (data.canHelpEmergencies = value)}
		/>
	</div>
</SectionCard>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.availability.icon}
	title={VOLUNTEER_SECTION_CONFIG.availability.label}
	color={VOLUNTEER_SECTION_CONFIG.availability.color}
>
	<div class="grid gap-4">
		<SelectField
			id="availability"
			name="availability"
			label="Implication dans l'association"
			bind:value={data.availability}
			options={VOLUNTEER_AVAILABILITY_OPTIONS}
			size="sm"
		/>

		<SelectField
			id="availabilityDuration"
			name="availabilityDuration"
			label="Temps de collaboration"
			bind:value={data.availabilityDuration}
			options={VOLUNTEER_AVAILABILITY_DURATION_OPTIONS}
			size="sm"
		/>
	</div>
</SectionCard>
