<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import InputField from '#lib/components/fields/InputField.svelte';
	import {
		CITY_PARTNER_COLOR,
		CITY_PARTNER_LABEL,
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
		/** Obligatoire : pas de « Non précisé » (la stérilisation d'un chat libre) */
		required?: boolean;
		/** L'id du champ : à changer si deux listes sont sur la même page */
		id?: string;
		/** L'erreur du choix lui-même (« Choisissez un vétérinaire ») */
		choiceError?: string;
	}

	let {
		veterinarians,
		choice = $bindable(''),
		other = $bindable(''),
		disabled = false,
		error,
		required = false,
		id = 'care-veterinarian',
		choiceError
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
	const emptyLabel = $derived(required ? 'Choisir un vétérinaire' : 'Non précisé');
	const triggerLabel = $derived(selectedVet?.name ?? (isOther ? 'Autre…' : emptyLabel));

	/** La 2e ligne d'une option : « Montpellier / Corum · ophtalmologie » */
	const details = (vet: VeterinarianOption) =>
		[vet.area, vet.specialty?.toLowerCase()].filter(Boolean).join(' · ');
</script>

<div class="grid gap-2">
	<label for={id} class="text-xs font-medium text-gray-700">
		Vétérinaire{required ? '' : ' (facultatif)'}
	</label>
	<Select.Root type="single" bind:value={choice} {disabled}>
		<Select.Trigger {id} class="w-full" aria-invalid={choiceError ? true : undefined}>
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
			{#if !required}
				<Select.Item value="" label="Non précisé">
					<span class="text-muted-foreground">Non précisé</span>
				</Select.Item>
			{/if}

			{#each groups as group, index (group.category)}
				{#if !required || index > 0}<Select.Separator />{/if}
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
								<span class="flex min-w-0 items-center gap-1.5">
									<span class="truncate">{vet.name}</span>
									{#if vet.isCityPartner}
										<span
											class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none {CITY_PARTNER_COLOR}"
										>
											{CITY_PARTNER_LABEL}
										</span>
									{/if}
								</span>
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
	{#if choiceError}
		<p class="text-xs text-destructive">{choiceError}</p>
	{/if}
	{#if isOther}
		<InputField
			id="{id}-other"
			name="veterinary"
			label="Nom du vétérinaire"
			placeholder="Nom de la clinique ou du véto"
			bind:value={other}
			{error}
			{disabled}
		/>
	{/if}
</div>
