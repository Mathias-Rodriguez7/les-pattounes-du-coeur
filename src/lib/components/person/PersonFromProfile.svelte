<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';
	import { toPersonInput, type PersonForm } from '#lib/person/personForm.ts';

	// Créer un 2e rôle (FA ou bénévole) pour une personne DÉJÀ connue :
	// ses coordonnées viennent de son profil. On les affiche, sans les rendre modifiables :
	// le serveur rattache le nouveau rôle au profil existant (retrouvé par l'email).
	// Les champs partent quand même, cachés : le schéma de création les vérifie.
	interface Props {
		person: PersonForm;
		/** Erreurs du serveur sur ces champs (ex : « Email présent dans la blacklist ») */
		errors?: Record<string, string | undefined>;
		/** Largeur de la carte dans la grille du formulaire */
		class?: string;
	}

	let { person, errors = {}, class: className = '' }: Props = $props();

	const hiddenFields = $derived(Object.entries(toPersonInput(person)));
	const personErrors = $derived(
		Object.keys(toPersonInput(person))
			.map((field) => errors[field])
			.filter(Boolean)
	);
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.profile.icon}
	title={PERSON_SECTION_CONFIG.profile.label}
	color={PERSON_SECTION_CONFIG.profile.color}
	class={className}
>
	<div class="ml-6 grid gap-1 text-sm">
		<p class="font-semibold">{person.firstName} {person.lastName}</p>
		<p class="text-muted-foreground">{person.email} · {person.phone || '—'}</p>
		<p class="text-muted-foreground">{person.postalCode} {person.city}</p>
		<p class="mt-1 text-xs text-muted-foreground">
			Coordonnées reprises de son profil : elles ne changent pas ici.
		</p>
		{#each personErrors as error (error)}
			<p class="text-xs text-destructive">{error}</p>
		{/each}
	</div>

	{#each hiddenFields as [name, value] (name)}
		<input type="hidden" {name} value={value ?? ''} />
	{/each}
</SectionCard>
