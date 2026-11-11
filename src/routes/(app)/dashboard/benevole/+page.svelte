<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { X } from '@lucide/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import VolunteerRow from '#lib/components/volunteers/VolunteerRow.svelte';
	import VolunteerPanel from '#lib/components/volunteers/VolunteerPanel.svelte';
	import NewVolunteerDialog from '#lib/components/volunteers/NewVolunteerDialog.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { VOLUNTEER_ROLE_OPTIONS, VOLUNTEER_STATUS_OPTIONS } from '#lib/constants/volunteer.js';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';

	const { data } = $props();

	const volunteers = $derived(data.volunteers);
	const stats = $derived(data.stats);

	// true à partir de 1024 px. Le 2ᵉ argument est la valeur utilisée côté serveur (SSR).
	const isDesktop = new MediaQuery('min-width: 1024px', true);

	let selectedVolunteerId = $state<string | null>(null);
	const selectedVolunteer = $derived(volunteers.find((v) => v.id === selectedVolunteerId) ?? null);
	const selectedVolunteerName = $derived(
		selectedVolunteer
			? `${selectedVolunteer.profil.firstName} ${selectedVolunteer.profil.lastName}`
			: 'Détail du bénévole'
	);

	// Tiroir du détail : utilisé uniquement sur mobile
	let mobilePanelOpen = $state(false);

	let searchQuery = $state('');
	let actifFilter = $state('ACTIVE');
	let roleFilter = $state('');
	let newVolunteerOpen = $state(false);

	function handleSelectVolunteer(volunteerId: string) {
		selectedVolunteerId = volunteerId;
		if (!isDesktop.current) mobilePanelOpen = true;
	}

	function clearFilters() {
		actifFilter = 'ACTIVE';
		roleFilter = '';
		searchQuery = '';
	}

	const statCards = $derived([
		{
			label: "Bénévoles dans l'association",
			value: stats.totalVolunteers,
			icon: 'users',
			theme: 'cats'
		},
		{ label: 'Profils incomplets', value: stats.incompleteProfiles, icon: 'alert', theme: 'dog' },
		{ label: 'En activité', value: stats.activeVolunteers, icon: 'CirclePlay', theme: 'activ' },
		{ label: 'En pause', value: stats.pausedVolunteers, icon: 'CirclePause', theme: 'break' },
		{
			label: 'Recrutés cette année',
			value: stats.recruitedThisYear,
			icon: 'Handshake',
			theme: 'adoptions'
		}
	]);

	const filteredVolunteers = $derived.by(() => {
		let filtered = volunteers;

		if (actifFilter) filtered = filtered.filter((v) => v.actif === actifFilter);
		if (roleFilter) filtered = filtered.filter((v) => v.role === roleFilter);

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((v) => {
				const fullName = `${v.profil.firstName ?? ''} ${v.profil.lastName ?? ''}`.toLowerCase();
				return fullName.includes(query);
			});
		}

		return filtered;
	});

	// En-têtes cohérents avec les données affichées par VolunteerRow
	const countColumns = [
		{ icon: 'cat', theme: 'cats', title: 'Chats suivis' },
		{ icon: 'clipboard', theme: 'pending', title: 'Formulaires assignés' }
	];
</script>

<svelte:head>
	<title>Bénévoles – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
			{#each statCards as card, i (card.label)}
				<!-- La 1ʳᵉ carte (le total) prend toute la largeur sur téléphone : 1 + 2 + 2 -->
				<Card.Root class="gap-2 py-4 {i === 0 ? 'col-span-2 sm:col-span-1' : ''}">
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

		<!-- ================= LISTE + DÉTAIL ================= -->
		<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
			<!-- LISTE : sur PC, sa hauteur suit celle du panneau (avec une hauteur minimale) -->
			<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
				<Card.Root class="flex flex-col lg:absolute lg:inset-0">
					<Card.Header class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2">
						<Card.Title class="text-xl font-bold sm:text-2xl">
							Bénévoles
							<span class="text-base font-normal text-muted-foreground">
								({filteredVolunteers.length})
							</span>
						</Card.Title>
						<Button class="rounded-2xl" size="sm" onclick={() => (newVolunteerOpen = true)}>
							<Icon name="plus" class="h-4 w-4" />
							<span class="hidden sm:inline">Nouveau bénévole</span>
							<span class="sm:hidden">Ajouter</span>
						</Button>
					</Card.Header>

					<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
						<!-- Filtres -->
						<TableToolbar
							bind:search={searchQuery}
							searchPlaceholder="Chercher un bénévole…"
							searchLabel="Chercher un bénévole par nom"
							onReset={clearFilters}
						>
							{#snippet filters()}
								<SelectField
									id="volunteer-status-filter"
									label=""
									options={VOLUNTEER_STATUS_OPTIONS}
									bind:value={actifFilter}
									placeholder="Statut"
									class="w-32"
								/>
								<SelectField
									id="volunteer-role-filter"
									label=""
									options={VOLUNTEER_ROLE_OPTIONS}
									bind:value={roleFilter}
									placeholder="Rôle"
									class="w-32"
								/>
							{/snippet}
						</TableToolbar>

						<!-- Tableau : prend l'espace restant et défile dans la carte sur PC -->
						<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
							<Table.Root containerClass="overflow-visible">
								<Table.Header
									class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
								>
									<Table.Row>
										<Table.Head>Nom</Table.Head>
										<Table.Head>Rôle</Table.Head>
										<Table.Head class="hidden sm:table-cell">Quartier</Table.Head>
										{#each countColumns as col (col.title)}
											<Table.Head title={col.title} class="hidden text-center sm:table-cell">
												<div class="flex justify-center text-white">
													<Icon
														name={col.icon}
														withWrapper={true}
														wrapperClass="flex h-8 w-8 items-center justify-center rounded-lg"
														style="background: {getGradientStyle(col.theme)}"
														iconClass="h-5 w-5"
													/>
												</div>
											</Table.Head>
										{/each}
										<!-- Colonne de la flèche : mobile uniquement -->
										<Table.Head class="w-8 sm:hidden">
											<span class="sr-only">Ouvrir</span>
										</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each filteredVolunteers as volunteer (volunteer.id)}
										<VolunteerRow
											{volunteer}
											onclick={() => handleSelectVolunteer(volunteer.id)}
											isSelected={selectedVolunteerId === volunteer.id}
										/>
									{:else}
										<Table.Row>
											<Table.Cell colspan={6} class="text-muted-foreground py-10 text-center">
												Aucun bénévole ne correspond à ces filtres.
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- DÉTAIL : à côté de la liste, sur ordinateur uniquement -->
			{#if isDesktop.current}
				<div class="min-w-0 lg:col-span-3">
					<VolunteerPanel volunteer={selectedVolunteer} isAdmin={data.isAdmin} />
				</div>
			{/if}
		</section>
	</div>
</main>

<!-- DÉTAIL : plein écran, sur mobile uniquement -->
{#if !isDesktop.current}
	<Sheet.Root bind:open={mobilePanelOpen}>
		<Sheet.Content
			side="right"
			showCloseButton={false}
			class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
		>
			<!-- Barre du haut : reste visible pendant le défilement -->
			<header class="sticky top-0 z-10 flex items-center gap-2 bg-card/95 px-4 py-2 backdrop-blur">
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">
					{selectedVolunteerName}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				<VolunteerPanel volunteer={selectedVolunteer} isAdmin={data.isAdmin} />
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

<NewVolunteerDialog
	bind:open={newVolunteerOpen}
	onCancel={() => {
		newVolunteerOpen = false;
	}}
/>
