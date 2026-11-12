<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';
	import { districtLabel } from '#lib/utils/districts.ts';

	// Section « Adresse » en LECTURE
	interface Props {
		address?: string | null;
		city?: string | null;
		postalCode?: string | null;
		/** La clé enregistrée (CENTRE_VILLE…) : on affiche son libellé */
		district?: string | null;
		/** Largeur de la carte dans la grille du panneau (ex : « @2xl:col-span-4 ») */
		class?: string;
	}

	let { address, city, postalCode, district, class: className = '' }: Props = $props();
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.address.icon}
	title={PERSON_SECTION_CONFIG.address.label}
	color={PERSON_SECTION_CONFIG.address.color}
	class={className}
>
	<div class="ml-6 grid gap-4">
		<div>
			<p class="font-medium text-muted-foreground">Rue</p>
			<p class="font-medium text-gray-900">{address || '—'}</p>
		</div>

		<div class="flex gap-4">
			<div>
				<p class="font-medium text-muted-foreground">Ville</p>
				<p class="font-medium text-gray-900">{city || '—'}</p>
			</div>
			<div>
				<p class="font-medium text-muted-foreground">CP</p>
				<p class="font-medium text-gray-900">{postalCode || '—'}</p>
			</div>
			<div>
				<p class="font-medium text-muted-foreground">Quartier</p>
				<p class="font-medium">{districtLabel(district) ?? '—'}</p>
			</div>
		</div>
	</div>
</SectionCard>
