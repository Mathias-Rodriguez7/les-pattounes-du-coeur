<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import VolunteerRow from '$lib/components/volunteers/VolunteerRow.svelte';
	import VolunteerPanel from '$lib/components/volunteers/VolunteerPanel.svelte';

	const { data } = $props();

	const volunteers = $derived(data.volunteers);
	const stats = $derived(data.stats);

	let selectedVolunteerId = $state<string | null>(null);
	let selectedVolunteer = $derived(volunteers.find((v) => v.id === selectedVolunteerId) ?? null);

	let currentPage = $state(1);
	let currentTab = $state('all');

	// 👇 FILTRE CYCLIQUE SUR LE RÔLE
	const roles = ['ALL', 'ADMIN', 'MANAGER', 'COMMUNICATION'];
	let currentRoleFilterIndex = $state(0);

	const handleRoleHeaderClick = () => {
		currentRoleFilterIndex = (currentRoleFilterIndex + 1) % roles.length;
		currentTab = roles[currentRoleFilterIndex];
		currentPage = 1;
	};

	const handleSelectVolunteer = (volunteerId: string) => {
		selectedVolunteerId = volunteerId;
	};
	const PAGE_SIZE = 10;

	const statCards = $derived([
		{
			label: "Bénévoles dans l'association",
			value: stats.totalVolunteers,
			icon: 'users',
			theme: 'cats'
		},
		{
			label: 'Profils de bénévole incomplets',
			value: stats.incompleteProfiles,
			icon: 'alert',
			theme: 'dog'
		},
		{
			label: 'Bénévoles en activité',
			value: stats.activeVolunteers,
			icon: 'CirclePlay',
			theme: 'activ'
		},
		{
			label: 'Bénévoles en pause',
			value: stats.pausedVolunteers,
			icon: 'CirclePause',
			theme: 'break'
		},
		{
			label: 'Bénévoles recrutés cette année',
			value: stats.recruitedThisYear,
			icon: 'Handshake',
			theme: 'adoptions'
		}
	]);

	const compatibilityIcons = [
		{ icon: 'cat', theme: 'cats', title: 'Compatible avec les chats' },
		{ icon: 'news', theme: 'fa', title: 'Nécessite un jardin' }
	];

	const filteredVolunteers = $derived(() => {
		switch (currentTab) {
			case 'ADMIN':
				return volunteers.filter((v) => v.role === 'ADMIN');
			case 'MANAGER':
				return volunteers.filter((v) => v.role === 'MANAGER');
			case 'COMMUNICATION':
				return volunteers.filter((v) => v.role === 'COMMUNICATION');
			case 'ACTIVE':
				return volunteers.filter((v) => v.actif === 'ACTIVE');
			case 'BREAK':
				return volunteers.filter((v) => v.actif === 'BREAK');
			case 'STOP':
				return volunteers.filter((v) => v.actif === 'STOP');
			default:
				return volunteers;
		}
	});

	const paginatedVolunteers = $derived(
		filteredVolunteers().slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	function onTabChange(tab: string) {
		currentTab = tab;
		currentPage = 1;
	}
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
				<Card.Title class="text-2xl font-bold">Bénévoles</Card.Title>
				<Button size="sm" onclick={() => (newCatOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouveau bénévole
				</Button>
			</Card.Header>
			<Card.Content>
				<Tabs.Root value={currentTab} onValueChange={onTabChange} class="min-w-full">
					<Tabs.Root value={currentTab} onValueChange={onTabChange} class="min-w-full">
						<Tabs.List class="bg-muted grid grid-cols-4 gap-1 p-1">
							<!-- 👇 RÔLE HEADER CLICKABLE AVEC CYCLE -->
							<Tabs.Trigger value="ALL" class="relative">
								Tous
								{#if currentTab === 'ALL'}
									<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
								{/if}
							</Tabs.Trigger>

							<Tabs.Trigger value="ACTIVE" class="relative">
								En activité
								{#if currentTab === 'ACTIVE'}
									<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
								{/if}
							</Tabs.Trigger>

							<Tabs.Trigger value="BREAK" class="relative">
								En pause
								{#if currentTab === 'BREAK'}
									<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger value="STOP" class="relative">
								Stop
								{#if currentTab === 'STOP'}
									<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-full"></div>
								{/if}
							</Tabs.Trigger>
						</Tabs.List>

						<!-- Le reste du tableau ... -->
					</Tabs.Root>

					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Statut</Table.Head>
								<Table.Head>Nom</Table.Head>
								<Table.Head
									class="hover:bg-muted cursor-pointer transition-colors"
									onclick={handleRoleHeaderClick}
									role="button"
									tabindex="0"
								>
									Rôle
								</Table.Head>
								<Table.Head>Quartier</Table.Head>
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
							{#each paginatedVolunteers as volunteer (volunteer.id)}
								<VolunteerRow
									{volunteer}
									onclick={() => handleSelectVolunteer(volunteer.id)}
									isSelected={selectedVolunteerId === volunteer.id}
								/>
							{/each}
						</Table.Body>
					</Table.Root>

					<!-- Pagination -->
					<div class="mt-4 flex justify-center">
						<Pagination.Root
							count={filteredVolunteers().length}
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
				</Tabs.Root>
			</Card.Content>
		</Card.Root>

		<!-- Panel détail -->
		<div class="col-span-3 overflow-y-auto">
			{#if selectedVolunteer}
				<VolunteerPanel volunteer={selectedVolunteer} isAdmin={data.isAdmin} />
			{:else}
				<Card.Root class="flex h-full items-center justify-center">
					<Card.Content class="text-muted-foreground text-center">
						Sélectionnez un bénévole pour voir les détails
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</section>
</main>
