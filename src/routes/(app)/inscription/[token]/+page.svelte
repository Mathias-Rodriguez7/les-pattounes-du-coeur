<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import PasswordField from '#lib/components/fields/PasswordField.svelte';
	import PdfReader from '#lib/components/media/PdfReader.svelte';
	import { PASSWORD_RULES } from '#lib/schemas/password.ts';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Check, Download, FileText, LoaderCircle, PartyPopper, X } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Le PDF passe par /inscription/<jeton>/guide (lien signé, document privé)
	const guideUrl = $derived(resolve(`inscription/${page.params.token ?? ''}/guide`));
	const isVolunteer = $derived(data.status === 'ready' && data.kind === 'VOLUNTEER');

	// Les étapes affichées en haut (la bénévole a une étape de plus : son mot de passe)
	const steps = $derived(
		isVolunteer
			? ['Lire le manuel', 'Accepter', 'Choisir un mot de passe']
			: ['Lire la convention', 'Accepter']
	);

	// La case ne se coche qu'une fois le document lu jusqu'au bout (PdfReader nous prévient)
	let hasReadToEnd = $state(false);
	let accepted = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);

	// Les MÊMES règles que le serveur, cochées en direct
	const passwordRules = $derived(
		PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(password) }))
	);
	const passwordMismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);

	// Erreurs par champ (case, mot de passe), seulement quand le serveur en renvoie
	const errors = $derived(
		form && 'errors' in form ? (form.errors as Record<string, string[] | undefined>) : undefined
	);
	const fieldError = (field: string) => errors?.[field]?.[0] ?? '';
	import RequiredLegend from '#lib/components/fields/RequiredLegend.svelte';
</script>

<svelte:head>
	<title>Inscription – Les Pattounes du Cœur</title>
</svelte:head>

