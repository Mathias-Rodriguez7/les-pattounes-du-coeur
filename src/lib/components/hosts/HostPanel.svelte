<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Pencil } from '@lucide/svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { truncate } from '$lib/utils/string';
	import HostEditForm from './HostEditForm.svelte';
	import type { HostWithRelations } from '$lib/types/host';

	const { host, isAdmin = false }: { host: HostWithRelations | null; isAdmin?: boolean } = $props();

	let isEditing = $state(false);
	let currentPage = $state(1);
	let isSaving = $state(false);

	let editData = $state({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		postalCode: '',
		numberOfCats: 0,
		notes: ''
	});

	const PAGE_SIZE = 10;

	const catList = $derived(
		host?.placements?.map((placement) => ({
			catId: placement.catId,
			catName: placement.cat.name,
			catStatus: placement.cat.status,
			arrivalDate: placement.startDate,
			placementId: placement.id
		})) ?? []
	);

	const statusColors = {
		AVAILABLE: 'bg-emerald-100 text-emerald-800',
		ADOPTED: 'bg-rose-100 text-rose-800',
		SOCIALIZE: 'bg-sky-100 text-sky-800',
		FREE: 'bg-orange-100 text-orange-800'
	};

	const getBadgeClass = (status: string) =>
		statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';

	const paginatedCats = $derived(
		catList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	const startEditing = () => {
		if (!host) return;

		editData = {
			firstName: host.profil.firstName,
			lastName: host.profil.lastName,
			email: host.profil.email,
			phone: host.profil.phone || '',
			address: host.profil.address || '',
			city: host.profil.city || '',
			postalCode: host.profil.postalCode || '',
			numberOfCats: host.numberOfCats || 0,
			notes: host.notes || ''
		};
		isEditing = true;
	};

	const handleSuccessfulSave = () => {
		if (!host) return;

		console.log("✅ Famille d'accueil mise à jour avec succès");
		host.profil.firstName = editData.firstName;
		host.profil.lastName = editData.lastName;
		host.profil.email = editData.email;
		host.profil.phone = editData.phone;
		host.profil.address = editData.address;
		host.profil.city = editData.city;
		host.profil.postalCode = editData.postalCode;
		host.numberOfCats = editData.numberOfCats;
		host.notes = editData.notes;

		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};
</script>

{#if host}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER AFFICHAGE ===== -->
			<Card.Header>
				<div class="flex justify-between">
					<div class="flex gap-6">
						<div class="flex items-center gap-6">
							<div class="grid grid-cols-1 gap-2">
								<Icon
									name="house"
									withWrapper={true}
									wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle('fa')}"
									iconClass="h-5 w-5"
								/>
								<span class="text-muted-foreground text-xs">Famille d'accueil</span>
							</div>
							<div class="flex-1">
								<Card.Title class="text-xl">
									{host.profil.firstName}
									{host.profil.lastName}
								</Card.Title>

								<div class="mt-2 flex items-center gap-2">
									<Badge class="bg-blue-100 text-blue-800">
										{host.numberOfCats || 0} chat{host.numberOfCats !== 1 ? 's' : ''}
									</Badge>
								</div>
							</div>
						</div>
						<!-- Contact Info avec icones -->
						<div class="flex gap-6">
							<!-- Email -->
							<div class="flex items-end gap-2">
								<Icon name="mail" iconClass="h-6 w-6 text-muted-foreground" />
								<span class="text-muted-foreground text-sm">{host.profil.email}</span>
							</div>

							<!-- Phone -->
							<div class="flex items-end gap-2">
								<Icon name="phone" iconClass="h-6 w-6 text-muted-foreground" />
								<span class="text-muted-foreground text-sm">{host.profil.phone || '-'}</span>
							</div>
						</div>
					</div>
					<!-- Boutons d'édition -->
					<div>
						{#if isAdmin}
							<Button variant="ghost" size="icon" onclick={startEditing}>
								<Pencil class="h-5 w-5" />
							</Button>
						{/if}
					</div>
				</div>
			</Card.Header>
		{:else}
			<!-- ===== HEADER ÉDITION ===== -->
			<Card.Header>
				<h3 class="text-2xl font-bold">Éditer la famille d'accueil</h3>
			</Card.Header>
		{/if}

		<!-- Contenu principal -->
		<Card.Content class="grid grid-cols-1 gap-6">
			<Separator />
			<div class="space-y-6">
				{#if !isEditing}
					<!-- ===== MODE AFFICHAGE INFOS GÉOGRAPHIQUES ===== -->
					<div class="grid grid-cols-3 gap-x-6 gap-y-2">
						<div>
							<p class="text-muted-foreground text-sm font-medium">Adresse</p>
							<p class="text-sm font-semibold">{host.profil.address || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Ville</p>
							<p class="text-sm font-semibold">{host.profil.city || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Code postal</p>
							<p class="text-sm font-semibold">{host.profil.postalCode || '-'}</p>
						</div>
					</div>

					{#if host.notes}
						<div>
							<p class="text-muted-foreground text-sm font-medium">Notes</p>
							<p class="text-sm">{host.notes}</p>
						</div>
					{/if}
				{:else}
					<!-- ===== MODE ÉDITION ===== -->
					<HostEditForm
						bind:editData
						hostId={host.id}
						onSuccess={handleSuccessfulSave}
						onCancel={handleCancelEdit}
						{isSaving}
					/>
				{/if}
			</div>

			{#if !isEditing}
				<Separator />

				<!-- Chats en accueil -->
				<div>
					<h4 class="mb-4 text-base font-semibold text-gray-900">
						Chats en accueil ({catList.length})
					</h4>
					<Table.Root class="min-h-125">
						<Table.Header>
							<Table.Row>
								<Table.Head>Chat</Table.Head>
								<Table.Head>Statut</Table.Head>
								<Table.Head>Arrivée</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if paginatedCats.length > 0}
								{#each paginatedCats as cat (cat.placementId)}
									<Table.Row>
										<Table.Cell class="font-semibold text-gray-900">{cat.catName}</Table.Cell>
										<Table.Cell>
											<Badge class={getBadgeClass(cat.catStatus)}>
												{truncate(cat.catStatus, 5)}
											</Badge>
										</Table.Cell>
										<Table.Cell class="text-sm text-gray-600">
											{new Date(cat.arrivalDate).toLocaleDateString('fr-FR')}
										</Table.Cell>
									</Table.Row>
								{/each}
							{:else}
								<Table.Row>
									<Table.Cell class="col-span-3 text-center text-gray-400">
										Aucun chat en accueil
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>

					<!-- Pagination -->
					{#if catList.length > PAGE_SIZE}
						<div class="mt-4 flex justify-center">
							<Pagination.Root count={catList.length} perPage={PAGE_SIZE} bind:page={currentPage}>
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
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="house" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une famille d'accueil</p>
		</Card.Content>
	</Card.Root>
{/if}
