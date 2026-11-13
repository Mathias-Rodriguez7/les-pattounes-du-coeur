<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerFormData } from '#lib/types/form.ts';

	// Les 4 cases « Expérience » d'une demande bénévole (décocher vide la description liée)
	interface Props {
		/** Les réponses de la demande (bind:data) */
		data: VolunteerFormData;
	}

	let { data = $bindable() }: Props = $props();
</script>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
	title={VOLUNTEER_SECTION_CONFIG.experience.label}
	color={VOLUNTEER_SECTION_CONFIG.experience.color}
>
	<div class="space-y-4">
		<CheckboxField
			id="hasCatExperience"
			name="hasCatExperience"
			label="Expérience avec des chats"
			checked={data.hasCatExperience}
			onChange={(value) => {
				data.hasCatExperience = value;
				if (!value) data.catExperienceDescription = undefined;
			}}
		/>

		<CheckboxField
			id="hasAssociationExperience"
			name="hasAssociationExperience"
			label="Expérience avec des associations"
			checked={data.hasAssociationExperience}
			onChange={(value) => {
				data.hasAssociationExperience = value;
				if (!value) data.associationExperienceDescription = undefined;
			}}
		/>

		<CheckboxField
			id="hasMedicalCareExperience"
			name="hasMedicalCareExperience"
			label="Expérience de soins"
			checked={data.hasMedicalCareExperience}
			onChange={(value) => {
				data.hasMedicalCareExperience = value;
				if (!value) data.medicalCareDescription = undefined;
			}}
		/>

		<CheckboxField
			id="hasTransportExperience"
			name="hasTransportExperience"
			label="Expérience transport animaux"
			checked={data.hasTransportExperience}
			onChange={(value) => (data.hasTransportExperience = value)}
		/>
	</div>
</SectionCard>
