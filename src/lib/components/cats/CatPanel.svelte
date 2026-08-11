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
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		statusLabel,
		sexLabel,
		hairLabel,
		vaccinateLabel,
		getLabel,
		focalPointClass
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
	let sexValue = $state('');
	let statusValue = $state('');
	let hairLengthValue = $state('');
	let vaccinateValue = $state('');
	let hostValue = $state('');
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
		hostValue = cat.currentHost?.id ?? '';
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

	function cancelEditing() {
		editing = false;
	}
</script>

<div class="relative">
	{#if cat}
		<!-- Image en haut pleine largeur -->
		<div class="h-60 w-full overflow-hidden rounded-2xl">
			<img
				src={cat.media?.[0]?.picture ?? '/img/logo.png'}
				alt={cat.name}
				class="h-full w-full object-cover {focalPointClass[cat.focalPoint ?? 'MID']}"
			/>
		</div>

		<!-- Card qui chevauche avec le Header -->
		<Card.Root class="relative col-span-1 -mt-8 overflow-auto">
			{#if editing}
				<!-- MODE ÉDITION -->
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

					<!-- HEADER EN MODE ÉDITION -->
					<Card.Header>
						<div class="grid grid-cols-2 gap-6">
							<div class="space-y-3">
								<div>
									<label for="name" class="text-muted-foreground text-xs">Nom</label>
									<Input id="name" name="name" bind:value={nameValue} class="mt-1" />
								</div>
								<div>
									<label for="birthDate" class="text-muted-foreground text-xs"
										>Date de naissance</label
									>
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

							<!-- FA & référent -->
							<div>
								<div class="space-y-3">
									<div>
										<label for="hostId" class="text-muted-foreground text-xs">FA</label>
										<Select.Root type="single" bind:value={hostValue}>
											<Select.Trigger class="mt-1">
												{hosts.find((h) => h.id === hostValue)
													? `${hosts.find((h) => h.id === hostValue)?.firstName} ${hosts.find((h) => h.id === hostValue)?.lastName}`
													: 'Aucune'}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="">Aucune</Select.Item>
												{#each hosts as h (h.id)}
													<Select.Item value={h.id}>{h.firstName} {h.lastName}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
										<input type="hidden" name="hostId" value={hostValue} />
									</div>

									{#if isAdmin}
										<div>
											<label for="volunteerId" class="text-muted-foreground text-xs">Référent</label
											>
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
							</div>
						</div>
						<Separator class="mt-4" />
					</Card.Header>

					<Card.Content class="flex flex-col gap-4 text-sm">
						<div class="grid grid-cols-2 gap-6">
							<!-- Infos physiques -->
							<div>
								<p class="mb-3 font-medium">Informations physiques</p>
								<div class="space-y-3">
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

							<!-- Compatibilités -->
							<div>
								<p class="mb-3 font-medium">Compatibilités</p>
								<div class="space-y-3">
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
						<div class="grid grid-cols-1 gap-4">
							<p class="mb-3 font-medium">Santé</p>
							<div class="grid grid-cols-2 gap-6">
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
							<div class="grid grid-cols-1 gap-2">
								<div>
									<label for="sickness" class="text-muted-foreground text-xs">Maladie</label>
									<Textarea id="sickness" name="sickness" bind:value={sicknessValue} class="mt-1" />
								</div>

								<div>
									<label for="treatment" class="text-muted-foreground text-xs">Traitement</label>
									<Textarea
										id="treatment"
										name="treatment"
										bind:value={treatmentValue}
										class="mt-1"
									/>
								</div>
							</div>
						</div>

						<Separator />

						<!-- Description -->
						<div>
							<label for="description" class="text-xs font-medium">Description</label>
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
							<Button type="button" variant="outline" class="flex-1 gap-2" onclick={cancelEditing}>
								<X class="h-4 w-4" />
								Annuler
							</Button>
						</div>
					</Card.Content>
				</form>
			{:else}
				<!-- MODE LECTURE -->
				<Card.Header class="flex flex-row items-start justify-between bg-white">
					<div>
						<Card.Title>{cat.name}</Card.Title>
						<Card.Description>
							{cat.ageBadge} · {getLabel(sexLabel, cat.sex)}
						</Card.Description>
					</div>
					<!-- FA & référent -->
					<div>
						<div class="grid grid-cols-2 gap-1 text-sm">
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
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 text-sm">
					<!-- Statut & visibilité -->
					<div class="flex gap-4">
						<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
						{#if cat.isVisible}
							<Badge class="bg-green-100 text-green-700">Visible</Badge>
						{:else}
							<Badge class="bg-red-100 text-red-700">Masqué</Badge>
						{/if}
					</div>
					<Separator />

					<div class="grid grid-cols-2 gap-6">
						<!-- Infos physiques -->
						<div>
							<p class="mb-2 text-base font-medium">Infos physiques</p>
							<div class="grid grid-cols-2 gap-2 text-sm">
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

						<!-- Compatibilités -->
						<div>
							<p class="mb-2 text-base font-medium">Compatibilités</p>
							<div class="grid grid-cols-2 gap-2 text-sm">
								<span class="text-muted-foreground">Chien</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkDog} />
								</div>
								<span class="text-muted-foreground">Chat</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkCat} />
								</div>
								<span class="text-muted-foreground">Enfant</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkChild} />
								</div>
								<span class="text-muted-foreground">Jardin</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOutside} />
								</div>
							</div>
						</div>
					</div>

					<Separator />

					<!-- Santé -->
					<div class="grid grid-cols-1 gap-4">
						<div>
							<p class="mb-2 text-base font-medium">Santé</p>
							<section class="grid grid-cols-2 gap-6">
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Vaccin</span>
									<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
									<span class="text-muted-foreground">Test FIV</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isFivTest} />
									</div>
									<span class="text-muted-foreground">Vermifuge</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isDeworming} />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Stérilisé·e</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isSterilize || cat.isAlreadySterilized} />
									</div>
									<span class="text-muted-foreground">Identifié·e</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isIdentify} />
									</div>
									<span class="text-muted-foreground">Puce</span>
									<span>{cat.chipId ?? '—'}</span>
								</div>
							</section>
						</div>
						<div class="grid grid-cols-1 gap-2">
							<span class="text-muted-foreground">Maladie</span>
							<span class="ml-4">{cat.sickness ?? '—'}</span>
							<span class="text-muted-foreground">Traitement</span>
							<span class="ml-4">{cat.treatment ?? '—'}</span>
						</div>
					</div>
					<Separator />

					<!-- Description -->
					{#if cat.description}
						<div>
							<p class="mb-1 font-medium">Description</p>
							<p class="text-muted-foreground text-sm">{cat.description}</p>
						</div>
					{/if}
				</Card.Content>
			{/if}
		</Card.Root>
	{:else}
		<Card.Content class="text-muted-foreground flex h-full items-center justify-center p-8 text-sm">
			Sélectionnez un chat pour voir ses détails
		</Card.Content>
	{/if}
</div>
