<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';
	import { formatAge } from '#lib/utils/age.ts';
	import { formatDate } from '#lib/utils/date.ts';

	// Section « Profil » en LECTURE (panneaux de demande) : le jumeau de PersonProfileFields
	interface Props {
		firstName?: string | null;
		lastName?: string | null;
		/** Dans le JSON d'une demande, la date est une chaîne */
		birthDate?: string | Date | null;
		/** Largeur de la carte dans la grille du panneau (ex : « @2xl:col-span-3 ») */
		class?: string;
	}

	let { firstName, lastName, birthDate, class: className = '' }: Props = $props();

	const date = $derived(birthDate ? new Date(birthDate) : null);
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.profile.icon}
	title={PERSON_SECTION_CONFIG.profile.label}
	color={PERSON_SECTION_CONFIG.profile.color}
	class={className}
>
	<div class="ml-6 space-y-3">
		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-muted-foreground">Prénom</p>
				<p class="font-medium">{firstName || '—'}</p>
			</div>
			<div>
				<p class="text-muted-foreground">Nom</p>
				<p class="font-medium">{lastName || '—'}</p>
			</div>
		</div>

		<div>
			<p class="text-muted-foreground">Date de naissance</p>
			<div class="flex items-center gap-2">
				<p class="font-medium">{formatDate(date)}</p>
				{#if date}
					<Badge class="bg-blue-100 text-sm text-blue-700">{formatAge(date)}</Badge>
				{/if}
			</div>
		</div>
	</div>
</SectionCard>
