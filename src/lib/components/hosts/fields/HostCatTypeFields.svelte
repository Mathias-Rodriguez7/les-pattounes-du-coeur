<script lang="ts" module>
	export type CatTypeData = {
		catAdult?: string | number | null;
		kittyAndKitten: boolean;
		kitten?: string | number | null;
	};
</script>

<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';

	// Section « Chats acceptés » des 3 formulaires admin d'une FA
	interface Props {
		/** L'objet du formulaire parent (bind:data) */
		data: CatTypeData;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let { data = $bindable(), errors = {}, disabled = false }: Props = $props();
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.cat.icon}
	title={HOST_SECTION_CONFIG.cat.label}
	color={HOST_SECTION_CONFIG.cat.color}
>
	<div class="grid gap-4">
		<InputField
			id="catAdult"
			name="catAdult"
			label="Chats adultes"
			type="number"
			bind:value={() => data.catAdult ?? '', (value) => (data.catAdult = value)}
			placeholder="0"
			error={errors.catAdult}
			size="sm"
			{disabled}
		/>

		<CheckboxField
			id="kittyAndKitten"
			name="kittyAndKitten"
			label="Chatte avec portée"
			checked={data.kittyAndKitten}
			onChange={(value) => (data.kittyAndKitten = value)}
			{disabled}
		/>

		<InputField
			id="kitten"
			name="kitten"
			label="Chatons"
			type="number"
			bind:value={() => data.kitten ?? '', (value) => (data.kitten = value)}
			placeholder="0"
			error={errors.kitten}
			size="sm"
			{disabled}
		/>
	</div>
</SectionCard>
