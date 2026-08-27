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

	type FormType = 'ADOPTION' | 'VOLUNTEER' | 'HOST' | 'COLAB' | 'ALERT' | 'OTHER';

	const { volunteer, isAdmin = false } = $props();

	let isEditing = $state(false);
	let currentPage = $state(1);
	let isSaving = $state(false);

	// ===== DONNÉES ÉDITION =====
	let editData = $state({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		district: '',
		address: '',
		actif: 'ACTIVE',
		role: 'ADMIN',
		city: '',
		postalCode: ''
	});

	const PAGE_SIZE = 10;

	// ===== CONFIG STATUS =====
	const statusConfig = {
		ACTIVE: {
			icon: 'CirclePlay',
			label: 'En activité',
			theme: 'activ'
		},
		BREAK: {
			icon: 'CirclePause',
			label: 'En pause',
			theme: 'break'
		},
		STOP: {
			icon: 'CircleX',
			label: 'Arrêté',
			theme: 'stop'
		}
	};

	// Récupérer TOUS les chats + leur placement s'il existe
	const catList = $derived(
		volunteer?.cats?.map((catVolunteer) => {
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

	const statusColors = {
		AVAILABLE: 'bg-emerald-100 text-emerald-800',
		ADOPTED: 'bg-rose-100 text-rose-800',
		SOCIALIZE: 'bg-sky-100 text-sky-800',
		FREE: 'bg-orange-100 text-orange-800'
	};

	const getBadgeClass = (status: string) =>
		statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';

	// Paginer les chats
	const paginatedCats = $derived(
		catList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	// ===== STATUS COURANT =====
	const currentStatus = $derived(
		volunteer?.actif
			? statusConfig[volunteer.actif as keyof typeof statusConfig]
			: statusConfig.ACTIVE
	);

	const formCounts = $derived.by(() => {
		const types = ['ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER'];
		const counts: Record<string, number> = {};

		types.forEach((type) => {
			counts[type] = (volunteer?.assignedForms || []).filter((f) => f.type === type).length;
		});

		return counts;
	});

	const formTypeConfig = {
		ADOPTION: { icon: 'heart', theme: 'adoptions' },
		VOLUNTEER: { icon: 'users', theme: 'volunteers' },
		HOST: { icon: 'house', theme: 'fa' },
		COLAB: { icon: 'Handshake', theme: 'colab' },
		ALERT: { icon: 'alert', theme: 'stop' },
		OTHER: { icon: 'other', theme: 'other' }
	};

	const formTypeLabels: Record<FormType, string> = {
		ADOPTION: 'Adoptions',
		VOLUNTEER: 'Bénévoles',
		HOST: "Familles d'accueil",
		COLAB: 'Collaborations',
		ALERT: 'Alertes',
		OTHER: 'Autres'
	};

	// ===== GESTION ÉDITION =====
	const startEditing = () => {
		editData = {
			firstName: volunteer.profil.firstName,
			lastName: volunteer.profil.lastName,
			email: volunteer.profil.email,
			phone: volunteer.profil.phone || '',
			district: volunteer.profil.district || '',
			address: volunteer.profil.address || '',
			city: volunteer.profil.city || '',
			postalCode: volunteer.profil.postalCode || '',
			actif: volunteer.actif,
			role: volunteer.role
		};
		isEditing = true;
	};

	const saveEditing = async () => {
		isSaving = true;
		try {
			const response = await fetch(`/api/volunteers/${volunteer.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					profil: {
						firstName: editData.firstName,
						lastName: editData.lastName,
						email: editData.email,
						phone: editData.phone,
						district: editData.district,
						address: editData.address,
						city: editData.city,
						postalCode: editData.postalCode
					},
					actif: editData.actif
				})
			});

			if (response.ok) {
				volunteer.profil.firstName = editData.firstName;
				volunteer.profil.lastName = editData.lastName;
				volunteer.profil.email = editData.email;
				volunteer.profil.phone = editData.phone;
				volunteer.profil.district = editData.district;
				volunteer.profil.address = editData.address;
				volunteer.profil.city = editData.city;
				volunteer.profil.postalCode = editData.postalCode;
				volunteer.actif = editData.actif;

				isEditing = false;
			}
		} catch (error) {
			console.error('Erreur lors de la sauvegarde:', error);
		} finally {
			isSaving = false;
		}
	};

	const cancelEditing = () => {
		isEditing = false;
	};

	// Couleurs pour les rôles
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
				<div class="flex justify-between">
					<div class="flex gap-6">
						<div class="flex items-center gap-6">
							<div class="grid grid-cols-1 gap-2">
								{#key volunteer?.actif}
									<Icon
										name={currentStatus.icon}
										withWrapper={true}
										wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
										style="background: {getGradientStyle(currentStatus.theme)}"
										iconClass="h-5 w-5"
									/>
								{/key}
								<span class="text-muted-foreground text-xs">{currentStatus.label}</span>
							</div>
							<div class="flex-1">
								<Card.Title class="text-xl">
									{volunteer.profil.firstName}
									{volunteer.profil.lastName}
								</Card.Title>

								<div class="mt-2 flex items-center gap-2">
									<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'}>
										{truncate(volunteer.role, 5)}
									</Badge>
								</div>
							</div>
						</div>
						<!-- Contact Info avec icones -->
						<div class="flex gap-6">
							<!-- Email -->
							<div class="flex items-end gap-2">
								<Icon name="mail" iconClass="h-6 w-6 text-muted-foreground" />
								<span class="text-muted-foreground text-sm">{volunteer.profil.email}</span>
							</div>

							<!-- Phone -->
							<div class="flex items-end gap-2">
								<Icon name="phone" iconClass="h-6 w-6 text-muted-foreground" />
								<span class="text-muted-foreground text-sm">{volunteer.profil.phone || '-'}</span>
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
				<h3 class="text-2xl font-bold">Éditer le bénévole</h3>
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
							<p class="text-sm font-semibold">{volunteer.profil.address || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Ville</p>
							<p class="text-sm font-semibold">{volunteer.profil.city || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Code postal</p>
							<p class="text-sm font-semibold">{volunteer.profil.postalCode || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Quartier</p>
							<p class="text-sm font-semibold">
								{DISTRICT_LABELS[volunteer.profil.district as keyof typeof DISTRICT_LABELS] ||
									volunteer.profil.district ||
									'-'}
							</p>
						</div>
					</div>
				{:else}
					<!-- ===== MODE ÉDITION ===== -->
					<VolunteerEditForm
						bind:editData
						onSave={saveEditing}
						onCancel={cancelEditing}
						{isSaving}
					/>
				{/if}
			</div>

			{#if !isEditing}
				<Separator />

				<!-- Chats et Formulaires -->
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<!-- CHATS EN GESTION -->
					<div>
						<h4 class="mb-4 text-base font-semibold text-gray-900">Chats en gestion</h4>
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
					</div>

					<!-- FORMULAIRES ASSIGNÉS -->
					<div>
						<h4 class="mb-4 text-base font-semibold text-gray-900">Formulaires assignés</h4>
						<div class="space-y-2">
							{#each Object.entries(formCounts) as [type, count] (type)}
								<div
									class="flex items-center justify-between rounded-xl border p-4 transition hover:shadow-md"
								>
									<div class="flex items-center gap-3">
										<Icon
											name={formTypeConfig[type]?.icon || 'FileText'}
											withWrapper={true}
											wrapperClass="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-white"
											style="background: {getGradientStyle(formTypeConfig[type]?.theme || 'other')}"
											iconClass="h-3 w-3"
										/>
										<span class="font-medium text-gray-900">{formTypeLabels[type]}</span>
									</div>
									<span
										class={`text-sm font-semibold ${count > 0 ? 'text-teal-600' : 'text-gray-400'}`}
									>
										{count}
									</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="user" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un bénévole</p>
		</Card.Content>
	</Card.Root>
{/if}
