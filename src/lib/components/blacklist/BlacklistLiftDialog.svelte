<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, Undo2 } from '@lucide/svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		email: string;
		/** Nom affiché dans le titre (l'email s'il est inconnu) */
		name: string;
		/** Un compte sera réactivé : on le dit avant de valider */
		hasAccount?: boolean;
	}

	let { email, name, hasAccount = false }: Props = $props();

	let open = $state(false);
	let reason = $state('');
	let error = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (open) {
			reason = '';
			error = '';
		}
	});

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (reason.trim().length < 3) {
			error = 'Indiquez pourquoi la blacklist est levée';
			cancel();
			return;
		}
		submitting = true;

		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Blacklist levée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				error = (result.data?.errors as Record<string, string[]>)?.reason?.[0] ?? '';
				toast.error((result.data?.error as string) ?? 'Erreur lors de la levée');
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<Undo2 class="size-4" />
		Lever
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Lever la blacklist de {name}</Dialog.Title>
			<Dialog.Description>
				Rien n'est effacé : la raison de la levée est ajoutée à l'historique.
				{#if hasAccount}
					<strong>Son compte sera réactivé</strong> : la personne pourra de nouveau se connecter.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/liftBlacklist" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="email" value={email} />

			<TextareaField
				id="lift-reason"
				name="reason"
				label="Pourquoi lever la blacklist ?"
				bind:value={reason}
				placeholder="Ex : situation régularisée après échange avec la personne"
				{error}
				required
				disabled={submitting}
			/>

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Lever la blacklist
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
