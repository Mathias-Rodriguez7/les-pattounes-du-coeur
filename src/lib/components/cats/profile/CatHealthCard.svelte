<script lang="ts">
	import type { Cat } from '@prisma/client';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { getLabel, vaccinateLabel } from '$lib/utils/catHelpers';

	interface Props {
		cat: Pick<
			Cat,
			| 'vaccinate'
			| 'isFivTest'
			| 'isDeworming'
			| 'isSterilize'
			| 'isAlreadySterilized'
			| 'isIdentify'
			| 'chipId'
		>;
		class?: string;
	}

	let { cat, class: className = '' }: Props = $props();
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.health.icon}
	title={CAT_SECTION_CONFIG.health.label}
	color={CAT_SECTION_CONFIG.health.color}
	class={className}
>
	<!-- @container : la carte s'adapte à SA largeur, pas à celle de l'écran.
	     Étroite (panneau d'une demande) : 1 colonne | Large (fiche du chat) : 2 colonnes -->
	<div class="@container ml-6">
		<div class="grid grid-cols-1 gap-2 @sm:grid-cols-2 @sm:gap-6">
			<div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
				<span class="text-muted-foreground">Vaccin</span>
				<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
				<span class="text-muted-foreground">Test FIV</span>
				<div class="flex justify-start">
					<BooleanIcon value={cat.isFivTest} />
				</div>
				<span class="text-muted-foreground">Vermifuge</span>
				<div class="flex justify-start">
					<BooleanIcon value={cat.isDeworming} />
				</div>
			</div>
			<div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
				<span class="text-muted-foreground">Stérilisé·e</span>
				<div class="flex justify-start">
					<!-- Stérilisé par l'asso OU arrivé déjà stérilisé -->
					<BooleanIcon value={cat.isSterilize || cat.isAlreadySterilized} />
				</div>
				<span class="text-muted-foreground">Identifié·e</span>
				<div class="flex justify-start">
					<BooleanIcon value={cat.isIdentify} />
				</div>
				<span class="text-muted-foreground">Puce</span>
				<span class="break-all">{cat.chipId ?? '—'}</span>
			</div>
		</div>
	</div>
</SectionCard>
