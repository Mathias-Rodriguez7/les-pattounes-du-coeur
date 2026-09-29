<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Camera } from '@lucide/svelte';
	import type { CatFull, CatEditData } from '$lib/types/cat';
	import type { HostFull } from '$lib/types/host';
	import type { VolunteerFull } from '$lib/types/volunteer';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		statusLabel,
		sexLabel,
		hairLabel,
		vaccinateLabel,
		getLabel
	} from '$lib/utils/catHelpers';
	import CatEditForm from './CatEditForm.svelte';
	import { getAgeBadge, formatAge } from '$lib/utils/age';
	import SectionCard from '../cards/SectionCard.svelte';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { formatDateNum } from '$lib/utils/date';
	import { truncate } from '$lib/utils/string';
	import { sicknessStatus } from '$lib/constants/sickness';
	import type { SicknessStatus } from '@prisma/client';

	interface Props {
		cat: CatFull | null;
		hosts?: HostFull[] | null;
		volunteers?: VolunteerFull[] | null;
		isAdmin?: boolean;
	}

	const { cat, hosts = [], volunteers = [], isAdmin = false }: Props = $props();

	let isEditing = $state(false);
	let editingImage = $state(false);

	// 1️⃣ DÉCLARER TOUS LES CHAMPS ÉDITABLES
	let editData = $state<CatEditData>({
		catNumber: '',
		name: '',
		sex: 'MALE',
		birthDate: new Date(),
		isVisible: true,
		status: 'AVAILABLE',
		hairLength: 'SHORT',
		color: '',
		origin: '',
		isSterilize: false,
		isAlreadySterilized: false,
		vaccinate: 'NO',
		isFivTest: false,
		isDeworming: false,
		description: '',
		isOkCat: false,
		isOkDog: false,
		isOkChild: false,
		isOutside: false,
		isIdentify: false,
		chipId: ''
	});

	// 2️⃣ REMPLIR editData À PARTIR DU cat
	const startEditing = () => {
		if (!cat) return;

		editData = {
			catNumber: cat.catNumber,
			name: cat.name,
			sex: cat.sex,
			birthDate: cat.birthDate ? new Date(cat.birthDate) : new Date(),
			isVisible: cat.isVisible,
			status: cat.status,
			hairLength: cat.hairLength,
			color: cat.color ?? '',
			origin: cat.origin ?? '',
			isSterilize: cat.isSterilize,
			isAlreadySterilized: cat.isAlreadySterilized,
			vaccinate: cat.vaccinate,
			isFivTest: cat.isFivTest,
			isDeworming: cat.isDeworming,
			description: cat.description ?? '',
			isOkCat: cat.isOkCat ?? false,
			isOkDog: cat.isOkDog ?? false,
			isOkChild: cat.isOkChild ?? false,
			isOutside: cat.isOutside ?? false,
			isIdentify: cat.isIdentify ?? false,
			chipId: cat.chipId ?? '',

			sicknesses: cat.sicknesses ?? [],
			placements: cat.placements ?? []
		};

		isEditing = true;
	};

	// 3️⃣ METTRE À JOUR cat APRÈS SUCCÈS
	const handleSuccessfulSave = () => {
		if (!cat) return;

		cat.catNumber = editData.catNumber;
		cat.name = editData.name;
		cat.sex = editData.sex;
		cat.birthDate = editData.birthDate;
		cat.isVisible = editData.isVisible;
		cat.status = editData.status;
		cat.hairLength = editData.hairLength;
		cat.color = editData.color;
		cat.origin = editData.origin;
		cat.isSterilize = editData.isSterilize;
		cat.isAlreadySterilized = editData.isAlreadySterilized;
		cat.vaccinate = editData.vaccinate;
		cat.isFivTest = editData.isFivTest;
		cat.isDeworming = editData.isDeworming;
		cat.description = editData.description;
		cat.isOkCat = editData.isOkCat;
		cat.isOkDog = editData.isOkDog;
		cat.isOkChild = editData.isOkChild;
		cat.isOutside = editData.isOutside;
		cat.isIdentify = editData.isIdentify;
		cat.chipId = editData.chipId;

		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	// ✅ Maladies actives
	const activeSicknesses = $derived.by(() => {
		return cat?.sicknesses?.filter((s) => s.status !== 'RESOLVED') || [];
	});

	// ✅ Tous les bénévoles assignés
	const assignedVolunteers = $derived.by(() => {
		if (!cat?.volunteers) return [];
		return cat.volunteers.map((cv) => cv.volunteer.profil).filter(Boolean);
	});

	// ✅ Placements actifs
	const activePlacements = $derived.by(() => {
		if (!cat?.placements) return [];
		return cat.placements.filter(
			(p) =>
				(p.type === 'LONG' && (p.status === 'ACTIVE' || p.status === 'BREAK')) ||
				(p.type === 'SHORT' && p.status === 'ACTIVE')
		);
	});

	const activeLongPlacement = $derived.by(() => {
		return activePlacements.find((p) => p.type === 'LONG') ?? null;
	});

	const activeShortPlacement = $derived.by(() => {
		return activePlacements.find((p) => p.type === 'SHORT') ?? null;
	});
</script>

{#if cat}
	<Card.Root class="relative col-span-1 overflow-auto">
		{#if !isEditing}
			<Card.Header>
				<section class="flex justify-between gap-6">
					<div class="flex flex-col justify-around">
						<Card.Title class="text-2xl">{cat.name}</Card.Title>
						<Card.Description>
							{getAgeBadge(cat.birthDate)} · {getLabel(sexLabel, cat.sex)}
						</Card.Description>
						<div>
							<span>Num de suivi:</span>
							<span>{cat.catNumber}</span>
						</div>
						<div class="flex gap-4">
							<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
							{#if cat.isVisible}
								<Badge class="bg-green-100 text-green-700">Visible</Badge>
							{:else}
								<Badge class="bg-red-100 text-red-700">Masqué</Badge>
							{/if}
						</div>
					</div>

					<SectionCard
						icon={CAT_SECTION_CONFIG.relations.icon}
						title={CAT_SECTION_CONFIG.relations.label}
						color={CAT_SECTION_CONFIG.relations.color}
						class="flex-1"
					>
						<div class="ml-6 grid grid-cols-3 gap-4 text-sm">
							<div>
								<span class="text-muted-foreground block text-xs">Bénévole(s)</span>
								{#if assignedVolunteers.length > 0}
									<div class="space-y-1">
										{#each assignedVolunteers as volunteer, i (i)}
											<p>{volunteer.firstName} {truncate(volunteer.lastName, 1)}.</p>
										{/each}
									</div>
								{:else}
									<p class="text-muted-foreground">Aucun bénévole assigné</p>
								{/if}
							</div>

							<div>
								<span class="text-muted-foreground block text-xs">
									FA (Classic)
									{#if activeLongPlacement?.status === 'BREAK'}
										<Badge variant="outline" class="ml-1 text-xs">En pause</Badge>
									{/if}
								</span>
								{#if activeLongPlacement}
									<div>
										<p>
											{activeLongPlacement.host.profil.firstName}
											{activeLongPlacement.host.profil.lastName}
										</p>
										{#if activeLongPlacement.host.profil.phone}
											<a
												href={`tel:${activeLongPlacement.host.profil.phone}`}
												class="hover:text-primary text-xs text-blue-500 underline"
											>
												{activeLongPlacement.host.profil.phone}
											</a>
										{/if}
										{#if activeLongPlacement.host.profil.email}
											<a
												href={`mailto:${activeLongPlacement.host.profil.email}`}
												class="hover:text-primary block text-xs text-blue-500 underline"
											>
												{activeLongPlacement.host.profil.email}
											</a>
										{/if}
										<p class="hover:text-primary block text-xs">
											{activeLongPlacement.host.profil.address}
											{activeLongPlacement.host.profil.city}
										</p>
									</div>
								{:else}
									<p class="text-muted-foreground">Aucune</p>
								{/if}
							</div>

							<div>
								{#if activeShortPlacement}
									<div>
										<span class="text-muted-foreground block text-xs">FA (Relais)</span>
										<div>
											<p>
												{activeShortPlacement.host.profil.firstName}
												{activeShortPlacement.host.profil.lastName}
											</p>
											{#if activeShortPlacement.host.profil.phone}
												<a
													href={`tel:${activeShortPlacement.host.profil.phone}`}
													class="hover:text-primary text-xs text-blue-500 underline"
												>
													{activeShortPlacement.host.profil.phone}
												</a>
											{/if}
											{#if activeShortPlacement.host.profil.email}
												<a
													href={`mailto:${activeShortPlacement.host.profil.email}`}
													class="hover:text-primary block text-xs text-blue-500 underline"
												>
													{activeShortPlacement.host.profil.email}
												</a>
											{/if}
											<p class="hover:text-primary block text-xs">
												{activeShortPlacement.host.profil.address}
												{activeShortPlacement.host.profil.city}
											</p>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</SectionCard>

					<div class="flex flex-col gap-2">
						{#if isAdmin}
							<Button variant="ghost" size="icon" onclick={startEditing}>
								<Pencil class="h-5 w-5" />
							</Button>
						{/if}

						<Button
							variant="ghost"
							size="icon"
							onclick={() => {
								editingImage = true;
							}}
						>
							<Camera class="h-5 w-5" />
						</Button>
					</div>
				</section>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4 text-sm">
				<Separator />

				{#if cat.adoptions?.[0]}
					{@const adoption = cat.adoptions[0]}
					<SectionCard
						icon={CAT_SECTION_CONFIG.adoptions.icon}
						title={CAT_SECTION_CONFIG.adoptions.label}
						color={CAT_SECTION_CONFIG.adoptions.color}
					>
						<div class="ml-6 grid grid-cols-2 gap-6 text-sm">
							<div class="space-y-2">
								<h4 class="font-semibold">Adoptant</h4>
								{#if adoption.profil}
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Nom</span>
										<span>{adoption.profil.firstName} {adoption.profil.lastName}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Téléphone</span>
										<span>{adoption.profil.phone ?? '—'}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Email</span>
										<span class="truncate">{adoption.profil.email ?? '—'}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Adresse</span>
										<span>{adoption.profil.address ?? '—'}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">Ville</span>
										<span>{adoption.profil.city ?? '—'}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-muted-foreground">CP</span>
										<span>{adoption.profil.postalCode ?? '—'}</span>
									</div>
								{:else}
									<p class="text-muted-foreground">Profil non disponible</p>
								{/if}
							</div>

							<div class="space-y-2">
								<h4 class="font-semibold">Adoption</h4>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Date adoption</span>
									<span>{formatDateNum(adoption.created_at)}</span>
								</div>
							</div>
						</div>
					</SectionCard>
				{:else}
					<div class="grid grid-cols-4 gap-4">
						<SectionCard
							icon={CAT_SECTION_CONFIG.profile.icon}
							title={CAT_SECTION_CONFIG.profile.label}
							color={CAT_SECTION_CONFIG.profile.color}
							class="col-span-1"
						>
							<div class="ml-6 space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Âge</span>
									<span>{formatAge(cat.birthDate)}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Couleur</span>
									<span>{cat.color ?? '—'}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Poil</span>
									<span>{getLabel(hairLabel, cat.hairLength)}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Origine</span>
									<span>{cat.origin ?? '—'}</span>
								</div>
							</div>
						</SectionCard>

						<SectionCard
							icon={CAT_SECTION_CONFIG.compatibility.icon}
							title={CAT_SECTION_CONFIG.compatibility.label}
							color={CAT_SECTION_CONFIG.compatibility.color}
							class="col-span-1"
						>
							<div class="ml-6 space-y-1">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Chien</span>
									<BooleanIcon value={cat.isOkDog ?? false} />
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Chat</span>
									<BooleanIcon value={cat.isOkCat ?? false} />
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Enfant</span>
									<BooleanIcon value={cat.isOkChild ?? false} />
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Jardin</span>
									<BooleanIcon value={cat.isOutside ?? false} />
								</div>
							</div>
						</SectionCard>

						<SectionCard
							icon={CAT_SECTION_CONFIG.health.icon}
							title={CAT_SECTION_CONFIG.health.label}
							color={CAT_SECTION_CONFIG.health.color}
							class="col-span-2"
						>
							<section class="ml-6 grid grid-cols-2 gap-6">
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Vaccin</span>
									<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
									<span class="text-muted-foreground">Test FIV</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isFivTest ?? false} />
									</div>
									<span class="text-muted-foreground">Vermifuge</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isDeworming ?? false} />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Stérilisé·e</span>
									<div class="flex justify-start">
										<BooleanIcon
											value={(cat.isSterilize ?? false) || (cat.isAlreadySterilized ?? false)}
										/>
									</div>
									<span class="text-muted-foreground">Identifié·e</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isIdentify ?? false} />
									</div>
									<span class="text-muted-foreground">Puce</span>
									<span>{cat.chipId ?? '—'}</span>
								</div>
							</section>
						</SectionCard>
					</div>

					<Separator />

					{#if activeSicknesses.length > 0}
						<SectionCard
							icon={CAT_SECTION_CONFIG.sicknesses.icon}
							title={CAT_SECTION_CONFIG.sicknesses.label}
							color={CAT_SECTION_CONFIG.sicknesses.color}
						>
							<div class="space-y-4">
								{#each activeSicknesses as sickness (sickness.id)}
									<div
										class="grid grid-cols-5 gap-4 rounded-xl border border-lime-500 bg-lime-100 px-4 py-2 text-sm"
									>
										<div class="col-span-1">
											<span class="text-muted-foreground block text-xs"
												>Maladie {sicknessStatus[sickness.status as SicknessStatus]}</span
											>
											<span class="font-medium">{sickness.name}</span>

											<div class="flex gap-2 pt-2">
												<div>
													<span class="text-muted-foreground block text-xs">Début</span>
													<span class="text-xs">{formatDateNum(sickness.startDate)}</span>
												</div>
												{#if sickness.endDate}
													<div>
														<span class="text-muted-foreground block text-xs">Fin</span>
														<span class="text-xs">{formatDateNum(sickness.endDate)}</span>
													</div>
												{/if}
											</div>
										</div>
										{#if sickness.description}
											<div class="col-span-2">
												<span class="text-muted-foreground block text-xs">Description</span>
												<p class="text-xs">{sickness.description}</p>
											</div>
										{/if}
										<div class="col-span-2">
											<span class="text-muted-foreground block text-xs">Traitement</span>
											<span class="text-xs">{sickness.treatment ?? '—'}</span>
										</div>
									</div>
								{/each}
							</div>
						</SectionCard>
					{:else}
						<SectionCard
							icon={CAT_SECTION_CONFIG.sicknesses.icon}
							title={CAT_SECTION_CONFIG.sicknesses.label}
							color={CAT_SECTION_CONFIG.sicknesses.color}
						>
							<p class="text-muted-foreground ml-6 text-sm">Aucune maladie active</p>
						</SectionCard>
					{/if}

					<Separator />

					{#if cat.description}
						<SectionCard
							icon={CAT_SECTION_CONFIG.description.icon}
							title={CAT_SECTION_CONFIG.description.label}
							color={CAT_SECTION_CONFIG.description.color}
						>
							<p class="text-muted-foreground ml-6 text-sm">{cat.description}</p>
						</SectionCard>
					{/if}
				{/if}
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6 overflow-y-auto">
				<CatEditForm
					bind:editData
					catId={cat.id}
					hosts={hosts ?? []}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="cat" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un chat pour voir ses détails</p>
		</Card.Content>
	</Card.Root>
{/if}
