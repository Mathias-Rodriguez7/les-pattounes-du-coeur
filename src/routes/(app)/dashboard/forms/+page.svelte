<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import FormRow from '$lib/components/forms/FormRow.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { FORM_TYPE_OPTIONS, FORM_STATUS_OPTIONS } from '$lib/constants/forms.js';
	import FormPanel from '$lib/components/forms/FormPanel.svelte';

	const { data } = $props();

	let forms = $derived(data.forms);
	const stats = $derived(data.stats);

	const isAdmin = $derived(data.isAdmin);
	const volunteers = $derived(data.volunteers);

	let selectedFormId = $state<string | null>(null);
	let selectedForm = $derived(forms.find((f) => f.id === selectedFormId) ?? null);

	let searchQuery = $state('');
	let typeFilter = $state('');
	let statusFilter = $state('PENDING');

	const handleSelectForm = (formId: string) => {
		selectedFormId = formId;
	};

	const statCards = $derived([
		{
			label: 'Total formulaires',
			value: stats.totalForms,
			icon: 'clipboard',
			theme: 'cats'
		},
		{
			label: 'En attente',
			value: stats.pendingForms,
			icon: 'clock',
			theme: 'pending'
		},
		{
			label: 'Approuvés',
			value: stats.approvedForms,
			icon: 'CircleCheck',
			theme: 'activ'
		},
		{
			label: 'Rejetés',
			value: stats.rejectedForms,
			icon: 'CircleX',
			theme: 'stop'
		}
	]);

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
				const email = f.email?.toLowerCase() ?? '';
				const assignedName = f.assignedTo
					? `${f.assignedTo.profil.firstName} ${f.assignedTo.profil.lastName}`.toLowerCase()
					: '';

				return email.includes(query) || assignedName.includes(query);
			});
		}

		return filtered;
	});

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
				<Card.Title class="text-2xl font-bold">Formulaires</Card.Title>
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
						/>

						<!-- Status -->
						<SelectField
							id="form-status-filter"
							label=""
							options={FORM_STATUS_OPTIONS}
							bind:value={statusFilter}
							placeholder="Statut"
							class="w-40"
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
								placeholder="Chercher un email ou un bénévole..."
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
								<Table.Head>Statut</Table.Head>
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
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Panel détail -->
		<div class="col-span-3 overflow-y-auto">
			{#key selectedFormId}
				<FormPanel form={selectedForm} />
			{/key}
		</div>
	</section>
</main>
