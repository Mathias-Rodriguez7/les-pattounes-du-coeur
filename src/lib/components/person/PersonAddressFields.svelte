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
		/** Largeur de la carte dans la grille du formulaire (ex : « @2xl:col-span-2 ») */
		class?: string;
		/** false : rue, ville et code postal facultatifs (ex : le lieu d'un SOS) */
		required?: boolean;
		/** Le code postal, lui, peut rester facultatif (ex : le relâchage d'un chat libre) */
		postalCodeRequired?: boolean;
		/** Le titre de la carte (par défaut : « Adresse ») */
		title?: string;
		/** Libellé du champ rue (par défaut : « Rue ») */
		streetLabel?: string;
		/** Préfixe des id, quand deux formulaires d'adresse sont sur la même page */
		idPrefix?: string;
	}

	let {
		address = $bindable(),
		city = $bindable(),
		postalCode = $bindable(),
		district = $bindable(),
		errors = {},
		disabled = false,
		class: className = '',
		required = true,
		postalCodeRequired = required,
		title = PERSON_SECTION_CONFIG.address.label,
		streetLabel = 'Rue',
		idPrefix = ''
	}: Props = $props();

	// Les quartiers sont ceux de Montpellier : la liste n'a de sens que pour cette ville
	const isMontpellier = $derived(city?.trim().toLowerCase() === 'montpellier');
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.address.icon}
	{title}
	color={PERSON_SECTION_CONFIG.address.color}
	class={className}
>
	<div class="@container">
		<div class="grid grid-cols-1 gap-4 @sm:grid-cols-2">
			<div class="@sm:col-span-2">
				<InputField
					id="{idPrefix}address"
					name="address"
					label={streetLabel}
					bind:value={address}
					placeholder="12 rue de la Paix"
					error={errors.address}
					{required}
					size="sm"
					{disabled}
				/>
			</div>
			<InputField
				id="{idPrefix}city"
				name="city"
				label="Ville"
				bind:value={city}
				placeholder="Montpellier"
				error={errors.city}
				{required}
				size="sm"
				{disabled}
			/>
			<InputField
				id="{idPrefix}postalCode"
				name="postalCode"
				label="Code postal"
				bind:value={postalCode}
				placeholder="34000"
				error={errors.postalCode}
				required={postalCodeRequired}
				size="sm"
				{disabled}
			/>
			{#if isMontpellier}
				<!-- '' dans la liste = « aucun quartier » ; null ou undefined dans les données -->
				<SelectField
					id="{idPrefix}district"
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
