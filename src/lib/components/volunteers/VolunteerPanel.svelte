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
	import { truncate } from '$lib/utils/string';
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
	import { VOLUNTEER_SECTION_CONFIG } from '$lib/constants/volunteer';
	import type { ColabActivity, VolunteerRole, Form } from '@prisma/client';
	import SectionCard from '../cards/SectionCard.svelte';
	import { formatDate } from '$lib/utils/date';

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
		if (!volunteer) return;

		// Met à jour les données du volunteer avec les changements
		volunteer.profil.firstName = editData.firstName;
		volunteer.profil.lastName = editData.lastName;
		volunteer.profil.email = editData.email;
		volunteer.profil.phone = editData.phone;
		volunteer.profil.district = editData.district;
		volunteer.profil.address = editData.address;
		volunteer.profil.city = editData.city;
		volunteer.profil.postalCode = editData.postalCode;
		volunteer.actif = editData.actif;
		volunteer.role = editData.role;

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

	const formCounts = $derived.by(() => {
		const counts: Record<FormType, number> = {
			ADOPTION: 0,
			VOLUNTEER: 0,
			HOST: 0,
			COLAB: 0,
			ALERT: 0,
			OTHER: 0
		};

		const forms = volunteer?.assignedForms ?? [];
		FORM_TYPES.forEach((type) => {
			counts[type] = forms.filter((f: Form) => (f.type as FormType) === type).length;
		});

		return counts;
	});

	const getBadgeClass = (status: string) =>
		statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';

	const roleColors: Record<string, string> = {
		ADMIN: 'bg-red-100 text-red-800',
		MANAGER: 'bg-blue-100 text-blue-800',
		COMMUNICATION: 'bg-purple-100 text-purple-800'
	};
</script>

