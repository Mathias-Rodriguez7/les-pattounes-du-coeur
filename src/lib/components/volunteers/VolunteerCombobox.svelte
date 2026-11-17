<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import { Check, ChevronsUpDown } from '@lucide/svelte';
	import { cn } from '#lib/utils.ts';

	// Choisir une bénévole dans une liste avec recherche (le même champ que « Associer un
	// bénévole » sur la fiche d'un chat). Envoie `name` = l'id choisi.
	interface Props {
		volunteers: { id: string; name: string }[];
		/** L'id choisi ('' : aucune) */
		value: string;
		name?: string;
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		volunteers,
		value = $bindable(''),
		name = 'volunteerId',
		placeholder = 'Sélectionner une bénévole',
		disabled = false
	}: Props = $props();

	let open = $state(false);
	const selected = $derived(volunteers.find((v) => v.id === value));
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-full justify-between font-normal"
				{disabled}
			>
				<span class="truncate {selected ? '' : 'text-muted-foreground'}">
					{selected?.name ?? placeholder}
				</span>
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0">
		<Command.Root>
			<Command.Input placeholder="Rechercher une bénévole…" />
			<Command.List>
				<Command.Empty>Aucune bénévole trouvée.</Command.Empty>
				<Command.Group>
					{#each volunteers as volunteer (volunteer.id)}
						<Command.Item
							value={volunteer.name}
							onSelect={() => {
								value = volunteer.id;
								open = false;
							}}
						>
							<Check
								class={cn('mr-2 size-4', value === volunteer.id ? 'opacity-100' : 'opacity-0')}
							/>
							{volunteer.name}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<input type="hidden" {name} {value} />
