<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerFormData } from '#lib/types/form.ts';

	// Les textes libres d'une demande bénévole : compétences, motivation, informations complémentaires
	interface Props {
		/** Les réponses de la demande (bind:data) */
		data: VolunteerFormData;
	}

	let { data = $bindable() }: Props = $props();
</script>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.capacity.icon}
	title={VOLUNTEER_SECTION_CONFIG.capacity.label}
	color={VOLUNTEER_SECTION_CONFIG.capacity.color}
>
	<TextareaField
		id="skills"
		name="skills"
		bind:value={data.skills}
		placeholder="Compétences, savoir-faire..."
	/>
</SectionCard>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.motivation.icon}
	title={VOLUNTEER_SECTION_CONFIG.motivation.label}
	color={VOLUNTEER_SECTION_CONFIG.motivation.color}
>
	<TextareaField
		id="motivation"
		name="motivation"
		bind:value={data.motivation}
		placeholder="Pourquoi souhaitez-vous devenir bénévole ?"
	/>
</SectionCard>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.additionalInformation.icon}
	title={VOLUNTEER_SECTION_CONFIG.additionalInformation.label}
	color={VOLUNTEER_SECTION_CONFIG.additionalInformation.color}
>
	<TextareaField
		id="additionalInformation"
		name="additionalInformation"
		bind:value={data.additionalInformation}
		placeholder="Autres informations utiles..."
	/>
</SectionCard>
