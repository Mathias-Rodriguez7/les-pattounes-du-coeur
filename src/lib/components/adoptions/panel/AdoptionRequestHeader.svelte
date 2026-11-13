<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { ArrowLeft, Pencil } from '@lucide/svelte';
	import AssignVolunteerDialog from '#lib/components/forms/AssignVolunteerDialog.svelte';
	import { statusColors } from '#lib/constants/forms.ts';
	import { formatAge } from '#lib/utils/age.ts';
	import { formatDate } from '#lib/utils/date.ts';
	import type { AdoptionFormJson, FormWithRelations } from '#lib/types/form.ts';
	import type { VolunteerBasic } from '#lib/types/volunteer.ts';

	// En-tête d'une demande d'adoption : qui, statut, type, date, bénévole assignée, crayon
	interface Props {
		form: FormWithRelations;
		/** Pour assigner une demande libre (admin, répartitrice) */
		volunteers?: VolunteerBasic[];
		canAssign?: boolean;
		/** Ouvert depuis la fiche du chat : bouton « Retour » */
		onClose?: () => void;
		onEdit: () => void;
	}

	let { form, volunteers = [], canAssign = false, onClose, onEdit }: Props = $props();

	const data = $derived(form.data as AdoptionFormJson);
	const birthDate = $derived(data.birthDate ? new Date(data.birthDate) : null);
	const assignedName = $derived(
		form.assignedTo ? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}` : ''
	);
</script>

<Card.Header>
	{#if onClose}
		<Button variant="ghost" size="sm" class="w-fit" onclick={onClose}>
			<ArrowLeft class="size-4" />
			Retour à la fiche du chat
		</Button>
	{/if}
	<section class="flex flex-wrap justify-between gap-4">
		<div class="grid gap-2 text-base">
			<Card.Title class="text-2xl">
				{data.firstName}
				{data.lastName}
				<Badge class="bg-blue-100 text-sm text-blue-700">
					{formatAge(birthDate)}
				</Badge>
			</Card.Title>
			<Card.Description class="flex gap-2">
				<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
					{statusColors[form.status]?.label}
				</Badge>
				<Badge variant="outline" class="text-xs">
					{form.type === 'ADOPTION_SPECIFIC' ? 'Chat Spécifique' : 'Adoption Flexible'}
				</Badge>
			</Card.Description>
		</div>

		<div class="flex flex-col justify-center gap-2 text-right text-sm text-muted-foreground">
			<p>{formatDate(form.createdAt)}</p>
			{#if assignedName}
				<p class="text-muted-foreground">
					Assigné à: <span class="font-medium">{assignedName}</span>
				</p>
			{/if}
			{#if form.type === 'ADOPTION_FLEXIBLE' && canAssign}
				<AssignVolunteerDialog
					formId={form.id}
					currentVolunteerId={form.assignedToId}
					{volunteers}
				/>
			{/if}
		</div>

		<div class="grid justify-items-end gap-2">
			<Button variant="ghost" size="icon" onclick={onEdit} class="shrink-0">
				<Pencil class="h-5 w-5" />
			</Button>
		</div>
	</section>
</Card.Header>
