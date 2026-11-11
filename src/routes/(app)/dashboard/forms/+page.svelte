<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FormRow from '$lib/components/forms/FormRow.svelte';
	import FormPanel from '$lib/components/forms/FormPanel.svelte';
	import { FORM_TYPE_OPTIONS, FORM_STATUS_OPTIONS } from '$lib/constants/forms.js';
	import CardAction from '$lib/components/ui/card/card-action.svelte';
	import AssignDispatcherDialog from '$lib/components/forms/AssignDispatcherDialog.svelte';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '$lib/components/tables/TableToolbar.svelte';
	import { resolve } from '$app/paths';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { buttonVariants } from '$lib/components/ui/button';
	import { X } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';

	const { data } = $props();

	let forms = $derived(data.forms);

	let selectedFormId = $state<string | null>(null);
	let selectedForm = $derived(forms.find((f) => f.id === selectedFormId) ?? null);

	// ===== DÉTAIL : à droite sur PC, en plein écran sur téléphone et tablette =====
	// true à partir de 1024 px (valeur supposée côté serveur : ordinateur)
	const isDesktop = new MediaQuery('min-width: 1024px', true);
	let mobilePanelOpen = $state(false);

	// La demande sélectionnée a disparu (traitée, ou hors du filtre) : on ferme le détail
	$effect(() => {
		if (selectedFormId && !selectedForm) {
			selectedFormId = null;
			mobilePanelOpen = false;
		}
	});

	const selectedFormTitle = $derived(selectedForm?.email ?? 'Détail du formulaire');

	let searchQuery = $state('');

	// ==========================================
	// Filtres Select (valeur '' = pas de filtre)
	// ==========================================
	// Valeurs de DÉPART lues dans l'URL, puis l'utilisatrice les change librement :
	// on veut volontairement une copie, pas un lien qui suivrait `data`
	// svelte-ignore state_referenced_locally
	let typeFilter = $state(data.filters.type ?? '');
	// svelte-ignore state_referenced_locally
	let statusFilter = $state(data.filters.status ?? 'PENDING');

	// ==========================================
	// Portée : « Mes formulaires » ou « Tous » (admin : tout, répartitrice : les libres)
	// Le changement passe par l'URL, le serveur recalcule la liste.
	// Aucun filtre n'est imposé : chacune utilise les filtres pour affiner.
	// ==========================================
	const canSwitchScope = $derived(data.canSeeAll);
	const showAll = $derived(data.scope === 'all');
	const scopeTitle = $derived(
		!showAll ? 'Mes formulaires' : data.isAdmin ? 'Tous les formulaires' : 'Tous les flexibles'
	);

	function setScope(checked: boolean) {
		selectedFormId = null;
		const url = new URL(page.url);
		if (checked) {
			url.searchParams.set('scope', 'all');
		} else {
			url.searchParams.delete('scope');
		}
		// resolve() vérifie le chemin de la route, mais n'accepte pas de « ?query » :
		// la règle ESLint ne reconnaît donc pas ce goto. On la désactive pour CETTE ligne.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/dashboard/forms')}${url.search}`, { keepFocus: true, noScroll: true });
	}

	// ==========================================
	// Stats (venant du serveur, cohérentes avec la portée)
	// ==========================================
	const statCards = $derived([
		{
			label: scopeTitle,
			value: data.stats.totalForms,
			icon: 'file',
			theme: 'cats'
		},
		{
			label: 'En attente',
			value: data.stats.pendingForms,
			icon: 'clock',
			theme: 'pending'
		},
		{
			label: 'Approuvés',
			value: data.stats.approvedForms,
			icon: 'CircleCheck',
			theme: 'fa'
		},
		{
			label: 'Rejetés',
			value: data.stats.rejectedForms,
			icon: 'CircleX',
			theme: 'stop'
		}
	]);

	// ==========================================
	// Filtres client : type → status → recherche
	// (le scope est déjà appliqué par le serveur)
	// ==========================================
	const filteredForms = $derived.by(() => {
		let filtered = forms;

		if (typeFilter) {
			filtered = filtered.filter((f) => f.type === typeFilter);
		}

		if (statusFilter) {
			filtered = filtered.filter((f) => f.status === statusFilter);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((f) => {
				const name = `${f.email ?? ''}`.toLowerCase();
				return name.includes(query) || f.id.toLowerCase().includes(query);
			});
		}

		return filtered;
	});

	const hasActiveFilters = $derived(!!typeFilter || !!statusFilter || !!searchQuery.trim());

	const handleSelectForm = (formId: string) => {
		selectedFormId = formId;
		if (!isDesktop.current) mobilePanelOpen = true;
	};

	function clearFilters() {
		typeFilter = '';
		statusFilter = 'PENDING';
		searchQuery = '';
	}
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- Bandeau stats : 2 × 2 sur téléphone, 4 sur une ligne à partir de la tablette -->
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
			{#each statCards as card (card.label)}
				<Card.Root class="gap-2 py-4">
					<Card.Header class="flex flex-row items-start justify-between gap-2 px-4">
						<Card.Title class="text-xs font-medium text-muted-foreground sm:text-sm">
							{card.label}
						</Card.Title>
						<Icon
							name={card.icon}
							withWrapper={true}
							wrapperClass="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:size-10 sm:rounded-2xl"
							style="background: {getGradientStyle(card.theme)}"
							iconClass="size-4 sm:size-5"
						/>
					</Card.Header>
					<Card.Content class="px-4">
						<p class="text-xl font-bold sm:text-2xl">{card.value}</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<!-- Tableau + Panel détail -->
		<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
			<!-- Tableau -->
			<Card.Root class="flex min-w-0 flex-col lg:col-span-2">
				<Card.Header class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2">
					<Card.Title class="flex items-center gap-3 text-xl font-bold sm:text-2xl">
						{#if canSwitchScope}
							<Switch id="scope-toggle" checked={showAll} onCheckedChange={setScope} />
						{/if}{scopeTitle}
					</Card.Title>
					<CardAction>
						{#if data.isAdmin}
							<AssignDispatcherDialog
								volunteers={data.volunteers}
								currentDispatcherId={data.volunteers.find((v) => v.isFlexibleDispatcher)?.id ??
									null}
							/>
						{/if}
					</CardAction>
				</Card.Header>

				<Card.Content>
					<!-- Barre de filtres -->
					<TableToolbar
						bind:search={searchQuery}
						searchPlaceholder="Chercher un formulaire…"
						searchLabel="Chercher un formulaire par e-mail"
						onReset={clearFilters}
					>
						{#snippet filters()}
							<!-- Type -->
							<SelectField
								id="form-type-filter"
								label=""
								options={FORM_TYPE_OPTIONS}
								bind:value={typeFilter}
								placeholder="Type"
								class="w-full sm:w-40"
							/>

							<!-- Status -->
							<SelectField
								id="form-status-filter"
								label=""
								options={FORM_STATUS_OPTIONS}
								bind:value={statusFilter}
								placeholder="Status"
								class="w-full sm:w-32"
							/>
						{/snippet}
					</TableToolbar>

					<!-- PC : hauteur fixe et défilement interne | Téléphone : la liste suit la page -->
					<div
						class="mt-2 overflow-x-auto rounded-md lg:h-[calc(120vh-24rem)] lg:min-h-80 lg:overflow-y-auto"
					>
						<Table.Root containerClass="overflow-visible">
							<Table.Header
								class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
							>
								<Table.Row>
									<Table.Head>Type</Table.Head>
									<Table.Head>Status</Table.Head>
									<Table.Head class="hidden sm:table-cell">Assigné à</Table.Head>
									<Table.Head>Date</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filteredForms as form (form.id)}
									<FormRow
										{form}
										onclick={() => handleSelectForm(form.id)}
										isSelected={selectedFormId === form.id}
									/>
								{:else}
									<Table.Row>
										<Table.Cell colspan={5} class="py-8 text-center text-gray-500">
											{#if searchQuery}
												Aucun formulaire trouvé pour "{searchQuery}"
											{:else if hasActiveFilters}
												Aucun formulaire ne correspond aux filtres
											{:else}
												Aucun formulaire
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- DÉTAIL : ordinateur -->
			{#if isDesktop.current}
				<div class="min-w-0 lg:col-span-3">
					<FormPanel
						cats={data.cats}
						form={selectedForm}
						volunteers={data.volunteers}
						isAdmin={data.isAdmin}
						canAssign={data.canAssign}
					/>
				</div>
			{/if}
		</section>
	</div>
</main>

<!-- DÉTAIL : plein écran sur téléphone et tablette (même principe que la page Chats) -->
{#if !isDesktop.current}
	<Sheet.Root bind:open={mobilePanelOpen}>
		<Sheet.Content
			side="right"
			showCloseButton={false}
			class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
		>
			<header class="sticky top-0 z-10 flex items-center gap-2 bg-card/95 px-4 py-2 backdrop-blur">
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">
					{selectedFormTitle}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				<FormPanel
					cats={data.cats}
					form={selectedForm}
					volunteers={data.volunteers}
					isAdmin={data.isAdmin}
					canAssign={data.canAssign}
				/>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
