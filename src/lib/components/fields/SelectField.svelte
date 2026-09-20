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
		disabled?: boolean;
		size?: 'sm' | 'md';
		required?: boolean;
	};

	let {
		id,
		name = id,
		label,
		value = $bindable(),
		options,
		disabled = false,
		size = 'sm',
		required = false
	}: Props = $props();

	const selectedLabel = $derived(
		options.find((o) => o.value === value)?.label ?? 'Sélectionner...'
	);
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class={`font-medium text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	<Select.Root type="single" bind:value {disabled}>
		<Select.Trigger {id} {name}>
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

	<!-- ⚠️ AJOUTE UN INPUT CACHÉ pour garantir que le name/value arrive au serveur -->
	<input type="hidden" {name} {value} />
</div>
