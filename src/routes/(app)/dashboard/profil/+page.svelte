<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// EMAIL FORM
	let emailCurrentEmail = $state(data.volunteer.email);
	let emailNewEmail = $state('');
	let emailConfirmEmail = $state('');
	let emailPassword = $state('');
	let emailIsSubmitting = $state(false);
	let emailShowPassword = $state(false);

	// PASSWORD FORM
	let passwordCurrent = $state('');
	let passwordNew = $state('');
	let passwordConfirm = $state('');
	let passwordIsSubmitting = $state(false);
	let passwordShowCurrent = $state(false);
	let passwordShowNew = $state(false);
	let passwordShowConfirm = $state(false);

	function resetEmailForm() {
		emailNewEmail = '';
		emailConfirmEmail = '';
		emailPassword = '';
		emailShowPassword = false;
	}

	function resetPasswordForm() {
		passwordCurrent = '';
		passwordNew = '';
		passwordConfirm = '';
		passwordShowCurrent = false;
		passwordShowNew = false;
		passwordShowConfirm = false;
	}

	$effect(() => {
		if (form?.success) {
			toast.success(form.message ?? 'Modification enregistrée');
			if (form.action === 'updateEmail') {
				emailCurrentEmail = emailNewEmail;
				resetEmailForm();
			} else if (form.action === 'updatePassword') {
				resetPasswordForm();
			}
		}
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<main class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-8">
	<div class="mx-auto max-w-2xl">
		<!-- HEADER -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900">Mon Profil</h1>
			<p class="mt-2 text-slate-600">Gérez vos informations personnelles et votre sécurité</p>
		</div>

		<!-- PROFIL INFO CARD -->
		<Card.Root class="mb-6 border-0 pt-0 shadow-sm">
			<Card.Header class="border-b bg-linear-to-r from-blue-50 to-indigo-50 p-4">
				<Card.Title class="text-lg font-semibold text-slate-900"
					>Informations Personnelles</Card.Title
				>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="grid grid-cols-2 gap-6">
					<div>
						<Label class="text-xs font-semibold text-slate-500 uppercase">Prénom</Label>
						<p class="mt-2 text-sm font-medium text-slate-900">{data.volunteer.firstName}</p>
					</div>
					<div>
						<Label class="text-xs font-semibold text-slate-500 uppercase">Nom</Label>
						<p class="mt-2 text-sm font-medium text-slate-900">{data.volunteer.lastName}</p>
					</div>
					<div>
						<Label class="text-xs font-semibold text-slate-500 uppercase">Email Actuel</Label>
						<p class="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
							<Mail class="h-4 w-4 text-blue-500" />
							{emailCurrentEmail}
						</p>
					</div>
					<div>
						<Label class="text-xs font-semibold text-slate-500 uppercase">Rôle</Label>
						<p class="mt-2 text-sm font-medium text-slate-900 capitalize">{data.volunteer.role}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- TABS -->
		<Tabs.Root value="email" class="w-full">
			<Tabs.List class="mb-6 grid w-full grid-cols-2">
				<Tabs.Trigger value="email" class="flex items-center gap-2">
					<Mail class="h-4 w-4" />
					<span>Email</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="password" class="flex items-center gap-2">
					<Lock class="h-4 w-4" />
					<span>Mot de passe</span>
				</Tabs.Trigger>
			</Tabs.List>

			<!-- EMAIL TAB -->
			<Tabs.Content value="email">
				<Card.Root class="border-0 pt-0 shadow-sm">
					<Card.Header class="border-b bg-linear-to-r from-blue-50 to-indigo-50 p-4">
						<Card.Title class="flex items-center gap-2">
							<Mail class="h-5 w-5 text-blue-500" />
							<span>Modifier l'email</span>
						</Card.Title>
						<Card.Description>
							Confirmez votre mot de passe pour modifier votre adresse email
						</Card.Description>
					</Card.Header>

					<Card.Content class="pt-6">
						<!-- INFO ALERT -->
						<Alert.Root class="mb-6 border-blue-200 bg-blue-50">
							<AlertCircle class="h-4 w-4 text-blue-600" />
							<Alert.Title class="text-blue-900">Conseil de sécurité</Alert.Title>
							<Alert.Description class="text-sm text-blue-800">
								Vous devrez confirmer votre nouveau email avant qu'il ne soit activé
							</Alert.Description>
						</Alert.Root>

						<form
							method="POST"
							action="?/updateEmail"
							use:enhance={() => {
								emailIsSubmitting = true;
								return async ({ result }) => {
									emailIsSubmitting = false;
									if (result.type === 'success') {
										resetEmailForm();
									}
								};
							}}
							class="space-y-5"
						>
							<!-- EMAIL ACTUEL (READ-ONLY) -->
							<div class="relative">
								<Label for="emailCurrent" class="text-sm font-medium text-slate-700">
									Email Actuel
								</Label>
								<Input
									id="emailCurrent"
									type="email"
									value={emailCurrentEmail}
									disabled
									class="mt-2 cursor-not-allowed bg-slate-100 text-slate-700"
								/>
								<span class="absolute top-10 right-3 text-green-600">
									<CheckCircle2 class="h-5 w-5" />
								</span>
							</div>

							<!-- NOUVEL EMAIL -->
							<div>
								<Label for="emailNew" class="text-sm font-medium text-slate-700">
									Nouvel Email <span class="text-red-500">*</span>
								</Label>
								<Input
									id="emailNew"
									type="email"
									name="newEmail"
									placeholder="nouveau@email.com"
									bind:value={emailNewEmail}
									class="mt-2"
								/>
								{#if form?.errors?.newEmail}
									<p class="mt-1 text-xs text-red-500">{form.errors.newEmail}</p>
								{/if}
							</div>

							<!-- CONFIRMATION EMAIL -->
							<div>
								<Label for="emailConfirm" class="text-sm font-medium text-slate-700">
									Confirmer Nouvel Email <span class="text-red-500">*</span>
								</Label>
								<Input
									id="emailConfirm"
									type="email"
									placeholder="Confirmez le nouvel email"
									bind:value={emailConfirmEmail}
									class="mt-2"
								/>
								{#if emailNewEmail && emailConfirmEmail && emailNewEmail !== emailConfirmEmail}
									<p class="mt-1 text-xs text-red-500">Les emails ne correspondent pas</p>
								{/if}
							</div>

							<!-- PASSWORD -->
							<div>
								<Label for="emailPassword" class="text-sm font-medium text-slate-700">
									Mot de passe actuel <span class="text-red-500">*</span>
								</Label>
								<div class="relative mt-2">
									<Input
										id="emailPassword"
										type={emailShowPassword ? 'text' : 'password'}
										name="currentPassword"
										placeholder="••••••••"
										bind:value={emailPassword}
										class="pr-10"
									/>
									<button
										type="button"
										onclick={() => (emailShowPassword = !emailShowPassword)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
									>
										{#if emailShowPassword}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
								{#if form?.errors?.currentPassword}
									<p class="mt-1 text-xs text-red-500">{form.errors.currentPassword}</p>
								{/if}
							</div>

							<Separator class="my-6" />

							<!-- ACTIONS -->
							<div class="flex gap-3 pt-4">
								<Button
									type="submit"
									class="flex-1 bg-blue-600 text-white hover:bg-blue-700"
									disabled={emailIsSubmitting}
								>
									{#if emailIsSubmitting}
										<span class="mr-2 animate-spin">⏳</span>
										Mise à jour...
									{:else}
										<Mail class="mr-2 h-4 w-4" />
										Mettre à jour l'email
									{/if}
								</Button>
								<Button
									type="button"
									variant="outline"
									on:click={resetEmailForm}
									disabled={emailIsSubmitting}
								>
									Annuler
								</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- PASSWORD TAB -->
			<Tabs.Content value="password">
				<Card.Root class="border-0 pt-0 shadow-sm">
					<Card.Header class="border-b bg-linear-to-r from-emerald-50 to-teal-50 p-4">
						<Card.Title class="flex items-center gap-2">
							<Lock class="h-5 w-5 text-emerald-500" />
							<span>Modifier le mot de passe</span>
						</Card.Title>
						<Card.Description>
							Changez votre mot de passe régulièrement pour plus de sécurité
						</Card.Description>
					</Card.Header>

					<Card.Content class="pt-6">
						<!-- REQUIREMENTS -->
						<Alert.Root class="mb-6 border-amber-200 bg-amber-50">
							<AlertCircle class="h-4 w-4 text-amber-600" />
							<Alert.Title class="text-amber-900">Conditions requises</Alert.Title>
							<Alert.Description class="text-sm text-amber-800">
								<ul class="mt-2 list-inside list-disc space-y-1">
									<li>Au moins 8 caractères</li>
									<li>Au moins une majuscule</li>
									<li>Au moins un chiffre</li>
									<li>Au moins un caractère spécial (!@#$%^&*)</li>
								</ul>
							</Alert.Description>
						</Alert.Root>

						<form
							method="POST"
							action="?/updatePassword"
							use:enhance={() => {
								passwordIsSubmitting = true;
								return async ({ result }) => {
									passwordIsSubmitting = false;
									if (result.type === 'success') {
										resetPasswordForm();
									}
								};
							}}
							class="space-y-5"
						>
							<!-- MOT DE PASSE ACTUEL -->
							<div>
								<Label for="passwordCurrent" class="text-sm font-medium text-slate-700">
									Mot de passe actuel <span class="text-red-500">*</span>
								</Label>
								<div class="relative mt-2">
									<Input
										id="passwordCurrent"
										type={passwordShowCurrent ? 'text' : 'password'}
										name="currentPassword"
										placeholder="••••••••"
										bind:value={passwordCurrent}
										class="pr-10"
									/>
									<button
										type="button"
										onclick={() => (passwordShowCurrent = !passwordShowCurrent)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
									>
										{#if passwordShowCurrent}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
								{#if form?.errors?.currentPassword}
									<p class="mt-1 text-xs text-red-500">{form.errors.currentPassword}</p>
								{/if}
							</div>

							<!-- NOUVEAU MOT DE PASSE -->
							<div>
								<Label for="passwordNew" class="text-sm font-medium text-slate-700">
									Nouveau mot de passe <span class="text-red-500">*</span>
								</Label>
								<div class="relative mt-2">
									<Input
										id="passwordNew"
										type={passwordShowNew ? 'text' : 'password'}
										name="newPassword"
										placeholder="••••••••"
										bind:value={passwordNew}
										class="pr-10"
									/>
									<button
										type="button"
										onclick={() => (passwordShowNew = !passwordShowNew)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
									>
										{#if passwordShowNew}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
								{#if form?.errors?.newPassword}
									<p class="mt-1 text-xs text-red-500">{form.errors.newPassword}</p>
								{/if}
							</div>

							<!-- CONFIRMATION MOT DE PASSE -->
							<div>
								<Label for="passwordConfirm" class="text-sm font-medium text-slate-700">
									Confirmer le mot de passe <span class="text-red-500">*</span>
								</Label>
								<div class="relative mt-2">
									<Input
										id="passwordConfirm"
										type={passwordShowConfirm ? 'text' : 'password'}
										placeholder="••••••••"
										bind:value={passwordConfirm}
										class="pr-10"
									/>
									<button
										type="button"
										onclick={() => (passwordShowConfirm = !passwordShowConfirm)}
										class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
									>
										{#if passwordShowConfirm}
											<EyeOff class="h-4 w-4" />
										{:else}
											<Eye class="h-4 w-4" />
										{/if}
									</button>
								</div>
								{#if passwordNew && passwordConfirm && passwordNew !== passwordConfirm}
									<p class="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
								{/if}
								{#if form?.errors?.confirmPassword}
									<p class="mt-1 text-xs text-red-500">{form.errors.confirmPassword}</p>
								{/if}
							</div>

							<Separator class="my-6" />

							<!-- ACTIONS -->
							<div class="flex gap-3 pt-4">
								<Button
									type="submit"
									class="flex-1 bg-emerald-600 text-white hover:bg-red-700"
									disabled={passwordIsSubmitting}
								>
									{#if passwordIsSubmitting}
										<span class="mr-2 animate-spin">⏳</span>
										Mise à jour...
									{:else}
										<Lock class="mr-2 h-4 w-4" />
										Mettre à jour le mot de passe
									{/if}
								</Button>
								<Button
									type="button"
									variant="outline"
									onclick={resetPasswordForm}
									disabled={passwordIsSubmitting}
								>
									Annuler
								</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</main>
