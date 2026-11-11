<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import SectionCard from '../cards/SectionCard.svelte';
	import { Plus, LoaderCircle } from '@lucide/svelte';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { getAgeBadge } from '$lib/utils/age';
	import Icon from '$lib/components/Icon.svelte';
	import { getLabel, getSexIcon, vaccinateLabel } from '$lib/utils/catHelpers';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import HostDataTable from '../hosts/HostDataTable.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		catId: string;
		cat: CatFull;
		placement?: PlacementFull | null;
		hosts: HostFull[];
		onSuccess?: () => void;
	}

	let { catId, cat, placement = null, hosts, onSuccess }: Props = $props();

	let open = $state(false);
	let step = $state<'table' | 'confirm'>('table');
	let isSubmitting = $state(false);
	let selectedHostIds = $state<string[]>([]);

	const activeSicknesses = $derived((cat.sicknesses ?? []).filter((s) => s.status === 'ACTIVE'));
	const treatedSicknesses = $derived((cat.sicknesses ?? []).filter((s) => s.status === 'TREATED'));
	const selectedHosts = $derived(hosts.filter((h) => selectedHostIds.includes(h.id)));
	const count = $derived(selectedHostIds.length);

	// À chaque fermeture (Échap, croix, clic à côté, succès) : retour à l'état initial
	$effect(() => {
		if (!open) {
			step = 'table';
			selectedHostIds = placement?.hostId ? [placement.hostId] : [];
		}
	});

	function handleSelectionChange(hostIds: string[]) {
		selectedHostIds = hostIds;
	}

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (selectedHostIds.length === 0) {
			toast.error("Veuillez sélectionner au moins une famille d'accueil");
			cancel(); // ANNULE réellement l'envoi
			return;
		}

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(
					count > 1 ? `${count} placements créés avec succès` : 'Placement créé avec succès'
				);
				open = false;
				await update();
				onSuccess?.();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur lors de la création du placement');
				await update({ reset: false });
			} else if (result.type === 'error') {
				toast.error('Erreur serveur');
			}

			isSubmitting = false;
		};
	};
	const sexIcon = $derived(getSexIcon(cat.sex));
</script>

