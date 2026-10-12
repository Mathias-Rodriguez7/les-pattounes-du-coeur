<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getFormPanelComponent } from '$lib/utils/formPanels';

	let { form } = $props();

	const PanelComponent = $derived(form ? getFormPanelComponent(form.type) : null);
</script>

{#if form}
	<PanelComponent {form} />
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="fileText" class="mx-auto mb-4 h-12 w-12 opacity-50" />
			<p>Sélectionnez un formulaire pour voir les détails</p>
		</Card.Content>
	</Card.Root>
{/if}
