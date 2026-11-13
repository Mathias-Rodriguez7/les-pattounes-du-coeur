<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';

	// Section « Contact » d'une personne : téléphone, email.
	// Liés séparément : dans une demande, l'email est une colonne et le téléphone est dans le JSON.
	interface Props {
		phone: string;
		email: string;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
		/** Largeur de la carte dans la grille du formulaire (ex : « @2xl:col-span-2 ») */
		class?: string;
	}

	let {
		phone = $bindable(),
		email = $bindable(),
		errors = {},
		disabled = false,
		class: className = ''
	}: Props = $props();
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.contact.icon}
	title={PERSON_SECTION_CONFIG.contact.label}
	color={PERSON_SECTION_CONFIG.contact.color}
	class={className}
>
	<div class="@container">
		<div class="grid grid-cols-1 gap-4 @sm:grid-cols-2">
			<InputField
				id="phone"
				name="phone"
				label="Téléphone"
				type="tel"
				bind:value={phone}
				placeholder="06 12 34 56 78"
				error={errors.phone}
				required
				size="sm"
				{disabled}
			/>
			<InputField
				id="email"
				name="email"
				label="Email"
				type="email"
				bind:value={email}
				placeholder="jean@example.com"
				error={errors.email}
				required
				size="sm"
				{disabled}
			/>
		</div>
	</div>
</SectionCard>
