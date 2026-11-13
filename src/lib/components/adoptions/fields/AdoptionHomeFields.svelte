<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { ADOPTION_SECTION_CONFIG } from '#lib/constants/forms.ts';
	import type { AdoptionFormData } from '#lib/types/form.ts';

	// Le logement et le foyer de l'adoptant (2 cartes : elles se placent dans la grille du parent)
	interface Props {
		/** Les réponses de la demande (bind:data) */
		data: AdoptionFormData;
	}

	let { data = $bindable() }: Props = $props();

	// Décocher « Animaux actuels » vide aussi les nombres (même règle que le serveur : adoptions/rules.ts)
	function setHasPets(value: boolean) {
		data.hasPets = value;
		if (!value) {
			// 0 et pas « vide » : c'est la valeur par défaut du formulaire public
			data.numberOfCats = 0;
			data.numberOfDogs = 0;
			data.otherPets = '';
		}
	}
</script>

<SectionCard
	icon={ADOPTION_SECTION_CONFIG.home.icon}
	title={ADOPTION_SECTION_CONFIG.home.label}
	color={ADOPTION_SECTION_CONFIG.home.color}
	class="@2xl:col-span-1"
>
	<div class="space-y-4">
		<InputField
			id="housingSize"
			name="housingSize"
			label="Taille du logement (m²)"
			type="number"
			bind:value={data.housingSize}
			placeholder="60"
			required
			size="sm"
		/>

		<CheckboxField
			id="hasGarden"
			name="hasGarden"
			label="Extérieur / Jardin"
			checked={data.hasGarden}
			onChange={(value) => {
				data.hasGarden = value;
				if (!value) {
					data.gardenSize = undefined;
				}
			}}
		/>

		{#if data.hasGarden}
			<InputField
				id="gardenSize"
				name="gardenSize"
				label="Taille de l'exterieur (m²)"
				type="number"
				bind:value={data.gardenSize}
				placeholder="100"
				size="sm"
			/>
		{/if}
	</div>
</SectionCard>

<SectionCard
	icon={ADOPTION_SECTION_CONFIG.foyer.icon}
	title={ADOPTION_SECTION_CONFIG.foyer.label}
	color={ADOPTION_SECTION_CONFIG.foyer.color}
	class="@2xl:col-span-2"
>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-2">
			<CheckboxField
				id="hasPets"
				name="hasPets"
				label="Animaux actuels"
				checked={data.hasPets}
				onChange={setHasPets}
			/>

			<InputField
				id="numberOfChildren"
				name="numberOfChildren"
				label="Nombre d'enfants"
				type="number"
				bind:value={data.numberOfChildren}
				placeholder="0"
				size="sm"
			/>
		</div>

		{#if data.hasPets}
			<div class="flex gap-2">
				<InputField
					id="numberOfCats"
					name="numberOfCats"
					label="Chats"
					type="number"
					bind:value={data.numberOfCats}
					placeholder="0"
					size="sm"
				/>

				<InputField
					id="numberOfDogs"
					name="numberOfDogs"
					label="Chiens"
					type="number"
					bind:value={data.numberOfDogs}
					placeholder="0"
					size="sm"
				/>
			</div>

			<TextareaField
				id="otherPets"
				name="otherPets"
				label="Autres animaux"
				bind:value={data.otherPets}
				placeholder="Autres animaux..."
			/>
		{/if}
	</div>
</SectionCard>
