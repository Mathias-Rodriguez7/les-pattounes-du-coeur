<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { Ban, LoaderCircle, Plus } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		/** Email connu (depuis une fiche ou une demande) : il n'est alors plus modifiable */
		email?: string;
		/** Nom affiché dans le titre */
		name?: string | null;
		/**
		 * 'add' : bouton « Ajouter » de la page Liste noire
		 * 'button' : bouton rouge « Liste noire » (fiches bénévole et FA)
		 * 'icon' : petite icône rouge, pour une ligne de titre déjà chargée (carte Adoptant)
		 */
		trigger?: 'add' | 'button' | 'icon';
		onSuccess?: () => void;
	}

	let { email: knownEmail = '', name = null, trigger = 'add', onSuccess }: Props = $props();

	let open = $state(false);
	let email = $state('');
	let reason = $state('');
	let errors = $state<Record<string, string | undefined>>({});
	let submitting = $state(false);

	// À chaque ouverture : on repart de l'email connu, et d'un formulaire propre
	$effect(() => {
		if (open) {
			email = knownEmail;
			reason = '';
			errors = {};
		}
	});

	const title = $derived(name ? `Mettre ${name} sur liste noire` : 'Ajouter à la liste noire');

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		errors = {};
		if (!email.trim()) errors.email = "Indiquez l'email";
		if (reason.trim().length < 3) errors.reason = 'Indiquez la raison (3 caractères minimum)';
		if (errors.email || errors.reason) {
			cancel();
			return;
		}
		submitting = true;

		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Ajouté à la liste noire');
				open = false;
				onSuccess?.();
				await update();
			} else if (result.type === 'failure') {
				const fieldErrors = (result.data?.errors ?? {}) as Record<string, string[]>;
				errors = { email: fieldErrors.email?.[0], reason: fieldErrors.reason?.[0] };
				toast.error((result.data?.error as string) ?? 'Erreur lors de la mise en liste noire');
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<!-- type="button" : le déclencheur est parfois DANS un <form> (fiches en édition).
	     Sans lui, un <button> envoie le formulaire : on enregistrerait la fiche en ouvrant la fenêtre. -->
	{#if trigger === 'add'}
		<Dialog.Trigger type="button" class={buttonVariants({ variant: 'destructive', size: 'sm' })}>
			<Plus class="size-4" />
			Ajouter
		</Dialog.Trigger>
	{:else if trigger === 'button'}
		<Dialog.Trigger type="button" class={buttonVariants({ variant: 'destructive' })}>
			<Ban class="size-4" />
			Liste noire
		</Dialog.Trigger>
	{:else}
		<Dialog.Trigger
			type="button"
			class={buttonVariants({ variant: 'ghost', size: 'icon' }) +
				' size-8 text-destructive hover:bg-red-50 hover:text-destructive'}
			{title}
			aria-label={title}
		>
			<Ban class="size-4" />
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				Ses prochaines demandes afficheront le badge « Liste noire ». Si cet email correspond à un
				compte bénévole ou famille d'accueil, ce compte est désactivé jusqu'à la levée.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/addToBlacklist" use:enhance={handleEnhance} class="grid gap-4">
			{#if knownEmail}
				<!-- Email connu : envoyé tel quel, affiché pour rappel -->
				<input type="hidden" name="email" value={email} />
				<p class="text-sm">
					<span class="text-muted-foreground">Email :</span>
					<span class="font-medium">{email}</span>
				</p>
			{:else}
				<InputField
					id="blacklist-email"
					name="email"
					type="email"
					label="Email"
					bind:value={email}
					placeholder="personne@exemple.fr"
					error={errors.email}
					required
					disabled={submitting}
				/>
			{/if}

			<TextareaField
				id="blacklist-reason"
				name="reason"
				label="Raison"
				bind:value={reason}
				placeholder="Ex : chat rendu en mauvais état, refus de tout contact"
				error={errors.reason}
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
				<Button type="submit" variant="destructive" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Mettre sur liste noire
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
