<script lang="ts">
	import PersonProfileView from '#lib/components/person/PersonProfileView.svelte';
	import PersonContactView from '#lib/components/person/PersonContactView.svelte';
	import PersonAddressView from '#lib/components/person/PersonAddressView.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import type { FormEditData, HostFormData } from '#lib/types/form.ts';
	import { statusColors } from '#lib/constants/forms.ts';
	import { formatDate } from '#lib/utils/date.ts';
	import HostEditFormPanel from './HostEditFormPanel.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Pencil } from '@lucide/svelte';
	import { HOST_SECTION_CONFIG, TYPE_COLORS } from '#lib/constants/host.ts';
	import BooleanIcon from '#lib/components/icons/BooleanIcon.svelte';
	import { healLabel, socializeLabel, babyFeedingLabel } from '#lib/types//index.ts';
	import type { Heal, Socialize, BabyFeeding } from '@prisma/client';
	import NewHostDialog from '#lib/components/hosts/NewHostDialog.svelte';
	import AssignVolunteerDialog from '../AssignVolunteerDialog.svelte';

	const { form, volunteers = [], isAdmin = false } = $props();

	let isEditing = $state(false);
	let showCreateDialog = $state(false);

	const hostData = $derived(form.data as HostFormData);

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);

	let editData = $state<FormEditData<HostFormData> | null>(null);

	const startEditing = () => {
		if (!form) return;

		const hostDataCopy = structuredClone(hostData as HostFormData);

		// ✅ Convertir la date de string à Date
		if (typeof hostDataCopy.birthDate === 'string') {
			hostDataCopy.birthDate = new Date(hostDataCopy.birthDate);
		}

		editData = {
			status: form.status,
			email: form.email,
			data: hostDataCopy,
			notes: form.notes || ''
		};

		isEditing = true;
	};

	const handleSuccessfulSave = () => {
		if (!form) return;
		isEditing = false;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};
</script>

