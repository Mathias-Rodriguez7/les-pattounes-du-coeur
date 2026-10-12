<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { FormWithRelations } from '$lib/types/form';

	let { form }: { form: FormWithRelations } = $props();
</script>

<div class="space-y-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Informations accueil FA</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-2">
			<!-- Contenu spécifique aux FA -->
		</Card.Content>
	</Card.Root>
</div>
