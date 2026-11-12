<script lang="ts">
	import { createAdoptionSchema } from '#lib/schemas/adoption.ts';
	import { getFieldError, flattenErrors } from '#lib/utils/zodErrors.ts';
	import type { FlattenedErrors } from '#lib/utils/zodErrors.ts';
	import { DISTRICT_OPTIONS } from '#lib/utils/districts.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import MediaUpload from '#lib/components/media/MediaUpload.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import SaveCancelButtons from '#lib/components/buttons/SaveCancelButtons.svelte';
	import { uploadFile, fileKey, UploadError } from '#lib/media/upload.ts';
	import type { AdoptionFormJson, BlacklistInfo } from '#lib/types/form.ts';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import { Ban } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { formatDateNum } from '#lib/utils/date.ts';

	/** Une demande en attente qu'on peut lier à l'adoption (depuis la fiche du chat) */
	type LinkableRequest = {
		id: string;
		email: string;
		data: unknown;
		createdAt: Date;
		blacklist?: BlacklistInfo | null;
	};

	interface Props {
		open?: boolean;
		onCancel?: () => void;
		/** Les coordonnées de la demande, pour pré-remplir le profil de l'adoptant */
		initialData?: (AdoptionFormJson & { email?: string }) | null;
		/** Page Formulaires : la demande traitée (fixe). Absent depuis la fiche du chat */
		formId?: string;
		/** Fiche du chat : les demandes en attente pour ce chat, au choix (ou aucune) */
		requests?: LinkableRequest[];
		/** Le chat adopté : celui de la demande précise, ou celui choisi pour une demande libre */
		catId: string;
		/** Page Formulaires : la blacklist de la demande traitée (si son email y figure) */
		blacklist?: BlacklistInfo | null;
		/** Admin : peut autoriser l'adoption malgré la blacklist */
		canOverrideBlacklist?: boolean;
	}

	let {
		open = $bindable(false),
		onCancel,
		initialData = null,
		formId,
		requests = [],
		catId,
		blacklist = null,
		canOverrideBlacklist = false
	}: Props = $props();

	// ===== BLACKLIST =====
	// Connue d'avance (demande traitée ou demande liée), ou renvoyée par le serveur
	// quand l'email tapé à la main est blacklisté (adoption « hors formulaire »)
	let serverBlacklist = $state<BlacklistInfo | null>(null);
	let blacklistOverride = $state(false);
	const activeBlacklist = $derived(
		requests.find((r) => r.id === linkedFormId)?.blacklist ?? blacklist ?? serverBlacklist
	);

	// La demande liée : fixe (page Formulaires) ou choisie dans la liste (fiche du chat)
	let linkedFormId = $state('');
	const canPickRequest = $derived(!formId && requests.length > 0);

	const requestOptions = $derived([
		{ value: '', label: 'Aucune (adoptant hors formulaire)' },
		...requests.map((r) => {
			const data = r.data as AdoptionFormJson;
			return {
				value: r.id,
				label: `${data.firstName ?? ''} ${data.lastName ?? ''} · ${formatDateNum(r.createdAt)}`
			};
		})
	]);

	// Choisir une demande pré-remplit l'adoptant avec ses coordonnées ; « Aucune » vide le formulaire
	function selectRequest(id: string) {
		linkedFormId = id;
		blacklistOverride = false;
		const request = requests.find((r) => r.id === id);

		fill(request ? { ...(request.data as AdoptionFormJson), email: request.email } : null);
	}
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// ✅ Profil de l'adoptant
	let firstName = $state('');
	let lastName = $state('');
	let birthDate = $state<Date | undefined>(undefined);
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('Montpellier');
	let postalCode = $state('34000');
	let selectedDistrict = $state<string>('');

	// ✅ Le contrat (obligatoire)
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});

	// Le serveur renvoie { champ: ['message', …] } (flatten de Zod) : on garde le 1er message
	function firstMessages(errors: unknown): FlattenedErrors {
		if (!errors || typeof errors !== 'object') return {};
		const flat: FlattenedErrors = {};
		for (const [key, messages] of Object.entries(errors as Record<string, string[] | undefined>)) {
			if (messages?.[0]) flat[key] = messages[0];
		}
		return flat;
	}

	// Les coordonnées seulement : changer de demande liée ne doit pas retirer le contrat déjà ajouté
	function resetAdopter() {
		firstName = '';
		lastName = '';
		birthDate = undefined;
		email = '';
		phone = '';
		address = '';
		city = 'Montpellier';
		postalCode = '34000';
		selectedDistrict = '';
		fieldErrors = {};
	}

	// À chaque ouverture : on repart des coordonnées de la demande
	// untrack : seul `open` déclenche l'effet. Le parent recrée l'objet initialData à chaque
	// rendu ({ ...adoptionData, email }) : sans untrack, la saisie serait effacée en cours de route
	$effect(() => {
		if (!open) return;
		untrack(() => {
			linkedFormId = formId ?? '';
			files = [];
			progress = {};
			serverBlacklist = null;
			blacklistOverride = false;
			fill(initialData);
		});
	});

	function fill(initialData: Props['initialData']) {
		resetAdopter();
		if (initialData) {
			firstName = initialData.firstName ?? '';
			lastName = initialData.lastName ?? '';
			email = initialData.email ?? '';
			phone = initialData.phone ?? '';
			address = initialData.address ?? '';
			city = initialData.city ?? 'Montpellier';
			postalCode = initialData.postalCode ?? '34000';
			birthDate = initialData.birthDate ? new Date(initialData.birthDate) : undefined;
			selectedDistrict = initialData.district ?? '';
		}
	}

	// ✅ Validation côté navigateur : les MÊMES règles que le serveur (sauf le contrat, vérifié à part)
	function validateForm(): boolean {
		const result = createAdoptionSchema.safeParse({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,
			// Avant, ces deux-là manquaient : la validation échouait toujours
			formId: linkedFormId || undefined,
			catId
		});

		if (!result.success) {
			fieldErrors = flattenErrors(result.error);
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		fieldErrors = {};
		return true;
	}

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}

		// Blacklist : bloquée pour une bénévole, case obligatoire pour l'admin
		// (le serveur vérifie les deux : ici, c'est pour un message immédiat)
		if (activeBlacklist && !canOverrideBlacklist) {
			toast.error('Adoptant blacklisté : seule une administratrice peut autoriser cette adoption');
			cancel();
			return;
		}
		if (activeBlacklist && !blacklistOverride) {
			toast.error("Cochez la case pour autoriser l'adoption malgré la blacklist");
			cancel();
			return;
		}

		const file = files[0];
		if (!file) {
			fieldErrors = { media: 'Le contrat signé est obligatoire' };
			toast.error('Ajoutez le contrat signé');
			cancel();
			return;
		}

		isSubmitting = true;

		// 1. Le contrat part sur S3 (bucket privé, dossier des documents de CE chat)
		try {
			const uploaded = await uploadFile(file, {
				purpose: 'catDocument',
				targetId: catId,
				onProgress: (percent) => (progress = { [fileKey(file)]: percent })
			});
			formData.set('mediaStorageKey', uploaded.storageKey);
			formData.set('mediaOriginalName', uploaded.originalName);
		} catch (e) {
			isSubmitting = false;
			progress = {};
			toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi du contrat");
			cancel();
			return;
		}

		// 2. Le formulaire part avec la clé du contrat (pas le fichier)
		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Adoption créée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				fieldErrors = firstMessages(result.data?.errors);
				// Email tapé à la main et blacklisté : le serveur renvoie la raison
				if (result.data?.blacklist) {
					serverBlacklist = result.data.blacklist as BlacklistInfo;
				}
				toast.error((result.data?.error as string) ?? "Erreur lors de la création de l'adoption");
				progress = {};
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};

	const handleCancelClick = () => {
		onCancel?.();
		open = false;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content size="lg" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Valider l'adoption</Dialog.Title>
			<Dialog.Description>
				Vérifiez les coordonnées de l'adoptant, puis joignez le contrat signé. L'adoption commencera
				par une période d'essai de 6 mois.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createAdoption" use:enhance={handleEnhance} class="space-y-6">
			<input type="hidden" name="catId" value={catId} />
			<input type="hidden" name="formId" value={linkedFormId} />

			<!-- Depuis la fiche du chat : lier une demande en attente (facultatif) -->
			{#if canPickRequest}
				<SelectField
					id="adoption-linked-request"
					label="Demande liée"
					options={requestOptions}
					bind:value={() => linkedFormId, selectRequest}
					disabled={isSubmitting}
				/>
			{/if}

			<!-- 📋 Identité & contact -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SectionCard
					icon={HOST_SECTION_CONFIG.profile.icon}
					title={HOST_SECTION_CONFIG.profile.label}
					color={HOST_SECTION_CONFIG.profile.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<InputField
							id="adoption-firstName"
							name="firstName"
							label="Prénom"
							bind:value={firstName}
							placeholder="Jean"
							error={getFieldError(fieldErrors, 'firstName')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="adoption-lastName"
							name="lastName"
							label="Nom"
							bind:value={lastName}
							placeholder="Dupont"
							error={getFieldError(fieldErrors, 'lastName')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<DatePicker
							name="birthDate"
							value={birthDate}
							onSelect={(date) => (birthDate = date)}
							label="Date de naissance"
							error={getFieldError(fieldErrors, 'birthDate')}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={HOST_SECTION_CONFIG.contact.icon}
					title={HOST_SECTION_CONFIG.contact.label}
					color={HOST_SECTION_CONFIG.contact.color}
				>
					<div class="grid gap-4">
						<InputField
							id="adoption-email"
							name="email"
							label="Email"
							type="email"
							bind:value={email}
							placeholder="jean@example.com"
							error={getFieldError(fieldErrors, 'email')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="adoption-phone"
							name="phone"
							label="Téléphone"
							bind:value={phone}
							placeholder="06 12 34 56 78"
							error={getFieldError(fieldErrors, 'phone')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={HOST_SECTION_CONFIG.address.icon}
					title={HOST_SECTION_CONFIG.address.label}
					color={HOST_SECTION_CONFIG.address.color}
					class="sm:col-span-2"
				>
					<div class="space-y-4">
						<InputField
							id="adoption-address"
							name="address"
							label="Rue"
							bind:value={address}
							placeholder="123 rue de la Paix"
							error={getFieldError(fieldErrors, 'address')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<InputField
								id="adoption-city"
								name="city"
								label="Ville"
								bind:value={city}
								placeholder="Montpellier"
								error={getFieldError(fieldErrors, 'city')}
								required
								size="sm"
								disabled={isSubmitting}
							/>

							<InputField
								id="adoption-postalCode"
								name="postalCode"
								label="Code postal"
								bind:value={postalCode}
								placeholder="34000"
								error={getFieldError(fieldErrors, 'postalCode')}
								required
								size="sm"
								disabled={isSubmitting}
							/>

							{#if city.toLowerCase() === 'montpellier'}
								<SelectField
									id="adoption-district"
									name="district"
									label="Quartier"
									bind:value={selectedDistrict}
									placeholder="Quartier"
									options={DISTRICT_OPTIONS}
									size="sm"
									disabled={isSubmitting}
								/>
							{/if}
						</div>
					</div>
				</SectionCard>
			</section>

			<!-- ⛔ Blacklist : la raison, et la décision (admin seulement) -->
			{#if activeBlacklist}
				<div
					role="alert"
					class="grid gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
				>
					<p class="flex items-center gap-2 font-semibold">
						<Ban class="size-5 shrink-0" />
						Adoptant blacklisté depuis le {formatDateNum(activeBlacklist.since)}
					</p>
					<p class="whitespace-pre-line">{activeBlacklist.reason}</p>
					{#if canOverrideBlacklist}
						<CheckboxField
							id="adoption-blacklist-override"
							name="blacklistOverride"
							label="J'ai pris connaissance de la blacklist et j'autorise cette adoption"
							checked={blacklistOverride}
							onChange={(value) => (blacklistOverride = value)}
							disabled={isSubmitting}
						/>
					{:else}
						<p class="text-xs">Seule une administratrice peut autoriser cette adoption.</p>
					{/if}
				</div>
			{/if}

			<!-- 📄 Le contrat signé (obligatoire) -->
			<MediaUpload
				id="adoption-contract"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				label="Contrat d'adoption signé (PDF) *"
				disabled={isSubmitting}
				error={getFieldError(fieldErrors, 'media') ?? getFieldError(fieldErrors, 'mediaStorageKey')}
			/>

			<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
		</form>
	</Dialog.Content>
</Dialog.Root>
