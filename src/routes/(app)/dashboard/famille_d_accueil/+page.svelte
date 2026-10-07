<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import HostRow from '$lib/components/hosts/HostRow.svelte';
	import HostPanel from '$lib/components/hosts/HostPanel.svelte';
	import NewHostDialog from '$lib/components/hosts/NewHostDialog.svelte';
	import {
		HOST_ACTIF_OPTIONS,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS
	} from '$lib/constants/host.js';

	const { data } = $props();

	let hosts = $derived(data.hosts);
	const stats = $derived(data.stats);

	let selectedHostId = $state<string | null>(null);
	let selectedHost = $derived(hosts.find((h) => h.id === selectedHostId) ?? null);

	let newHostOpen = $state(false); // ← manquait

	let typeFilter = $state('');
	let actifFilter = $state('ACTIVE');
	let searchQuery = $state('');
	let healFilter = $state('');
	let socializeFilter = $state('');
	let babyFilter = $state('');

	const handleSelectHost = (hostId: string) => {
		selectedHostId = hostId;
	};

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
		{ icon: 'syringe', theme: 'activ', title: 'Soin' },
		{ icon: 'cat', theme: 'cats', title: 'Chat placé' },
		{ icon: 'trees', theme: 'fa', title: 'Exterieur' }
	];

	const filteredHosts = $derived.by(() => {
		let filtered = hosts; // ← scopedHost n'existe pas

		if (typeFilter) {
			filtered = filtered.filter((h) => h.type === typeFilter);
		}

		if (actifFilter) {
			filtered = filtered.filter((h) => h.actif === actifFilter);
		}

		if (healFilter) {
			filtered = filtered.filter((h) => h.heal === healFilter);
		}

		if (socializeFilter) {
			filtered = filtered.filter((h) => h.socialize === socializeFilter);
		}

		if (babyFilter) {
			filtered = filtered.filter((h) => h.babyFeeding === babyFilter);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((h) => {
				const firstName = h.profil.firstName?.toLowerCase() ?? '';
				const lastName = h.profil.lastName?.toLowerCase() ?? '';
				const fullName = `${firstName} ${lastName}`;

				return fullName.includes(query);
			});
		}

		return filtered; // ← manquait, + accolades en trop supprimées
	});

	function clearFilters() {
		typeFilter = '';
		actifFilter = 'ACTIVE';
		healFilter = '';
		socializeFilter = '';
		babyFilter = '';
		searchQuery = '';
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
				<Card.Title class="text-2xl font-bold">Familles d'accueil</Card.Title>
				<Button class="rounded-2xl" size="sm" onclick={() => (newHostOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouvelle FA
				</Button>
			</Card.Header>
			<Card.Content>
				<!-- Recherche + filtre -->
				<div class="grid items-center gap-2">
					<div class="flex flex-wrap gap-2">
						<SelectField
							id="host-type-filter"
							label=""
							options={HOST_TYPE_OPTIONS}
							bind:value={typeFilter}
							placeholder="Type"
							class="w-40"
						/>

						<SelectField
							id="host-type-filter"
							label=""
							options={HOST_ACTIF_OPTIONS}
							bind:value={actifFilter}
							placeholder="Status"
							class="w-40"
						/>

						<SelectField
							id="host-type-filter"
							label=""
							options={HOST_HEAL_OPTIONS}
							bind:value={healFilter}
							placeholder="Soin"
							class="w-40"
						/>

						<SelectField
							id="host-type-filter"
							label=""
							options={HOST_SOCIALIZE_OPTIONS}
							bind:value={socializeFilter}
							placeholder="Socia"
							class="w-40"
						/>

						<SelectField
							id="host-type-filter"
							label=""
							options={HOST_BABY_FEEDING_OPTIONS}
							bind:value={babyFilter}
							placeholder="Bib"
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
							<Input bind:value={searchQuery} placeholder="Rechercher une FA..." class="pl-9" />
						</div>
					</div>
				</div>

				<!-- Tableau scrollable -->
				<div class="max-h-[60vh] overflow-y-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Nom</Table.Head>
								<Table.Head>Rôle</Table.Head>
								<Table.Head>Animaux</Table.Head>
								<Table.Head>Socia</Table.Head>
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
							{#each filteredHosts as host (host.id)}
								<HostRow
									{host}
									onclick={() => handleSelectHost(host.id)}
									isSelected={selectedHostId === host.id}
								/>
							{:else}
								<Table.Row>
									<Table.Cell
										colspan={4 + compatibilityIcons.length}
										class="text-muted-foreground py-8 text-center"
									>
										Aucune famille d'accueil trouvée
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
			<HostPanel host={selectedHost} isAdmin={data.isAdmin} />
		</div>
	</section>

	<NewHostDialog
		bind:open={newHostOpen}
		onCancel={() => {
			newHostOpen = false;
		}}
	/>
</main>
