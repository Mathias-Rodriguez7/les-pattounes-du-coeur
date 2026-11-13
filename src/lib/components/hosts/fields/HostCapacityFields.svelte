<script lang="ts" module>
	export type CapacityData = {
		heal: string;
		socialize: string;
		babyFeeding: string;
		type?: string | null;
	};
</script>

<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import {
		HOST_SECTION_CONFIG,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS
	} from '#lib/constants/host.ts';

	// Section « Capacités » des 3 formulaires admin d'une FA
	interface Props {
		/** L'objet du formulaire parent (bind:data) */
		data: CapacityData;
		/** Le type d'accueil ici : pour la demande FA, qui n'a pas de section « Statut » */
		withType?: boolean;
		disabled?: boolean;
	}

	let { data = $bindable(), withType = false, disabled = false }: Props = $props();
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.capacity.icon}
	title={HOST_SECTION_CONFIG.capacity.label}
	color={HOST_SECTION_CONFIG.capacity.color}
>
	<div class="grid gap-4">
		{#if withType}
			<SelectField
				id="type"
				name="type"
				label="Type d'accueil"
				bind:value={() => data.type ?? '', (value) => (data.type = value)}
				options={HOST_TYPE_OPTIONS}
				size="sm"
				required
				{disabled}
			/>
		{/if}

		<SelectField
			id="heal"
			name="heal"
			label="Soins"
			bind:value={data.heal}
			options={HOST_HEAL_OPTIONS}
			size="sm"
			{disabled}
		/>

		<SelectField
			id="socialize"
			name="socialize"
			label="Socialisation"
			bind:value={data.socialize}
			options={HOST_SOCIALIZE_OPTIONS}
			size="sm"
			{disabled}
		/>

		<SelectField
			id="babyFeeding"
			name="babyFeeding"
			label="Biberonnage"
			bind:value={data.babyFeeding}
			options={HOST_BABY_FEEDING_OPTIONS}
			size="sm"
			{disabled}
		/>
	</div>
</SectionCard>
