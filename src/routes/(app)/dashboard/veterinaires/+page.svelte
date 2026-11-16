<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Clock, Globe, MapPin, Phone, Search, Stethoscope, TriangleAlert } from '@lucide/svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import VeterinarianDialog from '#lib/components/veterinarians/VeterinarianDialog.svelte';
	import {
		VETERINARIAN_CATEGORY,
		VETERINARIAN_CATEGORY_ORDER
	} from '#lib/constants/veterinarian.ts';
	import type { VeterinarianRow } from '#lib/server/veterinarians/queries.ts';

	let { data } = $props();

	// ===== RECHERCHE : nom, vétérinaires, spécialité, secteur, adresse =====
	let query = $state('');

	/** « Clémentide » → « clementide » : la recherche ignore les majuscules et les accents */
	const normalize = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();

	const matches = (vet: VeterinarianRow, q: string) =>
		!q ||
		normalize(
			[vet.name, vet.doctors, vet.specialty, vet.area, vet.address].filter(Boolean).join(' ')
		).includes(q);

	const visible = $derived.by(() => {
		const q = normalize(query.trim());
		return data.veterinarians.filter((vet) => matches(vet, q));
	});

	// Les groupes non vides, dans l'ordre des catégories ; les retirés à part (admin seulement)
	const groups = $derived(
		VETERINARIAN_CATEGORY_ORDER.map((category) => ({
			category,
			vets: visible.filter((vet) => vet.isActive && vet.category === category)
		})).filter((group) => group.vets.length > 0)
	);
	const removed = $derived(visible.filter((vet) => !vet.isActive));

	// ===== RETIRER / REMETTRE (admin) =====
	let busyId = $state<string | null>(null);

	const handleActive =
		(vetId: string): SubmitFunction =>
		() => {
			busyId = vetId;
			return async ({ result, update }) => {
				busyId = null;
				if (result.type === 'success') toast.success(result.data?.message as string);
				else if (result.type === 'failure') toast.error((result.data?.error as string) ?? 'Erreur');
				await update();
			};
		};
</script>

<svelte:head>
	<title>Vétérinaires – Les Pattounes du Cœur</title>
</svelte:head>

<!-- ===== UNE CARTE VÉTÉRINAIRE ===== -->
{#snippet vetCard(vet: VeterinarianRow)}
	<Card.Root class="gap-3 {vet.isActive ? '' : 'opacity-60'}">
		<Card.Header class="flex flex-row items-start justify-between gap-2">
			<div class="min-w-0">
				<Card.Title class="text-base">{vet.name}</Card.Title>
				{#if vet.doctors}
					<Card.Description>{vet.doctors}</Card.Description>
				{/if}
				{#if vet.specialty}
					<Badge class="mt-2 {VETERINARIAN_CATEGORY[vet.category].color}">{vet.specialty}</Badge>
				{/if}
			</div>
			{#if data.isAdmin}
				<div class="flex shrink-0 items-center">
					<VeterinarianDialog {vet} />
				</div>
			{/if}
		</Card.Header>

		<Card.Content class="grid gap-2 text-sm">
			{#if vet.area || vet.address}
				<p class="flex gap-2">
					<MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					<span>
						{#if vet.area}<span class="font-medium">{vet.area}</span><br />{/if}
						{vet.address ?? ''}
					</span>
				</p>
			{/if}
			{#if vet.phone}
				<p class="flex items-center gap-2">
					<Phone class="size-4 shrink-0 text-muted-foreground" />
					<a
						href={`tel:${vet.phone.replace(/[^\d+]/g, '')}`}
						class="text-blue-600 underline hover:text-primary"
					>
						{vet.phone}
					</a>
				</p>
			{/if}
			{#if vet.website}
				<p class="flex min-w-0 items-center gap-2">
					<Globe class="size-4 shrink-0 text-muted-foreground" />
					<!-- Un site externe saisi par l'admin : pas une route de l'appli, resolve() ne s'applique pas -->
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={vet.website}
						target="_blank"
						rel="noopener noreferrer"
						class="truncate text-blue-600 underline hover:text-primary"
					>
						Site web
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</p>
			{/if}
			{#if vet.hours}
				<p class="flex gap-2">
					<Clock class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					<span class="whitespace-pre-line">{vet.hours}</span>
				</p>
			{/if}
			{#if vet.notes}
				<p class="flex gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
					<TriangleAlert class="size-4 shrink-0" />
					<span>{vet.notes}</span>
				</p>
			{/if}

			{#if data.isAdmin}
				<form
					method="POST"
					action="?/setVeterinarianActive"
					use:enhance={handleActive(vet.id)}
					class="mt-1 flex items-center justify-between gap-2 border-t pt-2"
				>
					<span class="text-xs text-muted-foreground">
						{vet._count.cares} soin{vet._count.cares > 1 ? 's' : ''}
					</span>
					<input type="hidden" name="veterinarianId" value={vet.id} />
					<input type="hidden" name="isActive" value={vet.isActive ? 'false' : 'true'} />
					<Button
						type="submit"
						variant="ghost"
						size="sm"
						class={vet.isActive ? 'text-destructive' : ''}
						disabled={busyId === vet.id}
					>
						{vet.isActive ? 'Retirer de la liste' : 'Remettre dans la liste'}
					</Button>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
{/snippet}

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-6 p-4 sm:p-6 lg:p-10">
		<!-- En-tête : titre, recherche, ajout (admin) -->
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h1 class="flex items-center gap-2 text-2xl font-bold">
				<Stethoscope class="size-6 text-primary" />
				Vétérinaires
			</h1>
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative">
					<Search
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						bind:value={query}
						placeholder="Clinique, spécialité, ville…"
						aria-label="Chercher un vétérinaire"
						class="w-64 rounded-2xl pl-9"
					/>
				</div>
				{#if data.isAdmin}
					<VeterinarianDialog />
				{/if}
			</div>
		</div>

		{#each groups as group (group.category)}
			{@const category = VETERINARIAN_CATEGORY[group.category]}
			<section class="grid gap-3">
				<div>
					<h2 class="text-lg font-semibold">
						{category.label}
						<span class="text-base font-normal text-muted-foreground">({group.vets.length})</span>
					</h2>
					<p class="text-sm text-muted-foreground">{category.hint}</p>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each group.vets as vet (vet.id)}
						{@render vetCard(vet)}
					{/each}
				</div>
			</section>
		{:else}
			<p class="py-10 text-center text-muted-foreground">
				{query ? 'Aucun vétérinaire ne correspond à cette recherche.' : 'Aucun vétérinaire.'}
			</p>
		{/each}

		<!-- Retirés de la liste (admin seulement) : ils ne sont plus proposés dans les soins -->
		{#if removed.length > 0}
			<section class="grid gap-3">
				<div>
					<h2 class="text-lg font-semibold text-muted-foreground">
						Retirés de la liste ({removed.length})
					</h2>
					<p class="text-sm text-muted-foreground">
						Plus proposés pour un nouveau soin. Les soins passés gardent leur nom.
					</p>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each removed as vet (vet.id)}
						{@render vetCard(vet)}
					{/each}
				</div>
			</section>
		{/if}
	</div>
</main>
