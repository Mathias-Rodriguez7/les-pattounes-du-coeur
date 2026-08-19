<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { X, Save, Plus, Trash2, Pencil } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { CatFull } from '$lib/types/cat';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { statusLabel, sexLabel, hairLabel, vaccinateLabel } from '$lib/utils/catHelpers';

	const {
		cat,
		hosts,
		volunteers,
		isAdmin = false,
		onCancel
	}: {
		cat: CatFull | null;
		hosts: { id: string; firstName: string; lastName: string }[];
		volunteers: { id: string; role: string; firstName: string; lastName: string }[];
		isAdmin?: boolean;
		onCancel: () => void;
	} = $props();

	// Champs texte
	let nameValue = $state('');
	let colorValue = $state('');
	let originValue = $state('');
	let chipIdValue = $state('');
	let sicknessValue = $state('');
	let treatmentValue = $state('');
	let descriptionValue = $state('');
	let birthDateValue = $state('');

	// États pour les selects
	let sexValue = $state('');
	let statusValue = $state('');
	let hairLengthValue = $state('');
	let vaccinateValue = $state('');
	let volunteerValue = $state('');
	let isVisibleValue = $state('');

	// Booléens
	let isFivTestValue = $state('');
	let isDewormingValue = $state('');
	let isSterilizeValue = $state('');
	let isIdentifyValue = $state('');
	let isOkDogValue = $state('');
	let isOkCatValue = $state('');
	let isOkChildValue = $state('');
	let isOutsideValue = $state('');

	// Placements
	let showLongPlacementDialog = $state(false);
	let showShortPlacementDialog = $state(false);
	let placementHostId = $state('');
	let placementStartDate = $state('');
	let placementEndDate = $state('');
	let placementNotes = $state('');
	let editingPlacementId = $state<string | null>(null);

	// Initialiser les valeurs quand on passe en mode édition
	function initializeForm() {
		if (!cat) return;

		nameValue = cat.name ?? '';
		colorValue = cat.color ?? '';
		originValue = cat.origin ?? '';
		chipIdValue = cat.chipId ?? '';
		sicknessValue = cat.sickness ?? '';
		treatmentValue = cat.treatment ?? '';
		descriptionValue = cat.description ?? '';
		birthDateValue = cat.birthDate ? new Date(cat.birthDate).toISOString().split('T')[0] : '';

		sexValue = cat.sex ?? '';
		statusValue = cat.status ?? '';
		hairLengthValue = cat.hairLength ?? '';
		vaccinateValue = cat.vaccinate ?? '';
		volunteerValue = cat.referent?.id ?? '';
		isVisibleValue = cat.isVisible ? 'true' : 'false';

		isFivTestValue = cat.isFivTest ? 'true' : 'false';
		isDewormingValue = cat.isDeworming ? 'true' : 'false';
		isSterilizeValue = cat.isSterilize ? 'true' : 'false';
		isIdentifyValue = cat.isIdentify ? 'true' : 'false';
		isOkDogValue = cat.isOkDog ? 'true' : 'false';
		isOkCatValue = cat.isOkCat ? 'true' : 'false';
		isOkChildValue = cat.isOkChild ? 'true' : 'false';
		isOutsideValue = cat.isOutside ? 'true' : 'false';
	}

	function resetPlacementForm() {
		placementHostId = '';
		placementStartDate = '';
		placementEndDate = '';
		placementNotes = '';
		editingPlacementId = null;
	}

	function openLongPlacementDialog() {
		editingPlacementId = null;
		resetPlacementForm();
		showLongPlacementDialog = true;
	}

	function openShortPlacementDialog(placement?: any) {
		if (placement) {
			editingPlacementId = placement.id;
			placementHostId = placement.hostId;
			placementStartDate = new Date(placement.startedDate).toISOString().split('T')[0];
			placementEndDate = placement.endedDate
				? new Date(placement.endedDate).toISOString().split('T')[0]
				: '';
			placementNotes = placement.notes || '';
		} else {
			editingPlacementId = null;
			resetPlacementForm();
		}
		showShortPlacementDialog = true;
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getCurrentPlacement() {
		if (!cat?.placements) return null;
		return cat.placements.find((p) => p.status !== 'CLOSED' && p.type === 'LONG') || null;
	}

	$effect(() => {
		initializeForm();
	});
</script>

<!-- MODE ÉDITION -->
<form
	method="POST"
	action="?/updateCat"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false });
			await invalidateAll();
			onCancel();
		};
	}}
	class="flex flex-col gap-4"
