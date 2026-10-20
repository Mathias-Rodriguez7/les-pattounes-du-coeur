<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Pencil } from '@lucide/svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import {
		VOLUNTEER_SECTION_CONFIG,
		VOLUNTEER_AVAILABILITY_LABELS,
		VOLUNTEER_AVAILABILITY_DURATION_LABELS
	} from '$lib/constants/volunteer';
	import type { FormEditData, VolunteerFormData } from '$lib/types/form';
	import { statusColors } from '$lib/constants/forms';
	import { formatDate } from '$lib/utils/date';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import VolunteerEditFormPanel from './VolunteerEditFormPanel.svelte';
	import NewVolunteerDialog from '$lib/components/volunteers/NewVolunteerDialog.svelte';
	import AssignVolunteerDialog from '../AssignVolunteerDialog.svelte';

	const { form, volunteers = [], isAdmin = false } = $props();

	let isEditing = $state(false);
	let showCreateDialog = $state(false);

	const VolunteerData = $derived(form.data as VolunteerFormData);

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);

	let editData = $state<FormEditData<VolunteerFormData> | null>(null);

	const startEditing = () => {
		if (!form) return;

		const volunteerDataCopy = structuredClone(VolunteerData as VolunteerFormData);

		// ✅ Convertir la date de string à Date
		if (typeof volunteerDataCopy.birthDate === 'string') {
			volunteerDataCopy.birthDate = new Date(volunteerDataCopy.birthDate);
		}

		editData = {
			status: form.status,
			email: form.email,
			data: volunteerDataCopy,
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
							{VolunteerData.firstName}
							{VolunteerData.lastName}
						</Card.Title>
						<Card.Description class="flex gap-2">
							<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
								{statusColors[form.status]?.label}
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
							Créer le bénévole
						</Button>
					</div>
				</section>
			</Card.Header>

			<Card.Content class="flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-10 gap-4">
					<!-- 👤 SECTION CANDIDAT -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.profile.icon}
						title={VOLUNTEER_SECTION_CONFIG.profile.label}
						color={VOLUNTEER_SECTION_CONFIG.profile.color}
						class="col-span-3"
					>
						<div class="ml-6 space-y-3">
							<!-- Identité -->
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-muted-foreground">Prénom</p>
									<p class="font-medium">{VolunteerData.firstName || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Nom</p>
									<p class="font-medium">{VolunteerData.lastName || '—'}</p>
								</div>
							</div>

							<!-- Date de naissance -->
							<div>
								<p class="text-muted-foreground">Date de naissance</p>
								<p class="font-medium">{formatDate(VolunteerData.birthDate)}</p>
							</div>
						</div>
					</SectionCard>

					<!-- 📧 SECTION CONTACT -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
						title={VOLUNTEER_SECTION_CONFIG.contact.label}
						color={VOLUNTEER_SECTION_CONFIG.contact.color}
						class="col-span-3"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Tel</p>
								<div class="flex items-center gap-2">
									<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
									<a
										href={`tel:${VolunteerData.phone}`}
										class="hover:text-primary text-xs text-blue-500 underline"
									>
										{VolunteerData.phone}
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
						icon={VOLUNTEER_SECTION_CONFIG.address.icon}
						title={VOLUNTEER_SECTION_CONFIG.address.label}
						color={VOLUNTEER_SECTION_CONFIG.address.color}
						class="col-span-4"
					>
						<div class="ml-6 grid gap-4">
							<div>
								<p class="text-muted-foreground font-medium">Rue</p>
								<p class="font-medium text-gray-900">{VolunteerData.address || '—'}</p>
							</div>

							<div class="flex gap-4">
								<div>
									<p class="text-muted-foreground font-medium">Ville</p>
									<p class="font-medium text-gray-900">{VolunteerData.city || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">CP</p>
									<p class="font-medium text-gray-900">{VolunteerData.postalCode || '—'}</p>
								</div>
								<div>
									<p class="text-muted-foreground font-medium">Quartier</p>
									<p class="font-medium">{VolunteerData.district}</p>
								</div>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<!-- 🏆 SECTION EXPÉRIENCE -->
				<section class="grid grid-cols-3 gap-4">
					<!-- 🐾 SECTION ANIMAUX À LA MAISON -->
					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
						title={VOLUNTEER_SECTION_CONFIG.experience.label}
						color={VOLUNTEER_SECTION_CONFIG.experience.color}
					>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Experience avec des chats</span>
								<BooleanIcon value={VolunteerData.hasCatExperience} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium"
									>Experience avec des associations</span
								>
								<BooleanIcon value={VolunteerData.hasAssociationExperience} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Experience de soins</span>
								<BooleanIcon value={VolunteerData.hasMedicalCareExperience} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Experience transport animeaux</span>
								<BooleanIcon value={VolunteerData.hasTransportExperience} />
							</div>
						</div>
					</SectionCard>

					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.infos.icon}
						title={VOLUNTEER_SECTION_CONFIG.infos.label}
						color={VOLUNTEER_SECTION_CONFIG.infos.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Voiture</span>
								<BooleanIcon value={VolunteerData.car} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">disponible en semaine</span>
								<BooleanIcon value={VolunteerData.canHelpWeekdays} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">disponible le weekend</span>
								<BooleanIcon value={VolunteerData.canHelpWeekends} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground font-medium">Peut aider en cas d'urgence</span>
								<BooleanIcon value={VolunteerData.canHelpEmergencies} />
							</div>
						</div>
					</SectionCard>

					<SectionCard
						icon={VOLUNTEER_SECTION_CONFIG.availability.icon}
						title={VOLUNTEER_SECTION_CONFIG.availability.label}
						color={VOLUNTEER_SECTION_CONFIG.availability.color}
					>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Implication dans l'associations</span
								>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{VOLUNTEER_AVAILABILITY_LABELS[VolunteerData.availability]}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="items-centern flex gap-1 text-sm">Temps de colaboration</span>
								<Badge class="h-fit bg-indigo-100 text-xs text-indigo-800">
									{VOLUNTEER_AVAILABILITY_DURATION_LABELS[VolunteerData.availabilityDuration]}
								</Badge>
							</div>
						</div>
					</SectionCard>
				</section>

				<Separator />

				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
					title={VOLUNTEER_SECTION_CONFIG.experience.label}
					color={VOLUNTEER_SECTION_CONFIG.experience.color}
				>
					<div class="grid gap-4">
						{#if VolunteerData.hasCatExperience}
							<!-- content here -->

							<div>
								<p class="text-muted-foreground">Experience avec des chats</p>
								<p class="font-medium">
									{VolunteerData.catExperienceDescription}
								</p>
							</div>
						{/if}
						{#if VolunteerData.hasAssociationExperience}
							<Separator />
							<div>
								<p class="text-muted-foreground">Experience avec association</p>
								<p class="font-medium">
									{VolunteerData.associationExperienceDescription}
								</p>
							</div>
						{/if}

						{#if VolunteerData.hasMedicalCareExperience}
							<Separator />
							<div>
								<p class="text-muted-foreground">Experience soins</p>
								<p class="font-medium">
									{VolunteerData.medicalCareDescription}
								</p>
							</div>
						{/if}
					</div>
				</SectionCard>

				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.capacity.icon}
					title={VOLUNTEER_SECTION_CONFIG.capacity.label}
					color={VOLUNTEER_SECTION_CONFIG.capacity.color}
				>
					<div>
						<p class="text-muted-foreground mb-2">Compétence</p>
						<p class="font-medium">{VolunteerData.skills}</p>
					</div>
				</SectionCard>

				<!-- 💬 SECTION MOTIVATION -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.motivation.icon}
					title={VOLUNTEER_SECTION_CONFIG.motivation.label}
					color={VOLUNTEER_SECTION_CONFIG.motivation.color}
				>
					<div>
						<p class="text-muted-foreground mb-2">Motivation</p>
						<p class="font-medium">{VolunteerData.motivation}</p>
					</div>
				</SectionCard>

				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.additionalInformation.icon}
					title={VOLUNTEER_SECTION_CONFIG.additionalInformation.label}
					color={VOLUNTEER_SECTION_CONFIG.additionalInformation.color}
				>
					<div>
						<p class="text-muted-foreground mb-2">Information additionnelle</p>
						<p class="font-medium">
							{VolunteerData.additionalInformation}
						</p>
					</div>
				</SectionCard>

				<Separator />

				<!-- 📝 SECTION NOTES -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.notes.icon}
					title={VOLUNTEER_SECTION_CONFIG.notes.label}
					color={VOLUNTEER_SECTION_CONFIG.notes.color}
				>
					<div class="ml-6 space-y-3">
						<p class="font-medium">{form.notes || '—'}</p>
					</div>
				</SectionCard>
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6 overflow-y-auto">
				<!-- ===== ÉDITION ===== -->
				<VolunteerEditFormPanel
					bind:editData
					formId={form.id}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
	<NewVolunteerDialog
		bind:open={showCreateDialog}
		onCancel={() => (showCreateDialog = false)}
		initialData={{ ...VolunteerData, email: form.email }}
		formId={form.id}
	/>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
