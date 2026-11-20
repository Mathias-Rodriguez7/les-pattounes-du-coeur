<script lang="ts">
	import PasswordInput from '#lib/components/auth/PasswordInput.svelte';

	type Props = {
		id: string;
		label?: string;
		name?: string;
		value?: string;
		error?: string;
		required?: boolean;
		autocomplete?: 'current-password' | 'new-password';
	};

	let {
		id,
		name = id,
		label,
		value = $bindable(''),
		error = '',
		required = false,
		autocomplete = 'current-password'
	}: Props = $props();
	import FieldError from './FieldError.svelte';
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

	<PasswordInput {id} {name} {autocomplete} {required} bind:value invalid={!!error} />

	<FieldError id={id ? `${id}-error` : undefined} {error} />
</div>
