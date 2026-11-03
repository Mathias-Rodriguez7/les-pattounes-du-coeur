<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Mail, ArrowLeft, MailCheck, CircleAlert, LoaderCircle, KeyRound } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Mot de passe oublié – Les Pattounes du Cœur</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		{#if form?.success}
			<!-- ✅ ÉTAT : EMAIL ENVOYÉ -->
			<Card.Root class="text-center">
				<Card.Content class="flex flex-col items-center gap-4 pt-8 pb-6">
					<div
						class="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full"
					>
						<MailCheck class="size-8" />
					</div>
					<div class="space-y-2">
						<h2 class="text-xl font-semibold">Vérifiez votre boîte mail</h2>
						<p class="text-muted-foreground text-sm">{form.message}</p>
					</div>
					<p class="bg-muted text-muted-foreground rounded-md px-3 py-2 text-xs">
						Le lien est valable <strong>1 heure</strong>. Pensez à vérifier vos courriers
						indésirables.
					</p>
				</Card.Content>
				<Card.Footer class="justify-center">
					<a
						href={resolve('/login')}
						class="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
					>
						<ArrowLeft class="size-4" />
						Retour à la connexion
					</a>
				</Card.Footer>
			</Card.Root>
		{:else}
			<!-- 📝 ÉTAT : FORMULAIRE -->
			<Card.Root>
				<Card.Header class="items-center space-y-3 text-center">
					<div
						class="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full"
					>
						<KeyRound class="size-7" />
					</div>
					<Card.Title class="text-2xl">Mot de passe oublié ?</Card.Title>
					<Card.Description>
						Pas de souci. Saisissez votre email et nous vous enverrons un lien pour en créer un
						nouveau.
					</Card.Description>
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
						{#if form?.error}
							<Alert.Root variant="destructive">
								<CircleAlert />
								<Alert.Description>{form.error}</Alert.Description>
							</Alert.Root>
						{/if}

						<div class="grid gap-2">
							<Label for="email">Adresse email</Label>
							<InputGroup.Root class="rounded-2xl">
								<InputGroup.Addon>
									<Mail />
								</InputGroup.Addon>
								<InputGroup.Input
									id="email"
									name="email"
									type="email"
									autocomplete="email"
									placeholder="vous@exemple.fr"
									required
								/>
							</InputGroup.Root>
						</div>
					</Card.Content>

					<Card.Footer class="mt-6 flex-col gap-3">
						<Button type="submit" class="h-11 w-full" disabled={isSubmitting}>
							{#if isSubmitting}
								<LoaderCircle class="animate-spin" />
								Envoi en cours…
							{:else}
								Envoyer le lien
							{/if}
						</Button>
						<a
							href={resolve('/login')}
							class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
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
