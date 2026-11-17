<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { HouseHeart, Trees } from '@lucide/svelte';

	// « Nouveau chat » : d'abord le type. Chat asso = le formulaire habituel ;
	// chat libre = attrapé, stérilisé puis relâché (son propre formulaire)
	interface Props {
		open?: boolean;
		onChoose: (kind: 'ASSO' | 'FREE') => void;
	}

	let { open = $bindable(false), onChoose }: Props = $props();

	const choices = [
		{
			kind: 'ASSO',
			icon: HouseHeart,
			title: 'Chat asso',
			text: "Pris en charge par l'asso : famille d'accueil, soins, adoption."
		},
		{
			kind: 'FREE',
			icon: Trees,
			title: 'Chat libre',
			text: 'Attrapé, stérilisé, puis relâché sur son lieu de vie.'
		}
	] as const;

	function choose(kind: 'ASSO' | 'FREE') {
		open = false;
		onChoose(kind);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content size="md">
		<Dialog.Header>
			<Dialog.Title>Nouveau chat</Dialog.Title>
			<Dialog.Description>Quel type de chat voulez-vous enregistrer ?</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each choices as choice (choice.kind)}
				<button
					type="button"
					onclick={() => choose(choice.kind)}
					class="grid gap-2 rounded-xl border p-4 text-left transition-colors hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<span class="flex items-center gap-2 font-semibold">
						<choice.icon class="size-5 text-primary" />
						{choice.title}
					</span>
					<span class="text-sm text-muted-foreground">{choice.text}</span>
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
