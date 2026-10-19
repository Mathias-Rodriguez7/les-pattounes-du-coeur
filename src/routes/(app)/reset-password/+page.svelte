<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import InputField from '$lib/components/fields/InputField.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Lock, Eye, EyeOff, ArrowLeft, CircleAlert, LoaderCircle } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let isSubmitting = $state(false);

	const mismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);
	const tooShort = $derived(password.length > 0 && password.length < 8);
</script>

<svelte:head>
	<title>Réinitialiser le mot de passe</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		{#if !data.valid}
			<Card.Root class="text-center">
				<Card.Content class="flex flex-col items-center gap-4 pt-8 pb-6">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
						<CircleAlert class="h-7 w-7 text-red-600" />
					</div>
					<div class="space-y-1">
						<h2 class="text-lg font-semibold">Lien invalide</h2>
						<p class="text-muted-foreground text-sm">
							Ce lien de réinitialisation est invalide ou a expiré.
						</p>
					</div>
				</Card.Content>
				<Card.Footer class="flex-col gap-3">
					<a
						href={resolve('/forgot-password')}
						class="text-primary text-sm font-medium hover:underline"
					>
						Demander un nouveau lien
					</a>
				</Card.Footer>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Header class="space-y-3">
					<div
						class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full"
					>
						<Lock class="h-6 w-6" />
					</div>
					<div class="space-y-1">
						<Card.Title class="text-xl">Nouveau mot de passe</Card.Title>
						<Card.Description>Choisissez un mot de passe d'au moins 8 caractères.</Card.Description>
					</div>
				</Card.Header>

				<form
					method="POST"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
				>
					<Card.Content class="space-y-4">
						<div class="relative">
							<InputField
								id="password"
								name="password"
								label="Nouveau mot de passe"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								required
								size="lg"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
								class="absolute top-9.5 right-3 text-slate-500 hover:text-slate-700"
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
							{#if tooShort}
								<p class="mt-1 text-xs text-red-500">Au moins 8 caractères requis</p>
							{:else if form?.errors?.password}
								<p class="mt-1 text-xs text-red-500">{form.errors.password}</p>
							{/if}
						</div>

						<div class="relative">
							<InputField
								id="confirmPassword"
								name="confirmPassword"
								label="Confirmer le mot de passe"
								type={showConfirm ? 'text' : 'password'}
								bind:value={confirmPassword}
								required
								size="lg"
							/>
							<button
								type="button"
								onclick={() => (showConfirm = !showConfirm)}
								aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
								class="absolute top-9.5 right-3 text-slate-500 hover:text-slate-700"
							>
								{#if showConfirm}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
							{#if mismatch}
								<p class="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
							{:else if form?.errors?.confirmPassword}
								<p class="mt-1 text-xs text-red-500">{form.errors.confirmPassword}</p>
							{/if}
						</div>

						{#if form?.error}
							<div
								role="alert"
								class="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
							>
								<CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
								<span>{form.error}</span>
							</div>
						{/if}
					</Card.Content>

					<Card.Footer class="flex-col gap-3">
						<Button type="submit" class="w-full" disabled={isSubmitting || mismatch || tooShort}>
							{#if isSubmitting}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								Enregistrement…
							{:else}
								Réinitialiser le mot de passe
							{/if}
						</Button>
						<a
							href={resolve('/login')}
							class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
						>
							<ArrowLeft class="h-4 w-4" />
							Retour à la connexion
						</a>
					</Card.Footer>
				</form>
			</Card.Root>
		{/if}
	</div>
</section>
