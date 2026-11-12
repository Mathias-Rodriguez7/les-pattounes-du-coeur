<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';

	// Section « Profil » d'une personne (bénévole, FA…) : prénom, nom, date de naissance.
	// Chaque champ est lié séparément (bind:firstName…) : le formulaire parent les range où il veut.
	interface Props {
		firstName: string;
		lastName: string;
		birthDate?: Date;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let {
		firstName = $bindable(),
		lastName = $bindable(),
		birthDate = $bindable(),
		errors = {},
		disabled = false
	}: Props = $props();
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.profile.icon}
	title={PERSON_SECTION_CONFIG.profile.label}
	color={PERSON_SECTION_CONFIG.profile.color}
>
	<!-- @container : 2 colonnes si la carte est assez large, 1 sinon (grilles de 4 cartes) -->
	<div class="@container">
		<div class="grid grid-cols-1 gap-4 @sm:grid-cols-2">
			<InputField
				id="firstName"
				name="firstName"
				label="Prénom"
				bind:value={firstName}
				placeholder="Jean"
				error={errors.firstName}
				required
				size="sm"
				{disabled}
			/>
			<InputField
				id="lastName"
				name="lastName"
				label="Nom"
				bind:value={lastName}
				placeholder="Dupont"
				error={errors.lastName}
				required
				size="sm"
				{disabled}
			/>
			<DatePicker
				name="birthDate"
				value={birthDate}
				onSelect={(date) => (birthDate = date)}
				label="Date de naissance"
				error={errors.birthDate}
			/>
		</div>
	</div>
</SectionCard>
