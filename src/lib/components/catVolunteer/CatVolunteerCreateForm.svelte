<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Plus, Check, ChevronsUpDown } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { VolunteerBasic } from '$lib/types/volunteer';
	import { cn } from '$lib/utils';

	interface Props {
		catId: string;
		volunteers: VolunteerBasic[];
		assignedVolunteerIds: string[];
		onSuccess?: (catVolunteer: any) => void;
	}

	let { catId, volunteers, assignedVolunteerIds, onSuccess }: Props = $props();

	let open = $state(false);
	let comboboxOpen = $state(false);
	let isSubmitting = $state(false);
	let selectedVolunteerId = $state('');

	const availableVolunteers = $derived(
		volunteers.filter((v) => !assignedVolunteerIds.includes(v.id))
	);

	const selectedVolunteer = $derived(availableVolunteers.find((v) => v.id === selectedVolunteerId));

	const selectedVolunteerLabel = $derived(
		selectedVolunteer
			? `${selectedVolunteer.profil?.firstName} ${selectedVolunteer.profil?.lastName}`
			: 'Sélectionner un bénévole'
	);

	const resetForm = () => {
		selectedVolunteerId = '';
	};

	const handleEnhance: SubmitFunction = () => {
		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				toast.success('Bénévole associé avec succès ✅');
				if (onSuccess && result.data.catVolunteer) {
					onSuccess(result.data.catVolunteer);
				}
				resetForm();
				open = false;
			} else if (result.type === 'failure') {
				console.error('❌ Erreur assignCatVolunteer:', result.data);
				toast.error((result.data?.error as string) || "Erreur lors de l'association");
			}

			await update({ reset: false });
			isSubmitting = false;
		};
	};
</script>

<Dialog bind:open>
	<DialogTrigger>
		{#snippet child({ props })}
			<Button {...props} type="button" variant="outline" size="sm" class="gap-1">
				<Plus class="h-4 w-4" />
				Ajouter un bénévole
			</Button>
		{/snippet}
	</DialogTrigger>

	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Associer un bénévole</DialogTitle>
			<DialogDescription>
				Sélectionnez un bénévole à associer à ce chat en tant que référent.
			</DialogDescription>
		</DialogHeader>

		<form method="POST" action="?/assignCatVolunteer" use:enhance={handleEnhance} class="space-y-4">
			<input type="hidden" name="catId" value={catId} />
			<input type="hidden" name="volunteerId" value={selectedVolunteerId} />

			<Popover.Root bind:open={comboboxOpen}>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							role="combobox"
							aria-expanded={comboboxOpen}
							class="w-full justify-between font-normal"
						>
							{selectedVolunteerLabel}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
					<Command.Root>
						<Command.Input placeholder="Rechercher un bénévole..." />
						<Command.List>
							<Command.Empty>Aucun bénévole trouvé.</Command.Empty>
							<Command.Group>
								{#each availableVolunteers as volunteer (volunteer.id)}
									<Command.Item
										value={`${volunteer.profil?.firstName} ${volunteer.profil?.lastName}`}
										onSelect={() => {
											selectedVolunteerId = volunteer.id;
											comboboxOpen = false;
										}}
									>
										<Check
											class={cn(
												'mr-2 h-4 w-4',
												selectedVolunteerId === volunteer.id ? 'opacity-100' : 'opacity-0'
											)}
										/>
										{volunteer.profil?.firstName}
										{volunteer.profil?.lastName}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>

			<DialogFooter>
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						resetForm();
						open = false;
					}}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={isSubmitting || !selectedVolunteerId}>
					{isSubmitting ? 'Association...' : 'Associer'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
