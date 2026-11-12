<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import AdoptionCancelDialog from '#lib/components/adoptions/AdoptionCancelDialog.svelte';
	import AdoptionFinalizeDialog from '#lib/components/adoptions/AdoptionFinalizeDialog.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import { getTrialInfo } from '#lib/utils/adoption.ts';
	import type { CatAdoption, CatFull } from '#lib/types/cat.ts';

	// Carte « Adoptant » de l'en-tête : qui a adopté le chat, et les actions sur l'adoption
	interface Props {
		cat: CatFull;
		/** L'adoption en cours (la plus récente) */
		adoption: CatAdoption;
		/** Blacklister l'adoptant : admin seulement */
		isAdmin: boolean;
		/** Annuler / finaliser : admin, ou bénévole associée au chat */
		canManage: boolean;
	}

	let { cat, adoption, isAdmin, canManage }: Props = $props();

	// Jours restants de l'essai : le bouton « Finaliser » n'est actif qu'à la fin de l'essai
	const trial = $derived(getTrialInfo(adoption));

	// Ce que le ménage de la finalisation supprimera : tout sauf UNE photo (les PDF ne bougent pas)
	const isSterilized = $derived(cat.isSterilize || cat.isAlreadySterilized);
	const galleryPhotos = $derived(cat.media.filter((m) => m.file.type === 'IMAGE').length);
	const galleryVideos = $derived(cat.media.filter((m) => m.file.type === 'VIDEO').length);

	// L'adresse de l'adoptant sur une seule ligne : « 12 rue X, 34000 Montpellier »
	const adopterAddress = $derived.by(() => {
		const profil = adoption.profil;
		if (!profil) return '';
		const town = [profil.postalCode, profil.city].filter(Boolean).join(' ');
		return [profil.address, town].filter(Boolean).join(', ');
	});
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.adoptions.icon}
	title={CAT_SECTION_CONFIG.adoptions.label}
	color={CAT_SECTION_CONFIG.adoptions.color}
>
	<!-- Les actions sur la ligne du titre : la carte reste aussi haute que la photo.
	     Annuler (discret) puis Finaliser (principale) -->
	{#snippet action()}
		<!-- Blacklist : admin seulement, petite icône pour ne pas charger la ligne -->
		{#if isAdmin && adoption.profil && !cat.adopterBlacklist}
			<BlacklistAddDialog
				email={adoption.profil.email}
				name={`${adoption.profil.firstName} ${adoption.profil.lastName}`}
				trigger="icon"
			/>
		{/if}
		{#if canManage && adoption.status !== 'CANCELLED'}
			<!-- Retour du chat : possible pendant l'essai ET après une adoption définitive -->
			<AdoptionCancelDialog
				adoptionId={adoption.id}
				catId={cat.id}
				catName={cat.name ?? 'Ce chat'}
				isFinal={adoption.status === 'FINAL'}
			/>
			{#if adoption.status === 'TRIAL'}
				<AdoptionFinalizeDialog
					adoptionId={adoption.id}
					catName={cat.name ?? 'ce chat'}
					{isSterilized}
					removedPhotos={Math.max(galleryPhotos - 1, 0)}
					removedVideos={galleryVideos}
					disabled={!trial.isDue}
				/>
			{/if}
		{/if}
	{/snippet}

	{#if adoption.profil}
		{@const adopter = adoption.profil}
		<!-- flex-wrap : les infos se rangent selon la place disponible,
	     sur une ligne si la carte est large, sur plusieurs sinon -->
		<!-- 3 lignes : le nom, puis le contact (tél + mail côte à côte), puis l'adresse -->
		<div class="grid min-w-0 gap-2 text-xs">
			<div class="flex min-w-0 items-center gap-2">
				<p class="truncate text-base font-semibold">
					{adopter.firstName}
					{adopter.lastName}
				</p>
				{#if cat.adopterBlacklist}
					<!-- La raison au survol, et lue par les lecteurs d'écran -->
					<Badge class="shrink-0 bg-red-100 text-red-700" title={cat.adopterBlacklist.reason}>
						Blacklisté
						<span class="sr-only">: {cat.adopterBlacklist.reason}</span>
					</Badge>
				{/if}
			</div>

			<!-- flex-wrap : tél et mail sur la même ligne, le mail passe dessous si la carte est étroite -->
			<div class="flex min-w-0 flex-wrap gap-x-6 gap-y-2">
				{#if adopter.phone}
					<div class="flex min-w-0 items-center gap-2">
						<Icon name="phone" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
						<a
							href={`tel:${adopter.phone}`}
							class="truncate text-blue-500 underline hover:text-primary"
						>
							{adopter.phone}
						</a>
					</div>
				{/if}
				<div class="flex max-w-full min-w-0 items-center gap-2">
					<Icon name="mail" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
					<a
						href={`mailto:${adopter.email}`}
						title={adopter.email}
						class="truncate text-blue-500 underline hover:text-primary"
					>
						{adopter.email}
					</a>
				</div>
			</div>

			{#if adopterAddress}
				<div class="flex min-w-0 items-center gap-2">
					<Icon name="map" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
					<span>{adopterAddress}</span>
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-muted-foreground">Profil non disponible</p>
	{/if}
</SectionCard>
