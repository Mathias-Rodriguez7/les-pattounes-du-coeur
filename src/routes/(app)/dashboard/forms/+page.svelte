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

	const { data } = $props();

	let forms = $derived(data.forms);

	let selectedFormId = $state<string | null>(null);
	let selectedForm = $derived(forms.find((f) => f.id === selectedFormId) ?? null);

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
	};

	function clearFilters() {
		typeFilter = '';
		statusFilter = 'PENDING';
		searchQuery = '';
	}
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-6 p-10">
		<!-- Bandeau stats -->
		<section class="grid grid-cols-4 gap-4">
			{#each statCards as card (card.label)}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">{card.label}</Card.Title>
						<Icon
							name={card.icon}
							withWrapper={true}
							wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
							style="background: {getGradientStyle(card.theme)}"
							iconClass="h-5 w-5"
						/>
					</Card.Header>
					<Card.Content>
						<p class="text-2xl font-bold">{card.value}</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<!-- Tableau + Panel détail -->
		<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
			<!-- Tableau -->
			<Card.Root class="flex flex-col lg:col-span-2">
				<Card.Header class="flex shrink-0 flex-row items-center justify-between">
					<Card.Title class="flex gap-4 text-2xl font-bold">
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
								class="w-40"
							/>

							<!-- Status -->
							<SelectField
								id="form-status-filter"
								label=""
								options={FORM_STATUS_OPTIONS}
								bind:value={statusFilter}
								placeholder="Status"
								class="w-30"
							/>
						{/snippet}
					</TableToolbar>

					<div class="mt-2 h-[calc(120vh-24rem)] min-h-80 overflow-auto rounded-md">
						<Table.Root containerClass="overflow-visible">
							<Table.Header
								class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
							>
								<Table.Row>
									<Table.Head>Type</Table.Head>
									<Table.Head>Status</Table.Head>
									<Table.Head>Assigné à</Table.Head>
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

			<!-- Panel détail -->
			<div class="col-span-3 overflow-y-auto">
				<FormPanel
					cats={data.cats}
					form={selectedForm}
					volunteers={data.volunteers}
					isAdmin={data.isAdmin}
					canAssign={data.canAssign}
				/>
			</div>
		</section>
	</div>
</main>
