<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';
	import { DISTRICT_OPTIONS } from '#lib/utils/districts.ts';

	// Section « Adresse » d'une personne : rue, ville, code postal, et quartier à Montpellier
	interface Props {
		address: string;
		city: string;
		postalCode: string;
		district?: string | null;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let {
		address = $bindable(),
		city = $bindable(),
		postalCode = $bindable(),
		district = $bindable(),
		errors = {},
		disabled = false
	}: Props = $props();

	// Les quartiers sont ceux de Montpellier : la liste n'a de sens que pour cette ville
	const isMontpellier = $derived(city?.trim().toLowerCase() === 'montpellier');
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.address.icon}
	title={PERSON_SECTION_CONFIG.address.label}
	color={PERSON_SECTION_CONFIG.address.color}
>
	<div class="@container">
		<div class="grid grid-cols-1 gap-4 @sm:grid-cols-2">
			<div class="@sm:col-span-2">
				<InputField
					id="address"
					name="address"
					label="Rue"
					bind:value={address}
					placeholder="12 rue de la Paix"
					error={errors.address}
					required
					size="sm"
					{disabled}
				/>
			</div>
			<InputField
				id="city"
				name="city"
				label="Ville"
				bind:value={city}
				placeholder="Montpellier"
				error={errors.city}
				required
				size="sm"
				{disabled}
			/>
			<InputField
				id="postalCode"
				name="postalCode"
				label="Code postal"
				bind:value={postalCode}
				placeholder="34000"
				error={errors.postalCode}
				required
				size="sm"
				{disabled}
			/>
			{#if isMontpellier}
				<!-- '' dans la liste = « aucun quartier » ; null ou undefined dans les données -->
				<SelectField
					id="district"
					name="district"
					label="Quartier"
					placeholder="Quartier"
					options={DISTRICT_OPTIONS}
					bind:value={() => district ?? '', (value) => (district = value || null)}
					size="sm"
					{disabled}
				/>
			{/if}
		</div>
	</div>
</SectionCard>
