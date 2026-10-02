<!-- PlacementCreateForm.svelte -->
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import SectionCard from '../cards/SectionCard.svelte';
	import { Plus } from '@lucide/svelte';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { getAgeBadge } from '$lib/utils/age';
	import { getLabel, sexLabel, vaccinateLabel } from '$lib/utils/catHelpers';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import HostDataTable from '../hosts/HostDataTable.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from '@lucide/svelte';

	interface Props {
		catId: string;
		cat: CatFull;
		placement: PlacementFull;
		hosts: HostFull[];
		onSuccess?: () => void;
	}

	let { catId, cat, placement = null, hosts, onSuccess }: Props = $props();

	let selectedHostIds = $state<string[]>(placement?.hostId ? [placement.hostId] : []);
	let open = $state(false);
	let step = $state<'table' | 'confirm'>('table');
	let isSubmitting = $state(false);

	const activeSicknesses = $derived((cat.sicknesses ?? []).filter((s) => s.status === 'ACTIVE'));
	const treatedSicknesses = $derived((cat.sicknesses ?? []).filter((s) => s.status === 'TREATED'));

	const selectedHosts = $derived(hosts.filter((h) => selectedHostIds.includes(h.id)));

	function handleSelectionChange(hostIds: string[]) {
		selectedHostIds = hostIds;
	}

	function goToConfirm() {
		if (selectedHostIds.length === 0) return;
		step = 'confirm';
	}

	function goBack() {
		step = 'table';
	}

	function resetForm() {
		step = 'table';
		selectedHostIds = placement?.hostId ? [placement.hostId] : [];
	}

	function resetAndClose() {
		resetForm();
		open = false;
	}

	const handleEnhance: SubmitFunction = () => {
		if (selectedHostIds.length === 0) {
			toast.error("Veuillez sélectionner au moins une famille d'accueil");
			return async () => {};
		}

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(
					`${selectedHostIds.length} placement${selectedHostIds.length > 1 ? 's' : ''} créé${selectedHostIds.length > 1 ? 's' : ''} avec succès`
				);
				resetAndClose();
				onSuccess?.();
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.error ?? 'Erreur lors de la création du placement');
				await update();
			} else if (result.type === 'error') {
				toast.error('Erreur serveur');
				console.error('Erreur:', result.error);
			}

			isSubmitting = false;
		};
	};
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && resetAndClose()}
	>{#if step === 'table'}
		<Dialog.Trigger>
			<Button variant="outline" size="sm">
				<Plus class="mr-1 h-4 w-4" />
				Ajouter un placement
			</Button>
		</Dialog.Trigger>

		<Dialog.Content size="xxl" class={step === 'table' ? 'max-w-5xl' : 'max-w-2xl'}>
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					Information de {cat.name}
				</Dialog.Title>
			</Dialog.Header>

			<!-- Chat -->
			<section class="grid grid-cols-1 gap-4 md:grid-cols-6">
				<!-- Profile -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.profile.icon}
					title={CAT_SECTION_CONFIG.profile.label}
					color={CAT_SECTION_CONFIG.profile.color}
					class="col-span-1"
				>
					<div class="space-y-3">
						<div class="ml-6 grid grid-cols-2 gap-2 text-sm">
							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
									<span>Nom</span>
								</div>
								<p class="font-medium">{cat.name}</p>
							</div>
							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
									<span>Sexe</span>
								</div>
								<p class="font-medium">{getLabel(sexLabel, cat.sex)}</p>
							</div>

							<div>
								<div class="text-muted-foreground mb-1 flex items-center gap-1.5">
									<span>Âge</span>
								</div>
								<p class="font-medium">{getAgeBadge(cat.birthDate)}</p>
							</div>
						</div>
					</div>
				</SectionCard>

				<!-- Compatibilité -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.compatibility.icon}
					title={CAT_SECTION_CONFIG.compatibility.label}
					color={CAT_SECTION_CONFIG.compatibility.color}
					class="col-span-1"
				>
					<div class="ml-6 grid grid-cols-2 gap-2 text-sm">
						<span class="text-muted-foreground">Chien</span>
						<div class="flex justify-start">
							<BooleanIcon value={cat.isOkDog ?? false} />
						</div>

						<span class="text-muted-foreground">Chat</span>
						<div class="flex justify-start">
							<BooleanIcon value={cat.isOkCat ?? false} />
						</div>

						<span class="text-muted-foreground">Enfant</span>
						<div class="flex justify-start">
							<BooleanIcon value={cat.isOkChild ?? false} />
						</div>

						<span class="text-muted-foreground">Jardin</span>
						<div class="flex justify-start">
							<BooleanIcon value={cat.isOutside ?? false} />
						</div>
					</div>
				</SectionCard>

				<!-- Santé -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.health.icon}
					title={CAT_SECTION_CONFIG.health.label}
					color={CAT_SECTION_CONFIG.health.color}
					class="col-span-2"
				>
					<section class="ml-6 grid grid-cols-2 gap-2">
						<div class="grid grid-cols-2 gap-2 text-sm">
							<span class="text-muted-foreground">Vaccin</span>
							<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
							<span class="text-muted-foreground">Test FIV</span>
							<div class="flex justify-start">
								<BooleanIcon value={cat.isFivTest ?? false} />
							</div>
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
							<div class="flex justify-start">
								<BooleanIcon value={cat.isIdentify ?? false} />
							</div>
							<span class="text-muted-foreground">Puce</span>
							<span>{cat.chipId ?? '—'}</span>
						</div>
					</section>
				</SectionCard>

				<!-- Maladies -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.sicknesses.icon}
					title={CAT_SECTION_CONFIG.sicknesses.label}
					color={CAT_SECTION_CONFIG.sicknesses.color}
					class="col-span-2"
				>
					<div class="ml-6 space-y-3">
						<div class="space-y-2">
							{#if activeSicknesses.length > 0}
								<div class="flex flex-col gap-2">
									<p class="text-muted-foreground mb-1 flex items-center gap-1.5">Maladie a vie</p>
									<div class="flex gap-2">
										{#each activeSicknesses as sickness (sickness.id ?? sickness.name)}
											<div>
												<span class="font-medium">{sickness.name}</span>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<p class="text-muted-foreground rounded border border-dashed p-3 text-sm">
									Aucune maladie active.
								</p>
							{/if}
						</div>
						<div class="space-y-2">
							{#if treatedSicknesses.length > 0}
								<div class="flex flex-col gap-2">
									<p class="text-muted-foreground mb-1 flex items-center gap-1.5">
										Maladie en traitement
									</p>
									<div class="flex gap-2">
										{#each treatedSicknesses as sickness (sickness.id ?? sickness.name)}
											<div>
												<span class="font-medium">{sickness.name}</span>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<p class="text-muted-foreground rounded border border-dashed p-3 text-sm">
									Aucune maladie en traitement.
								</p>
							{/if}
						</div>
					</div>
				</SectionCard>
			</section>

			<section class="space-y-2">
				<h3 class="text-sm font-semibold">Choisir une ou plusieurs familles d'accueil</h3>
				<HostDataTable {hosts} {selectedHostIds} onSelectionChange={handleSelectionChange} />
			</section>

			<Dialog.Footer>
				<Button disabled={selectedHostIds.length === 0} onclick={goToConfirm}>
					Proposer a ({selectedHostIds.length}) FA
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{:else}
		<Dialog.Content size="sm" class={step === 'table' ? 'max-w-5xl' : 'max-w-2xl'}>
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					Information de {cat.name}
				</Dialog.Title>
			</Dialog.Header>

			<form method="POST" action="?/createPlacement" use:enhance={handleEnhance} class="space-y-4">
				<input type="hidden" name="catId" value={catId} />
				{#each selectedHostIds as hostId (hostId)}
					<input type="hidden" name="hostIds" value={hostId} />
				{/each}
				<input type="hidden" name="type" value="PROPOSAL" />
				<input type="hidden" name="status" value="ACTIVE" />

				<div class="space-y-2">
					<p class="text-sm font-medium">Chat : {cat.name}</p>
					<p class="text-sm font-medium">
						{selectedHostIds.length} Famille{selectedHosts.length > 1 ? 's' : ''} d'accueil sélectionnée{selectedHosts.length >
						1
							? 's'
							: ''} :
					</p>
					<ul class="list-inside list-disc text-sm">
						{#each selectedHosts as host (host.id)}
							<li>{host.profil.firstName} {host.profil.lastName}</li>
						{/each}
					</ul>
				</div>

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={goBack} disabled={isSubmitting}>
						Retour
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Confirmer la création
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	{/if}
</Dialog.Root>
