<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getAgeBadge } from '$lib/utils/age';
	import { getLabel, getSexIcon, hairLabel } from '$lib/utils/catHelpers';
	import type { CatFull } from '$lib/types/cat';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ageLabels, furLabels } from '$lib/constants/forms';

	let {
		cats = [] as CatFull[],
		form,
		onSelect,
		onCancel
	} = $props<{
		cats?: CatFull[];
		form: { type: string; data: Record<string, any> };
		onSelect: (catId: string) => void;
		onCancel?: () => void;
	}>();

	const adoptionData = $derived(form.data);

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

	const formSummary = $derived({
		name: `${adoptionData.firstName ?? ''} ${adoptionData.lastName ?? ''}`.trim(),
		catAge: adoptionData.catAge,
		furLength: adoptionData.furLength,
		color: adoptionData.color,
		temperament: adoptionData.temperament
	});
</script>

<div
	class="bg-muted/50 border-muted grid grid-cols-2 gap-3 rounded-xl border p-3 text-sm md:grid-cols-4"
>
	<div>
		<p class="text-muted-foreground text-xs">Candidat</p>
		<p class="font-medium">{formSummary.name || '—'}</p>
	</div>
	<div>
		<p class="text-muted-foreground text-xs">Âge souhaité</p>
		<Badge variant="outline" class="text-xs">
			{ageLabels[formSummary.catAge] ?? formSummary.catAge ?? '—'}
		</Badge>
	</div>
	<div>
		<p class="text-muted-foreground text-xs">Poil / couleur</p>
		<p class="font-medium">
			{furLabels[formSummary.furLength] ?? '—'} · {formSummary.color ?? '—'}
		</p>
	</div>
	<div class="col-span-2 md:col-span-4">
		<p class="text-muted-foreground text-xs">Caractère recherché</p>
		<p class="font-medium">{formSummary.temperament || '—'}</p>
	</div>
</div>
<Separator />
<div class="space-y-4">
	{#if cats.length === 0}
		<p class="text-muted-foreground py-6 text-center">Aucun chat disponible.</p>
	{:else}
		<div class="flex items-center justify-between gap-2">
			<div class="relative">
				<Icon
					name="search"
					class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
				/>
				<Input type="text" placeholder="Chercher un chat..." bind:value={search} class="pl-9" />
			</div>
			<p class="text-muted-foreground text-xs">{filteredCats.length} chat(s)</p>
		</div>

		{#if filteredCats.length === 0}
			<p class="text-muted-foreground py-6 text-center">
				Aucun chat ne correspond à « {search} ».
			</p>
		{:else}
			<div class="mt-2 h-[calc(120vh-24rem)] min-h-80 overflow-auto rounded-md">
				<Table.Root containerClass="overflow-visible">
					<Table.Header class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
						<Table.Row>
							<Table.Head class="w-10"></Table.Head>
							<Table.Head>Nom</Table.Head>
							<Table.Head>Âge</Table.Head>
							<Table.Head>Sexe</Table.Head>
							<Table.Head>Couleur</Table.Head>
							<Table.Head>Poil</Table.Head>
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
								class="hover:bg-muted/50 cursor-pointer transition-colors {isSelected
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

								<Table.Cell>{cat.color ?? '—'}</Table.Cell>

								<Table.Cell>
									{#if cat.hairLength}
										<Badge variant="outline" class="text-xs">
											{getLabel(hairLabel, cat.hairLength)}
										</Badge>
									{:else}
										—
									{/if}
								</Table.Cell>

								<Table.Cell
									class="text-muted-foreground max-w-md min-w-64 align-top wrap-break-word whitespace-normal"
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

	<div class="flex justify-end gap-2">
		{#if onCancel}
			<Button type="button" variant="outline" onclick={onCancel}>Annuler</Button>
		{/if}
		<Button type="button" disabled={!selected} onclick={() => selected && onSelect(selected.id)}>
			{selected ? `Choisir ${selected.name}` : 'Sélectionnez un chat'}
		</Button>
	</div>
</div>
