<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerFormData } from '#lib/types/form.ts';

	// Les descriptions d'expérience, affichées seulement si la case correspondante est cochée
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
	<div class="space-y-2">
		{#if data.hasCatExperience}
			<TextareaField
				id="catExperienceDescription"
				name="catExperienceDescription"
				label="Décrivez votre expérience"
				bind:value={data.catExperienceDescription}
				placeholder="Nombre de chats, durée, type de soins..."
			/>
		{/if}
	</div>

	<div class="space-y-2">
		{#if data.hasAssociationExperience}
			<TextareaField
				id="associationExperienceDescription"
				name="associationExperienceDescription"
				label="Décrivez votre expérience"
				bind:value={data.associationExperienceDescription}
				placeholder="Nom de l'association, rôle, durée..."
			/>
		{/if}
	</div>

	<div class="space-y-2">
		{#if data.hasMedicalCareExperience}
			<TextareaField
				id="medicalCareDescription"
				name="medicalCareDescription"
				label="Décrivez votre expérience"
				bind:value={data.medicalCareDescription}
				placeholder="Type de soins, formation..."
			/>
		{/if}
	</div>
</SectionCard>
