<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import BlacklistBadge from '#lib/components/blacklist/BlacklistBadge.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { formatAge } from '#lib/utils/age.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { formatDate } from '#lib/utils/date.ts';
	import { HOST_SECTION_CONFIG, STATUS_CONFIG, TYPE_COLORS } from '#lib/constants/host.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// En-tête de la fiche d'une FA : statut, type, nom, âge, badges, pause, bouton « Modifier »
	interface Props {
		host: HostFull;
		/** Le bouton « Modifier » n'est proposé qu'à l'admin */
		isAdmin: boolean;
		/** Clic sur « Modifier » : HostPanel passe en mode édition */
		onEdit: () => void;
	}

	let { host, isAdmin, onEdit }: Props = $props();

	const fullName = $derived(`${host.profil.firstName} ${host.profil.lastName}`);
	// Sa blacklist active (0 ou 1), chargée avec la FA (hostFullArgs)
	const blacklist = $derived(host.profil.blacklists[0] ?? null);
	const currentStatus = $derived(
		host.actif && host.actif in STATUS_CONFIG ? STATUS_CONFIG[host.actif] : STATUS_CONFIG.ACTIVE
	);
	// Le type peut ne pas être renseigné en base
	const typeInfo = $derived(host.type ? TYPE_COLORS[host.type] : null);
	const isOnBreak = $derived(host.actif === 'BREAK' && !!(host.breakStart || host.breakEnd));
</script>

<Card.Header>
	<!-- PC : ta ligne d'origine (h-25) | Mobile : le bloc pause passe à la ligne -->
	<section class="flex justify-between gap-4 lg:h-25">
		<div class="flex min-w-0 flex-wrap gap-4 lg:flex-nowrap lg:gap-8">
			<!-- Status Icon -->
			<div class="flex flex-col items-center justify-around gap-2">
				{#key host.actif}
					<Icon
						name={currentStatus.icon}
						withWrapper={true}
						wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
						style="background: {getGradientStyle(currentStatus.theme)}"
						iconClass="h-6 w-6"
					/>
				{/key}
				<Badge class={typeInfo?.color ?? 'bg-gray-100 text-gray-800'}>
					{typeInfo?.label ?? 'Type non renseigné'}
				</Badge>
			</div>

			<!-- Infos personnelles -->
			<div class="flex min-w-0 flex-col justify-between gap-1">
				<Card.Title class="text-xl sm:text-2xl">{fullName}</Card.Title>

				<div class="flex flex-wrap items-center gap-2 lg:gap-4">
					<Card.Description class="text-lg sm:text-xl">
						{formatAge(host.profil.birthDate)}
					</Card.Description>
					<Badge
						class={host.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
					>
						{host.isAvailable ? '✓ Disponible' : '✗ Non disponible'}
					</Badge>
					{#if blacklist}
						<BlacklistBadge {blacklist} />
					{/if}

					{#if host.profil.volunteer}
						<div title="Cette FA est aussi bénévole">
							<Icon name="star" iconClass="h-6 w-6 text-amber-500 fill-amber-500" />
						</div>
					{/if}
				</div>
			</div>

			<!-- PAUSE : pleine largeur sur mobile, à côté des infos sur PC -->
			{#if isOnBreak}
				<div class="basis-full lg:basis-auto">
					<SectionCard
						icon={HOST_SECTION_CONFIG.pause.icon}
						title={HOST_SECTION_CONFIG.pause.label}
						color={HOST_SECTION_CONFIG.pause.color}
					>
						<div class="ml-6 grid gap-4">
							<div class="text-sm">
								{#if host.breakStart}
									<p class="font-medium text-gray-900">
										Début : {formatDate(new Date(host.breakStart))}
									</p>
								{/if}
								{#if host.breakEnd}
									<p class="font-medium text-gray-900">
										Fin : {formatDate(new Date(host.breakEnd))}
									</p>
								{/if}
							</div>
						</div>
					</SectionCard>
				</div>
			{/if}
		</div>

		<!-- Bouton édition -->
		{#if isAdmin}
			<Button
				variant="ghost"
				size="icon"
				onclick={onEdit}
				class="shrink-0"
				aria-label="Modifier la famille d'accueil"
			>
				<Pencil class="h-5 w-5" />
			</Button>
		{/if}
	</section>
</Card.Header>
