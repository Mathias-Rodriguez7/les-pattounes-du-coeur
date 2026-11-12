<script lang="ts">
	import { createAdoptionSchema } from '#lib/schemas/adoption.ts';
	import { getFieldError, flattenErrors, firstMessages } from '#lib/utils/zodErrors.ts';
	import type { FlattenedErrors } from '#lib/utils/zodErrors.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import MediaUpload from '#lib/components/media/MediaUpload.svelte';
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import {
		emptyPersonForm,
		personFormFrom,
		toPersonInput,
		type PersonForm
	} from '#lib/person/personForm.ts';
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

	// ✅ Profil de l'adoptant : un seul objet (le même type que les autres formulaires « personne »)
	let person = $state<PersonForm>(emptyPersonForm());

	// ✅ Le contrat (obligatoire)
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});

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

	// Les coordonnées seulement : changer de demande liée ne doit pas retirer le contrat déjà ajouté
	function fill(initialData: Props['initialData']) {
		person = initialData ? personFormFrom(initialData) : emptyPersonForm();
		fieldErrors = {};
	}

	// ✅ Validation côté navigateur : les MÊMES règles que le serveur (sauf le contrat, vérifié à part)
	function validateForm(): boolean {
		const result = createAdoptionSchema.safeParse({
			...toPersonInput(person),
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
				// Pas d'`errors` quand le refus vient de la blacklist : on vide les messages
				const errors = result.data?.errors as Record<string, string[] | undefined> | undefined;
				fieldErrors = errors ? firstMessages(errors) : {};
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

			<!-- 📋 Identité & contact : les mêmes cartes que les autres formulaires « personne » -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<PersonProfileFields
					bind:firstName={person.firstName}
					bind:lastName={person.lastName}
					bind:birthDate={person.birthDate}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>
				<PersonContactFields
					bind:phone={person.phone}
					bind:email={person.email}
					errors={fieldErrors}
					disabled={isSubmitting}
				/>
				<PersonAddressFields
					bind:address={person.address}
					bind:city={person.city}
					bind:postalCode={person.postalCode}
					bind:district={person.district}
					errors={fieldErrors}
					disabled={isSubmitting}
					class="sm:col-span-2"
				/>
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
