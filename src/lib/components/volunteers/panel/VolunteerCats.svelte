<script lang="ts">
	import EntityLink from '#lib/components/links/EntityLink.svelte';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Pagination from '#lib/components/ui/pagination/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { statusLabel } from '#lib/utils/catHelpers.ts';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	// Les chats suivis par un bénévole, 10 par page
	interface Props {
		volunteer: VolunteerWithRelations;
	}

	let { volunteer }: Props = $props();

	const PAGE_SIZE = 10;
	let currentPage = $state(1);

	// Une ligne par chat : son statut, et la FA chez qui il est placé (s'il l'est).
	// Un chat adopté reste suivi par la bénévole, mais il est rangé dans l'historique
	const catList = $derived(
		volunteer.cats
			.filter((catVolunteer) => catVolunteer.cat.status !== 'ADOPTED')
			.map((catVolunteer) => {
				const placement = catVolunteer.cat.placements?.[0];
				return {
					catId: catVolunteer.catId,
					catName: catVolunteer.cat.name,
					catStatus: catVolunteer.cat.status,
					hostFirstName: placement?.host.profil.firstName || null,
					hostLastName: placement?.host.profil.lastName || null,
					placementId: placement?.id || null,
					hostId: placement?.hostId ?? null,
					hasPlacement: !!placement
				};
			})
	);

	const paginatedCats = $derived(
		catList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	const statusColors = {
		AVAILABLE: 'bg-emerald-100 text-emerald-800',
		ADOPTED: 'bg-rose-100 text-rose-800',
		SOCIALIZE: 'bg-sky-100 text-sky-800',
		FREE: 'bg-orange-100 text-orange-800'
	};

	const getBadgeClass = (status: string) =>
		statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
</script>

<SectionCard
	icon={VOLUNTEER_SECTION_CONFIG.cats.icon}
	title={VOLUNTEER_SECTION_CONFIG.cats.label}
	color={VOLUNTEER_SECTION_CONFIG.cats.color}
>
	{#if catList.length === 0}
		<p class="py-6 text-center text-sm text-muted-foreground">Aucun chat suivi pour le moment.</p>
	{:else}
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Chat</Table.Head>
						<Table.Head>Statut</Table.Head>
						<Table.Head>FA</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each paginatedCats as cat (cat.catId)}
						<Table.Row>
							<Table.Cell class="font-semibold text-gray-900">
								<EntityLink kind="cat" id={cat.catId}>{cat.catName}</EntityLink>
							</Table.Cell>
							<Table.Cell>
								<Badge class={getBadgeClass(cat.catStatus)}>
									{statusLabel[cat.catStatus] ?? cat.catStatus}
								</Badge>
							</Table.Cell>
							<Table.Cell class="max-w-32 truncate">
								{#if cat.hasPlacement}
									<EntityLink kind="host" id={cat.hostId} class="font-semibold text-gray-900">
										{cat.hostFirstName}
										{cat.hostLastName}
									</EntityLink>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Pagination : seulement s'il y a plus d'une page -->
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
	{/if}
</SectionCard>
