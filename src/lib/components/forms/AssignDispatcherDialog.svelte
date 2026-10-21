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
	import { Radio, Check, ChevronsUpDown } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { VolunteerBasic } from '$lib/types/volunteer';
	import { cn } from '$lib/utils';

	interface Props {
		volunteers: VolunteerBasic[];
		currentDispatcherId?: string | null;
		onSuccess?: () => void;
	}

	let { volunteers, currentDispatcherId = null, onSuccess }: Props = $props();

	let open = $state(false);
	let comboboxOpen = $state(false);
	let isSubmitting = $state(false);
	let selectedVolunteerId = $state('');

	// Pré-remplir avec le dispatcher actuel à l'ouverture
	$effect(() => {
		if (open) {
			selectedVolunteerId = currentDispatcherId ?? '';
		}
	});

	const selectedVolunteer = $derived(volunteers.find((v) => v.id === selectedVolunteerId));

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
				toast.success('Dispatcher des formulaires flexibles mis à jour ✅');
				onSuccess?.();
				resetForm();
				open = false;
			} else if (result.type === 'failure') {
				console.error('❌ Erreur setFlexibleDispatcher:', result.data);
				toast.error((result.data?.error as string) || 'Erreur lors de la désignation');
			}

			await update({ reset: false });
			isSubmitting = false;
		};
	};
</script>

<Dialog bind:open>
	<DialogTrigger>
		{#snippet child({ props })}
			<Button {...props} type="button" variant="outline" class="gap-2">
				<Radio class="h-4 w-4" />
				Dispatcher flexible
			</Button>
		{/snippet}
	</DialogTrigger>

	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Dispatcher des formulaires flexibles</DialogTitle>
			<DialogDescription>
				Sélectionnez le bénévole qui gère l'assignation des formulaires d'adoption flexibles. Un
				seul bénévole peut occuper ce rôle à la fois.
			</DialogDescription>
		</DialogHeader>

		<form
			method="POST"
			action="?/setFlexibleDispatcher"
			use:enhance={handleEnhance}
			class="space-y-4"
		>
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
								{#each volunteers as volunteer (volunteer.id)}
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
					{isSubmitting ? 'Enregistrement...' : 'Valider'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
