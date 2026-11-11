<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { X, Search, Trash2, Undo2 } from '@lucide/svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import MediaPreview from '../media/MediaPreview.svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import { NEWS_SECTION_CONFIG, NEWS_TYPE_OPTIONS_CLASSIC } from '#lib/constants/news.ts';
	import type { NewsEditData } from '#lib/types/news.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { uploadFile, fileKey, UploadError } from '#lib/media/upload.ts';

	type CatOption = { id: string; name: string | null; catNumber: string };

	interface Props {
		editData: NewsEditData;
		newsId: string;
		cats?: CatOption[];
		canDelete?: boolean;
		onSuccess?: () => void;
		onCancel?: () => void;
	}

	let {
		editData = $bindable(),
		newsId,
		cats = [],
		canDelete = false,
		onSuccess,
		onCancel
	}: Props = $props();

	let isSaving = $state(false);
	let isDeleting = $state(false);
	let progress = $state<Record<string, number>>({});

	// ===== ERREURS SERVEUR =====
	let serverErrors = $state<Record<string, string[] | undefined>>({});
	const fieldError = (field: string) => serverErrors[field]?.[0] ?? '';

	// ===== MÉDIA =====
	let files = $state<File[]>([]); // nouveau PDF choisi (envoi : étape 5)
	let removeCurrent = $state(false); // retirer le document actuel à l'enregistrement

	const hasCurrentMedia = $derived(!!editData.currentMedia && !removeCurrent);

	// ===== CHATS =====
	let catSearch = $state('');

	const isCatsNews = $derived(editData.type === 'NEWSCATS');

	const catLabel = (cat: CatOption) =>
		cat.name ? `${cat.name} · ${cat.catNumber}` : cat.catNumber;

	const selectedCats = $derived(cats.filter((cat) => editData.catIds.includes(cat.id)));

	const filteredCats = $derived.by(() => {
		const q = catSearch.trim().toLowerCase();
		if (!q) return cats;
		return cats.filter(
			(cat) => cat.catNumber.toLowerCase().includes(q) || cat.name?.toLowerCase().includes(q)
		);
	});

	function toggleCat(catId: string, checked: boolean) {
		editData.catIds = checked
			? [...editData.catIds, catId]
			: editData.catIds.filter((id) => id !== catId);
	}

	// ===== ENVOI =====
	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		isSaving = true;
		serverErrors = {};

		// 1. Le PDF part d'abord à S3, puis seule sa clé rejoint le formulaire.
		//    Une News chats n'a pas de document : on n'envoie rien, même si un fichier a été choisi avant de changer le type.
		const file = isCatsNews ? undefined : files[0];
		if (file) {
			try {
				const uploaded = await uploadFile(file, {
					purpose: 'news',
					onProgress: (percent) => (progress = { [fileKey(file)]: percent })
				});
				formData.set('mediaStorageKey', uploaded.storageKey);
				formData.set('mediaOriginalName', uploaded.originalName);
			} catch (e) {
				isSaving = false;
				progress = {};
				toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi du document");
				cancel();
				return;
			}
		}

		// 2. Puis le formulaire part normalement
		return async ({ result, update }) => {
			isSaving = false;

			if (result.type === 'success') {
				toast.success('News mise à jour');
				await update();
				onSuccess?.();
			} else if (result.type === 'failure') {
				serverErrors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur lors de la mise à jour');
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
</script>

<form method="POST" action="?/update" class="flex flex-col gap-6" use:enhance={handleEnhance}>
	<input type="hidden" name="newsId" value={newsId} />

	<!-- ===== RÉSUMÉ ===== -->
	<SectionCard
		icon={NEWS_SECTION_CONFIG.summary.icon}
		title={NEWS_SECTION_CONFIG.summary.label}
		color={NEWS_SECTION_CONFIG.summary.color}
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="sm:col-span-2">
				<InputField
					id="edit-news-title"
					name="title"
					label="Titre"
					bind:value={editData.title}
					placeholder="Titre de la news"
					error={fieldError('title')}
					required
				/>
			</div>
			{#if !isCatsNews}
				<SelectField
					id="edit-news-type"
					name="type"
					label="Type"
					options={NEWS_TYPE_OPTIONS_CLASSIC}
					bind:value={editData.type}
					required
				/>
			{/if}
		</div>
	</SectionCard>

	<!-- ===== CONTENU ===== -->
	<SectionCard
		icon={NEWS_SECTION_CONFIG.content.icon}
		title={NEWS_SECTION_CONFIG.content.label}
		color={NEWS_SECTION_CONFIG.content.color}
	>
		<TextareaField
			id="edit-news-content"
			name="content"
			bind:value={editData.content}
			placeholder="Contenu de la news…"
			error={fieldError('content')}
			rows={6}
		/>
	</SectionCard>

	<!-- ===== CHATS ou DOCUMENT selon le type ===== -->
	{#if isCatsNews}
		<SectionCard
			icon={NEWS_SECTION_CONFIG.cats.icon}
			title="{NEWS_SECTION_CONFIG.cats.label} ({editData.catIds.length})"
			color={NEWS_SECTION_CONFIG.cats.color}
		>
			<div class="flex flex-col gap-3">
				{#if selectedCats.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each selectedCats as cat (cat.id)}
							<Badge variant="secondary" class="gap-1 pr-1">
								{catLabel(cat)}
								<button
									type="button"
									class="rounded-full p-0.5 hover:bg-muted-foreground/20"
									onclick={() => toggleCat(cat.id, false)}
									aria-label="Retirer {catLabel(cat)}"
								>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground italic">Aucun chat sélectionné</p>
				{/if}

				<div class="relative">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Chercher un chat (nom ou numéro)…"
						aria-label="Chercher un chat à associer"
						bind:value={catSearch}
						class="pl-9"
					/>
				</div>

				<div class="max-h-60 overflow-y-auto rounded-md border p-2">
					{#each filteredCats as cat (cat.id)}
						<div class="rounded-md px-2 py-1.5 hover:bg-muted/50">
							<CheckboxField
								id="edit-news-cat-{cat.id}"
								label={catLabel(cat)}
								checked={editData.catIds.includes(cat.id)}
								onChange={(checked) => toggleCat(cat.id, checked)}
							/>
						</div>
					{:else}
						<p class="text-muted-foreground py-4 text-center text-sm">
							Aucun chat ne correspond à « {catSearch.trim()} »
						</p>
					{/each}
				</div>

				{#if fieldError('catIds')}
					<p class="text-sm text-destructive">{fieldError('catIds')}</p>
				{/if}
			</div>

			<!-- Ce qui part au serveur : un champ caché par chat -->
			{#each editData.catIds as catId (catId)}
				<input type="hidden" name="catIds" value={catId} />
			{/each}
		</SectionCard>
	{:else}
		<SectionCard
			icon={NEWS_SECTION_CONFIG.media.icon}
			title={NEWS_SECTION_CONFIG.media.label}
			color={NEWS_SECTION_CONFIG.media.color}
		>
			<div class="flex flex-col gap-3">
				<!-- Document actuel -->
				{#if hasCurrentMedia && editData.currentMedia}
					<MediaPreview
						src={editData.currentMedia.url}
						mimeType={editData.currentMedia.mimeType}
						sizeBytes={editData.currentMedia.sizeBytes}
						name={editData.currentMedia.name ?? 'Document actuel'}
						variant="card"
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="self-start text-destructive hover:text-destructive"
						onclick={() => (removeCurrent = true)}
						disabled={isSaving}
					>
						<Trash2 class="size-4" />
						Retirer ce document
					</Button>
				{:else if removeCurrent}
					<div
						class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed p-3 text-sm"
					>
						<span class="text-muted-foreground">Le document sera retiré à l'enregistrement.</span>

						<Button type="button" variant="ghost" size="sm" onclick={() => (removeCurrent = false)}
							><Undo2 class="size-4" /> Annuler</Button
						>
					</div>
					<!-- Envoyé SEULEMENT quand on a cliqué « Retirer » -->
					<input type="hidden" name="removeMedia" value="true" />
				{/if}

				<!-- Nouveau document -->
				<MediaUpload
					id="edit-news-media"
					accept={['DOCUMENT']}
					bind:files
					{progress}
					label={hasCurrentMedia ? 'Remplacer par un autre PDF' : 'Ajouter un PDF'}
					error={fieldError('media')}
					disabled={isSaving}
				/>
			</div>
		</SectionCard>
	{/if}

	<Separator />

	<!-- ===== ACTIONS ===== -->
	<!-- PC : une ligne | Mobile : Enregistrer au-dessus de Supprimer -->
	<section class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			{#if canDelete}
				<DeleteButton
					entityId={newsId}
					firstName={editData.title}
					{isDeleting}
					{isSaving}
					showDelete={true}
					actionName="?/delete"
					fieldName="newsId"
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette news ? Cette action est définitive."
				/>
			{/if}
		</div>

		<SaveCancelButtons {onCancel} {isSaving} />
	</section>
</form>
