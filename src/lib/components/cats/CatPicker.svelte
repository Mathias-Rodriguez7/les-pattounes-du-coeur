<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getAgeBadge } from '$lib/utils/age';
	import { getLabel, getSexIcon, hairLabel } from '$lib/utils/catHelpers';
	import type { CatPickerItem } from '$lib/types/cat';
	import type { AdoptionFormJson } from '$lib/types/form';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ADOPTION_SECTION_CONFIG, ageLabels, furLabels } from '$lib/constants/forms';
	import { X } from '@lucide/svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import { HOST_SECTION_CONFIG } from '$lib/constants/host';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';

	interface Props {
		/** Les chats qu'on peut proposer (déjà filtrés par le serveur) */
		cats?: CatPickerItem[];
		/** La demande d'adoption libre : ses préférences sont affichées en rappel */
		form: { data: unknown };
		onSelect: (catId: string) => void;
		onCancel?: () => void;
	}

	let { cats = [], form, onSelect, onCancel }: Props = $props();

	// Form.data est du JSON : on dit à TypeScript ce qu'il contient vraiment
	const adoptionData = $derived(form.data as AdoptionFormJson);

	let selectedId = $state<string | null>(null);
	let search = $state('');

	const filteredCats = $derived(
		cats.filter((c) => {
			const q = search.trim().toLowerCase();
			if (!q) return true;
			return (
				c.name?.toLowerCase().includes(q) ||
				(c.color?.toLowerCase().includes(q) ?? false) ||
				c.catNumber?.toLowerCase().includes(q)
			);
		})
	);

	const selected = $derived(cats.find((c) => c.id === selectedId) ?? null);

	function select(id: string) {
		selectedId = id;
	}

	const handleCancelClick = () => {
		if (onCancel) {
			onCancel();
		}
	};

	const catSex = $derived(adoptionData.catSex);
	const preferredSexIcon = $derived(catSex ? getSexIcon(catSex) : null);
</script>

<div class="flex items-center justify-between">
	<h2 class="text-lg font-semibold">
		Éditer: la demande de {adoptionData.firstName || 'Sans nom'}
		{adoptionData.lastName || '—'}
	</h2>

	<Button variant="ghost" size="icon" onclick={handleCancelClick}>
		<X class="h-5 w-5" />
	</Button>
</div>

