<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Pencil } from '@lucide/svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { statusLabel } from '$lib/utils/catHelpers';
	import { Badge } from '$lib/components/ui/badge';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import VolunteerEditForm from './VolunteerEditForm.svelte';
	import { formatAge } from '$lib/utils/age';
	import {
		type VolunteerWithRelations,
		type VolunteerEditData,
		type FormType,
		type CatVolunteerWithRelations,
		FORM_TYPE_CONFIG,
		FORM_TYPE_LABELS,
		FORM_TYPES,
		STATUS_CONFIG
	} from '$lib/types/';
	import type { ColabActivity, VolunteerRole, Form } from '@prisma/client';
	import SectionCard from '../cards/SectionCard.svelte';
	import { formatDate } from '$lib/utils/date';
	import {
		VOLUNTEER_SECTION_CONFIG,
		VOLUNTEER_ROLE_OPTIONS,
		roleColors
	} from '$lib/constants/volunteer';

	const {
		volunteer,
		isAdmin = false
	}: { volunteer: VolunteerWithRelations | null; isAdmin?: boolean } = $props();

	let isEditing = $state(false);
	let currentPage = $state(1);

	let editData = $state<VolunteerEditData>({
		firstName: '',
		lastName: '',
		birthDate: new Date(),
		email: '',
		phone: '',
		district: '',
		address: '',
		city: '',
		postalCode: '',

		// Volunteer spécifiques
		actif: 'ACTIVE' as ColabActivity,
		role: 'MANAGER' as VolunteerRole,
		breakStart: null,
		breakEnd: null
	});

	const startEditing = () => {
		if (!volunteer) return;
		editData = {
			firstName: volunteer.profil.firstName,
			lastName: volunteer.profil.lastName,
			birthDate: volunteer.profil.birthDate ? new Date(volunteer.profil.birthDate) : new Date(),
			email: volunteer.profil.email,
			phone: volunteer.profil.phone || '',
			district: volunteer.profil.district || '',
			address: volunteer.profil.address || '',
			city: volunteer.profil.city || '',
			postalCode: volunteer.profil.postalCode || '',
			actif: volunteer.actif || 'ACTIVE',
			breakStart: volunteer.breakStart ? new Date(volunteer.breakStart) : null,
			breakEnd: volunteer.breakEnd ? new Date(volunteer.breakEnd) : null,
			role: volunteer.role
		};

		isEditing = true;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	const handleSuccessfulSave = () => {
		// VolunteerEditForm appelle update() : les données sont rechargées depuis le serveur.
		// (Avant, on recopiait les champs à la main dans `volunteer` : c'est modifier une prop,
		// et les données affichées pouvaient différer de ce qui était enregistré)
		isEditing = false;
	};

	const PAGE_SIZE = 10;

	const catList = $derived(
		volunteer?.cats?.map((catVolunteer: CatVolunteerWithRelations) => {
			const placement = catVolunteer.cat.placements?.[0];
			return {
				catId: catVolunteer.catId,
				catName: catVolunteer.cat.name,
				catStatus: catVolunteer.cat.status,
				hostFirstName: placement?.host.profil.firstName || null,
				hostLastName: placement?.host.profil.lastName || null,
				placementId: placement?.id || null,
				hasPlacement: !!placement
			};
		}) ?? []
	);

	const adoptedCatsCount = $derived(
		volunteer?.cats?.filter(
			(catVolunteer: CatVolunteerWithRelations) => catVolunteer.cat.status === 'ADOPTED'
		).length ?? 0
	);

	const fullName = $derived(
		volunteer ? `${volunteer.profil.firstName} ${volunteer.profil.lastName}` : ''
	);

	const location = $derived(
		volunteer?.profil.district
			? DISTRICT_LABELS[volunteer.profil.district as keyof typeof DISTRICT_LABELS]
			: volunteer?.profil.city || '—'
	);

	const paginatedCats = $derived(
		catList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	const currentStatus = $derived(
		volunteer?.actif && volunteer.actif in STATUS_CONFIG
			? STATUS_CONFIG[volunteer.actif]
			: STATUS_CONFIG.ACTIVE
	);

	const statusColors = {
		AVAILABLE: 'bg-emerald-100 text-emerald-800',
		ADOPTED: 'bg-rose-100 text-rose-800',
		SOCIALIZE: 'bg-sky-100 text-sky-800',
		FREE: 'bg-orange-100 text-orange-800'
	};

	// Un compteur par type, construit depuis FORM_TYPES : impossible d'oublier un type
	// ou d'en inventer un qui n'existe plus (comme l'ancien « ADOPTION »)
	const formCounts = $derived.by(() => {
		const forms = volunteer?.assignedForms ?? [];
		return Object.fromEntries(
			FORM_TYPES.map((type) => [type, forms.filter((f: Form) => f.type === type).length])
		) as Record<FormType, number>;
	});

	const getBadgeClass = (status: string) =>
		statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';

	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === volunteer?.role)?.label ?? volunteer?.role
	);
	const isOnBreak = $derived(
		volunteer?.actif === 'BREAK' && !!(volunteer.breakStart || volunteer.breakEnd)
	);
