<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Pencil, X, Save } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { CatFull } from '$lib/types/cat';
	import {
		statusLabel,
		sexLabel,
		hairLabel,
		vaccinateLabel,
		getLabel
	} from '$lib/utils/catHelpers';

	const {
		cat,
		hosts,
		volunteers,
		isAdmin = false
	}: {
		cat: CatFull | null;
		hosts: { id: string; firstName: string; lastName: string }[];
		volunteers: { id: string; role: string; firstName: string; lastName: string }[];
		isAdmin?: boolean;
	} = $props();

	let editing = $state(false);

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
	let sexValue = $state<{ value: string; label: string } | undefined>();
	let statusValue = $state<{ value: string; label: string } | undefined>();
	let hairLengthValue = $state<{ value: string; label: string } | undefined>();
	let vaccinateValue = $state<{ value: string; label: string } | undefined>();
	let hostValue = $state<{ value: string; label: string } | undefined>();
	let volunteerValue = $state<{ value: string; label: string } | undefined>();
	let isVisibleValue = $state<{ value: string; label: string } | undefined>();

	// Booléens
	let isFivTestValue = $state<{ value: string; label: string } | undefined>();
	let isDewormingValue = $state<{ value: string; label: string } | undefined>();
	let isSterilizeValue = $state<{ value: string; label: string } | undefined>();
	let isIdentifyValue = $state<{ value: string; label: string } | undefined>();
	let isOkDogValue = $state<{ value: string; label: string } | undefined>();
	let isOkCatValue = $state<{ value: string; label: string } | undefined>();
	let isOkChildValue = $state<{ value: string; label: string } | undefined>();
	let isOutsideValue = $state<{ value: string; label: string } | undefined>();

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

		sexValue = cat.sex ? { value: cat.sex, label: sexLabel[cat.sex] || cat.sex } : undefined;
		statusValue = cat.status
			? { value: cat.status, label: statusLabel[cat.status] || cat.status }
			: undefined;
		hairLengthValue = cat.hairLength
			? { value: cat.hairLength, label: hairLabel[cat.hairLength] || '—' }
			: undefined;
		vaccinateValue = cat.vaccinate
			? { value: cat.vaccinate, label: vaccinateLabel[cat.vaccinate] || '—' }
			: undefined;

		hostValue = cat.currentHost
			? {
					value: cat.currentHost.id,
					label: `${cat.currentHost.firstName} ${cat.currentHost.lastName}`
				}
			: undefined;

		volunteerValue = cat.referent
			? { value: cat.referent.id, label: `${cat.referent.firstName} ${cat.referent.lastName}` }
			: undefined;

		isVisibleValue = {
			value: cat.isVisible ? 'true' : 'false',
			label: cat.isVisible ? 'Oui' : 'Non'
		};
		isFivTestValue = {
			value: cat.isFivTest ? 'true' : 'false',
			label: cat.isFivTest ? 'Oui' : 'Non'
		};
		isDewormingValue = {
			value: cat.isDeworming ? 'true' : 'false',
			label: cat.isDeworming ? 'Oui' : 'Non'
		};
		isSterilizeValue = {
			value: cat.isSterilize ? 'true' : 'false',
			label: cat.isSterilize ? 'Oui' : 'Non'
		};
		isIdentifyValue = {
			value: cat.isIdentify ? 'true' : 'false',
			label: cat.isIdentify ? 'Oui' : 'Non'
		};
		isOkDogValue = {
			value: cat.isOkDog ? 'true' : 'false',
			label: cat.isOkDog ? 'Oui' : 'Non'
		};
		isOkCatValue = {
			value: cat.isOkCat ? 'true' : 'false',
			label: cat.isOkCat ? 'Oui' : 'Non'
		};
		isOkChildValue = {
			value: cat.isOkChild ? 'true' : 'false',
			label: cat.isOkChild ? 'Oui' : 'Non'
		};
		isOutsideValue = {
			value: cat.isOutside ? 'true' : 'false',
			label: cat.isOutside ? 'Oui' : 'Non'
		};
	}

	function cancelEditing() {
		editing = false;
	}
</script>

