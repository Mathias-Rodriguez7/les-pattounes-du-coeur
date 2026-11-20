<script lang="ts">
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import FieldError from './FieldError.svelte';
	import { localFieldError } from '#lib/forms/fieldValidation.ts';

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

	// Vérifié quand on quitte le champ (obligatoire vide, email mal écrit) ; l'erreur du serveur passe avant
	let touched = $state(false);
	const shownError = $derived(error || (touched ? localFieldError({ value, required }) : ''));
	const errorId = $derived(id ? `${id}-error` : undefined);
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
		onblur={() => (touched = true)}
		aria-invalid={shownError ? 'true' : undefined}
		aria-describedby={shownError ? errorId : undefined}
		class={shownError ? 'border-red-500' : ''}
	/>
	<FieldError id={errorId} error={shownError} />
</div>
