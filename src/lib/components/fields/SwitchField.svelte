<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		id: string;
		name: string;
		label: string;
		checked?: boolean;
		description?: string;
		disabled?: boolean;
		checkedLabel?: string;
		uncheckedLabel?: string;
		onChange?: (checked: boolean) => void;
	}

	const {
		id,
		name,
		label,
		checked = false,
		description,
		disabled = false,
		checkedLabel = '✓ Activé',
		uncheckedLabel = '✗ Désactivé',
		onChange
	}: Props = $props();

	let internalChecked = $derived.by(() => checked);

	const handleChange = (newChecked: boolean) => {
		if (onChange) {
			onChange(newChecked);
		}
	};
</script>

<div class="space-y-2">
	<!-- ✅ INPUT HIDDEN POUR LE FORM -->
	<input type="hidden" {name} value={internalChecked ? 'true' : 'false'} />

	<!-- ✅ LABEL -->
	<Label for={id} class="text-xs font-medium text-gray-700">
		{label}
	</Label>

	<!-- ✅ SWITCH + STATUS TEXT -->
	<div class="flex items-center gap-3">
		<Switch {id} checked={internalChecked} onCheckedChange={handleChange} {disabled} />

		<span class="text-xs font-medium text-gray-600">
			{internalChecked ? checkedLabel : uncheckedLabel}
		</span>
	</div>

	<!-- ✅ DESCRIPTION OPTIONNELLE -->
	{#if description}
		<p class="text-xs text-gray-500">
			{description}
		</p>
	{/if}
</div>
