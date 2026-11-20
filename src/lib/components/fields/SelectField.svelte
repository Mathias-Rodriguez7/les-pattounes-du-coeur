<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';

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
		showName = true
	}: Props = $props();

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
	<Select.Root type="single" bind:value {disabled}>
		<Select.Trigger {id} class={className} aria-label={triggerAriaLabel}>
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
</div>