</script>

{#if volunteer}
	<!-- @container : les classes @md:, @3xl:… à l'intérieur se basent sur la largeur du panneau -->
	<Card.Root class="@container flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== EN-TÊTE ===== -->
			<Card.Header class="gap-4">
				<div class="flex items-start gap-4">
					<!-- Icône de statut + rôle -->
					<div class="flex shrink-0 flex-col items-center gap-2">
						{#key volunteer.actif}
							<Icon
								name={currentStatus.icon}
								withWrapper={true}
								wrapperClass="flex size-12 items-center justify-center rounded-2xl text-white shadow-lg"
								style="background: {getGradientStyle(currentStatus.theme)}"
								iconClass="size-6"
							/>
						{/key}
						<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'}>
							{roleLabel}
						</Badge>
					</div>

					<!-- Nom + âge -->
					<div class="min-w-0 flex-1">
						<Card.Title class="truncate text-xl @md:text-2xl" title={fullName}>
							{fullName}
						</Card.Title>
						<div class="mt-1 flex items-center gap-2">
							<Card.Description class="text-base @md:text-lg">
								{formatAge(volunteer.profil.birthDate)}
							</Card.Description>
							{#if volunteer.profil.host}
								<span title="Ce bénévole est aussi famille d'accueil">
									<Icon name="star" iconClass="size-5 text-amber-500 fill-amber-500" />
								</span>
							{/if}
						</div>
					</div>

					<!-- Édition -->
					{#if isAdmin}
						<Button
							variant="ghost"
							size="icon"
							class="shrink-0"
							onclick={startEditing}
							aria-label="Modifier le bénévole"
						>
							<Pencil class="size-5" />
						</Button>
					{/if}
				</div>

				<!-- Pause : bandeau pleine largeur sous l'en-tête -->
				{#if isOnBreak}
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.pause.icon}
						title={VOLUNTEER_SECTION_CONFIG.pause.label}
						color={VOLUNTEER_SECTION_CONFIG.pause.color}
					>
						<div class="ml-6 flex flex-wrap gap-x-6 gap-y-1 text-sm">
							{#if volunteer.breakStart}
								<p class="font-medium text-gray-900">
									Début : {formatDate(new Date(volunteer.breakStart))}
								</p>
							{/if}
							{#if volunteer.breakEnd}
								<p class="font-medium text-gray-900">
									Fin : {formatDate(new Date(volunteer.breakEnd))}
								</p>
							{/if}
						</div>
					</SectionCard>
				{/if}
			</Card.Header>

			<Card.Content class="grid grid-cols-1 gap-6">
				<Separator />

				<!-- ===== EXPÉRIENCE / ADRESSE / CONTACT ===== -->
				<!-- Étroit : 1 colonne | Moyen : 2 colonnes | Large : 3 blocs sur une ligne (2 + 3 + 3) -->
				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-8">
					<!-- Expérience -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
						title={VOLUNTEER_SECTION_CONFIG.experience.label}
						color={VOLUNTEER_SECTION_CONFIG.experience.color}
						class="@3xl:col-span-2"
					>
						<div class="ml-6 grid gap-3">
							<div class="flex items-center justify-between gap-2">
								<span class="text-xs font-medium text-muted-foreground">Chats gérés</span>
								<Badge class="bg-blue-100 text-sm font-bold text-blue-800">{catList.length}</Badge>
							</div>
							<div class="flex items-center justify-between gap-2">
								<span class="text-xs font-medium text-muted-foreground">Adoptions</span>
								<Badge class="bg-green-100 text-sm font-bold text-green-800">
									{adoptedCatsCount}
								</Badge>
							</div>
						</div>
					</SectionCard>

					<!-- Contact -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
						title={VOLUNTEER_SECTION_CONFIG.contact.label}
						color={VOLUNTEER_SECTION_CONFIG.contact.color}
						class="@3xl:col-span-3"
					>
						<div class="ml-6 grid min-w-0 gap-3 text-sm">
							<div class="min-w-0">
								<p class="font-medium text-muted-foreground">Téléphone</p>
								<a
									href="tel:{volunteer.profil.phone}"
									class="flex items-center gap-2 text-blue-600 hover:underline"
								>
									<Icon name="phone" iconClass="size-4 shrink-0 text-muted-foreground" />
									{volunteer.profil.phone || '—'}
								</a>
							</div>
							<div class="min-w-0">
								<p class="font-medium text-muted-foreground">Email</p>
								<a
									href="mailto:{volunteer.profil.email}"
									class="flex min-w-0 items-center gap-2 text-blue-600 hover:underline"
									title={volunteer.profil.email}
								>
									<Icon name="mail" iconClass="size-4 shrink-0 text-muted-foreground" />
									<span class="truncate">{volunteer.profil.email}</span>
								</a>
							</div>
						</div>
					</SectionCard>

					<!-- Adresse : pleine largeur en 2 colonnes, 3/8 en grand -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.address.icon}
						title={VOLUNTEER_SECTION_CONFIG.address.label}
						color={VOLUNTEER_SECTION_CONFIG.address.color}
						class="@lg:col-span-2 @3xl:col-span-3"
					>
						<div class="ml-6 space-y-2 text-sm">
							<div>
								<p class="font-medium text-muted-foreground">Rue</p>
								<p class="font-medium text-gray-900">{volunteer.profil.address || '—'}</p>
							</div>
							<div class="flex flex-wrap gap-x-6 gap-y-2">
								<div>
									<p class="font-medium text-muted-foreground">Ville</p>
									<p class="font-medium text-gray-900">{volunteer.profil.city || '—'}</p>
								</div>
								<div>
									<p class="font-medium text-muted-foreground">CP</p>
									<p class="font-medium text-gray-900">{volunteer.profil.postalCode || '—'}</p>
								</div>
								<div>
									<p class="font-medium text-muted-foreground">Quartier</p>
									<Badge variant="secondary" class="mt-1 text-xs">{location}</Badge>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- ===== CHATS + FORMULAIRES ===== -->
				<div class="grid grid-cols-1 gap-4 @3xl:grid-cols-3">
					<!-- Chats en gestion -->
					<div class="min-w-0 @3xl:col-span-2">
						<SectionCard
							icon={VOLUNTEER_SECTION_CONFIG.cats.icon}
							title={VOLUNTEER_SECTION_CONFIG.cats.label}
							color={VOLUNTEER_SECTION_CONFIG.cats.color}
						>
							{#if catList.length === 0}
								<p class="py-6 text-center text-sm text-muted-foreground">
									Aucun chat suivi pour le moment.
								</p>
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
													<Table.Cell class="font-semibold text-gray-900">{cat.catName}</Table.Cell>
													<Table.Cell>
														<Badge class={getBadgeClass(cat.catStatus)}>
															{statusLabel[cat.catStatus] ?? cat.catStatus}
														</Badge>
													</Table.Cell>
													<Table.Cell class="max-w-32 truncate">
														{#if cat.hasPlacement}
															<span class="font-semibold text-gray-900">
																{cat.hostFirstName}
																{cat.hostLastName}
															</span>
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
										<Pagination.Root
											count={catList.length}
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
								{/if}
							{/if}
						</SectionCard>
					</div>

					<!-- Formulaires assignés -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.forms.icon}
						title={VOLUNTEER_SECTION_CONFIG.forms.label}
						color={VOLUNTEER_SECTION_CONFIG.forms.color}
					>
						<!-- 2 colonnes en largeur moyenne, liste verticale à côté des chats en grand -->
						<div class="grid grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-1">
							{#each FORM_TYPES as type (type)}
								<div
									class="flex items-center justify-between gap-2 rounded-xl border p-3 transition hover:shadow-md"
								>
									<div class="flex min-w-0 items-center gap-3">
										<Icon
											name={FORM_TYPE_CONFIG[type].icon}
											withWrapper={true}
											wrapperClass="flex size-6 shrink-0 items-center justify-center rounded-lg text-white"
											style="background: {getGradientStyle(FORM_TYPE_CONFIG[type].theme)}"
											iconClass="size-3"
										/>
										<span class="truncate text-sm font-medium text-gray-900">
											{FORM_TYPE_LABELS[type]}
										</span>
									</div>
									<span
										class="text-sm font-semibold {formCounts[type] > 0
											? 'text-teal-600'
											: 'text-gray-400'}"
									>
										{formCounts[type]}
									</span>
								</div>
							{/each}
						</div>
					</SectionCard>
				</div>
			</Card.Content>
		{:else}
			<Card.Content class="grid grid-cols-1 gap-6">
				<VolunteerEditForm
					bind:editData
					volunteerId={volunteer.id}
					profileId={volunteer.profilId}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="user" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un bénévole</p>
		</Card.Content>
	</Card.Root>
{/if}
