<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import CardAction from '#lib/components/ui/card/card-action.svelte';
	import { buttonVariants } from '#lib/components/ui/button/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import BlacklistRow from '#lib/components/blacklist/BlacklistRow.svelte';
	import BlacklistPanel from '#lib/components/blacklist/BlacklistPanel.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import { personName } from '#lib/components/blacklist/blacklistDisplay.ts';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { X } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();

	const people = $derived(data.people);

	// ===== Sélection (même principe que la page Formulaires) =====
	let selectedEmail = $state<string | null>(null);
	const selectedPerson = $derived(people.find((p) => p.email === selectedEmail) ?? null);

	// Détail à droite sur PC, en plein écran sur téléphone et tablette
	const isDesktop = new MediaQuery('min-width: 1024px', true);
	let mobilePanelOpen = $state(false);

	// La personne a disparu de la liste (liste noire levée) : on ferme le détail
	$effect(() => {
		if (selectedEmail && !selectedPerson) {
			selectedEmail = null;
			mobilePanelOpen = false;
		}
	});

	function selectPerson(email: string) {
		selectedEmail = email;
		if (!isDesktop.current) mobilePanelOpen = true;
	}

	// ===== Stats =====
	const statCards = $derived([
		{ label: 'Sur liste noire', value: people.length, icon: 'Ban', theme: 'stop' },
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
	<title>Liste noire – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- Bandeau stats : 3 cartes (2 + 1 sur téléphone) -->
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
			<Card.Root class="flex min-w-0 flex-col lg:col-span-2">
				<Card.Header class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2">
					<Card.Title class="text-xl font-bold sm:text-2xl">Liste noire</Card.Title>
					<CardAction>
						<BlacklistAddDialog />
					</CardAction>
				</Card.Header>

				<Card.Content>
					<TableToolbar
						bind:search={searchQuery}
						searchPlaceholder="Chercher un nom, un email…"
						searchLabel="Chercher dans la liste noire"
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
												: 'Personne sur liste noire'}
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
					<BlacklistPanel person={selectedPerson} />
				</div>
			{/if}
		</section>
	</div>
</main>

<!-- DÉTAIL : plein écran sur téléphone et tablette -->
{#if !isDesktop.current}
	<Sheet.Root bind:open={mobilePanelOpen}>
		<Sheet.Content
			side="right"
			showCloseButton={false}
			class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
		>
			<header class="sticky top-0 z-10 flex items-center gap-2 bg-card/95 px-4 py-2 backdrop-blur">
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">
					{selectedPerson ? (personName(selectedPerson) ?? selectedPerson.email) : 'Détail'}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				<BlacklistPanel person={selectedPerson} />
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
