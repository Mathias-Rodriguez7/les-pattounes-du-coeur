<script lang="ts">
	import { Input } from '#lib/components/ui/input/index.js';
	import FieldError from './FieldError.svelte';
	import { localFieldError } from '#lib/forms/fieldValidation.ts';

	type Props = {
		id?: string;
		label?: string;
		name?: string;
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
		name = id,
		label,
		value = $bindable(),
		type = 'text',
		placeholder,
		error = '',
		disabled = false,
		required = false,
		size = 'md'
	}: Props = $props();

	// Vérifié quand on quitte le champ (obligatoire vide, email mal écrit) ; l'erreur du serveur passe avant
	let touched = $state(false);
	const shownError = $derived(error || (touched ? localFieldError({ value, required, type }) : ''));
	const errorId = $derived(id ? `${id}-error` : undefined);

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
		{name}
		{type}
		bind:value
		{placeholder}
		{disabled}
		{required}
		onblur={() => (touched = true)}
		aria-invalid={shownError ? 'true' : undefined}
		aria-describedby={shownError ? errorId : undefined}
		class={`${sizeClasses[size]} ${shownError ? 'border-red-500' : ''}`}
	/>

	<FieldError id={errorId} error={shownError} />
</div>
