<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Mail, Lock, Eye, EyeOff, LoaderCircle, CircleAlert } from '@lucide/svelte';

	type Props = {
		/** Appelé au clic sur « Mot de passe oublié ? » (ex : fermer le sheet) */
		onForgotPassword?: () => void;
		/** Classes du bouton (permet un bouton plus grand sur desktop) */
		buttonClass?: string;
	};

	let { onForgotPassword, buttonClass = 'w-full' }: Props = $props();

	// Identifiant unique par instance (la Navbar affiche le formulaire 2 fois)
	const id = $props.id();

	let errorMessage = $state<string | null>(null);
	let submitting = $state(false);
	let showPassword = $state(false);
	let capsLockOn = $state(false);

	// Détecte si la touche Verr. Maj est active pendant la saisie
	function checkCapsLock(event: KeyboardEvent) {
		capsLockOn = event.getModifierState('CapsLock');
	}
</script>

<form
	method="POST"
	action="/login"
	class="grid gap-5"
	use:enhance={() => {
		submitting = true;
		errorMessage = null;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'failure') {
				errorMessage = (result.data?.error as string) ?? 'Erreur de connexion';
				return;
			}

			await update();
		};
	}}
>
	{#if errorMessage}
		<Alert.Root variant="destructive">
			<CircleAlert />
			<Alert.Description>{errorMessage}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- EMAIL -->
	<div class="grid gap-2">
		<Label for="{id}-email">Email</Label>
		<InputGroup.Root class="rounded-2xl">
			<InputGroup.Addon>
				<Mail />
			</InputGroup.Addon>
			<InputGroup.Input
				id="{id}-email"
				name="email"
				type="email"
				autocomplete="email"
				placeholder="vous@exemple.fr"
				required
			/>
		</InputGroup.Root>
	</div>

	<!-- MOT DE PASSE -->
	<div class="grid gap-2">
		<div class="flex items-center justify-between">
			<Label for="{id}-password">Mot de passe</Label>
			<a
				href={resolve('/forgot-password')}
				onclick={onForgotPassword}
				class="text-muted-foreground hover:text-primary text-sm transition-colors"
			>
				Mot de passe oublié ?
			</a>
		</div>

		<InputGroup.Root class="rounded-2xl">
			<InputGroup.Addon>
				<Lock />
			</InputGroup.Addon>
			<InputGroup.Input
				id="{id}-password"
				name="password"
				type={showPassword ? 'text' : 'password'}
				autocomplete="current-password"
				placeholder="••••••••"
				required
				onkeydown={checkCapsLock}
				onkeyup={checkCapsLock}
			/>
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					size="icon-xs"
					onclick={() => (showPassword = !showPassword)}
					aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
					aria-pressed={showPassword}
				>
					{#if showPassword}
						<EyeOff />
					{:else}
						<Eye />
					{/if}
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>

		{#if capsLockOn}
			<p class="text-sm text-amber-600">⚠️ Majuscules activées</p>
		{/if}
	</div>

	<Button type="submit" class={buttonClass} disabled={submitting}>
		{#if submitting}
			<LoaderCircle class="animate-spin" />
			Connexion…
		{:else}
			Se connecter
		{/if}
	</Button>
</form>
