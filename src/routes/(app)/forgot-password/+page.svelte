<script lang="ts">
	import { enhance } from '$app/forms';
	import InputField from '$lib/components/fields/InputField.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Mail, ArrowLeft, CircleCheckBig, CircleAlert, LoaderCircle } from '@lucide/svelte';
	import type { ActionData } from './$types';
	import { resolve } from '$app/paths';

	let { form }: { form: ActionData } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Mot de passe oublié</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		{#if form?.success}
			<Card.Root class="text-center">
				<Card.Content class="flex flex-col items-center gap-4 pt-8 pb-6">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
						<CircleCheckBig class="h-7 w-7 text-green-600" />
					</div>
					<div class="space-y-1">
						<h2 class="text-lg font-semibold">Vérifiez votre boîte mail</h2>
						<p class="text-muted-foreground text-sm">{form.message}</p>
					</div>
					<p class="text-muted-foreground text-xs">
						Le lien est valable 1 heure. Pensez à vérifier vos courriers indésirables.
					</p>
				</Card.Content>
				<Card.Footer class="justify-center">
					<a
						href={resolve('/')}
						class="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
					>
						<ArrowLeft class="h-4 w-4" />
						Retour à la connexion
					</a>
				</Card.Footer>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Header class="space-y-3">
					<div class="flex items-center gap-4">
						<div
							class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full"
						>
							<Mail class="h-6 w-6" />
						</div>
						<Card.Title class="text-xl">Mot de passe oublié ?</Card.Title>
					</div>
					<div class="space-y-1">
						<Card.Description>
							Pas de souci. Saisissez votre adresse email et nous vous enverrons un lien pour en
							créer un nouveau.
						</Card.Description>
					</div>
				</Card.Header>

				<form
					class="grid gap-4"
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
						<InputField
							id="email"
							name="email"
							label="Adresse email"
							type="email"
							placeholder="exemple@exemple.com"
							required
							size="lg"
						/>

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
						<Button type="submit" class="w-full" disabled={isSubmitting}>
							{#if isSubmitting}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								Envoi en cours…
							{:else}
								Envoyer le lien
							{/if}
						</Button>
						<a
							href={resolve('/')}
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
