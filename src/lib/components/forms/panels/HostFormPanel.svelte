<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import type { FormEditData, HostFormData } from '$lib/types/form';
	import { statusColors } from '$lib/constants/forms';
	import { formatDate } from '$lib/utils/date';
	import HostEditFormPanel from './HostEditFormPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Pencil } from '@lucide/svelte';
	import { HOST_SECTION_CONFIG, TYPE_COLORS } from '$lib/constants/host';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { healLabel, socializeLabel, babyFeedingLabel } from '$lib/types/';
	import type { Heal, Socialize, BabyFeeding } from '@prisma/client';

	const { form } = $props();

	let isEditing = $state(false);

	const hostData = $derived(form.data as Record<string, any>);

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
				<section class="flex justify-between gap-6">
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
					<div class="text-muted-foreground flex flex-col justify-center gap-2 text-right text-sm">
						<p>{formatDate(form.createdAt)}</p>
						{#if form.assignedTo}
							<p class="text-muted-foreground">
								Assigné à: <span class="font-medium">{assignedName || 'N/A'}</span>
							</p>
						{/if}
					</div>
					<Button variant="ghost" size="icon" onclick={startEditing} class="shrink-0">
						<Pencil class="h-5 w-5" />
					</Button>
				</section>
			</Card.Header>

			<Card.Content class="flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-10 gap-4">
					<!-- 👤 SECTION CANDIDAT -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.profile.icon}
						title={HOST_SECTION_CONFIG.profile.label}
						color={HOST_SECTION_CONFIG.profile.color}
						class="col-span-3"
					>
						<div class="ml-6 space-y-3">
							<!-- Identité -->
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-muted-foreground">Prénom</p>
									<p class="font-medium">{hostData.firstName || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Nom</p>
									<p class="font-medium">{hostData.lastName || '—'}</p>
								</div>
							</div>

							<!-- Date de naissance -->
							<div>
								<p class="text-muted-foreground">Date de naissance</p>
								<p class="font-medium">{formatDate(hostData.birthDate)}</p>
							</div>
						</div>
					</SectionCard>

					<!-- 📧 SECTION CONTACT -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.contact.icon}
						title={HOST_SECTION_CONFIG.contact.label}
						color={HOST_SECTION_CONFIG.contact.color}
						class="col-span-3"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Tel</p>
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`tel:${hostData.phone}`}
										class="hover:text-primary text-xs text-blue-500 underline"
									>
										{hostData.phone}
									</a>
								</div>
							</div>

							<div>
								<p class="text-muted-foreground font-medium">Mail</p>
								<div class="flex items-center gap-2">
									<Icon name="mail" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`mailto:${form.email}`}
										class="hover:text-primary text-xs text-blue-500 underline"
									>
										{form.email}
									</a>
								</div>
							</div>
						</div>
					</SectionCard>

					<!-- 🏠 SECTION ADRESSE -->
					<SectionCard
						icon={HOST_SECTION_CONFIG.address.icon}
						title={HOST_SECTION_CONFIG.address.label}
						color={HOST_SECTION_CONFIG.address.color}
						class="col-span-4"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Rue</p>
								<p class="font-medium text-gray-900">{hostData.address || '—'}</p>
							</div>

							<div class="flex gap-4">
								<div>
									<p class="text-muted-foreground font-medium">Ville</p>
									<p class="font-medium text-gray-900">{hostData.city || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">CP</p>
									<p class="font-medium text-gray-900">{hostData.postalCode || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">Quartier</p>
									<p class="font-medium">{hostData.district}</p>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- 🏆 SECTION EXPÉRIENCE -->
				<section class="grid grid-cols-4 gap-4">
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
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Stock</span>
								<BooleanIcon value={hostData.isStockFeed} />
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
								<span class="text-muted-foreground font-medium">Animeaux dans le foyer</span>
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
								<p class="text-muted-foregroundfont-medium">Soins</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{healLabel[hostData.heal as Heal]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground font-medium">Socialisation</p>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{socializeLabel[hostData.socialize as Socialize]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground font-medium">Biberonnage</p>
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
								<span class="text-muted-foreground font-medium">Chat adulte</span>
								<Badge class="bg-blue-100 text-xs text-blue-800">
									{hostData.catAdult || '—'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Chatte avec portée</span>
								<BooleanIcon value={hostData.kittyAndKitten} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Chaton</span>
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
					<div>
						<p class="text-muted-foreground mb-2">Description du logement</p>
						<p class="text-muted-foreground text-xs italic">{hostData.homeDescription}</p>
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
								<p class="text-muted-foreground text-xs">Exterieur</p>
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
						<p class="text-muted-foreground text-xs whitespace-pre-wrap italic">
							{hostData.motivation}
						</p>
						{#if hostData.additionalMessage}
							<div class="border-muted-foreground border-l-2 pl-3">
								<p class="text-muted-foreground mb-1 text-xs">Message supplémentaire</p>
								<p class="text-muted-foreground text-xs italic">{hostData.additionalMessage}</p>
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
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
