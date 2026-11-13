<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import CatVolunteerCreateForm from '#lib/components/catVolunteer/CatVolunteerCreateForm.svelte';
	import CatVolunteerRemoveButton from '#lib/components/catVolunteer/CatVolunteerRemoveButton.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import { truncate } from '#lib/utils/string.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import type { VolunteerBasic } from '#lib/types/volunteer.ts';

	// Section « Bénévoles référents » de la fiche d'un chat (toujours affichée, même après adoption)
	interface Props {
		cat: CatFull;
		/** Toutes les bénévoles : la liste du bouton « Associer » */
		volunteers: VolunteerBasic[];
		/** Seule l'admin associe ou retire une bénévole */
		isAdmin: boolean;
	}

	let { cat, volunteers, isAdmin }: Props = $props();

	// On garde le lien complet (volunteerId + profil) pour pouvoir le retirer
	const assignedVolunteers = $derived(cat.volunteers.filter((cv) => cv.volunteer?.profil));
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.volunteer.icon}
	title={CAT_SECTION_CONFIG.volunteer.label}
	color={CAT_SECTION_CONFIG.volunteer.color}
>
	{#snippet action()}
		{#if isAdmin}
			<CatVolunteerCreateForm
				catId={cat.id}
				{volunteers}
				assignedVolunteerIds={assignedVolunteers.map((cv) => cv.volunteerId)}
			/>
		{/if}
	{/snippet}

	{#if assignedVolunteers.length > 0}
		<div class="flex flex-wrap gap-4 text-sm">
			{#each assignedVolunteers as cv (cv.volunteerId)}
				{@const profil = cv.volunteer.profil}
				<div class="grid min-w-0 gap-2 rounded-xl border border-sky-400 bg-sky-100 p-2">
					<div class="flex items-center justify-between gap-2">
						<p class="font-semibold">
							{profil.firstName}
							{truncate(profil.lastName, 1)}.
						</p>
						{#if isAdmin}
							<CatVolunteerRemoveButton
								catId={cat.id}
								volunteerId={cv.volunteerId}
								volunteerName={`${profil.firstName} ${profil.lastName}`}
							/>
						{/if}
					</div>
					<div class="flex gap-2">
						<Icon name="phone" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
						<a
							href={`tel:${profil.phone}`}
							class="text-xs text-blue-500 underline hover:text-primary"
						>
							{profil.phone}
						</a>
					</div>
					<div class="flex min-w-0 gap-2">
						<Icon name="mail" iconClass="h-5 w-5 shrink-0 text-muted-foreground" />
						<a
							href={`mailto:${profil.email}`}
							class="block text-xs break-all text-blue-500 underline hover:text-primary"
						>
							{profil.email}
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
			<p>Aucun bénévole associé à ce chat</p>
		</div>
	{/if}
</SectionCard>
