<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = {
		buttonText: string;
		title: string;
		description?: string;
		children: import('svelte').Snippet;
	};

	const { buttonText, title, description, children }: Props = $props();

	let open = $state(false);

	export function closeDialog() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button>
			{buttonText}
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>
				{title}
			</Dialog.Title>

			{#if description}
				<Dialog.Description>
					{description}
				</Dialog.Description>
			{/if}
		</Dialog.Header>

		{@render children()}
	</Dialog.Content>
</Dialog.Root>