{#snippet banner()}
	<!-- Le même bandeau que le Profil : dégradé + chats qui marchent (décoratif) -->
	<div class="relative h-24 bg-linear-to-r from-primary/80 to-accent sm:h-32">
		<img
			src="/img/chats-ligne-bandeau.png"
			alt=""
			class="absolute right-4 bottom-0 h-[90%] w-auto max-w-[calc(100%-2rem)] object-contain object-right-bottom sm:right-8"
		/>
	</div>
{/snippet}

{#snippet stepNumber(n: number)}
	<span
		class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
	>
		{n}
	</span>
{/snippet}

<main class="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
	{#if form?.success}
		<!-- FA : inscription terminée. Testé EN PREMIER : après la validation, la page est rechargée
		     et l'invitation (utilisée, donc supprimée) n'existe plus → le load dit « invalide ».
		     (Une bénévole, elle, part directement sur son tableau de bord) -->
		<Card.Root class="gap-0 overflow-hidden py-0">
			{@render banner()}
			<Card.Header class="p-6">
				<Card.Title class="flex items-center gap-2 text-2xl">
					<PartyPopper class="size-6 text-primary" />
					Merci {form.firstName} !
				</Card.Title>
				<Card.Description class="text-base">
					Votre inscription comme famille d'accueil est validée. Votre bénévole référente vous
					contactera très vite. Bienvenue chez les Pattounes !
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{:else if data.status === 'invalid'}
		<!-- Lien inconnu, expiré ou déjà utilisé -->
		<Card.Root class="gap-0 overflow-hidden py-0">
			{@render banner()}
			<Card.Header class="p-6">
				<Card.Title class="text-xl">Ce lien n'est plus valable</Card.Title>
				<Card.Description>
					Il a peut-être expiré (14 jours) ou déjà servi. Demandez à l'association de vous renvoyer
					une invitation.
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{:else}
		<!-- ===== EN-TÊTE : bienvenue + étapes ===== -->
		<Card.Root class="gap-0 overflow-hidden py-0">
			{@render banner()}
			<div class="grid gap-4 p-6">
				<div class="grid gap-1">
					<h1 class="text-2xl font-bold">Bienvenue {data.firstName} !</h1>
					<p class="text-muted-foreground">
						{isVolunteer
							? 'Encore une petite étape avant de créer votre compte bénévole.'
							: "Encore une petite étape avant de finaliser votre inscription comme famille d'accueil."}
					</p>
				</div>
				<ol class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
					{#each steps as step, index (step)}
						<li class="flex items-center gap-2">
							{@render stepNumber(index + 1)}
							{step}
						</li>
					{/each}
				</ol>
			</div>
		</Card.Root>

		<!-- ===== 1. LE DOCUMENT ===== -->
		<Card.Root class="gap-4">
			<Card.Header class="flex flex-row flex-wrap items-center justify-between gap-3">
				<Card.Title class="flex items-center gap-3 text-lg">
					{@render stepNumber(1)}
					<FileText class="size-5 text-primary" />
					{data.charter.title}
				</Card.Title>
				<a href="{guideUrl}?download=1" class={buttonVariants({ variant: 'outline', size: 'sm' })}>
					<Download class="size-4" />
					Télécharger le PDF
				</a>
			</Card.Header>
			<Card.Content>
				<!-- Dessiné dans la page (ordinateur ET téléphone) : on sait quand la fin est atteinte -->
				<PdfReader
					url={guideUrl}
					title={data.charter.title}
					onReachedEnd={() => (hasReadToEnd = true)}
				/>
			</Card.Content>
		</Card.Root>

		<!-- ===== 2. ACCEPTER (+ 3. MOT DE PASSE) ===== -->
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<RequiredLegend />
			<input type="hidden" name="documentId" value={data.charter.id} />

			<Card.Root class="gap-6">
				<Card.Content class="grid gap-6">
					<section class="grid gap-3">
						<h2 class="flex items-center gap-3 text-lg font-semibold">
							{@render stepNumber(2)}
							Accepter
						</h2>
						<div
							class="rounded-xl border p-4 transition-colors {accepted
								? 'border-primary/50 bg-primary/5'
								: 'bg-muted/40'}"
						>
							<CheckboxField
								id="accepted"
								name="accepted"
								label={isVolunteer
									? "J'ai lu le Manuel de la gestionnaire et je m'engage à le respecter"
									: "J'ai lu la Convention famille d'accueil et j'accepte ses engagements"}
								checked={accepted}
								disabled={!hasReadToEnd}
								onChange={(value) => (accepted = value)}
							/>
						</div>
						{#if !hasReadToEnd}
							<p class="text-sm text-muted-foreground">
								Lisez le document jusqu'à la fin pour pouvoir cocher la case.
							</p>
						{/if}
						{#if fieldError('accepted')}
							<p class="text-sm text-destructive">{fieldError('accepted')}</p>
						{/if}
					</section>

					{#if isVolunteer}
						<section class="grid gap-3">
							<h2 class="flex items-center gap-3 text-lg font-semibold">
								{@render stepNumber(3)}
								Choisir un mot de passe
							</h2>
							<p class="text-sm text-muted-foreground">
								Votre identifiant de connexion sera votre adresse email.
							</p>
							<div class="grid gap-4 sm:grid-cols-2">
								<PasswordField
									id="newPassword"
									label="Mot de passe"
									bind:value={password}
									error={fieldError('newPassword')}
									autocomplete="new-password"
									required
								/>
								<PasswordField
									id="confirmPassword"
									label="Confirmer le mot de passe"
									bind:value={confirmPassword}
									error={passwordMismatch
										? 'Les mots de passe ne correspondent pas'
										: fieldError('confirmPassword')}
									autocomplete="new-password"
									required
								/>
							</div>
							<ul class="grid gap-1 text-sm sm:grid-cols-2">
								{#each passwordRules as rule (rule.label)}
									<li
										class="flex items-center gap-2 {rule.ok
											? 'text-green-700'
											: 'text-muted-foreground'}"
									>
										{#if rule.ok}
											<Check class="size-4" />
										{:else}
											<X class="size-4" />
										{/if}
										{rule.label}
									</li>
								{/each}
							</ul>
						</section>
					{/if}

					{#if form?.error && !errors}
						<p role="alert" class="rounded-xl bg-red-50 p-4 text-sm text-red-800">{form.error}</p>
					{/if}

					<div class="flex justify-end border-t pt-6">
						<Button type="submit" size="lg" class="w-full sm:w-auto" disabled={submitting}>
							{#if submitting}
								<LoaderCircle class="size-4 animate-spin" />
							{/if}
							{isVolunteer ? 'Valider et créer mon compte' : 'Valider mon inscription'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</form>
	{/if}
</main>
