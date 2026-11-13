<script lang="ts" module>
	export type DescriptionData = {
		outside: boolean;
		homeDescription?: string | null;
		presence?: string | null;
		outsideDescription?: string | null;
	};
</script>

<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';

	// Les 3 descriptions communes aux formulaires admin d'une FA : logement, présence, extérieur.
	// Les textes propres à un formulaire (motivation, notes, arrêt d'activité…) restent chez lui.
	interface Props {
		/** L'objet du formulaire parent (bind:data) */
		data: DescriptionData;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let { data = $bindable(), errors = {}, disabled = false }: Props = $props();
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.homeDescription.icon}
	title={HOST_SECTION_CONFIG.homeDescription.label}
	color={HOST_SECTION_CONFIG.homeDescription.color}
>
	<TextareaField
		id="homeDescription"
		name="homeDescription"
		label="Description du logement"
		bind:value={() => data.homeDescription ?? '', (value) => (data.homeDescription = value)}
		placeholder="Le logement, son ambiance, ses particularités…"
		error={errors.homeDescription}
		{disabled}
	/>
</SectionCard>

<SectionCard
	icon={HOST_SECTION_CONFIG.presence.icon}
	title={HOST_SECTION_CONFIG.presence.label}
	color={HOST_SECTION_CONFIG.presence.color}
>
	<TextareaField
		id="presence"
		name="presence"
		label="Présence"
		bind:value={() => data.presence ?? '', (value) => (data.presence = value)}
		placeholder="La présence au domicile sur une semaine…"
		error={errors.presence}
		{disabled}
	/>
</SectionCard>

<!-- Seulement si la FA a un extérieur (case « Extérieur » de la section Logement) -->
{#if data.outside}
	<SectionCard
		icon={HOST_SECTION_CONFIG.outsideDescription.icon}
		title={HOST_SECTION_CONFIG.outsideDescription.label}
		color={HOST_SECTION_CONFIG.outsideDescription.color}
	>
		<TextareaField
			id="outsideDescription"
			name="outsideDescription"
			label="Description de l'extérieur"
			bind:value={() => data.outsideDescription ?? '', (value) => (data.outsideDescription = value)}
			placeholder="Jardin, balcon, terrasse…"
			error={errors.outsideDescription}
			{disabled}
		/>
	</SectionCard>
{/if}
