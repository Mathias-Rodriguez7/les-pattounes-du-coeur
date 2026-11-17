<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import { HOUSEHOLD_FIELDS, type HouseholdData } from '#lib/hosts/household.ts';

	// =====================================================================
	// Section « Composition du foyer » des formulaires admin d'une FA :
	// création (NewHostDialog), modification (HostEditForm), demande FA (HostEditFormPanel).
	// Les 4 champs viennent de HOUSEHOLD_FIELDS : mêmes libellés partout.
	// Vide = pas renseigné (différent de 0 = personne)
	// =====================================================================

	interface Props {
		/** L'objet du formulaire parent (bind:data) : la section modifie SES champs directement */
		data: HouseholdData;
		errors?: Record<string, string | undefined>;
		disabled?: boolean;
	}

	let { data = $bindable(), errors = {}, disabled = false }: Props = $props();
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.household.icon}
	title={HOST_SECTION_CONFIG.household.label}
	color={HOST_SECTION_CONFIG.household.color}
>
	<div class="grid grid-cols-2 gap-3">
		{#each HOUSEHOLD_FIELDS as field (field.key)}
			<!-- Liaison « fonction » : le champ affiche '' quand la valeur est null -->
			<InputField
				id={field.key}
				name={field.key}
				label={field.label}
				type="number"
				bind:value={() => data[field.key] ?? '', (value) => (data[field.key] = value)}
				placeholder="0"
				error={errors[field.key]}
				size="sm"
				{disabled}
			/>
		{/each}
	</div>
	<p class="mt-2 text-xs text-muted-foreground">
		Adultes : 18 ans et plus · Enfants : moins de 18 ans
	</p>
</SectionCard>