>
	<input type="hidden" name="id" value={cat?.id} />

	<!-- HEADER EN MODE ÉDITION -->
	<Card.Header>
		<div class="grid grid-cols-[1fr_auto_1fr] gap-6">
			<div class="grid grid-cols-1 gap-2">
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					<div>
						<label for="name" class="text-muted-foreground text-base">Nom</label>
						<Input id="name" name="name" bind:value={nameValue} class="mt-1" />
					</div>
					<div>
						<label for="isVisible" class="text-muted-foreground text-xs">Visible</label>
						<Select.Root type="single" bind:value={isVisibleValue}>
							<Select.Trigger class="mt-1">
								{isVisibleValue === 'true'
									? 'Oui'
									: isVisibleValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isVisible" value={isVisibleValue} />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-6">
					<div>
						<label for="birthDate" class="text-muted-foreground text-xs">Date de naissance</label>
						<Input
							id="birthDate"
							name="birthDate"
							type="date"
							bind:value={birthDateValue}
							class="mt-1"
						/>
					</div>

					<div>
						<label for="status" class="text-muted-foreground text-xs">Statut</label>
						<Select.Root type="single" bind:value={statusValue}>
							<Select.Trigger class="mt-1">
								{statusLabel[statusValue] ?? 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(statusLabel) as [val, label] (val)}
									<Select.Item value={val}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="status" value={statusValue} />
					</div>
				</div>
			</div>
			<Separator orientation="vertical" class="h-6" />
			<!-- FA Section -->
			<div>
				<div class="space-y-3">
					<div>
						<!-- Placement actuel -->
						{#if getCurrentPlacement()}
							<div class="mb-3 space-y-2 rounded bg-blue-50 p-2">
								<div class="flex items-center justify-between">
									<div>
										<p class="text-xs font-medium">
											{getCurrentPlacement().host.firstName}
											{getCurrentPlacement().host.lastName}
										</p>
										<p class="text-muted-foreground text-xs">
											Depuis {formatDate(getCurrentPlacement().startedDate)}
										</p>
									</div>
									<Badge variant="outline" class="text-xs">Active</Badge>
								</div>
							</div>
						{:else}
							<p class="text-muted-foreground mb-3 text-xs italic">Aucune FA assignée</p>
						{/if}

						<!-- Boutons -->
						<div class="mb-3 grid grid-cols-2 gap-2">
							<Button type="button" size="sm" variant="outline" onclick={openLongPlacementDialog}>
								<Plus class="mr-2 h-4 w-4" />
								Long
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onclick={() => openShortPlacementDialog()}
							>
								<Plus class="mr-2 h-4 w-4" />
								Court
							</Button>
						</div>

						<!-- Liste -->
						{#if cat?.placements && cat.placements.length > 0}
							<div class="max-h-48 space-y-2 overflow-y-auto border-t pt-2">
								{#each cat.placements as placement (placement.id)}
									<div
										class="flex items-center justify-between rounded-sm border border-dashed p-2 text-xs"
									>
										<div>
											<p class="font-medium">
												{placement.host.firstName}
												{placement.host.lastName}
											</p>
											<p class="text-muted-foreground">
												{formatDate(placement.startedDate)}
												{#if placement.endedDate}
													→ {formatDate(placement.endedDate)}
												{/if}
											</p>
											<Badge variant="outline" class="mt-1 text-xs">
												{placement.type === 'LONG' ? 'Long' : 'Court'}
											</Badge>
										</div>
										<div class="flex gap-1">
											{#if placement.type === 'SHORT'}
												<Button
													type="button"
													size="sm"
													variant="ghost"
													class="h-6 w-6 p-0"
													onclick={() => openShortPlacementDialog(placement)}
												>
													<Pencil class="h-3 w-3" />
												</Button>
												<form
													method="POST"
													action="?/deleteShortPlacement"
													use:enhance={() => {
														return async ({ update }) => {
															await update();
															await invalidateAll();
														};
													}}
													class="contents"
												>
													<input type="hidden" name="placementId" value={placement.id} />
													<Button size="sm" variant="ghost" type="submit" class="h-6 w-6 p-0">
														<Trash2 class="h-3 w-3 text-red-500" />
													</Button>
												</form>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					{#if isAdmin}
						<div>
							<label for="volunteerId" class="text-muted-foreground text-xs">Bénévole</label>
							<Select.Root type="single" bind:value={volunteerValue}>
								<Select.Trigger class="mt-1">
									{volunteers.find((v) => v.id === volunteerValue)
										? `${volunteers.find((v) => v.id === volunteerValue)?.firstName} ${volunteers.find((v) => v.id === volunteerValue)?.lastName}`
										: 'Aucun'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">Aucun</Select.Item>
									{#each volunteers as v (v.id)}
										<Select.Item value={v.id}>{v.firstName} {v.lastName}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="volunteerId" value={volunteerValue} />
						</div>
					{/if}
				</div>
			</div>
		</div>
		<Separator class="mt-4" />
	</Card.Header>

	<Card.Content class="flex flex-col gap-4 text-sm">
		<div class="grid grid-cols-[1fr_auto_1fr] gap-6">
			<!-- Infos physiques -->
			<div>
				<p class="mb-2 text-base font-medium">Informations physiques</p>
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					<div>
						<label for="sex" class="text-muted-foreground text-xs">Sexe</label>
						<Select.Root type="single" bind:value={sexValue}>
							<Select.Trigger class="mt-1">
								{sexLabel[sexValue] ?? 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(sexLabel) as [val, label] (val)}
									<Select.Item value={val}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="sex" value={sexValue} />
					</div>
					<div>
						<label for="color" class="text-muted-foreground text-xs">Couleur</label>
						<Input id="color" name="color" bind:value={colorValue} class="mt-1" />
					</div>
					<div>
						<label for="hairLength" class="text-muted-foreground text-xs">Poil</label>
						<Select.Root type="single" bind:value={hairLengthValue}>
							<Select.Trigger class="mt-1">
								{hairLabel[hairLengthValue] ?? '—'}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(hairLabel) as [val, label] (val)}
									<Select.Item value={val}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="hairLength" value={hairLengthValue} />
					</div>

					<div>
						<label for="origin" class="text-muted-foreground text-xs">Origine</label>
						<Input id="origin" name="origin" bind:value={originValue} class="mt-1" />
					</div>
				</div>
			</div>
			<Separator orientation="vertical" class="h-6" />
			<!-- Compatibilités -->
			<div>
				<p class="mb-2 text-base font-medium">Compatibilités</p>
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					<div>
						<label for="isOkDog" class="text-muted-foreground text-xs">Chien</label>
						<Select.Root type="single" bind:value={isOkDogValue}>
							<Select.Trigger class="mt-1">
								{isOkDogValue === 'true'
									? 'Oui'
									: isOkDogValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isOkDog" value={isOkDogValue} />
					</div>

					<div>
						<label for="isOkCat" class="text-muted-foreground text-xs">Chat</label>
						<Select.Root type="single" bind:value={isOkCatValue}>
							<Select.Trigger class="mt-1">
								{isOkCatValue === 'true'
									? 'Oui'
									: isOkCatValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isOkCat" value={isOkCatValue} />
					</div>
					<div>
						<label for="isOkChild" class="text-muted-foreground text-xs">Enfant</label>
						<Select.Root type="single" bind:value={isOkChildValue}>
							<Select.Trigger class="mt-1">
								{isOkChildValue === 'true'
									? 'Oui'
									: isOkChildValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isOkChild" value={isOkChildValue} />
					</div>

					<div>
						<label for="isOutside" class="text-muted-foreground text-xs">Jardin</label>
						<Select.Root type="single" bind:value={isOutsideValue}>
							<Select.Trigger class="mt-1">
								{isOutsideValue === 'true'
									? 'Oui'
									: isOutsideValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isOutside" value={isOutsideValue} />
					</div>
				</div>
			</div>
		</div>

		<Separator />

		<!-- Santé -->
		<div>
			<p class="mb-2 text-base font-medium">Santé</p>
			<div class="grid grid-cols-1 gap-4">
				<div class="grid grid-cols-3 gap-x-6 gap-y-2">
					<div>
						<label for="vaccinate" class="text-muted-foreground text-xs">Vaccin</label>
						<Select.Root type="single" bind:value={vaccinateValue}>
							<Select.Trigger class="mt-1">
								{vaccinateLabel[vaccinateValue] ?? '—'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">—</Select.Item>
								{#each Object.entries(vaccinateLabel) as [val, label] (val)}
									<Select.Item value={val}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="vaccinate" value={vaccinateValue} />
					</div>

					<div>
						<label for="isFivTest" class="text-muted-foreground text-xs">Test FIV</label>
						<Select.Root type="single" bind:value={isFivTestValue}>
							<Select.Trigger class="mt-1">
								{isFivTestValue === 'true'
									? 'Oui'
									: isFivTestValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isFivTest" value={isFivTestValue} />
					</div>
					<div>
						<label for="isDeworming" class="text-muted-foreground text-xs">Vermifuge</label>
						<Select.Root type="single" bind:value={isDewormingValue}>
							<Select.Trigger class="mt-1">
								{isDewormingValue === 'true'
									? 'Oui'
									: isDewormingValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isDeworming" value={isDewormingValue} />
					</div>

					<div>
						<label for="isSterilize" class="text-muted-foreground text-xs">Stérilisé·e</label>
						<Select.Root type="single" bind:value={isSterilizeValue}>
							<Select.Trigger class="mt-1">
								{isSterilizeValue === 'true'
									? 'Oui'
									: isSterilizeValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isSterilize" value={isSterilizeValue} />
					</div>
					<div>
						<label for="isIdentify" class="text-muted-foreground text-xs">Identifié·e</label>
						<Select.Root type="single" bind:value={isIdentifyValue}>
							<Select.Trigger class="mt-1">
								{isIdentifyValue === 'true'
									? 'Oui'
									: isIdentifyValue === 'false'
										? 'Non'
										: 'Sélectionner...'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">Oui</Select.Item>
								<Select.Item value="false">Non</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="isIdentify" value={isIdentifyValue} />
					</div>

					<div>
						<label for="chipId" class="text-muted-foreground text-xs">Puce</label>
						<Input id="chipId" name="chipId" bind:value={chipIdValue} class="mt-1" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					<div>
						<label for="sickness" class="mb-2 text-base font-medium">Maladie</label>
						<Textarea id="sickness" name="sickness" bind:value={sicknessValue} class="mt-1" />
					</div>

					<div>
						<label for="treatment" class="mb-2 text-base font-medium">Traitement</label>
						<Textarea id="treatment" name="treatment" bind:value={treatmentValue} class="mt-1" />
					</div>
				</div>
			</div>
		</div>

		<Separator />

		<!-- Description -->
		<div>
			<label for="description" class="mb-2 text-base font-medium">Description</label>
			<Textarea
				id="description"
				name="description"
				bind:value={descriptionValue}
				rows={4}
				class="mt-1"
			/>
		</div>

		<!-- Boutons -->
		<div class="flex gap-2 pt-4">
			<Button type="submit" class="flex-1 gap-2">
				<Save class="h-4 w-4" />
				Sauvegarder
			</Button>
			<Button type="button" variant="outline" class="flex-1 gap-2" onclick={onCancel}>
				<X class="h-4 w-4" />
				Annuler
			</Button>
		</div>
	</Card.Content>
</form>

<!-- DIALOG LONG PLACEMENT -->
<Dialog.Root bind:open={showLongPlacementDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Ajouter une FA Long terme</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="?/addOrReplaceLongPlacement"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					await invalidateAll();
					showLongPlacementDialog = false;
					resetPlacementForm();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="catId" value={cat?.id} />

			<div>
				<label for="placement-host" class="text-sm font-medium">Famille d'accueil</label>
				<Select.Root type="single" bind:value={placementHostId}>
					<Select.Trigger class="mt-1" id="placement-host">
						{hosts.find((h) => h.id === placementHostId)
							? `${hosts.find((h) => h.id === placementHostId)?.firstName} ${hosts.find((h) => h.id === placementHostId)?.lastName}`
							: 'Sélectionner...'}
					</Select.Trigger>
					<Select.Content>
						{#each hosts as h (h.id)}
							<Select.Item value={h.id}>{h.firstName} {h.lastName}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input type="hidden" name="hostId" value={placementHostId} />
			</div>

			<div>
				<label for="placement-start" class="text-sm font-medium">Date de début</label>
				<Input
					id="placement-start"
					name="startedDate"
					type="date"
					bind:value={placementStartDate}
					class="mt-1"
					required
				/>
			</div>

			<div>
				<label for="placement-end" class="text-sm font-medium">Date de fin (optionnel)</label>
				<Input
					id="placement-end"
					name="endedDate"
					type="date"
					bind:value={placementEndDate}
					class="mt-1"
				/>
			</div>

			<div>
				<label for="placement-notes" class="text-sm font-medium">Notes</label>
				<Textarea
					id="placement-notes"
					name="notes"
					bind:value={placementNotes}
					class="mt-1"
					rows={3}
				/>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit" class="flex-1">
					<Plus class="mr-2 h-4 w-4" />
					Ajouter
				</Button>
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					onclick={() => {
						showLongPlacementDialog = false;
						resetPlacementForm();
					}}
				>
					Annuler
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- DIALOG SHORT PLACEMENT -->
<Dialog.Root bind:open={showShortPlacementDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{editingPlacementId ? 'Modifier' : 'Ajouter'} une FA Court terme
			</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action={editingPlacementId ? '?/updateShortPlacement' : '?/addShortPlacement'}
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					await invalidateAll();
					showShortPlacementDialog = false;
					resetPlacementForm();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="catId" value={cat?.id} />
			{#if editingPlacementId}
				<input type="hidden" name="placementId" value={editingPlacementId} />
			{/if}

			<div>
				<label for="short-host" class="text-sm font-medium">Famille d'accueil</label>
				<Select.Root type="single" bind:value={placementHostId}>
					<Select.Trigger class="mt-1" id="short-host">
						{hosts.find((h) => h.id === placementHostId)
							? `${hosts.find((h) => h.id === placementHostId)?.firstName} ${hosts.find((h) => h.id === placementHostId)?.lastName}`
							: 'Sélectionner...'}
					</Select.Trigger>
					<Select.Content>
						{#each hosts as h (h.id)}
							<Select.Item value={h.id}>{h.firstName} {h.lastName}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input type="hidden" name="hostId" value={placementHostId} />
			</div>

			<div>
				<label for="short-start" class="text-sm font-medium">Date de début</label>
				<Input
					id="short-start"
					name="startedDate"
					type="date"
					bind:value={placementStartDate}
					class="mt-1"
					required
				/>
			</div>

			<div>
				<label for="short-end" class="text-sm font-medium">Date de fin</label>
				<Input
					id="short-end"
					name="endedDate"
					type="date"
					bind:value={placementEndDate}
					class="mt-1"
					required
				/>
			</div>

			<div>
				<label for="short-notes" class="text-sm font-medium">Notes</label>
				<Textarea id="short-notes" name="notes" bind:value={placementNotes} class="mt-1" rows={3} />
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit" class="flex-1">
					<Save class="mr-2 h-4 w-4" />
					Enregistrer
				</Button>
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					onclick={() => {
						showShortPlacementDialog = false;
						resetPlacementForm();
					}}
				>
					Annuler
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