{#if form}
	<Card.Root>
		{#if !isEditing}
			<Card.Header>
				<section class="flex flex-wrap justify-between gap-4">
					<div class="grid gap-2 text-base">
						<Card.Title class="text-2xl">
							{hostData.firstName}
							{hostData.lastName}
						</Card.Title>
						<Card.Description class="flex gap-2">
							<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
								{statusColors[form.status]?.label}
							</Badge>
							<Badge class={TYPE_COLORS[hostData.type]?.color || 'bg-gray-100 text-gray-800'}>
								{TYPE_COLORS[hostData.type]?.label}
							</Badge>
						</Card.Description>
					</div>
					<div class="flex flex-col justify-center gap-2 text-right text-sm text-muted-foreground">
						<p>{formatDate(form.createdAt)}</p>
						{#if form.assignedTo}
							<p class="text-muted-foreground">
								Assigné à: <span class="font-medium">{assignedName || 'N/A'}</span>
							</p>
						{/if}
						{#if isAdmin}
							<AssignVolunteerDialog
								formId={form.id}
								currentVolunteerId={form.assignedToId}
								{volunteers}
							/>
						{/if}
					</div>
					<div class="grid justify-items-end gap-2">
						<Button variant="ghost" size="icon" onclick={startEditing} class="shrink-0">
							<Pencil class="h-5 w-5" />
						</Button>

						<Button onclick={() => (showCreateDialog = true)} disabled={form.status === 'APPROVED'}>
							Créer une famille d'accueil
						</Button>
					</div>
				</section>
			</Card.Header>

			<Card.Content class="@container flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-10">
					<PersonProfileView
						firstName={hostData.firstName}
						lastName={hostData.lastName}
						birthDate={hostData.birthDate}
						class="@2xl:col-span-3"
					/>
					<PersonContactView phone={hostData.phone} email={form.email} class="@2xl:col-span-3" />
					<PersonAddressView
						address={hostData.address}
						city={hostData.city}
						postalCode={hostData.postalCode}
						district={hostData.district}
						class="@2xl:col-span-4"
					/>
				</section>

				<Separator />

				<!-- 🏆 SECTION EXPÉRIENCE -->
				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-4">
					<!-- 🏠 SECTION LOGEMENT -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.home.icon}
						title={HOST_SECTION_CONFIG.home.label}
						color={HOST_SECTION_CONFIG.home.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Espace</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">{hostData.space} m²</Badge>
							</div>

							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Exterieur</span>
								<BooleanIcon value={hostData.outside} />
							</div>
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Voiture</span>
								<BooleanIcon value={hostData.car} />
							</div>
						</div>
					</SectionCard>
					<!-- 🐾 SECTION ANIMAUX À LA MAISON -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.animals.icon}
						title={HOST_SECTION_CONFIG.animals.label}
						color={HOST_SECTION_CONFIG.animals.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between border-b border-orange-100 pb-2">
								<span class="font-medium text-muted-foreground">Animeaux dans le foyer</span>
								<BooleanIcon value={hostData.hasAnimalsAtHome} />
							</div>

							{#if hostData.hasAnimalsAtHome}
								<div class="space-y-1">
									<div class="flex items-center justify-between">
										<span class="items-centern flex gap-1 text-sm">🐱 Chats</span>
										<Badge variant="outline" class="h-fit text-xs">
											{hostData.numberOfCatsAtHome || 0}
										</Badge>
									</div>
									<div class="flex items-center justify-between">
										<span class="items-centern flex gap-1 text-sm">🐕 Chiens</span>
										<Badge variant="outline" class="h-fit text-xs">
											{hostData.numberOfDogsAtHome || 0}
										</Badge>
									</div>
									{#if hostData.otherAnimalsAtHome}
										<div class="flex items-center justify-between">
											<span class="items-centern flex gap-1 text-sm">🐾 Autres</span>
											<Badge variant="outline" class="h-fit text-xs">
												{hostData.otherAnimalsAtHome}
											</Badge>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</SectionCard>

					<SectionCard
						icon={HOST_SECTION_CONFIG.capacity.icon}
						title={HOST_SECTION_CONFIG.capacity.label}
						color={HOST_SECTION_CONFIG.capacity.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Soins</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[hostData.heal as Heal]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[hostData.socialize as Socialize]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground">Biberonnage</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{babyFeedingLabel[hostData.babyFeeding as BabyFeeding]}
								</Badge>
							</div>
						</div>
					</SectionCard>

					<!-- 📅 SECTION DISPONIBILITÉ -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.cat.icon}
						title={HOST_SECTION_CONFIG.cat.label}
						color={HOST_SECTION_CONFIG.cat.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chat adulte</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{hostData.catAdult || '—'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chatte avec portée</span>
								<BooleanIcon value={hostData.kittyAndKitten} />
							</div>

							<div class="flex items-center justify-between">
								<span class="font-medium text-muted-foreground">Chaton</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{hostData.kitten || '—'}
								</Badge>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- 💬 SECTION MOTIVATION -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.homeDescription.icon}
					title={HOST_SECTION_CONFIG.homeDescription.label}
					color={HOST_SECTION_CONFIG.homeDescription.color}
				>
					<div class="grid gap-2">
						<div>
							<p class="mb-2 text-muted-foreground">Description du logement</p>
							<p class="text-xs text-muted-foreground italic">{hostData.homeDescription}</p>
						</div>
						<div>
							<p class="mb-2 text-muted-foreground">Presence</p>
							<p class="text-xs text-muted-foreground italic">{hostData.presence}</p>
						</div>
					</div>
				</SectionCard>

				<Separator />

				<SectionCard
					icon={HOST_SECTION_CONFIG.outsideDescription.icon}
					title={HOST_SECTION_CONFIG.outsideDescription.label}
					color={HOST_SECTION_CONFIG.outsideDescription.color}
				>
					<div>
						{#if hostData.outside && hostData.outsideDescription}
							<div>
								<p class="text-xs text-muted-foreground">Exterieur</p>
								<p class="text-xs">{hostData.outsideDescription}</p>
							</div>
						{/if}
					</div>
				</SectionCard>

				<Separator />

				<!-- 💬 SECTION MOTIVATION -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.motivation.icon}
					title={HOST_SECTION_CONFIG.motivation.label}
					color={HOST_SECTION_CONFIG.motivation.color}
				>
					<div class="ml-6 space-y-3">
						<p class="text-xs whitespace-pre-wrap text-muted-foreground italic">
							{hostData.motivation}
						</p>
						{#if hostData.additionalMessage}
							<div class="border-l-2 border-muted-foreground pl-3">
								<p class="mb-1 text-xs text-muted-foreground">Message supplémentaire</p>
								<p class="text-xs text-muted-foreground italic">{hostData.additionalMessage}</p>
							</div>
						{/if}
					</div>
				</SectionCard>

				<Separator />

				<!-- 📝 SECTION NOTES -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.notes.icon}
					title={HOST_SECTION_CONFIG.notes.label}
					color={HOST_SECTION_CONFIG.notes.color}
				>
					<div class="ml-6 space-y-3">
						<p class="font-medium">{form.notes || '—'}</p>
					</div>
				</SectionCard>
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6 overflow-y-auto">
				<!-- ===== ÉDITION ===== -->
				<HostEditFormPanel
					bind:editData
					formId={form.id}
					{isAdmin}
					isBlacklisted={!!form.blacklist}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
	<NewHostDialog
		bind:open={showCreateDialog}
		onCancel={() => (showCreateDialog = false)}
		initialData={{ ...hostData, email: form.email }}
		formId={form.id}
	/>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
