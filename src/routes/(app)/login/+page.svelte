<script lang="ts">
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { LogIn, CircleCheckBig, CircleAlert } from '@lucide/svelte';
	import type { ActionData } from './$types';

	// Rempli par l'action quand JavaScript n'est pas chargé (fail(400, { error }))
	let { form }: { form: ActionData } = $props();

	const resetSuccess = $derived(page.url.searchParams.get('reset') === 'success');
</script>

<svelte:head>
	<title>Connexion – Les Pattounes du Cœur</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center px-4 py-12">
	<div class="w-full max-w-sm">
		<Card.Root>
			<Card.Header class="items-center space-y-3 text-center">
				<div
					class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<LogIn class="size-7" />
				</div>
				<Card.Title class="text-2xl">Connexion</Card.Title>
				<Card.Description>Accédez à votre espace bénévole.</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-4">
				{#if resetSuccess}
					<Alert.Root>
						<CircleCheckBig />
						<Alert.Description>
							Votre mot de passe a été modifié. Vous pouvez vous connecter.
						</Alert.Description>
					</Alert.Root>
				{/if}

				{#if form?.error}
					<Alert.Root variant="destructive">
						<CircleAlert />
						<Alert.Description>{form.error}</Alert.Description>
					</Alert.Root>
				{/if}

				<LoginForm buttonClass="h-11 w-full" />
			</Card.Content>
		</Card.Root>
	</div>
</section>
