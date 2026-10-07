<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

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
		placeholder?: string;
		disabled?: boolean;
		size?: 'xs' | 'sm' | 'md';
		required?: boolean;
		class?: string;
		wrapperClass?: string;
	};

	let {
		id,
		name = id,
		label,
		value = $bindable(),
		options,
		placeholder = 'Sélectionner...',
		disabled = false,
		size = 'sm',
		required = false,
		class: className = '',
		wrapperClass = ''
	}: Props = $props();

	const selectedOption = $derived(options.find((o) => o.value === value));
	const selectedLabel = $derived(selectedOption?.label ?? placeholder);
</script>

<div class={wrapperClass}>
	{#if label}
		<label for={id} class={`font-medium text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	<Select.Root type="single" bind:value {disabled}>
		<Select.Trigger {id} class={className}>
			<span class={selectedOption ? '' : 'text-muted-foreground'}>
				{selectedLabel}
			</span>
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option.value)}
				<Select.Item value={option.value} label={option.label}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<input type="hidden" {name} {value} />
</div>