{#if volunteer}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER AFFICHAGE ===== -->
			<Card.Header>
				<div class="flex h-25 justify-between">
					<div class="flex gap-8">
						<!-- Status Icon -->
						<div class="flex flex-col items-center justify-around">
							{#key volunteer?.actif}
								<Icon
									name={currentStatus.icon}
									withWrapper={true}
									wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle(currentStatus.theme)}"
									iconClass="h-5 w-5"
								/>
							{/key}
							<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'}>
								{truncate(volunteer.role, 5)}
							</Badge>
						</div>

						<div class="flex flex-col justify-around">
							<Card.Title class="text-2xl">{fullName}</Card.Title>

							<div class="flex gap-4">
								<Card.Description class="text-xl">
									{formatAge(volunteer.profil.birthDate)}
								</Card.Description>

								{#if volunteer.profil.host}
									<div title="Ce bénévole est aussi FA">
										<Icon name="star" iconClass="h-6 w-6 text-amber-500 fill-amber-500" />
									</div>
								{/if}
							</div>
						</div>
						<!-- PAUSE / BREAK -->
						<div>
							{#if volunteer.actif === 'BREAK' && (volunteer.breakStart || volunteer.breakEnd)}
								<SectionCard
									icon={VOLUNTEER_SECTION_CONFIG.pause.icon}
									title={VOLUNTEER_SECTION_CONFIG.pause.label}
									color={VOLUNTEER_SECTION_CONFIG.pause.color}
								>
									<div class="ml-6 grid gap-4">
										<div class="text-sm">
											{#if volunteer.breakStart}
												<p class="font-medium text-gray-900">
													Début: {formatDate(new Date(volunteer.breakStart))}
												</p>
											{/if}
											{#if volunteer.breakEnd}
												<p class="font-medium text-gray-900">
													Fin: {formatDate(new Date(volunteer.breakEnd))}
												</p>
											{/if}
										</div>
									</div>
								</SectionCard>
							{:else}{/if}
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

			<!-- Contenu principal -->

			<Card.Content class="grid grid-cols-1 gap-6">
				<Separator />
				<section class="grid grid-cols-8 gap-4">
					<!-- Experience -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.Experience.icon}
						title={VOLUNTEER_SECTION_CONFIG.Experience.label}
						color={VOLUNTEER_SECTION_CONFIG.Experience.color}
						class="col-span-2"
					>
						<div>
							<div class="ml-6 grid gap-4">
								<!-- Nombre total de chats gérés -->
								<div class="flex justify-between">
									<span class="text-muted-foreground text-xs font-medium">Chats gérés</span>
									<Badge class="bg-blue-100 text-sm font-bold text-blue-800">
										{catList.length}
									</Badge>
								</div>

								<!-- Nombre de chats adoptés -->
								<div class="flex justify-between">
									<span class="text-muted-foreground text-xs font-medium">Adoptions</span>
									<Badge class="bg-green-100 text-sm font-bold text-green-800">
										{adoptedCatsCount}
									</Badge>
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- Adresse -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.address.icon}
						title={VOLUNTEER_SECTION_CONFIG.address.label}
						color={VOLUNTEER_SECTION_CONFIG.address.color}
						class="col-span-3"
					>
						<div class="grid gap-4">
							<div class="col-span-2 ml-6 gap-4 space-y-2 text-sm">
								<div>
									<p class="text-muted-foreground font-medium">Rue</p>
									<p class="font-medium text-gray-900">{volunteer.profil.address || '—'}</p>
								</div>
								<div class="flex gap-4">
									<div>
										<p class="text-muted-foreground font-medium">Ville</p>
										<p class="font-medium text-gray-900">{volunteer.profil.city || '—'}</p>
									</div>
									<div>
										<p class="text-muted-foreground font-medium">CP</p>
										<p class="font-medium text-gray-900">{volunteer.profil.postalCode || '—'}</p>
									</div>

									<div>
										<p class="text-muted-foreground font-medium">Quartier</p>
										<Badge variant="secondary" class="mt-1 h-fit text-xs">{location}</Badge>
									</div>
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- Contact -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
						title={VOLUNTEER_SECTION_CONFIG.contact.label}
						color={VOLUNTEER_SECTION_CONFIG.contact.color}
						class="col-span-3"
					>
						<div class="ml-6 grid gap-4">
							<div class="flex items-center gap-2">
								<Icon name="phone" iconClass="h-5 w-5 text-muted-foreground" />
								<a
									href="tel:{volunteer.profil.phone}"
									class="text-sm text-blue-600 hover:underline"
								>
									{volunteer.profil.phone || '—'}
								</a>
							</div>

							<div class="flex items-center gap-2">
								<Icon name="mail" iconClass="h-5 w-5 text-muted-foreground" />
								<a
									href="mailto:{volunteer.profil.email}"
									class="truncate text-sm text-blue-600 hover:underline"
									title={volunteer.profil.email}
								>
									{truncate(volunteer.profil.email, 28)}
								</a>
							</div>
						</div>
					</SectionCard>
				</section>
				<Separator />

				<!-- Chats et Formulaires -->
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
					<!-- CHATS EN GESTION -->
					<div class="col-span-2 grid">
						<SectionCard
							icon={VOLUNTEER_SECTION_CONFIG.cats.icon}
							title={VOLUNTEER_SECTION_CONFIG.cats.label}
							color={VOLUNTEER_SECTION_CONFIG.cats.color}
						>
							<Table.Root class="min-h-125">
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
													{truncate(statusLabel[cat.catStatus] ?? cat.catStatus, 5)}
												</Badge>
											</Table.Cell>
											<Table.Cell>
												{#if cat.hasPlacement}
													<span class="font-semibold text-gray-900">
														{cat.hostFirstName}
														{cat.hostLastName}
													</span>
												{:else}
													<span class="text-gray-400">-</span>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>

							<!-- Pagination -->
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
						</SectionCard>
					</div>

					<!-- FORMULAIRES ASSIGNÉS -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.forms.icon}
						title={VOLUNTEER_SECTION_CONFIG.forms.label}
						color={VOLUNTEER_SECTION_CONFIG.forms.color}
					>
						<div class="space-y-2">
							{#each FORM_TYPES as type (type)}
								<div
									class="flex items-center justify-between rounded-xl border p-4 transition hover:shadow-md"
								>
									<div class="flex items-center gap-3">
										<Icon
											name={FORM_TYPE_CONFIG[type].icon}
											withWrapper={true}
											wrapperClass="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-white"
											style="background: {getGradientStyle(FORM_TYPE_CONFIG[type].theme)}"
											iconClass="h-3 w-3"
										/>
										<span class="font-medium text-gray-900">{FORM_TYPE_LABELS[type]}</span>
									</div>
									<span
										class={`text-sm font-semibold ${formCounts[type] > 0 ? 'text-teal-600' : 'text-gray-400'}`}
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
				<!-- ===== MODE ÉDITION ===== -->
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
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="user" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un bénévole</p>
		</Card.Content>
	</Card.Root>
{/if}