<Card.Root class="col-span-1 overflow-auto">
	{#if cat}
		<div class="h-48 w-full overflow-hidden">
			<img
				src={cat.media?.[0]?.picture ?? '/img/logo.png'}
				alt={cat.name}
				class="h-full w-full object-cover"
			/>
		</div>

		<Card.Header class="flex flex-row items-start justify-between">
			<div>
				<Card.Title>{cat.name}</Card.Title>
				<Card.Description>
					{cat.ageBadge} · {getLabel(sexLabel, cat.sex)}
				</Card.Description>
			</div>
			{#if !editing}
				<Button
					variant="ghost"
					size="icon"
					onclick={() => {
						editing = true;
						initializeForm();
					}}
				>
					<Pencil class="h-4 w-4" />
				</Button>
			{/if}
		</Card.Header>

		<Card.Content class="flex flex-col gap-3 text-sm">
			{#if editing}
				<!-- ───── MODE ÉDITION ───── -->
				<form
					method="POST"
					action="?/updateCat"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
							await invalidateAll();
							editing = false;
						};
					}}
					class="flex flex-col gap-4"
				>
					<input type="hidden" name="id" value={cat.id} />

					<!-- Infos générales -->
					<div>
						<p class="mb-3 font-medium">Informations générales</p>
						<div class="grid grid-cols-2 items-center gap-2">
							<label for="name" class="text-muted-foreground">Nom</label>
							<Input id="name" name="name" bind:value={nameValue} />

							<label for="sex" class="text-muted-foreground">Sexe</label>
							<Select.Root bind:selected={sexValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									{#each Object.entries(sexLabel) as [val, label] (val)}
										<Select.Item value={val} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="sex" value={sexValue?.value || ''} />

							<label for="birthDate" class="text-muted-foreground">Date de naissance</label>
							<Input id="birthDate" name="birthDate" type="date" bind:value={birthDateValue} />

							<label for="status" class="text-muted-foreground">Statut</label>
							<Select.Root bind:selected={statusValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									{#each Object.entries(statusLabel) as [val, label] (val)}
										<Select.Item value={val} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="status" value={statusValue?.value || ''} />

							<label for="isVisible" class="text-muted-foreground">Visible</label>
							<Select.Root bind:selected={isVisibleValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isVisible" value={isVisibleValue?.value || 'false'} />

							<label for="color" class="text-muted-foreground">Couleur</label>
							<Input id="color" name="color" bind:value={colorValue} />

							<label for="hairLength" class="text-muted-foreground">Poil</label>
							<Select.Root bind:selected={hairLengthValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="" label="—" />
									{#each Object.entries(hairLabel) as [val, label] (val)}
										<Select.Item value={val} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="hairLength" value={hairLengthValue?.value || ''} />

							<label for="origin" class="text-muted-foreground">Origine</label>
							<Input id="origin" name="origin" bind:value={originValue} />
						</div>
					</div>

					<!-- Santé -->
					<div>
						<p class="mb-3 font-medium">Santé</p>
						<div class="grid grid-cols-2 items-center gap-2">
							<label for="vaccinate" class="text-muted-foreground">Vaccin</label>
							<Select.Root bind:selected={vaccinateValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="" label="—" />
									{#each Object.entries(vaccinateLabel) as [val, label] (val)}
										<Select.Item value={val} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="vaccinate" value={vaccinateValue?.value || ''} />

							<label for="isFivTest" class="text-muted-foreground">FIV</label>
							<Select.Root bind:selected={isFivTestValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isFivTest" value={isFivTestValue?.value || 'false'} />

							<label for="isDeworming" class="text-muted-foreground">Vermifuge</label>
							<Select.Root bind:selected={isDewormingValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isDeworming" value={isDewormingValue?.value || 'false'} />

							<label for="isSterilize" class="text-muted-foreground">Stérilisé</label>
							<Select.Root bind:selected={isSterilizeValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isSterilize" value={isSterilizeValue?.value || 'false'} />

							<label for="isIdentify" class="text-muted-foreground">Identifié</label>
							<Select.Root bind:selected={isIdentifyValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isIdentify" value={isIdentifyValue?.value || 'false'} />

							<label for="chipId" class="text-muted-foreground">Puce</label>
							<Input id="chipId" name="chipId" bind:value={chipIdValue} />

							<label for="sickness" class="text-muted-foreground">Maladie</label>
							<Input id="sickness" name="sickness" bind:value={sicknessValue} />

							<label for="treatment" class="text-muted-foreground">Traitement</label>
							<Input id="treatment" name="treatment" bind:value={treatmentValue} />
						</div>
					</div>

					<!-- Compatibilités -->
					<div>
						<p class="mb-3 font-medium">Compatibilités</p>
						<div class="grid grid-cols-2 items-center gap-2">
							<label for="isOkDog" class="text-muted-foreground">Chien</label>
							<Select.Root bind:selected={isOkDogValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isOkDog" value={isOkDogValue?.value || 'false'} />

							<label for="isOkCat" class="text-muted-foreground">Chat</label>
							<Select.Root bind:selected={isOkCatValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isOkCat" value={isOkCatValue?.value || 'false'} />

							<label for="isOkChild" class="text-muted-foreground">Enfant</label>
							<Select.Root bind:selected={isOkChildValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isOkChild" value={isOkChildValue?.value || 'false'} />

							<label for="isOutside" class="text-muted-foreground">Jardin</label>
							<Select.Root bind:selected={isOutsideValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="true" label="Oui" />
									<Select.Item value="false" label="Non" />
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="isOutside" value={isOutsideValue?.value || 'false'} />
						</div>
					</div>

					<!-- Gestion -->
					<div>
						<p class="mb-3 font-medium">Gestion</p>
						<div class="grid grid-cols-2 items-center gap-2">
							<label for="hostId" class="text-muted-foreground">FA</label>
							<Select.Root bind:selected={hostValue}>
								<Select.Trigger>
									<Select.Value placeholder="Sélectionner..." />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="" label="Aucune" />
									{#each hosts as h (h.id)}
										<Select.Item value={h.id} label={`${h.firstName} ${h.lastName}`} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="hostId" value={hostValue?.value || ''} />

							{#if isAdmin}
								<label for="volunteerId" class="text-muted-foreground">Référent</label>
								<Select.Root bind:selected={volunteerValue}>
									<Select.Trigger>
										<Select.Value placeholder="Sélectionner..." />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="" label="Aucun" />
										{#each volunteers as v (v.id)}
											<Select.Item value={v.id} label={`${v.firstName} ${v.lastName}`} />
										{/each}
									</Select.Content>
								</Select.Root>
								<input type="hidden" name="volunteerId" value={volunteerValue?.value || ''} />
							{/if}
						</div>
					</div>

					<!-- Description -->
					<div>
						<p class="mb-2 font-medium">Description</p>
						<Textarea id="description" name="description" bind:value={descriptionValue} rows={4} />
					</div>

					<!-- Boutons -->
					<div class="flex gap-2 pt-4">
						<Button type="submit" class="flex-1 gap-2">
							<Save class="h-4 w-4" />
							Sauvegarder
						</Button>
						<Button type="button" variant="outline" class="flex-1 gap-2" onclick={cancelEditing}>
							<X class="h-4 w-4" />
							Annuler
						</Button>
					</div>
				</form>
			{:else}
				<!-- ───── MODE LECTURE ───── -->

				<!-- Statut & visibilité -->
				<div class="flex gap-2">
					<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
					{#if cat.isVisible}
						<Badge class="bg-green-100 text-green-700">Visible</Badge>
					{:else}
						<Badge class="bg-red-100 text-red-700">Masqué</Badge>
					{/if}
				</div>

				<!-- Infos physiques -->
				<div>
					<p class="mb-2 text-xs font-medium">Infos physiques</p>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<span class="text-muted-foreground">Âge</span>
						<span>{cat.formattedAge}</span>
						<span class="text-muted-foreground">Couleur</span>
						<span>{cat.color ?? '—'}</span>
						<span class="text-muted-foreground">Poil</span>
						<span>{getLabel(hairLabel, cat.hairLength)}</span>
						<span class="text-muted-foreground">Origine</span>
						<span>{cat.origin ?? '—'}</span>
					</div>
				</div>

				<!-- Santé -->
				<div>
					<p class="mb-2 text-xs font-medium">Santé</p>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<span class="text-muted-foreground">Vaccin</span>
						<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
						<span class="text-muted-foreground">FIV</span>
						<span>{cat.isFivTest ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Vermifuge</span>
						<span>{cat.isDeworming ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Stérilisé</span>
						<span>{cat.isSterilize || cat.isAlreadySterilized ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Identifié</span>
						<span>{cat.isIdentify ? '✓' : '✗'}</span>
					</div>
				</div>

				{#if cat.sickness}
					<p class="text-xs"><span class="text-muted-foreground">Maladie : </span>{cat.sickness}</p>
				{/if}
				{#if cat.treatment}
					<p class="text-xs">
						<span class="text-muted-foreground">Traitement : </span>{cat.treatment}
					</p>
				{/if}
				{#if cat.chipId}
					<p class="text-xs"><span class="text-muted-foreground">Puce : </span>{cat.chipId}</p>
				{/if}

				<!-- Compatibilités -->
				<div>
					<p class="mb-2 text-xs font-medium">Compatibilités</p>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<span class="text-muted-foreground">Chien</span>
						<span>{cat.isOkDog ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Chat</span>
						<span>{cat.isOkCat ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Enfant</span>
						<span>{cat.isOkChild ? '✓' : '✗'}</span>
						<span class="text-muted-foreground">Jardin</span>
						<span>{cat.isOutside ? '✓' : '✗'}</span>
					</div>
				</div>

				<!-- FA & référent -->
				<div>
					<p class="mb-2 text-xs font-medium">Gestion</p>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<span class="text-muted-foreground">FA</span>
						<span>
							{#if cat.currentHost}
								{cat.currentHost.firstName} {cat.currentHost.lastName}
							{:else}
								<span class="text-red-500">Aucune</span>
							{/if}
						</span>
						<span class="text-muted-foreground">Référent</span>
						<span>
							{#if cat.referent}
								{cat.referent.firstName} {cat.referent.lastName}
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</span>
					</div>
				</div>

				{#if cat.description}
					<div>
						<p class="mb-1 text-xs font-medium">Description</p>
						<p class="text-muted-foreground text-xs">{cat.description}</p>
					</div>
				{/if}
			{/if}
		</Card.Content>
	{:else}
		<Card.Content class="text-muted-foreground flex h-full items-center justify-center p-8 text-sm">
			Sélectionnez un chat pour voir ses détails
		</Card.Content>
	{/if}
</Card.Root>
