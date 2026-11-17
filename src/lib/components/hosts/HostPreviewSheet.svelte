<script lang="ts">
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import HostIdentity from './panel/HostIdentity.svelte';
	import HostPlacements from './panel/HostPlacements.svelte';
	import HostProfile from './panel/HostProfile.svelte';
	import HostDescriptions from './panel/HostDescriptions.svelte';
	import { HOST_TYPES, statusColors } from '#lib/constants/host.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// L'aperçu d'UNE FA depuis le tableau « Proposer à des FA » : sa fiche complète, en lecture,
	// sans quitter la proposition. Les mêmes cartes que la page FA.
	interface Props {
		host: HostFull | null;
		/** Cochée dans la proposition ? (le bouton du bas la coche ou la décoche) */
		selected: boolean;
		onToggle: (hostId: string, checked: boolean) => void;
		onClose: () => void;
	}

	let { host, selected, onToggle, onClose }: Props = $props();
</script>

<!-- Ouvert tant qu'une FA est choisie ; fermer (croix, Échap, clic à côté) la « déchoisit » -->
<Sheet.Root
	bind:open={
		() => host !== null,
		(value) => {
			if (!value) onClose();
		}
	}
>
	<!-- La largeur se règle avec le même préfixe que le composant (data-[side=right]:…) :
	     un simple sm:max-w-… serait écrasé par son data-[side=right]:sm:max-w-sm -->
	<Sheet.Content
		side="right"
		class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-4xl"
	>
		{#if host}
			<Sheet.Header class="sticky top-0 z-10 border-b bg-card/95 p-4 backdrop-blur">
				<div class="flex flex-wrap items-center gap-2">
					{#if host.type}
						<Badge class={HOST_TYPES[host.type].color}>{HOST_TYPES[host.type].label}</Badge>
					{/if}
					{#if host.actif}
						<Badge class={statusColors[host.actif]?.color}>{statusColors[host.actif]?.label}</Badge>
					{/if}
					<Badge variant="outline">{host.isAvailable ? 'Disponible' : 'Non disponible'}</Badge>
				</div>
				<Sheet.Title class="text-xl font-bold">
					{host.profil.firstName}
					{host.profil.lastName}
				</Sheet.Title>
				<Sheet.Description>Aperçu de la fiche, en lecture seule.</Sheet.Description>
			</Sheet.Header>

			<div class="@container grid gap-6 p-4 text-sm">
				<HostIdentity {host} />
				<Separator />
				<HostPlacements {host} />
				<Separator />
				<HostProfile {host} />
				<Separator />
				<HostDescriptions {host} />
			</div>

			<!-- En bas : la cocher ou la décocher pour la proposition, sans revenir au tableau -->
			<div class="sticky bottom-0 flex justify-end gap-2 border-t bg-card/95 p-4 backdrop-blur">
				<Button variant="outline" onclick={onClose}>Fermer</Button>
				<Button
					variant={selected ? 'outline' : 'default'}
					onclick={() => onToggle(host.id, !selected)}
				>
					{selected ? 'Retirer de la proposition' : 'Ajouter à la proposition'}
				</Button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
