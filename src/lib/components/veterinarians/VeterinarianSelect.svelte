<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import InputField from '#lib/components/fields/InputField.svelte';
	import {
		OTHER_VETERINARIAN,
		VETERINARIAN_CATEGORY,
		VETERINARIAN_CATEGORY_ORDER
	} from '#lib/constants/veterinarian.ts';
	import type { VeterinarianOption } from '#lib/server/veterinarians/queries.ts';

	// Le vétérinaire d'un soin : un de la liste, ou « Autre… » avec le nom saisi à la main.
	// La liste est rangée par catégorie (Partenaires, Urgences, Spécialistes), comme la page
	// Vétérinaires ; chaque ligne montre le nom, et dessous le secteur et la spécialité.
	// Envoie `veterinarianId` (un id, ou vide) et `veterinary` (le nom saisi, seulement pour « Autre »)
	interface Props {
		veterinarians: VeterinarianOption[];
		/** L'id choisi, '' (non précisé) ou OTHER_VETERINARIAN */
		choice: string;
		/** Le nom saisi quand on choisit « Autre… » */
		other: string;
		disabled?: boolean;
		error?: string;
	}

	let {
		veterinarians,
		choice = $bindable(''),
		other = $bindable(''),
		disabled = false,
		error
	}: Props = $props();

	const groups = $derived(
		VETERINARIAN_CATEGORY_ORDER.map((category) => ({
			category,
			vets: veterinarians.filter((vet) => vet.category === category)
		})).filter((group) => group.vets.length > 0)
	);

	const isOther = $derived(choice === OTHER_VETERINARIAN);
	const selectedVet = $derived(veterinarians.find((vet) => vet.id === choice));

	// Le bouton fermé : juste le nom (le détail est dans la liste)
	const triggerLabel = $derived(selectedVet?.name ?? (isOther ? 'Autre…' : 'Non précisé'));

	/** La 2e ligne d'une option : « Montpellier / Corum · ophtalmologie » */
	const details = (vet: VeterinarianOption) =>
		[vet.area, vet.specialty?.toLowerCase()].filter(Boolean).join(' · ');
</script>

<div class="grid gap-2">
	<label for="care-veterinarian" class="text-xs font-medium text-gray-700">
		Vétérinaire (facultatif)
	</label>
	<Select.Root type="single" bind:value={choice} {disabled}>
		<Select.Trigger id="care-veterinarian" class="w-full">
			<span
				class="min-w-0 flex-1 truncate text-left {selectedVet || isOther
					? ''
					: 'text-muted-foreground'}"
			>
				{triggerLabel}
			</span>
		</Select.Trigger>
		<!-- Aussi large que le champ, et pas plus haute que 20rem : on fait défiler -->
		<Select.Content class="max-h-80 w-(--bits-select-anchor-width)">
			<Select.Item value="" label="Non précisé">
				<span class="text-muted-foreground">Non précisé</span>
			</Select.Item>

			{#each groups as group (group.category)}
				<Select.Separator />
				<Select.Group>
					<Select.GroupHeading class="font-semibold">
						{VETERINARIAN_CATEGORY[group.category].label}
						{#if group.category !== 'PARTNER'}
							<span class="font-normal">· {VETERINARIAN_CATEGORY[group.category].hint}</span>
						{/if}
					</Select.GroupHeading>
					{#each group.vets as vet (vet.id)}
						<Select.Item value={vet.id} label={vet.name}>
							<!-- div (pas span) : le style de Select.Item met le dernier span en ligne -->
							<div class="grid min-w-0 gap-0.5">
								<span class="truncate">{vet.name}</span>
								{#if details(vet)}
									<span class="truncate text-xs text-muted-foreground">{details(vet)}</span>
								{/if}
							</div>
						</Select.Item>
					{/each}
				</Select.Group>
			{/each}

			<Select.Separator />
			<Select.Item value={OTHER_VETERINARIAN} label="Autre…">
				Autre… <span class="text-xs text-muted-foreground">(saisir le nom)</span>
			</Select.Item>
		</Select.Content>
	</Select.Root>

	<!-- Ce que reçoit le serveur : l'id (pas « OTHER ») et, pour « Autre… », le nom saisi -->
	<input type="hidden" name="veterinarianId" value={isOther ? '' : choice} />
	{#if isOther}
		<InputField
			id="care-veterinary"
			name="veterinary"
			label="Nom du vétérinaire"
			placeholder="Nom de la clinique ou du véto"
			bind:value={other}
			{error}
			{disabled}
		/>
	{/if}
</div>
