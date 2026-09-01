<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import HostRow from '$lib/components/hosts/HostRow.svelte';
	import HostPanel from '$lib/components/hosts/HostPanel.svelte';
	import NewHostDialog from '$lib/components/hosts/NewHostDialog.svelte';

	const { data } = $props();

	const hosts = $derived(data.hosts);
	const stats = $derived(data.stats);

	let selectedHostId = $state<string | null>(null);
	let selectedHost = $derived(hosts.find((h) => h.id === selectedHostId) ?? null);

	let currentPage = $state(1);
	let currentTab = $state('all');

	// 👇 FILTRE CYCLIQUE SUR LE STATUT
	const statuses = ['ALL', 'FREE', 'CAT_PLACE', 'WAITING', 'WAITING_VALIDATION'];
	let currentStatusFilterIndex = $state(0);

	const handleStatusHeaderClick = () => {
		currentStatusFilterIndex = (currentStatusFilterIndex + 1) % statuses.length;
		currentTab = statuses[currentStatusFilterIndex];
		currentPage = 1;
	};

	const handleSelectHost = (hostId: string) => {
		selectedHostId = hostId;
	};

	const PAGE_SIZE = 10;

	const statCards = $derived([
		{
			label: "FA dans l'association",
			value: stats.totalHosts,
			icon: 'house',
			theme: 'fa'
		},
		{
			label: 'FA profils incomplets',
			value: stats.incompleteProfiles,
			icon: 'alert',
			theme: 'dog'
		},
		{
			label: 'FA actives',
			value: stats.activeHosts,
			icon: 'CirclePlay',
			theme: 'activ'
		},
		{
			label: 'FA en pause',
			value: stats.breakHosts,
			icon: 'CirclePause',
			theme: 'break'
		},
		{
			label: 'FA recrutés cette année',
			value: stats.recruitedThisYear,
			icon: 'Handshake',
			theme: 'adoptions'
		}
	]);

	const compatibilityIcons = [
		{ icon: 'cat', theme: 'cats', title: 'Compatible chats' },
		{ icon: 'trees', theme: 'fa', title: 'A un jardin' }
	];

	const filteredHosts = $derived(() => {
		switch (currentTab) {
			case 'LONG':
				return hosts.filter((h) => h.type === 'CLASSIC');
			case 'RELAIS':
				return hosts.filter((h) => h.type === 'RELAY');
			default:
				return hosts;
		}
	});

	const paginatedHosts = $derived(
		filteredHosts().slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	function onTabChange(tab: string) {
		currentTab = tab;
		currentPage = 1;
	}

	let newHostOpen = $state(false);
</script>

<main class="flex flex-col gap-4 p-8">
	<!-- Bandeau stats -->
	<section class="grid grid-cols-5 gap-4">
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
				<Card.Title class="text-2xl font-bold">Familles d'accueil</Card.Title>
				<Button size="sm" onclick={() => (newHostOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouvelle famille
				</Button>
			</Card.Header>
			<Card.Content>
				<Tabs.Root value={currentTab} onValueChange={onTabChange} class="min-w-full">
					<Tabs.List class="bg-muted grid grid-cols-3 gap-1 p-1">
						<!-- 👇 STATUT HEADER CLICKABLE AVEC CYCLE -->
						<Tabs.Trigger value="ALL" class="relative">
							Tous
							{#if currentTab === 'ALL'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
							{/if}
						</Tabs.Trigger>

						<Tabs.Trigger value="LONG" class="relative">
							Long
							{#if currentTab === 'LONG'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
							{/if}
						</Tabs.Trigger>

						<Tabs.Trigger value="RELAIS" class="relative">
							Relais
							{#if currentTab === 'RELAIS'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
							{/if}
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>

				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Statut</Table.Head>
							<Table.Head>Nom</Table.Head>
							<Table.Head>Rôle</Table.Head>
							<Table.Head>Quartier</Table.Head>
							<Table.Head>Espace</Table.Head>
							{#each compatibilityIcons as compat (compat.title)}
								<Table.Head title={compat.title} class="text-center">
									<div class="flex justify-center text-white">
										<Icon
											name={compat.icon}
											withWrapper={true}
											wrapperClass="flex h-8 w-8 items-center justify-center rounded-lg"
											style="background: {getGradientStyle(compat.theme)}"
											iconClass="h-5 w-5"
										/>
									</div>
								</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each paginatedHosts as host (host.id)}
							<HostRow
								{host}
								onclick={() => handleSelectHost(host.id)}
								isSelected={selectedHostId === host.id}
							/>
						{/each}
					</Table.Body>
				</Table.Root>

				<!-- Pagination -->
				<div class="mt-4 flex justify-center">
					<Pagination.Root
						count={filteredHosts().length}
						perPage={PAGE_SIZE}
						bind:page={currentPage}
					>
						{#snippet children({ pages, currentPage: cp })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.Previous />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={cp === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.Next />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Panel détail -->
		<div class="col-span-3 overflow-y-auto">
			{#if selectedHost}
				<HostPanel host={selectedHost} isAdmin={data.isAdmin} />
			{:else}
				<Card.Root class="flex h-full items-center justify-center">
					<Card.Content class="text-muted-foreground text-center">
						Sélectionnez une famille d'accueil pour voir les détails
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</section>
	<NewHostDialog bind:open={newHostOpen} />
</main>
