<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	type Props = {
		id?: string;
		label?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		rows?: number;
	};

	let {
		id,
		name = id,
		label,
		value = $bindable(),
		placeholder,
		error = '',
		disabled = false,
		required = false,
		rows = 3
	}: Props = $props();
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
	<Textarea
		{id}
		{name}
		bind:value
		{placeholder}
		{disabled}
		{rows}
		class={error ? 'border-red-500' : ''}
	/>
	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
