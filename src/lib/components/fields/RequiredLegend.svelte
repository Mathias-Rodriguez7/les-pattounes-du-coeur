<script lang="ts">
	// La légende des champs obligatoires : la même partout, en tête de formulaire.
	// L'étoile rouge est celle des libellés (InputField, SelectField, TextareaField…).
	let { class: className = '' }: { class?: string } = $props();
</script>

<p class="text-xs text-muted-foreground {className}">
	<span class="text-red-500" aria-hidden="true">*</span> Champs obligatoires
</p>