<Dialog.Root bind:open>
	<!-- Le déclencheur est HORS du {#if} : il reste affiché pendant la confirmation -->
	<!-- buttonVariants : le Trigger EST le bouton (avant : un bouton dans un bouton) -->
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm', class: 'rounded-2xl' })}>
		<Plus class="h-4 w-4" />
		<span class="hidden sm:inline">Ajouter un placement</span>
		<span class="sm:hidden">Ajouter</span>
	</Dialog.Trigger>

	{#if step === 'table'}
		<!-- ===================== ÉTAPE 1 : choisir les FA ===================== -->
		<Dialog.Content size="xxl" class="max-h-[90dvh] overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Proposer {cat.name ?? 'ce chat'} à des familles d'accueil</Dialog.Title>
				<Dialog.Description>
					Vérifiez le profil du chat, puis sélectionnez une ou plusieurs familles.
				</Dialog.Description>
			</Dialog.Header>

			<!-- Résumé du chat : PC 1 + 1 + 2 + 2 (comme avant) | Tablette 2 | Mobile 1 -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
				<SectionCard
					icon={CAT_SECTION_CONFIG.profile.icon}
					title={CAT_SECTION_CONFIG.profile.label}
					color={CAT_SECTION_CONFIG.profile.color}
					class="md:col-span-1"
				>
					<div class="ml-6 grid grid-cols-2 gap-2 text-sm">
						<p class="text-muted-foreground mb-1">Nom</p>
						<p class="font-medium">{cat.name ?? '—'}</p>
						<p class="text-muted-foreground mb-1">Sexe</p>
						<p class="flex items-center gap-1.5 font-medium">
							<Icon name={sexIcon.icon} class="h-4 w-4 {sexIcon.color}" />
							{sexIcon.label}
						</p>

						<p class="text-muted-foreground mb-1">Âge</p>
						<p class="font-medium">{getAgeBadge(cat.birthDate)}</p>
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.compatibility.icon}
					title={CAT_SECTION_CONFIG.compatibility.label}
					color={CAT_SECTION_CONFIG.compatibility.color}
					class="md:col-span-1"
				>
					<div class="ml-6 grid grid-cols-2 gap-2 text-sm">
						<span class="text-muted-foreground">Chien</span>
						<div class="flex justify-start"><BooleanIcon value={cat.isOkDog ?? false} /></div>
						<span class="text-muted-foreground">Chat</span>
						<div class="flex justify-start"><BooleanIcon value={cat.isOkCat ?? false} /></div>
						<span class="text-muted-foreground">Enfant</span>
						<div class="flex justify-start"><BooleanIcon value={cat.isOkChild ?? false} /></div>
						<span class="text-muted-foreground">Jardin</span>
						<div class="flex justify-start"><BooleanIcon value={cat.isOutside ?? false} /></div>
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.health.icon}
					title={CAT_SECTION_CONFIG.health.label}
					color={CAT_SECTION_CONFIG.health.color}
					class="sm:col-span-2 md:col-span-2"
				>
					<div class="ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
						<div class="grid grid-cols-2 gap-2 text-sm">
							<span class="text-muted-foreground">Vaccin</span>
							<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
							<span class="text-muted-foreground">Test FIV</span>
							<div class="flex justify-start"><BooleanIcon value={cat.isFivTest ?? false} /></div>
							<span class="text-muted-foreground">Vermifuge</span>
							<div class="flex justify-start">
								<BooleanIcon value={cat.isDeworming ?? false} />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<span class="text-muted-foreground">Stérilisé·e</span>
							<div class="flex justify-start">
								<BooleanIcon
									value={(cat.isSterilize ?? false) || (cat.isAlreadySterilized ?? false)}
								/>
							</div>
							<span class="text-muted-foreground">Identifié·e</span>
							<div class="flex justify-start"><BooleanIcon value={cat.isIdentify ?? false} /></div>
							<span class="text-muted-foreground">Puce</span>
							<span class="break-all">{cat.chipId ?? '—'}</span>
						</div>
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.sicknesses.icon}
					title={CAT_SECTION_CONFIG.sicknesses.label}
					color={CAT_SECTION_CONFIG.sicknesses.color}
					class="sm:col-span-2 md:col-span-2"
				>
					<div class="ml-6 space-y-3 text-sm">
						{#if activeSicknesses.length > 0}
							<div>
								<p class="text-muted-foreground mb-1">Maladies actives</p>
								<div class="flex flex-wrap gap-x-3 gap-y-1">
									{#each activeSicknesses as sickness (sickness.id)}
										<span class="font-medium">{sickness.name}</span>
									{/each}
								</div>
							</div>
						{:else}
							<p class="text-muted-foreground rounded border border-dashed p-3">
								Aucune maladie active.
							</p>
						{/if}

						{#if treatedSicknesses.length > 0}
							<div>
								<p class="text-muted-foreground mb-1">Maladies en traitement</p>
								<div class="flex flex-wrap gap-x-3 gap-y-1">
									{#each treatedSicknesses as sickness (sickness.id)}
										<span class="font-medium">{sickness.name}</span>
									{/each}
								</div>
							</div>
						{:else}
							<p class="text-muted-foreground rounded border border-dashed p-3">
								Aucune maladie en traitement.
							</p>
						{/if}
					</div>
				</SectionCard>
			</section>

			<!-- Choix des FA -->
			<section class="min-w-0 space-y-2">
				<h3 class="text-sm font-semibold">Choisir une ou plusieurs familles d'accueil</h3>
				<!-- Le tableau défile horizontalement s'il est trop large, sans élargir la fenêtre -->
				<div class="overflow-x-auto">
					<HostDataTable
						{cat}
						{hosts}
						{selectedHostIds}
						onSelectionChange={handleSelectionChange}
					/>
				</div>
			</section>

			<Dialog.Footer>
				<Button class="w-full sm:w-auto" disabled={count === 0} onclick={() => (step = 'confirm')}>
					Proposer à {count} FA
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{:else}
		<!-- ===================== ÉTAPE 2 : confirmer ===================== -->
		<Dialog.Content size="md">
			<Dialog.Header>
				<Dialog.Title>Confirmer la proposition</Dialog.Title>
				<Dialog.Description>
					{cat.name ?? 'Ce chat'} sera proposé{count > 1 ? ' à ces familles' : ' à cette famille'}.
				</Dialog.Description>
			</Dialog.Header>

			<form method="POST" action="?/createPlacement" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="catId" value={catId} />
				{#each selectedHostIds as hostId (hostId)}
					<input type="hidden" name="hostIds" value={hostId} />
				{/each}
				<input type="hidden" name="type" value="PROPOSAL" />
				<input type="hidden" name="status" value="ACTIVE" />

				<div class="space-y-2 text-sm">
					<p class="font-medium">
						{count} famille{count > 1 ? 's' : ''} d'accueil sélectionnée{count > 1 ? 's' : ''} :
					</p>
					<ul class="list-inside list-disc">
						{#each selectedHosts as host (host.id)}
							<li>{host.profil.firstName} {host.profil.lastName}</li>
						{/each}
					</ul>
				</div>

				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						onclick={() => (step = 'table')}
						disabled={isSubmitting}
					>
						Retour
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<LoaderCircle class="h-4 w-4 animate-spin" />
						{/if}
						Confirmer la proposition
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	{/if}
</Dialog.Root>
