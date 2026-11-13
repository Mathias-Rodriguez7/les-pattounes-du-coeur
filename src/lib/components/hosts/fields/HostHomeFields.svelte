<script lang="ts" module>
	export type HomeData = {
		space?: string | number | null;
		outside: boolean;
		car: boolean;
		isStockFeed?: boolean;
		outsideDescription?: string | null;
	};
</script>

<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';

	// Section « Logement » des 3 formulaires admin d'une FA
	interface Props {
		/** L'objet du formulaire parent (bind:data) */
		data: HomeData;
		/** Un message par champ */
		errors?: Record<string, string | undefined>;
		/** « Nourriture en stock » : pas demandé dans le formulaire public, donc absent des demandes FA */
		withStockFeed?: boolean;
		disabled?: boolean;
	}

	let { data = $bindable(), errors = {}, withStockFeed = true, disabled = false }: Props = $props();

	// Décocher « Extérieur » vide sa description (même règle que le serveur : hosts/rules.ts)
	function setOutside(value: boolean) {
		data.outside = value;
		if (!value) data.outsideDescription = '';
	}
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.home.icon}
	title={HOST_SECTION_CONFIG.home.label}
	color={HOST_SECTION_CONFIG.home.color}
>
	<div class="space-y-4">
		<InputField
			id="space"
			name="space"
			label="Surface (m²)"
			type="number"
			bind:value={() => data.space ?? '', (value) => (data.space = value)}
			placeholder="60"
			error={errors.space}
			required
			size="sm"
			{disabled}
		/>

		<CheckboxField
			id="outside"
			name="outside"
			label="Extérieur"
			checked={data.outside}
			onChange={setOutside}
			{disabled}
		/>

		<CheckboxField
			id="car"
			name="car"
			label="Voiture"
			checked={data.car}
			onChange={(value) => (data.car = value)}
			{disabled}
		/>

		{#if withStockFeed}
			<CheckboxField
				id="isStockFeed"
				name="isStockFeed"
				label="Nourriture en stock"
				checked={data.isStockFeed ?? false}
				onChange={(value) => (data.isStockFeed = value)}
				{disabled}
			/>
		{/if}
	</div>
</SectionCard>
