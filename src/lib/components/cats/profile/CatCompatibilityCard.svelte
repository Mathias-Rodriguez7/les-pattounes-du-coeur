<script lang="ts">
	import type { Cat } from '@prisma/client';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';

	interface Props {
		cat: Pick<Cat, 'isOkDog' | 'isOkCat' | 'isOkChild' | 'isOutside'>;
		class?: string;
	}

	let { cat, class: className = '' }: Props = $props();

	const rows = $derived([
		{ label: 'Chien', value: cat.isOkDog },
		{ label: 'Chat', value: cat.isOkCat },
		{ label: 'Enfant', value: cat.isOkChild },
		{ label: 'Jardin', value: cat.isOutside }
	]);
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.compatibility.icon}
	title={CAT_SECTION_CONFIG.compatibility.label}
	color={CAT_SECTION_CONFIG.compatibility.color}
	class={className}
>
	<div class="ml-6 space-y-1">
		{#each rows as row (row.label)}
			<div class="flex items-center justify-between">
				<span class="text-muted-foreground">{row.label}</span>
				<BooleanIcon value={row.value ?? false} />
			</div>
		{/each}
	</div>
</SectionCard>
