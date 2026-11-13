<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import {
		FORM_TYPE_CONFIG,
		FORM_TYPE_LABELS,
		FORM_TYPES,
		type FormType
	} from '#lib/types/index.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	// Les formulaires assignés à un bénévole, comptés par type
	interface Props {
		volunteer: VolunteerWithRelations;
	}

	let { volunteer }: Props = $props();

	// Un compteur par type, construit depuis FORM_TYPES : impossible d'oublier un type
	// ou d'en inventer un qui n'existe plus
	const formCounts = $derived(
		Object.fromEntries(
			FORM_TYPES.map((type) => [
				type,
				volunteer.assignedForms.filter((f) => f.type === type).length
			])
		) as Record<FormType, number>
	);
</script>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.forms.icon}
	title={VOLUNTEER_SECTION_CONFIG.forms.label}
	color={VOLUNTEER_SECTION_CONFIG.forms.color}
>
	<!-- 2 colonnes en largeur moyenne, liste verticale à côté des chats en grand -->
	<div class="grid grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-1">
		{#each FORM_TYPES as type (type)}
			<div
				class="flex items-center justify-between gap-2 rounded-xl border p-3 transition hover:shadow-md"
			>
				<div class="flex min-w-0 items-center gap-3">
					<Icon
						name={FORM_TYPE_CONFIG[type].icon}
						withWrapper={true}
						wrapperClass="flex size-6 shrink-0 items-center justify-center rounded-lg text-white"
						style="background: {getGradientStyle(FORM_TYPE_CONFIG[type].theme)}"
						iconClass="size-3"
					/>
					<span class="truncate text-sm font-medium text-gray-900">
						{FORM_TYPE_LABELS[type]}
					</span>
				</div>
				<span
					class="text-sm font-semibold {formCounts[type] > 0 ? 'text-teal-600' : 'text-gray-400'}"
				>
					{formCounts[type]}
				</span>
			</div>
		{/each}
	</div>
</SectionCard>
