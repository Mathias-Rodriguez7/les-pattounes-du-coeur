<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import {
		ADOPTION_SECTION_CONFIG,
		ADOPTION_AGE_OPTIONS,
		ADOPTION_SEX_OPTIONS,
		ADOPTION_FUR_OPTIONS
	} from '#lib/constants/forms.ts';
	import type { AdoptionFormData } from '#lib/types/form.ts';

	// Le chat recherché par l'adoptant : âge, sexe, couleur, poil, caractère
	interface Props {
		/** Les réponses de la demande (bind:data) */
		data: AdoptionFormData;
	}

	let { data = $bindable() }: Props = $props();
</script>

<SectionCard
	icon={ADOPTION_SECTION_CONFIG.cat.icon}
	title={ADOPTION_SECTION_CONFIG.cat.label}
	color={ADOPTION_SECTION_CONFIG.cat.color}
>
	<div class="grid gap-4">
		<div class="grid grid-cols-2 gap-2 @2xl:grid-cols-4">
			<SelectField
				id="catAge"
				name="catAge"
				label="Âge du chat"
				bind:value={data.catAge}
				options={ADOPTION_AGE_OPTIONS}
				size="sm"
				required
			/>

			<SelectField
				id="catSex"
				name="catSex"
				label="Sexe"
				bind:value={data.catSex}
				options={ADOPTION_SEX_OPTIONS}
				size="sm"
				required
			/>

			<InputField
				id="color"
				name="color"
				label="Couleur"
				bind:value={data.color}
				placeholder="Roux, noir, etc."
				size="sm"
			/>

			<SelectField
				id="furLength"
				name="furLength"
				label="Longueur du poil"
				bind:value={data.furLength}
				options={ADOPTION_FUR_OPTIONS}
				size="sm"
				required
			/>
		</div>
		<TextareaField
			id="temperament"
			name="temperament"
			label="Caractère recherché"
			bind:value={data.temperament}
			placeholder="Décrivez le caractère recherché..."
		/>
	</div>
</SectionCard>
