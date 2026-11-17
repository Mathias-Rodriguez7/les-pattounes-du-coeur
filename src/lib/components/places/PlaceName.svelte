<script lang="ts">
	import { placeLabel } from '#lib/utils/districts.ts';

	// Le lieu court : le quartier à Montpellier, sinon la ville EN ITALIQUE
	// (pour distinguer « Mosson », un quartier, de « Lattes », une ville)
	interface Props {
		city?: string | null;
		district?: string | null;
		class?: string;
	}

	let { city, district, class: className = '' }: Props = $props();

	const place = $derived(placeLabel({ city, district }));
</script>

<span
	class="{place.isCity ? 'italic' : ''} {className}"
	title={place.isCity ? `Ville : ${place.label}` : `Quartier de Montpellier : ${place.label}`}
>
	{place.label}
</span>
