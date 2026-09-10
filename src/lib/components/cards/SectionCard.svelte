<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	type SelectOption = {
		value: string;
		label: string;
	};

	type Props = {
		id?: string;
		label?: string;
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		size?: 'sm' | 'md' | 'lg';
	};

	let {
		id,
		label,
		value = $bindable(),
		options,
		placeholder = 'Sélectionner...',
		error = '',
		disabled = false,
		required = false,
		size = 'md'
	}: Props = $props();

	const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);

	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="text-xs font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<Select.Root type="single" bind:value disabled={disabled ?? false}>
		<Select.Trigger {id} class={sizeClasses[size]}>
			{selectedLabel}
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option.value)}
				<Select.Item value={option.value} label={option.label}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
