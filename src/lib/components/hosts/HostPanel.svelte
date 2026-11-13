<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import type { HostFull, HostEditData } from '#lib/types/host.ts';
	import HostEditForm from './HostEditForm.svelte';
	import { emptyHostEditData, hostToEditData } from './hostEditData.ts';
	import HostPanelHeader from './panel/HostPanelHeader.svelte';
	import HostIdentity from './panel/HostIdentity.svelte';
	import HostPlacements from './panel/HostPlacements.svelte';
	import HostProfile from './panel/HostProfile.svelte';
	import HostDescriptions from './panel/HostDescriptions.svelte';
	import HostPlacementHistory from './panel/HostPlacementHistory.svelte';

	const { host, isAdmin = false }: { host: HostFull | null; isAdmin?: boolean } = $props();

	// Sa blacklist active (0 ou 1), chargée avec la FA (hostFullArgs)
	const blacklist = $derived(host?.profil.blacklists[0] ?? null);

	let isEditing = $state(false);

	let editData = $state<HostEditData>(emptyHostEditData());

	const startEditing = () => {
		if (!host) return;
		editData = hostToEditData(host);
		isEditing = true;
	};

	// HostEditForm appelle update() : les données sont rechargées depuis le serveur
	const handleSuccessfulSave = () => {
		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};
</script>

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<HostPanelHeader {host} {isAdmin} onEdit={startEditing} />

			<Card.Content class="space-y-6">
				<Separator />
				<HostIdentity {host} />
				<Separator />
				<HostPlacements {host} />
				<Separator />
				<HostProfile {host} />
				<Separator />
				<HostDescriptions {host} />
				<Separator />
				<HostPlacementHistory {host} />
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6">
				<HostEditForm
					bind:editData
					hostId={host.id}
					profileId={host.profilId}
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
			<Icon name="house" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une famille d'accueil</p>
		</Card.Content>
	</Card.Root>
{/if}
