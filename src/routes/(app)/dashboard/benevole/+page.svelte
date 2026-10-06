<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import VolunteerRow from '$lib/components/volunteers/VolunteerRow.svelte';
	import VolunteerPanel from '$lib/components/volunteers/VolunteerPanel.svelte';
	import NewVolunteerDialog from '$lib/components/volunteers/NewVolunteerDialog.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { VOLUNTEER_ROLE_OPTIONS, VOLUNTEER_STATUS_OPTIONS } from '$lib/constants/volunteer.js';

	const { data } = $props();

	let volunteers = $derived(data.volunteers);
	const stats = $derived(data.stats);

	let selectedVolunteerId = $state<string | null>(null);
	let selectedVolunteer = $derived(volunteers.find((v) => v.id === selectedVolunteerId) ?? null);

	let searchQuery = $state('');

	let actifFilter = $state('ACTIVE');
	let roleFilter = $state('');

	const handleSelectVolunteer = (volunteerId: string) => {
		selectedVolunteerId = volunteerId;
	};

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

	const filteredVolunteer = $derived.by(() => {
		let filtered = volunteers;

		if (actifFilter) {
			filtered = filtered.filter((v) => v.actif === actifFilter);
		}

		if (roleFilter) {
			filtered = filtered.filter((v) => v.role === roleFilter);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((v) => {
				const firstName = v.profil.firstName?.toLowerCase() ?? '';
				const lastName = v.profil.lastName?.toLowerCase() ?? '';
				const fullName = `${firstName} ${lastName}`;

				return fullName.includes(query);
			});
		}

		return filtered;
	});

	const compatibilityIcons = [
		{ icon: 'cat', theme: 'cats', title: 'Compatible avec les chats' },
		{ icon: 'news', theme: 'fa', title: 'Nécessite un jardin' }
	];

	function clearFilters() {
		actifFilter = 'ACTIVE';
		roleFilter = '';
		searchQuery = '';
	}

	let newVolunteerOpen = $state(false);
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
				<Button class="rounded-2xl" size="sm" onclick={() => (newVolunteerOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouveau bénévole
				</Button>
			</Card.Header>
			<Card.Content>
				<!-- Barre de filtres -->
				<div class="grid items-center gap-2">
					<div class="flex flex-wrap gap-2">
						<!-- Status -->
						<SelectField
							id="host-type-filter"
							label=""
							options={VOLUNTEER_STATUS_OPTIONS}
							bind:value={actifFilter}
							placeholder="Status"
							class="w-30"
						/>

						<!-- Role -->
						<SelectField
							id="host-type-filter"
							label=""
							options={VOLUNTEER_ROLE_OPTIONS}
							bind:value={roleFilter}
							placeholder="Rôle"
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
								placeholder="Chercher un chat..."
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
								<Table.Head>Nom</Table.Head>
								<Table.Head>Rôle</Table.Head>
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
							{#each filteredVolunteer as volunteer (volunteer.id)}
								<VolunteerRow
									{volunteer}
									onclick={() => handleSelectVolunteer(volunteer.id)}
									isSelected={selectedVolunteerId === volunteer.id}
								/>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Panel détail -->
		<div class="col-span-3 overflow-y-auto">
			<VolunteerPanel volunteer={selectedVolunteer} isAdmin={data.isAdmin} />
		</div>
	</section>
	<NewVolunteerDialog
		bind:open={newVolunteerOpen}
		onCancel={() => {
			newVolunteerOpen = false;
		}}
	/>
</main>
