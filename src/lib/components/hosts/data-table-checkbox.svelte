<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';

	let {
		checked = false,
		indeterminate = false,
		onCheckedChange
	}: {
		checked?: boolean;
		indeterminate?: boolean;
		onCheckedChange: (value: boolean) => void;
	} = $props();
</script>

<Checkbox {checked} {indeterminate} {onCheckedChange} aria-label="Sélectionner" />
