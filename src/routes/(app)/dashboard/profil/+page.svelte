<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import PasswordField from '#lib/components/fields/PasswordField.svelte';
	import { PASSWORD_RULES } from '#lib/schemas/password.ts';
	import ProfileHeader from '#lib/components/profile/ProfileHeader.svelte';
	import ProfileBreakCard from '#lib/components/profile/ProfileBreakCard.svelte';
	import WeeklyDigestSwitch from '#lib/components/profile/WeeklyDigestSwitch.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import {
		Mail,
		Lock,
		ShieldCheck,
		LoaderCircle,
		Save,
		Check,
		X,
		ChevronRight
	} from '@lucide/svelte';
	import { DISTRICT_OPTIONS } from '#lib/utils/districts.ts';
	import type { ActionData, PageData } from './$types';
	import { fade } from 'svelte/transition';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { VOLUNTEER_STATUS_OPTIONS, VOLUNTEER_ROLE_OPTIONS } from '#lib/constants/volunteer.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Les quartiers + « Aucun » : un profil peut ne pas avoir de quartier
	const districtChoices = [{ value: '', label: 'Aucun' }, ...DISTRICT_OPTIONS];

	const isAdmin = $derived(data.volunteer.role === 'ADMIN');
	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === data.volunteer.role)?.label ??
			data.volunteer.role
	);
	const initials = $derived(
		`${data.volunteer.firstName.charAt(0)}${data.volunteer.lastName.charAt(0)}`.toUpperCase()
	);

	const memberSince = $derived(format(data.volunteer.createdAt, 'MMMM yyyy', { locale: fr }));
	const STATUS_DOT: Record<string, string> = {
		ACTIVE: 'bg-green-500',
		BREAK: 'bg-amber-500',
		STOP: 'bg-red-500'
	};

	const statusLabel = $derived(
		VOLUNTEER_STATUS_OPTIONS.find((s) => s.value === data.volunteer.actif)?.label ?? 'Non renseigné'
	);
	const breakEndLabel = $derived(
		data.volunteer.actif === 'BREAK' && data.volunteer.breakEnd
			? format(data.volunteer.breakEnd, 'd MMMM yyyy', { locale: fr })
			: null
	);

	// ===== PROFIL =====
	let profileIsSubmitting = $state(false);

	// ===== EMAIL =====
	let emailDialogOpen = $state(false);
	let emailNewEmail = $state('');
	let emailConfirmEmail = $state('');
	let emailPassword = $state('');
	let emailIsSubmitting = $state(false);

	const emailMismatch = $derived(
		emailConfirmEmail.length > 0 &&
			emailNewEmail.trim().toLowerCase() !== emailConfirmEmail.trim().toLowerCase()
	);
	const canSubmitEmail = $derived(
		emailNewEmail.length > 0 &&
			emailConfirmEmail.length > 0 &&
			!emailMismatch &&
			emailPassword.length > 0
	);

	// ===== MOT DE PASSE =====
	let passwordDialogOpen = $state(false);
	let passwordCurrent = $state('');
	let passwordNew = $state('');
	let passwordConfirm = $state('');
	let passwordIsSubmitting = $state(false);

	// Les MÊMES règles que le serveur (schemas/password.ts)
	const passwordRules = $derived(
		PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(passwordNew) }))
	);
	const passwordMismatch = $derived(passwordConfirm.length > 0 && passwordNew !== passwordConfirm);
	const canSubmitPassword = $derived(
		passwordCurrent.length > 0 &&
			passwordRules.every((r) => r.ok) &&
			passwordNew === passwordConfirm
	);

	function resetEmailForm() {
		emailNewEmail = '';
		emailConfirmEmail = '';
		emailPassword = '';
	}

	function resetPasswordForm() {
		passwordCurrent = '';
		passwordNew = '';
		passwordConfirm = '';
	}

	// Vide le formulaire quand on ferme la fenêtre (croix, Échap, clic à côté)
	$effect(() => {
		if (!emailDialogOpen) resetEmailForm();
	});
	$effect(() => {
		if (!passwordDialogOpen) resetPasswordForm();
	});

	/**
	 * Message d'erreur d'un champ, SEULEMENT s'il vient du bon formulaire
	 * (email et mot de passe ont tous deux un champ `currentPassword`).
	 */
	function errorFor(action: string, field: string): string {
		if (form?.action !== action) return '';
		const errors = (form as { errors?: Record<string, string[] | string | undefined> }).errors;
		const error = errors?.[field];
		return (Array.isArray(error) ? error[0] : error) ?? '';
	}

	$effect(() => {
		if (form?.success) {
			toast.success(form.message ?? 'Modification enregistrée');
			// Succès → on ferme la fenêtre (ce qui vide aussi le formulaire)
			if (form.action === 'updateEmail') emailDialogOpen = false;
			if (form.action === 'updatePassword') passwordDialogOpen = false;
		}
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Mon profil – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }} class="min-h-full px-4 py-6 sm:px-6 lg:py-10">
	<!-- Le titre de la page, pour les lecteurs d'écran et les moteurs de recherche -->
	<h1 class="sr-only">Mon profil</h1>
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<ProfileHeader
			name={`${data.volunteer.firstName} ${data.volunteer.lastName}`}
			{initials}
			{roleLabel}
			{statusLabel}
			statusDotClass={STATUS_DOT[data.volunteer.actif ?? ''] ?? 'bg-gray-400'}
			{memberSince}
			{breakEndLabel}
			catsFollowed={data.stats.catsFollowed}
			pendingForms={data.stats.pendingForms}
		/>

		<!-- Desktop : le formulaire (2/3) et une colonne Pause + Sécurité (1/3), chacun à sa hauteur
		     Tablette : les deux cartes de droite côte à côte, sous le formulaire -->
		<div class="grid gap-6 lg:grid-cols-3 lg:items-start">
			<!-- ================= INFORMATIONS ================= -->
			<Card.Root class="gap-0 py-0 lg:col-span-2">
				<Card.Header class="px-4 py-4 sm:px-6">
					<Card.Title class="text-lg">Informations personnelles</Card.Title>
					<Card.Description>
						Ces informations permettent à l'association de vous contacter.
					</Card.Description>
				</Card.Header>

				<Separator />

				<Card.Content class="p-4 sm:p-6">
					<form
						method="POST"
						action="?/updateProfile"
						class="flex flex-col"
						use:enhance={() => {
							profileIsSubmitting = true;
							return async ({ update }) => {
								await update({ reset: false });
								profileIsSubmitting = false;
							};
						}}
					>
						<div class="grid gap-4">
							<!-- Prénom / Nom -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField
									id="firstName"
									label="Prénom"
									value={data.volunteer.firstName}
									error={errorFor('updateProfile', 'firstName')}
									required
								/>
								<InputField
									id="lastName"
									label="Nom"
									value={data.volunteer.lastName}
									error={errorFor('updateProfile', 'lastName')}
									required
								/>
							</div>

							<!-- Naissance / Téléphone / (Rôle) : 3 colonnes seulement si le Rôle est affiché -->
							<div class="grid grid-cols-1 gap-4 {isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}">
								<DatePicker
									name="birthDate"
									label="Date de naissance"
									value={data.volunteer.birthDate ?? undefined}
									error={errorFor('updateProfile', 'birthDate')}
								/>
								<InputField
									id="phone"
									label="Téléphone"
									type="tel"
									placeholder="0612345678"
									value={data.volunteer.phone}
									error={errorFor('updateProfile', 'phone')}
									required
								/>
								{#if isAdmin}
									<SelectField
										id="role"
										label="Rôle"
										options={VOLUNTEER_ROLE_OPTIONS}
										value={data.volunteer.role}
										class="w-full"
										wrapperClass="space-y-2"
									/>
								{/if}
							</div>

							<!-- Adresse -->
							<InputField
								id="address"
								label="Adresse"
								value={data.volunteer.address}
								error={errorFor('updateProfile', 'address')}
								required
							/>

							<!-- Ville / Code postal / Quartier -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<InputField
									id="city"
									label="Ville"
									value={data.volunteer.city}
									error={errorFor('updateProfile', 'city')}
									required
								/>
								<InputField
									id="postalCode"
									label="Code postal"
									placeholder="34000"
									value={data.volunteer.postalCode}
									error={errorFor('updateProfile', 'postalCode')}
									required
								/>
								<SelectField
									id="district"
									label="Quartier"
									options={districtChoices}
									value={data.volunteer.district ?? ''}
									placeholder="Aucun"
									class="w-full"
									wrapperClass="space-y-2"
								/>
							</div>
						</div>

						<!-- Le récapitulatif du lundi à gauche, le bouton à droite (l'un sous l'autre sur téléphone) -->
						<div
							class="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"
						>
							<WeeklyDigestSwitch weeklyDigest={data.volunteer.weeklyDigest} />
							<Button type="submit" class="w-full sm:w-auto" disabled={profileIsSubmitting}>
								{#if profileIsSubmitting}
									<LoaderCircle class="animate-spin" />
									Enregistrement…
								{:else}
									<Save />
									Enregistrer les modifications
								{/if}
							</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>

			<aside class="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
				<!-- PAUSE (pas pour une bénévole arrêtée : c'est l'association qui la réactive) -->
				{#if data.volunteer.actif !== 'STOP'}
					<ProfileBreakCard
						actif={data.volunteer.actif}
						breakStart={data.volunteer.breakStart}
						breakEnd={data.volunteer.breakEnd}
						error={errorFor('setBreak', 'breakStart') || errorFor('setBreak', 'breakEnd')}
					/>
				{/if}

				<!-- SÉCURITÉ -->
				<Card.Root class="gap-0 self-start py-0">
					<Card.Header class="px-6 py-4">
						<Card.Title class="flex items-center gap-2 text-base">
							<ShieldCheck class="size-4 text-primary" />
							Sécurité
						</Card.Title>
					</Card.Header>

					<Separator />

					<Card.Content class="p-3">
						<button
							type="button"
							onclick={() => (emailDialogOpen = true)}
							class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted"
						>
							<Mail class="size-4 shrink-0 text-muted-foreground" />
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium">Adresse email</p>
								<p class="truncate text-xs text-muted-foreground">{data.volunteer.email}</p>
							</div>
							<ChevronRight class="size-4 shrink-0 text-muted-foreground" />
						</button>

						<button
							type="button"
							onclick={() => (passwordDialogOpen = true)}
							class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted"
						>
							<Lock class="size-4 shrink-0 text-muted-foreground" />
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium">Mot de passe</p>
								<p class="text-xs tracking-widest text-muted-foreground">••••••••</p>
							</div>
							<ChevronRight class="size-4 shrink-0 text-muted-foreground" />
						</button>
					</Card.Content>
				</Card.Root>
			</aside>
		</div>
	</div>
</main>

<!-- ================= FENÊTRE : EMAIL ================= -->
<Dialog.Root bind:open={emailDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Modifier l'adresse email</Dialog.Title>
			<Dialog.Description>
				Votre email sert d'identifiant de connexion. Email actuel :
				<strong class="text-foreground">{data.volunteer.email}</strong>
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/updateEmail"
			class="space-y-4"
			use:enhance={() => {
				emailIsSubmitting = true;
				return async ({ update }) => {
					await update();
					emailIsSubmitting = false;
				};
			}}
		>
			<InputField
				id="newEmail"
				label="Nouvel email"
				type="email"
				bind:value={emailNewEmail}
				error={errorFor('updateEmail', 'newEmail')}
				required
			/>
			<InputField
				id="confirmEmail"
				label="Confirmer le nouvel email"
				type="email"
				bind:value={emailConfirmEmail}
				error={emailMismatch ? 'Les emails ne correspondent pas' : ''}
				required
			/>
			<PasswordField
				id="emailPassword"
				name="currentPassword"
				label="Mot de passe actuel"
				bind:value={emailPassword}
				error={errorFor('updateEmail', 'currentPassword')}
				required
			/>

			<Dialog.Footer class="pt-2">
				<Button type="button" variant="outline" onclick={() => (emailDialogOpen = false)}>
					Annuler
				</Button>
				<Button type="submit" disabled={emailIsSubmitting || !canSubmitEmail}>
					{#if emailIsSubmitting}
						<LoaderCircle class="animate-spin" />
						Mise à jour…
					{:else}
						Mettre à jour
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- ================= FENÊTRE : MOT DE PASSE ================= -->
<Dialog.Root bind:open={passwordDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Modifier le mot de passe</Dialog.Title>
			<Dialog.Description>
				Vos autres appareils seront déconnectés après le changement.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/updatePassword"
			class="space-y-4"
			use:enhance={() => {
				passwordIsSubmitting = true;
				return async ({ update }) => {
					await update();
					passwordIsSubmitting = false;
				};
			}}
		>
			<PasswordField
				id="passwordCurrent"
				name="currentPassword"
				label="Mot de passe actuel"
				bind:value={passwordCurrent}
				error={errorFor('updatePassword', 'currentPassword')}
				required
			/>

			<div class="space-y-2">
				<PasswordField
					id="passwordNew"
					name="newPassword"
					label="Nouveau mot de passe"
					autocomplete="new-password"
					bind:value={passwordNew}
					error={errorFor('updatePassword', 'newPassword')}
					required
				/>
				<ul class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
					{#each passwordRules as rule (rule.label)}
						<li
							class="flex items-center gap-1.5 {rule.ok
								? 'text-foreground'
								: 'text-muted-foreground'}"
						>
							{#if rule.ok}
								<Check class="size-3.5 shrink-0 text-green-600" />
							{:else}
								<X class="size-3.5 shrink-0" />
							{/if}
							{rule.label}
						</li>
					{/each}
				</ul>
			</div>

			<PasswordField
				id="passwordConfirm"
				name="confirmPassword"
				label="Confirmer le mot de passe"
				autocomplete="new-password"
				bind:value={passwordConfirm}
				error={passwordMismatch
					? 'Les mots de passe ne correspondent pas'
					: errorFor('updatePassword', 'confirmPassword')}
				required
			/>

			<Dialog.Footer class="pt-2">
				<Button type="button" variant="outline" onclick={() => (passwordDialogOpen = false)}>
					Annuler
				</Button>
				<Button type="submit" disabled={passwordIsSubmitting || !canSubmitPassword}>
					{#if passwordIsSubmitting}
						<LoaderCircle class="animate-spin" />
						Mise à jour…
					{:else}
						Mettre à jour
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
