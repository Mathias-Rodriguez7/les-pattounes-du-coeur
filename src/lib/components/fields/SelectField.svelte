<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import FieldError from './FieldError.svelte';
	import { localFieldError } from '#lib/forms/fieldValidation.ts';

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
		/** Sans libellé visible (filtres) : le nom lu par les lecteurs d'écran. Par défaut, le placeholder */
		ariaLabel?: string;
		/**
		 * Sans libellé visible : affiche le nom du filtre devant la valeur (« Âge : Adulte »),
		 * pour savoir quel filtre est réglé. false pour une liste toujours remplie (ex : type de chat)
		 */
		showName?: boolean;
		/** Message d'erreur sous la liste (ex : celui du serveur) */
		error?: string;
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
		wrapperClass = '',
		ariaLabel,
		showName = true,
		error = ''
	}: Props = $props();

	// Vérifié quand on quitte le champ (obligatoire vide, email mal écrit) ; l'erreur du serveur passe avant
	let touched = $state(false);
	const shownError = $derived(error || (touched ? localFieldError({ value, required }) : ''));
	const errorId = $derived(id ? `${id}-error` : undefined);

	const selectedOption = $derived(options.find((o) => o.value === value));
	const fieldNameForDisplay = $derived(ariaLabel ?? placeholder);
	const selectedLabel = $derived(
		!selectedOption
			? placeholder
			: !label && showName
				? `${fieldNameForDisplay} : ${selectedOption.label}`
				: selectedOption.label
	);
	// Pas de libellé visible : le lecteur d'écran annonce « Âge : Adulte » (le filtre ET sa valeur)
	const fieldName = $derived(ariaLabel ?? placeholder);
	const triggerAriaLabel = $derived(
		label ? undefined : selectedOption ? `${fieldName} : ${selectedOption.label}` : fieldName
	);
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
	<!-- Liste obligatoire refermée sans choix : erreur (comme un champ quitté vide) -->
	<Select.Root
		type="single"
		bind:value
		{disabled}
		onOpenChange={(open) => {
			if (!open) touched = true;
		}}
	>
		<Select.Trigger
			{id}
			class="{className} {shownError ? 'border-red-500' : ''}"
			aria-label={triggerAriaLabel}
			aria-invalid={shownError ? 'true' : undefined}
			aria-describedby={shownError ? errorId : undefined}
		>
			<!-- min-w-0 + truncate : un libellé trop long finit par « … » au lieu de déborder.
			     title : le libellé complet au survol -->
			<span
				class="min-w-0 flex-1 truncate text-left {selectedOption ? '' : 'text-muted-foreground'}"
				title={selectedLabel}
			>
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
	<FieldError id={errorId} error={shownError} />
</div>
