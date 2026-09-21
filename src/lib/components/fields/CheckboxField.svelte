<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		id: string;
		name: string;
		label: string;
		checked?: boolean;
		description?: string;
		disabled?: boolean;
		onChange?: (checked: boolean) => void;
	}

	const {
		id,
		name,
		label,
		checked = false,
		description,
		disabled = false,
		onChange
	}: Props = $props();

	// ✅ Utilise $derived.by() pour une valeur réactive bidirectionnelle
	let internalChecked = $derived.by(() => checked);

	const handleChange = (newChecked: boolean) => {
		if (onChange) {
			onChange(newChecked);
		}
	};
</script>

<div class="flex items-start gap-3">
	<!-- ✅ INPUT HIDDEN POUR LE FORM -->
	<input type="hidden" {name} value={internalChecked ? 'true' : 'false'} />

	<!-- ✅ CHECKBOX + LABEL -->
	<Checkbox {id} checked={internalChecked} onCheckedChange={handleChange} {disabled} />

	<div class="grid gap-1.5">
		<Label for={id} class="cursor-pointer text-xs font-medium text-gray-700">
			{label}
		</Label>
		{#if description}
			<p class="text-xs text-gray-500">
				{description}
			</p>
		{/if}
	</div>
</div>
