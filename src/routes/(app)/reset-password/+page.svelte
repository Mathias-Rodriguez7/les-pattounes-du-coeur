<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import PasswordInput from '#lib/components/auth/PasswordInput.svelte';
	import {
		ShieldCheck,
		ArrowLeft,
		CircleAlert,
		LoaderCircle,
		Check,
		X,
		LinkIcon
	} from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);

	// Critères affichés en direct. Seul le premier est obligatoire (même règle que le serveur).
	const rules = $derived([
		{ label: 'Au moins 8 caractères', ok: password.length >= 8 },
		{
			label: 'Une majuscule et une minuscule',
			ok: /[a-z]/.test(password) && /[A-Z]/.test(password)
		},
		{ label: 'Un chiffre', ok: /\d/.test(password) },
		{
			label: 'Un caractère spécial',
			ok: /[^A-Za-z0-9]/.test(password)
		}
	]);

	const score = $derived(rules.filter((r) => r.ok).length);

	const strength = $derived(
		score <= 1
			? { label: 'Faible', color: 'bg-destructive' }
			: score === 2
				? { label: 'Moyen', color: 'bg-amber-500' }
				: score === 3
					? { label: 'Bon', color: 'bg-primary' }
					: { label: 'Excellent', color: 'bg-green-600' }
	);

	const mismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);
	const canSubmit = $derived(password.length >= 8 && password === confirmPassword);
</script>

<svelte:head>
	<title>Nouveau mot de passe – Les Pattounes du Cœur</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		{#if !data.valid}
			<!-- ❌ ÉTAT : LIEN INVALIDE -->
			<Card.Root class="text-center">
				<Card.Content class="flex flex-col items-center gap-4 pt-8 pb-6">
					<div
						class="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
					>
						<LinkIcon class="size-8" />
					</div>
					<div class="space-y-2">
						<h2 class="text-xl font-semibold">Lien invalide ou expiré</h2>
						<p class="text-sm text-muted-foreground">
							Pour des raisons de sécurité, un lien n'est valable qu'une heure et ne peut servir
							qu'une seule fois.
						</p>
					</div>
				</Card.Content>

				<Card.Footer class="justify-center"
					><Button href={resolve('forgot-password')} class="w-full">Demander un nouveau lien</Button
					></Card.Footer
				>
			</Card.Root>
		{:else}
			<!-- 📝 ÉTAT : FORMULAIRE -->
			<Card.Root>
				<Card.Header class="items-center space-y-3 text-center">
					<div
						class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<ShieldCheck class="size-7" />
					</div>
					<Card.Title class="text-2xl">Nouveau mot de passe</Card.Title>
					<Card.Description
						>Choisissez un mot de passe que vous n'utilisez pas ailleurs.</Card.Description
					>
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
					<Card.Content class="space-y-5">
						{#if form?.error}
							<Alert.Root variant="destructive">
								<CircleAlert />
								<Alert.Description>{form.error}</Alert.Description>
							</Alert.Root>
						{/if}

						<!-- NOUVEAU MOT DE PASSE -->
						<div class="grid gap-2">
							<Label for="password">Nouveau mot de passe</Label>
							<PasswordInput
								id="password"
								name="password"
								autocomplete="new-password"
								bind:value={password}
								invalid={!!form?.errors?.password}
								required
							/>

							{#if password.length > 0}
								<!-- Barre de robustesse : 4 segments -->
								<div class="flex items-center gap-2">
									<div class="flex flex-1 gap-1">
										{#each rules as rule, i (rule.label)}
											<div
												class="h-1.5 flex-1 rounded-full transition-colors {i < score
													? strength.color
													: 'bg-muted'}"
											></div>
										{/each}
									</div>
									<span class="w-16 text-right text-xs text-muted-foreground">{strength.label}</span
									>
								</div>

								<!-- Liste des critères -->
								<ul class="grid gap-1 text-xs">
									{#each rules as rule (rule.label)}
										<li
											class="flex items-center gap-1.5 {rule.ok
												? 'text-foreground'
												: 'text-muted-foreground'}"
										>
											{#if rule.ok}
												<Check class="size-3.5 text-green-600" />
											{:else}
												<X class="size-3.5" />
											{/if}
											{rule.label}
										</li>
									{/each}
								</ul>
							{/if}

							{#if form?.errors?.password}
								<p class="text-xs text-destructive">{form.errors.password}</p>
							{/if}
						</div>

						<!-- CONFIRMATION -->
						<div class="grid gap-2">
							<Label for="confirmPassword">Confirmer le mot de passe</Label>
							<PasswordInput
								id="confirmPassword"
								name="confirmPassword"
								autocomplete="new-password"
								bind:value={confirmPassword}
								invalid={mismatch || !!form?.errors?.confirmPassword}
								required
							/>
							{#if mismatch}
								<p class="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
							{:else if form?.errors?.confirmPassword}
								<p class="text-xs text-destructive">{form.errors.confirmPassword}</p>
							{:else if confirmPassword.length > 0}
								<p class="flex items-center gap-1 text-xs text-green-600">
									<Check class="size-3.5" /> Les mots de passe correspondent
								</p>
							{/if}
						</div>
					</Card.Content>

					<Card.Footer class="mt-6 flex-col gap-3">
						<Button type="submit" class="h-11 w-full" disabled={isSubmitting || !canSubmit}>
							{#if isSubmitting}
								<LoaderCircle class="animate-spin" />
								Enregistrement…
							{:else}
								Enregistrer le mot de passe
							{/if}
						</Button>
						<a
							href={resolve('login')}
							class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							<ArrowLeft class="size-4" />
							Retour à la connexion
						</a>
					</Card.Footer>
				</form>
			</Card.Root>
		{/if}
	</div>
</section>
