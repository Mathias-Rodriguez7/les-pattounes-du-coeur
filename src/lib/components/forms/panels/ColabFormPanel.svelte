<script lang="ts">
	import PersonContactView from '#lib/components/person/PersonContactView.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Pencil } from '@lucide/svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { COLAB_SECTION_CONFIG } from '#lib/constants/colab.ts';
	import type { FormEditData, CollabFormData } from '#lib/types/form.ts';
	import { statusColors } from '#lib/constants/forms.ts';
	import { formatDate } from '#lib/utils/date.ts';
	import ColabEditFormPanel from './ColabEditFormPanel.svelte';
	import AssignVolunteerDialog from '../AssignVolunteerDialog.svelte';

	const { form, volunteers = [], isAdmin = false } = $props();

	let isEditing = $state(false);

	const colabData = $derived(form.data as CollabFormData);

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);

	let editData = $state<FormEditData<CollabFormData> | null>(null);

	const startEditing = () => {
		if (!form) return;

		const colabDataCopy = structuredClone(colabData as CollabFormData);

		editData = {
			status: form.status,
			email: form.email,
			data: colabDataCopy,
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
							{colabData.firstName}
							{colabData.lastName}
						</Card.Title>
						{#if colabData.companyName}
							<Card.Description class="text-base">
								{colabData.companyName}
							</Card.Description>
						{/if}
						<Card.Description class="flex gap-2">
							<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
								{statusColors[form.status]?.label}
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
					<Button variant="ghost" size="icon" onclick={startEditing} class="shrink-0">
						<Pencil class="h-5 w-5" />
					</Button>
				</section>
			</Card.Header>

			<Card.Content class="@container flex flex-col gap-6 text-sm">
				<Separator />

				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-10">
					<!-- 👤 SECTION IDENTITÉ -->
					<SectionCard
						icon={COLAB_SECTION_CONFIG.profile.icon}
						title={COLAB_SECTION_CONFIG.profile.label}
						color={COLAB_SECTION_CONFIG.profile.color}
						class="@2xl:col-span-5"
					>
						<div class="ml-6 grid grid-cols-2 gap-4">
							<div>
								<p class="text-muted-foreground">Prénom</p>
								<p class="font-medium">{colabData.firstName || '—'}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Nom</p>
								<p class="font-medium">{colabData.lastName || '—'}</p>
							</div>
							<div class="col-span-2">
								<p class="text-muted-foreground">Entreprise</p>
								<p class="font-medium">{colabData.companyName || '—'}</p>
							</div>
						</div>
					</SectionCard>

					<PersonContactView phone={colabData.phone} email={form.email} class="@2xl:col-span-5" />
				</section>

				<Separator />

				<!-- 🤝 SECTION PARTENARIAT -->
				<SectionCard
					icon={COLAB_SECTION_CONFIG.presentation.icon}
					title={COLAB_SECTION_CONFIG.presentation.label}
					color={COLAB_SECTION_CONFIG.presentation.color}
				>
					<div>
						<p class="font-medium whitespace-pre-line">{colabData.presentation}</p>
					</div>
				</SectionCard>

				<SectionCard
					icon={COLAB_SECTION_CONFIG.partnership.icon}
					title={COLAB_SECTION_CONFIG.partnership.label}
					color={COLAB_SECTION_CONFIG.partnership.color}
				>
					<div>
						<p class="font-medium whitespace-pre-line">{colabData.partnershipProposal}</p>
					</div>
				</SectionCard>

				<Separator />

				<!-- 📝 SECTION NOTES -->
				<SectionCard
					icon={COLAB_SECTION_CONFIG.notes.icon}
					title={COLAB_SECTION_CONFIG.notes.label}
					color={COLAB_SECTION_CONFIG.notes.color}
				>
					<div class="ml-6 space-y-3">
						<p class="font-medium">{form.notes || '—'}</p>
					</div>
				</SectionCard>
			</Card.Content>
		{:else}
			<Card.Content class="space-y-6 overflow-y-auto">
				<!-- ===== ÉDITION ===== -->
				<ColabEditFormPanel
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
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="fileText" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