<div class="grid grid-cols-2 gap-3 p-3 text-sm md:grid-cols-3">
	<SectionCard
		icon={HOST_SECTION_CONFIG.cat.icon}
		title={HOST_SECTION_CONFIG.cat.label}
		color={HOST_SECTION_CONFIG.cat.color}
	>
		<div class="grid gap-4 text-xs">
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground">Âge</p>
				<Badge variant="outline" class="text-xs">
					{adoptionData.catAge ? ageLabels[adoptionData.catAge] : '—'}
				</Badge>
			</div>
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground">Couleur / poil</p>
				<p>
					{adoptionData.color} /
					<Badge variant="outline" class="text-xs">
						{adoptionData.furLength ? furLabels[adoptionData.furLength] : '—'}
					</Badge>
				</p>
			</div>
			{#if preferredSexIcon}
				<div class="flex items-center justify-between" title={preferredSexIcon.label}>
					<p class="text-muted-foreground">Sexe souhaité</p>
					<Icon name={preferredSexIcon.icon} class="h-6 w-6 {preferredSexIcon.color}" />
				</div>
			{/if}
		</div>
	</SectionCard>

	<SectionCard
		icon={HOST_SECTION_CONFIG.home.icon}
		title={HOST_SECTION_CONFIG.home.label}
		color={HOST_SECTION_CONFIG.home.color}
	>
		<div class="grid gap-4 text-xs">
			<div class="flex items-center justify-between">
				<span class="items-centern flex gap-1 text-sm">Espace</span>
				<Badge class="bg-blue-100 text-xs text-blue-800">
					{adoptionData.housingSize || '—'} m²
				</Badge>
			</div>

			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="items-centern flex gap-1 text-sm">Exterieur</span>
					<BooleanIcon value={adoptionData.hasGarden} />
				</div>
				<div class="flex items-center justify-between">
					<span class="items-centern flex gap-1 text-sm">Espace exterieur</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">
						{adoptionData.gardenSize || '—'} m²
					</Badge>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<span class="items-centern flex gap-1 text-sm">Nombre d'enfants</span>
				<Badge class="bg-blue-100 text-xs text-blue-800">
					{adoptionData.numberOfChildren}
				</Badge>
			</div>
		</div>
	</SectionCard>

	<SectionCard
		icon={HOST_SECTION_CONFIG.animals.icon}
		title={HOST_SECTION_CONFIG.animals.label}
		color={HOST_SECTION_CONFIG.animals.color}
	>
		<div class="ml-6 space-y-3">
			<div class="flex items-center justify-between border-b border-orange-100 pb-2">
				<span class="font-medium text-muted-foreground">Animaux dans le foyer</span>
				<BooleanIcon value={adoptionData.hasPets} />
			</div>

			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="items-centern flex gap-1 text-sm">🐱 Chats</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">
						{adoptionData.numberOfCats}
					</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span class="items-centern flex gap-1 text-sm">🐕 Chiens</span>
					<Badge class="bg-blue-100 text-xs text-blue-800">
						{adoptionData.numberOfDogs}
					</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span class="items-centern flex gap-1 text-sm">🐾 Autres</span>
					<p class="rounded-md bg-muted p-2 text-xs">{adoptionData.otherPets || '—'}</p>
				</div>
			</div>
		</div>
	</SectionCard>
</div>
<SectionCard
	icon={ADOPTION_SECTION_CONFIG.temperament.icon}
	title={ADOPTION_SECTION_CONFIG.temperament.label}
	color={ADOPTION_SECTION_CONFIG.temperament.color}
>
	<p class="text-xs text-muted-foreground">Caractère recherché</p>
	<p class="font-medium">{adoptionData.temperament || '—'}</p>
</SectionCard>
<Separator />
<div class="flex flex-1 flex-col space-y-4">
	{#if cats.length === 0}
		<div class="py-6 text-center">
			<p class="font-medium">Vous n'avez aucun chat à l'adoption en ce moment.</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Contactez la répartitrice pour qu'elle confie cette demande à une autre bénévole.
			</p>
		</div>
	{:else}
		<div class="flex items-center justify-between gap-2">
			<div class="relative">
				<Icon
					name="search"
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input type="text" placeholder="Chercher un chat..." bind:value={search} class="pl-9" />
			</div>
			<p class="text-xs text-muted-foreground">{filteredCats.length} chat(s)</p>
		</div>

		{#if filteredCats.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">
				Aucun chat ne correspond à « {search} ».
			</p>
		{:else}
			<div class="mt-2 max-h-[calc(120vh-24rem)] overflow-auto rounded-md">
				<Table.Root containerClass="overflow-visible">
					<Table.Header class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
						<Table.Row>
							<Table.Head class="w-10"></Table.Head>
							<Table.Head>Nom</Table.Head>
							<Table.Head>Âge</Table.Head>
							<Table.Head>Sexe</Table.Head>
							<Table.Head>Couleur / Poil</Table.Head>
							<Table.Head>Description</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredCats as cat (cat.id)}
							{@const sexIcon = getSexIcon(cat.sex)}
							{@const isSelected = selectedId === cat.id}
							<Table.Row
								role="option"
								aria-selected={isSelected}
								tabindex={0}
								class="cursor-pointer transition-colors hover:bg-muted/50 {isSelected
									? 'bg-primary/10 hover:bg-primary/15'
									: ''}"
								onclick={() => select(cat.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										select(cat.id);
									}
								}}
							>
								<Table.Cell>
									<div
										class="flex h-4 w-4 items-center justify-center rounded-full border {isSelected
											? 'border-primary bg-primary'
											: 'border-muted-foreground'}"
									>
										{#if isSelected}
											<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
										{/if}
									</div>
								</Table.Cell>

								<Table.Cell class="font-medium">{cat.name}</Table.Cell>

								<Table.Cell>{getAgeBadge(cat.birthDate)}</Table.Cell>

								<Table.Cell>
									<span title={sexIcon.label}>
										<Icon name={sexIcon.icon} class="h-4 w-4 {sexIcon.color}" />
									</span>
								</Table.Cell>

								<Table.Cell
									>{cat.color ?? '—'} /
									{#if cat.hairLength}
										<Badge variant="outline" class="text-xs">
											{getLabel(hairLabel, cat.hairLength)}
										</Badge>
									{:else}
										—
									{/if}
								</Table.Cell>

								<Table.Cell
									class="max-w-md min-w-64 align-top wrap-break-word whitespace-normal text-muted-foreground"
								>
									<p class="whitespace-pre-line">{cat.description ?? '—'}</p>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	{/if}

	<div class="mt-auto flex justify-end gap-2">
		{#if onCancel}
			<Button type="button" variant="outline" onclick={onCancel}>Annuler</Button>
		{/if}
		<Button type="button" disabled={!selected} onclick={() => selected && onSelect(selected.id)}>
			{selected ? `Choisir ${selected.name}` : 'Sélectionnez un chat'}
		</Button>
	</div>
</div>
