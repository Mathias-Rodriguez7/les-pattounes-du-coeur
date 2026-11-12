<script lang="ts" module>
	/** Les champs dont la section a besoin (les 3 formulaires les ont, sous des types différents) */
	export type AnimalsData = {
		hasAnimalsAtHome: boolean;
		numberOfCatsAtHome?: string | number | null;
		numberOfDogsAtHome?: string | number | null;
		otherAnimalsAtHome?: string | null;
	};
</script>

<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';

	// =====================================================================
	// Section « Animaux » des formulaires admin d'une FA :
	// création (NewHostDialog), modification (HostEditForm), demande FA (HostEditFormPanel).
	// Écrite UNE fois : mêmes libellés et même comportement partout.
	// =====================================================================

	interface Props {
		/** L'objet du formulaire parent (bind:data) : la section modifie SES champs directement */
		data: AnimalsData;
		/** Un message par champ (ex : { numberOfCatsAtHome: 'Nombre invalide' }) */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let { data = $bindable(), errors = {}, disabled = false }: Props = $props();

	// Décocher vide aussi les nombres : l'écran reste cohérent avec ce qui sera enregistré
	// (le serveur applique la même règle : voir withoutAnimalCounts)
	function setHasAnimals(value: boolean) {
		data.hasAnimalsAtHome = value;
		if (!value) {
			data.numberOfCatsAtHome = null;
			data.numberOfDogsAtHome = null;
			data.otherAnimalsAtHome = '';
		}
	}
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.animals.icon}
	title={HOST_SECTION_CONFIG.animals.label}
	color={HOST_SECTION_CONFIG.animals.color}
>
	<div class="space-y-4">
		<CheckboxField
			id="hasAnimalsAtHome"
			name="hasAnimalsAtHome"
			label="Animaux au domicile"
			checked={data.hasAnimalsAtHome}
			onChange={setHasAnimals}
			{disabled}
		/>

		{#if data.hasAnimalsAtHome}
			<!-- Liaison « fonction » : le champ affiche '' quand la valeur est null -->
			<InputField
				id="numberOfCatsAtHome"
				name="numberOfCatsAtHome"
				label="Chats"
				type="number"
				bind:value={
					() => data.numberOfCatsAtHome ?? '', (value) => (data.numberOfCatsAtHome = value)
				}
				placeholder="0"
				error={errors.numberOfCatsAtHome}
				size="sm"
				{disabled}
			/>

			<InputField
				id="numberOfDogsAtHome"
				name="numberOfDogsAtHome"
				label="Chiens"
				type="number"
				bind:value={
					() => data.numberOfDogsAtHome ?? '', (value) => (data.numberOfDogsAtHome = value)
				}
				placeholder="0"
				error={errors.numberOfDogsAtHome}
				size="sm"
				{disabled}
			/>

			<TextareaField
				id="otherAnimalsAtHome"
				name="otherAnimalsAtHome"
				label="Autres animaux"
				bind:value={
					() => data.otherAnimalsAtHome ?? '', (value) => (data.otherAnimalsAtHome = value)
				}
				placeholder="Lapin, hamster, oiseau…"
				error={errors.otherAnimalsAtHome}
				{disabled}
			/>
		{/if}
	</div>
</SectionCard>
