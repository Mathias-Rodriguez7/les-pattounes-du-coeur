<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
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

	const { data } = $props();

	let forms = $derived(data.forms);

	let selectedFormId = $state<string | null>(null);
	let selectedForm = $derived(forms.find((f) => f.id === selectedFormId) ?? null);

	let searchQuery = $state('');

	// ==========================================
	// Filtres Select (valeur '' = pas de filtre)
	// ==========================================
	let typeFilter = $state(data.filters.type ?? '');
	let statusFilter = $state(data.filters.status ?? 'PENDING');

	// ==========================================
	// Portée : admin ou dispatcher flexible = switch, sinon "mes forms"
	// Le changement passe par l'URL, le serveur recalcule la liste
	// ==========================================
	const canSwitchScope = $derived(data.canSeeAllFlexible);
	const showAllFlexible = $derived(data.scope === 'flexible');

	function setScope(checked: boolean) {
		selectedFormId = null;
		const url = new URL(page.url);
		if (checked) {
			url.searchParams.set('scope', 'flexible');
			url.searchParams.set('type', 'ADOPTION_FLEXIBLE');
			typeFilter = 'ADOPTION_FLEXIBLE';
		} else {
			url.searchParams.delete('scope');
			url.searchParams.delete('type');
			typeFilter = '';
		}
		goto(url, { keepFocus: true, noScroll: true });
	}

	// ==========================================
	// Stats (venant du serveur, cohérentes avec la portée)
	// ==========================================
	const statCards = $derived([
		{
			label: showAllFlexible ? 'Flexibles (tous)' : 'Mes formulaires',
			value: data.stats.totalForms,
			icon: 'file',
			theme: 'cats'
		},
		{
			label: 'En attente',
			value: data.stats.pendingForms,
			icon: 'clock',
			theme: 'dog'
		},
		{
			label: 'Approuvés',
			value: data.stats.approvedForms,
			icon: 'check',
			theme: 'fa'
		},
		{
			label: 'Rejetés',
			value: data.stats.rejectedForms,
			icon: 'x',
			theme: 'socializing'
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

<main class="flex flex-col gap-4 p-8">
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
					{showAllFlexible ? 'Tous les flexibles' : 'Mes formulaires'}
					{#if canSwitchScope}
						<Switch id="scope-toggle" checked={showAllFlexible} onCheckedChange={setScope} />
					{/if}
				</Card.Title>
				<CardAction>
					{#if data.isAdmin}
						<AssignDispatcherDialog
							volunteers={data.volunteers}
							currentDispatcherId={data.volunteers.find((v) => v.isFlexibleDispatcher)?.id ?? null}
						/>
					{/if}
				</CardAction>
			</Card.Header>

			<Card.Content>
				<!-- Barre de filtres -->
				<div class="grid items-center gap-2">
					<div class="flex flex-wrap gap-2">
						<!-- Type -->
						<SelectField
							id="form-type-filter"
							label=""
							options={FORM_TYPE_OPTIONS}
							bind:value={typeFilter}
							placeholder="Type"
							class="w-40"
							disabled={showAllFlexible}
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
					</div>

					<div class="flex items-center gap-2">
						<Button class="rounded-2xl" size="sm" onclick={clearFilters}>Réinitialiser</Button>

						<div class="relative flex-1">
							<Icon
								name="search"
								class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
							/>
							<Input
								type="text"
								placeholder="Chercher un formulaire..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>
					</div>
				</div>

				<div class="mt-2 h-[calc(120vh-24rem)] min-h-80 overflow-auto rounded-md">
					<Table.Root containerClass="overflow-visible">
						<Table.Header class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
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
			/>
		</div>
	</section>
</main>
