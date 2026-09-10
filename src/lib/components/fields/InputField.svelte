<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	type Props = {
		id?: string;
		label?: string;
		value?: string | number;
		type?: string;
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
		type = 'text',
		placeholder,
		error = '',
		disabled = false,
		required = false,
		size = 'md'
	}: Props = $props();

	const sizeClasses = {
		sm: 'text-xs h-8',
		md: 'text-sm h-9',
		lg: 'text-base h-10'
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

	<Input
		{id}
		{type}
		bind:value
		{placeholder}
		{disabled}
		class={`${sizeClasses[size]} ${error ? 'border-red-500' : ''}`}
	/>

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
