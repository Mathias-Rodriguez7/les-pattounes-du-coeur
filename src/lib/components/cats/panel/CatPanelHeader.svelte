<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Camera, HeartHandshake } from '@lucide/svelte';
	import CatAdopterCard from './CatAdopterCard.svelte';
	import { statusLabel, getSexIcon, focalPointStyle } from '#lib/utils/catHelpers.ts';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { getTrialInfo } from '#lib/utils/adoption.ts';
	import { ADOPTION_STATUS } from '#lib/constants/adoption.ts';
	import { publicMediaUrl } from '#lib/media/urls.ts';
	import type { CatAdoption, CatFull } from '#lib/types/cat.ts';

	// En-tête de la fiche d'un chat : sa photo, qui il est, où en est son adoption,
	// et à droite la carte Adoptant (ou le bouton « Adopter »)
	interface Props {
		cat: CatFull;
		/** La dernière adoption du chat, s'il y en a une */
		adoption: CatAdoption | null;
		/** Adopté : le statut du chat ET une adoption existante */
		isAdopted: boolean;
		isAdmin: boolean;
		/** Admin, ou bénévole associée au chat */
		canManage: boolean;
		/** Le bouton « Adopter » est proposé */
		canAdopt: boolean;
		/** Clic sur la photo : CatPanel ouvre la galerie */
		onEditPhoto: () => void;
		/** Clic sur « Adopter » : CatPanel ouvre la fenêtre d'adoption */
		onAdopt: () => void;
	}

	let { cat, adoption, isAdopted, isAdmin, canManage, canAdopt, onEditPhoto, onAdopt }: Props =
		$props();

	// Photo principale : celle marquée isPrimary, sinon la première image
	const primaryMedia = $derived(cat.media.find((m) => m.file.type === 'IMAGE') ?? null);
	const primaryStyle = $derived(primaryMedia ? focalPointStyle(primaryMedia) : '');
	const sexIcon = $derived(getSexIcon(cat.sex));
	// Jours restants de l'essai : le badge passe en rouge « À finaliser » à la fin de l'essai
	const trial = $derived(adoption ? getTrialInfo(adoption) : null);
</script>

<Card.Header class="flex flex-wrap items-stretch gap-4 pl-0 sm:gap-6">
	<!-- Photo : collée au bord gauche, bord droit en arc de cercle -->
	<!-- Clic = galerie. Souris : icône au survol | Tactile : pastille toujours visible -->
	<button
		type="button"
		onclick={onEditPhoto}
		class="group relative h-38 w-32 shrink-0 self-start overflow-hidden rounded-r-[5rem] bg-muted sm:w-50"
		aria-label="Gérer les photos de {cat.name ?? 'ce chat'}"
	>
		{#if primaryMedia}
			<img
				src={publicMediaUrl(primaryMedia.file.storageKey)}
				alt={cat.name ?? cat.catNumber}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 pointer-fine:group-hover:scale-105"
				style={primaryStyle}
			/>
		{:else}
			<span class="flex h-full items-center justify-center text-muted-foreground">
				<Icon name="cat" class="size-10 opacity-40" />
			</span>
		{/if}

		<!-- Souris : voile sombre + appareil photo au survol (ou au focus clavier) -->
		<span
			class="absolute inset-0 hidden items-center justify-center bg-black/40 text-white opacity-0 transition-opacity pointer-fine:flex pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100"
		>
			<Camera class="size-7" />
		</span>

		<!-- Tactile : pas de survol, donc une petite pastille toujours visible -->
		<span
			class="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white pointer-fine:hidden"
		>
			<Camera class="size-4" />
		</span>
	</button>

	<!-- Infos : qui est ce chat, et où en est-il ? -->
	<div class="grid min-w-0 flex-1 content-start gap-2 pt-6 pr-6 lg:flex-initial">
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
			<Card.Title class="text-xl sm:text-2xl">{cat.name ?? 'Sans nom'}</Card.Title>
			<span class="text-sm text-muted-foreground">{getAgeBadge(cat.birthDate)}</span>
			{#if sexIcon}
				<p class="flex items-center gap-1.5 font-medium">
					<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
					{sexIcon.label}
				</p>
			{/if}
		</div>

		<p class="text-sm text-muted-foreground">
			N° de suivi : <span class="font-medium text-foreground">{cat.catNumber}</span>
		</p>

		<div class="flex flex-wrap gap-2">
			<Badge variant="outline" class="text-sm">
				{statusLabel[cat.status] ?? cat.status}
			</Badge>
			{#if cat.isVisible}
				<Badge class="bg-green-100 text-sm text-green-700">Visible</Badge>
			{:else}
				<Badge class="bg-red-100 text-sm text-red-700">Masqué</Badge>
			{/if}
		</div>

		<!-- L'état de l'adoption : sur sa propre ligne, c'est l'information du moment -->
		{#if isAdopted && adoption}
			<!-- Badge sur 2 lignes (flex-col, coins arrondis au lieu de pilule) : la colonne des
			     infos reste étroite, et la carte Adoptant gagne de la place -->
			{#if adoption.status === 'TRIAL' && trial}
				<Badge
					class="w-fit flex-col items-start gap-0 rounded-lg text-sm {trial.isDue
						? 'bg-red-100 text-red-700'
						: ADOPTION_STATUS.TRIAL.color}"
				>
					<span>
						{trial.isDue ? 'À finaliser' : ADOPTION_STATUS.TRIAL.label}
						· fin {formatDateNum(adoption.trialEndsAt)}
					</span>
					{#if !trial.isDue}
						<span class="text-xs font-normal">
							dans {trial.daysLeft} jour{trial.daysLeft > 1 ? 's' : ''}
						</span>
					{/if}
				</Badge>
			{:else if adoption.status === 'FINAL'}
				<Badge
					class="w-fit flex-col items-start gap-0 rounded-lg text-sm {ADOPTION_STATUS.FINAL.color}"
				>
					<span>{ADOPTION_STATUS.FINAL.label}</span>
					<span class="text-xs font-normal">
						depuis le {formatDateNum(adoption.finalizedAt)}
					</span>
				</Badge>
			{/if}
		{/if}
	</div>

	<!-- Adoptant + action : à droite sur PC, en dessous sur tablette et mobile.
     Le {#if} englobe le conteneur : sans adoption, aucun bloc vide ne prend de place -->
	{#if isAdopted && adoption}
		<div class="w-full min-w-0 lg:w-auto lg:flex-1 lg:pt-6">
			<CatAdopterCard {cat} {adoption} {isAdmin} {canManage} />
		</div>
	{:else if canAdopt}
		<!-- Pas encore adopté : l'action à la place de la carte Adoptant.
	     Une fois l'adoption créée, la carte la remplace (le load est relancé) -->
		<div class="ml-auto self-start pt-6 pr-6">
			<Button size="sm" onclick={onAdopt}>
				<HeartHandshake class="size-4" />
				Adopter
			</Button>
		</div>
	{/if}
</Card.Header>
