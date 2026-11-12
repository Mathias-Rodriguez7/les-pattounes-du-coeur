<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import BlacklistBadge from '#lib/components/blacklist/BlacklistBadge.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { formatAge } from '#lib/utils/age.ts';
	import { formatDate } from '#lib/utils/date.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import {
		VOLUNTEER_SECTION_CONFIG,
		VOLUNTEER_ROLE_OPTIONS,
		roleColors
	} from '#lib/constants/volunteer.ts';
	import { STATUS_CONFIG } from '#lib/types/index.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	// En-tête de la fiche d'un bénévole : statut, rôle, nom, âge, badges, pause, bouton « Modifier »
	interface Props {
		volunteer: VolunteerWithRelations;
		/** Le bouton « Modifier » n'est proposé qu'à l'admin */
		isAdmin: boolean;
		/** Clic sur « Modifier » : VolunteerPanel passe en mode édition */
		onEdit: () => void;
	}

	let { volunteer, isAdmin, onEdit }: Props = $props();

	const fullName = $derived(`${volunteer.profil.firstName} ${volunteer.profil.lastName}`);
	// Sa blacklist active (0 ou 1), chargée par la page Bénévoles
	const blacklist = $derived(volunteer.profil.blacklists?.[0] ?? null);
	const currentStatus = $derived(
		volunteer.actif && volunteer.actif in STATUS_CONFIG
			? STATUS_CONFIG[volunteer.actif]
			: STATUS_CONFIG.ACTIVE
	);
	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === volunteer.role)?.label ?? volunteer.role
	);
	const isOnBreak = $derived(
		volunteer.actif === 'BREAK' && !!(volunteer.breakStart || volunteer.breakEnd)
	);
</script>

<Card.Header class="gap-4">
	<div class="flex items-start gap-4">
		<!-- Icône de statut + rôle -->
		<div class="flex shrink-0 flex-col items-center gap-2">
			{#key volunteer.actif}
				<Icon
					name={currentStatus.icon}
					withWrapper={true}
					wrapperClass="flex size-12 items-center justify-center rounded-2xl text-white shadow-lg"
					style="background: {getGradientStyle(currentStatus.theme)}"
					iconClass="size-6"
				/>
			{/key}
			<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'}>
				{roleLabel}
			</Badge>
		</div>

		<!-- Nom + âge -->
		<div class="min-w-0 flex-1">
			<Card.Title class="truncate text-xl @md:text-2xl" title={fullName}>
				{fullName}
			</Card.Title>
			<div class="mt-1 flex items-center gap-2">
				<Card.Description class="text-base @md:text-lg">
					{formatAge(volunteer.profil.birthDate)}
				</Card.Description>
				{#if blacklist}
					<BlacklistBadge {blacklist} />
				{/if}
				{#if volunteer.profil.host}
					<span title="Ce bénévole est aussi famille d'accueil">
						<Icon name="star" iconClass="size-5 text-amber-500 fill-amber-500" />
					</span>
				{/if}
			</div>
		</div>

		<!-- Édition -->
		{#if isAdmin}
			<Button
				variant="ghost"
				size="icon"
				class="shrink-0"
				onclick={onEdit}
				aria-label="Modifier le bénévole"
			>
				<Pencil class="size-5" />
			</Button>
		{/if}
	</div>

	<!-- Pause : bandeau pleine largeur sous l'en-tête -->
	{#if isOnBreak}
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.pause.icon}
			title={VOLUNTEER_SECTION_CONFIG.pause.label}
			color={VOLUNTEER_SECTION_CONFIG.pause.color}
		>
			<div class="ml-6 flex flex-wrap gap-x-6 gap-y-1 text-sm">
				{#if volunteer.breakStart}
					<p class="font-medium text-gray-900">
						Début : {formatDate(new Date(volunteer.breakStart))}
					</p>
				{/if}
				{#if volunteer.breakEnd}
					<p class="font-medium text-gray-900">
						Fin : {formatDate(new Date(volunteer.breakEnd))}
					</p>
				{/if}
			</div>
		</SectionCard>
	{/if}
</Card.Header>
