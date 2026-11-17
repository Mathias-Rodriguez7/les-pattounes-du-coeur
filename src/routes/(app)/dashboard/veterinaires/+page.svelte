<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { ChevronRight } from '@lucide/svelte';
	import VeterinarianDialog from '#lib/components/veterinarians/VeterinarianDialog.svelte';
	import VeterinarianPanel from '#lib/components/veterinarians/VeterinarianPanel.svelte';
	import {
		VETERINARIAN_CATEGORY,
		VETERINARIAN_CATEGORY_OPTIONS
	} from '#lib/constants/veterinarian.ts';
	import { desktop } from '#lib/utils/media.svelte.ts';

	let { data } = $props();

	const vets = $derived(data.veterinarians);

	// ===== FILTRES (valeur '' = pas de filtre) =====
	// « Dans la liste » par défaut : les retirés ne sont montrés qu'à l'admin, sur demande
	const LIST_OPTIONS = [
		{ value: 'ACTIVE', label: 'Dans la liste' },
		{ value: 'REMOVED', label: 'Retirés' }
	];

	let categoryFilter = $state('');
	let listFilter = $state('ACTIVE');
	let searchQuery = $state('');

	function clearFilters() {
		categoryFilter = '';
		listFilter = 'ACTIVE';
		searchQuery = '';
	}

	/** « Clémentide » → « clementide » : la recherche ignore les majuscules et les accents */
	const normalize = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();

	const filtered = $derived.by(() => {
		const q = normalize(searchQuery.trim());
		return vets.filter((vet) => {
			if (listFilter === 'ACTIVE' && !vet.isActive) return false;
			if (listFilter === 'REMOVED' && vet.isActive) return false;
			if (categoryFilter && vet.category !== categoryFilter) return false;
			if (!q) return true;
			return normalize(
				[vet.name, vet.doctors, vet.specialty, vet.area, vet.address].filter(Boolean).join(' ')
			).includes(q);
		});
	});

	// ===== SÉLECTION =====
	let selectedId = $state<string | null>(null);
	const selected = $derived(vets.find((vet) => vet.id === selectedId) ?? null);
	let mobilePanelOpen = $state(false);

	function select(id: string) {
		selectedId = id;
		if (!desktop.current) mobilePanelOpen = true;
	}
</script>

<svelte:head>
	<title>Vétérinaires – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<ListDetailLayout bind:open={mobilePanelOpen} title={selected?.name ?? 'Détail du vétérinaire'}>
			{#snippet list()}
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-8rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<Card.Title class="text-xl font-bold sm:text-2xl">
								Vétérinaires
								<span class="text-base font-normal text-muted-foreground">({filtered.length})</span>
							</Card.Title>
							{#if data.isAdmin}
								<VeterinarianDialog />
							{/if}
						</Card.Header>

						<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
							<TableToolbar
								bind:search={searchQuery}
								searchPlaceholder="Clinique, spécialité, ville…"
								searchLabel="Chercher un vétérinaire"
								onReset={clearFilters}
							>
								{#snippet filters()}
									<SelectField
										id="vet-filter-category"
										label=""
										options={VETERINARIAN_CATEGORY_OPTIONS}
										bind:value={categoryFilter}
										placeholder="Catégorie"
										class="w-full sm:w-36"
									/>
									{#if data.isAdmin}
										<SelectField
											id="vet-filter-list"
											label=""
											options={LIST_OPTIONS}
											bind:value={listFilter}
											placeholder="Liste"
											class="w-full sm:w-36"
										/>
									{/if}
								{/snippet}
							</TableToolbar>

							<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
								<Table.Root containerClass="overflow-visible">
									<Table.Header
										class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
									>
										<Table.Row>
											<Table.Head>Clinique</Table.Head>
											<Table.Head class="hidden sm:table-cell">Secteur</Table.Head>
											<Table.Head>Catégorie</Table.Head>
											<Table.Head class="w-8 sm:hidden"
												><span class="sr-only">Ouvrir</span></Table.Head
											>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each filtered as vet (vet.id)}
											{@const category = VETERINARIAN_CATEGORY[vet.category]}
											<Table.Row
												onclick={() => select(vet.id)}
												class="{selectedId === vet.id
													? 'bg-accent hover:bg-accent'
													: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors {vet.isActive
													? ''
													: 'opacity-60'}"
											>
												<Table.Cell class="max-w-48">
													<p class="truncate font-semibold text-gray-900">{vet.name}</p>
													{#if vet.specialty || vet.doctors}
														<p class="truncate text-xs text-muted-foreground">
															{vet.specialty ?? vet.doctors}
														</p>
													{/if}
												</Table.Cell>
												<Table.Cell class="hidden max-w-36 truncate text-sm sm:table-cell">
													{vet.area ?? '—'}
												</Table.Cell>
												<Table.Cell>
													<Badge class={category.color}>{category.one}</Badge>
												</Table.Cell>
												<Table.Cell class="w-8 text-muted-foreground sm:hidden">
													<ChevronRight class="size-4" />
												</Table.Cell>
											</Table.Row>
										{:else}
											<Table.Row>
												<Table.Cell colspan={4} class="text-muted-foreground py-10 text-center">
													Aucun vétérinaire ne correspond à ces filtres.
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/snippet}

			{#snippet detail()}
				<VeterinarianPanel vet={selected} isAdmin={data.isAdmin} />
			{/snippet}
		</ListDetailLayout>
	</div>
</main>
