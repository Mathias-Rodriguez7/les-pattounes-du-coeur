<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import type { VolunteerWithRelations, VolunteerEditData } from '#lib/types/volunteer.ts';
	import VolunteerEditForm from './VolunteerEditForm.svelte';
	import { emptyVolunteerEditData, volunteerToEditData } from './volunteerEditData.ts';
	import VolunteerPanelHeader from './panel/VolunteerPanelHeader.svelte';
	import VolunteerIdentity from './panel/VolunteerIdentity.svelte';
	import VolunteerCats from './panel/VolunteerCats.svelte';
	import VolunteerAssignedForms from './panel/VolunteerAssignedForms.svelte';

	const {
		volunteer,
		isAdmin = false
	}: { volunteer: VolunteerWithRelations | null; isAdmin?: boolean } = $props();

	// Sa blacklist active (0 ou 1), chargée par la page Bénévoles
	const blacklist = $derived(volunteer?.profil.blacklists?.[0] ?? null);

	let isEditing = $state(false);

	let editData = $state<VolunteerEditData>(emptyVolunteerEditData());

	const startEditing = () => {
		if (!volunteer) return;
		editData = volunteerToEditData(volunteer);
		isEditing = true;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	const handleSuccessfulSave = () => {
		// VolunteerEditForm appelle update() : les données sont rechargées depuis le serveur.
		// (Avant, on recopiait les champs à la main dans `volunteer` : c'est modifier une prop,
		// et les données affichées pouvaient différer de ce qui était enregistré)
		isEditing = false;
	};
</script>

{#if volunteer}
	<!-- @container : les classes @md:, @3xl:… à l'intérieur se basent sur la largeur du panneau -->
	<Card.Root class="@container flex h-full flex-col">
		{#if !isEditing}
			<VolunteerPanelHeader {volunteer} {isAdmin} onEdit={startEditing} />

			<Card.Content class="grid grid-cols-1 gap-6">
				<Separator />
				<VolunteerIdentity {volunteer} />
				<Separator />

				<!-- Chats + formulaires : côte à côte en grand (2/3 + 1/3), empilés sinon -->
				<div class="grid grid-cols-1 gap-4 @3xl:grid-cols-3">
					<div class="min-w-0 @3xl:col-span-2">
						<!-- {#key} : un autre bénévole = un tableau neuf, sa pagination repart de la page 1 -->
						{#key volunteer.id}
							<VolunteerCats {volunteer} />
						{/key}
					</div>
					<VolunteerAssignedForms {volunteer} />
				</div>
			</Card.Content>
		{:else}
			<Card.Content class="grid grid-cols-1 gap-6">
				<VolunteerEditForm
					bind:editData
					volunteerId={volunteer.id}
					profileId={volunteer.profilId}
					isBlacklisted={!!blacklist}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="user" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un bénévole</p>
		</Card.Content>
	</Card.Root>
{/if}
