<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import { Check, ChevronsUpDown } from '@lucide/svelte';

	type SelectOption = {
		value: string;
		label: string;
	};

	type Props = {
		id?: string;
		label: string;
		name?: string;
		value?: string;
		options: readonly SelectOption[];
		disabled?: boolean;
		size?: 'sm' | 'md';
		required?: boolean;
		placeholder?: string;
	};

	let {
		id,
		name = id,
		label,
		value = $bindable(),
		options,
		disabled = false,
		size = 'sm',
		required = false,
		placeholder = 'Rechercher...'
	}: Props = $props();

	let open = $state(false);

	const selectedLabel = $derived(
		options.find((o) => o.value === value)?.label ?? 'Sélectionner...'
	);

	function handleSelect(selectedValue: string) {
		value = selectedValue;
		open = false;
	}
</script>

<div>
	{#if label}
		<label for={id} class={`font-medium text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger {id} {disabled}>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					class={cn(
						'w-full justify-between font-normal',
						size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'
					)}
					{disabled}
				>
					{selectedLabel}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
			<Command.Root>
				<Command.Input {placeholder} />
				<Command.List>
					<Command.Empty>Aucun résultat.</Command.Empty>
					<Command.Group>
						{#each options as option (option.value)}
							<Command.Item value={option.label} onSelect={() => handleSelect(option.value)}>
								<Check
									class={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')}
								/>
								{option.label}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	<!-- ⚠️ INPUT CACHÉ pour garantir que le name/value arrive au serveur -->
	<input type="hidden" {name} {value} />
</div>
