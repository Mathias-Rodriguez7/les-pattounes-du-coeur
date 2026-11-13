<script lang="ts">
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import CardAction from '#lib/components/ui/card/card-action.svelte';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import BlacklistRow from '#lib/components/blacklist/BlacklistRow.svelte';
	import BlacklistPanel from '#lib/components/blacklist/BlacklistPanel.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import { personName } from '#lib/components/blacklist/blacklistDisplay.ts';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();

	const people = $derived(data.people);

	// ===== Sélection (même principe que la page Formulaires) =====
	let selectedEmail = $state<string | null>(null);
	const selectedPerson = $derived(people.find((p) => p.email === selectedEmail) ?? null);

	let mobilePanelOpen = $state(false);

	// La personne a disparu de la liste (blacklist levée) : on ferme le détail
	$effect(() => {
		if (selectedEmail && !selectedPerson) {
			selectedEmail = null;
			mobilePanelOpen = false;
		}
	});

	function selectPerson(email: string) {
		selectedEmail = email;
		if (!desktop.current) mobilePanelOpen = true;
	}

	// ===== Stats =====
	const statCards = $derived([
		{ label: 'Blacklistés', value: people.length, icon: 'Ban', theme: 'stop' },
		{
			label: 'Comptes désactivés',
			value: people.filter((p) => p.account).length,
			icon: 'user',
			theme: 'volunteers'
		},
		{ label: 'Levées (historique)', value: data.liftedCount, icon: 'CircleCheck', theme: 'fa' }
	]);

	// ===== Recherche : nom, email ou raison =====
	let searchQuery = $state('');

	const filteredPeople = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return people;
		return people.filter((p) =>
			[personName(p), p.email, p.reason].some((text) => text?.toLowerCase().includes(query))
		);
	});
</script>

<svelte:head>
	<title>Blacklist – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- Bandeau stats : 3 cartes (2 + 1 sur téléphone) -->
		<StatCards cards={statCards} class="grid-cols-2 sm:grid-cols-3" />

		<!-- Tableau + Panel détail -->
		<ListDetailLayout
			bind:open={mobilePanelOpen}
			title={selectedPerson ? (personName(selectedPerson) ?? selectedPerson.email) : 'Détail'}
		>
			{#snippet list()}
				<Card.Root class="flex min-w-0 flex-col lg:col-span-2">
					<Card.Header class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2">
						<Card.Title class="text-xl font-bold sm:text-2xl">Blacklist</Card.Title>
						<CardAction>
							<BlacklistAddDialog />
						</CardAction>
					</Card.Header>

					<Card.Content>
						<TableToolbar
							bind:search={searchQuery}
							searchPlaceholder="Chercher un nom, un email…"
							searchLabel="Chercher dans la blacklist"
						/>

						<div
							class="mt-2 overflow-x-auto rounded-md lg:h-[calc(120vh-24rem)] lg:min-h-80 lg:overflow-y-auto"
						>
							<Table.Root containerClass="overflow-visible">
								<Table.Header
									class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
								>
									<Table.Row>
										<Table.Head>Personne</Table.Head>
										<Table.Head class="hidden sm:table-cell">Compte</Table.Head>
										<Table.Head>Depuis</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each filteredPeople as person (person.email)}
										<BlacklistRow
											{person}
											isSelected={selectedEmail === person.email}
											onclick={() => selectPerson(person.email)}
										/>
									{:else}
										<Table.Row>
											<Table.Cell colspan={3} class="py-8 text-center text-gray-500">
												{searchQuery
													? `Aucun résultat pour "${searchQuery}"`
													: 'Aucune personne blacklistée'}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{/snippet}

			{#snippet detail()}
				<BlacklistPanel person={selectedPerson} />
			{/snippet}
		</ListDetailLayout>
	</div>
</main>
