<script lang="ts">
	import type { MediaType } from '@prisma/client';
	import { Upload, X, FileText, Film, Eye, FileType } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ImagePreview from './ImagePreview.svelte';
	import {
		MEDIA_RULES,
		formatBytes,
		getAcceptAttribute,
		getMediaTypeFromMime,
		validateFile,
		DOCX_MIME
	} from '$lib/media/rules';
	import { fileKey } from '$lib/media/upload';

	interface Props {
		/** Types acceptés, ex : ['DOCUMENT'] ou ['IMAGE', 'VIDEO'] */
		accept: MediaType[];
		/** Fichiers choisis (bind:files) — c'est ce que le parent enverra à l'étape 5 */
		files?: File[];
		multiple?: boolean;
		maxFiles?: number;
		label?: string;
		id?: string;
		disabled?: boolean;
		allowWord?: boolean;
		/** Erreur renvoyée par le serveur */
		error?: string;
		preview?: boolean;
		progress?: Record<string, number>;
	}

	let {
		accept,
		files = $bindable([]),
		multiple = false,
		maxFiles = multiple ? 10 : 1,
		label,
		id,
		disabled = false,
		allowWord = false,
		error,
		preview = true,
		progress = {}
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `media-upload-${uid}`);
	const hintId = $derived(`${inputId}-hint`);

	let input = $state<HTMLInputElement | null>(null);
	let rejected = $state<{ name: string; error: string }[]>([]);

	// Texte d'aide : « PDF · 20 Mo max »
	const hint = $derived(
		accept
			.map(
				(t) =>
					`${MEDIA_RULES[t].label}${t === 'DOCUMENT' && allowWord ? ' ou Word' : ''} · ${formatBytes(MEDIA_RULES[t].maxBytes)} max`
			)
			.join(' — ')
	);

	const canAddMore = $derived(files.length < maxFiles);

	// Identifie un fichier pour éviter les doublons et servir de clé dans {#each}

	// ===== AJOUT / RETRAIT =====
	function addFiles(list: FileList | null | undefined) {
		if (!list || disabled) return;

		const accepted: File[] = [];
		const errors: { name: string; error: string }[] = [];

		for (const file of Array.from(list)) {
			const check = validateFile(file, accept, { allowWord });
			if (check.ok) accepted.push(file);
			else errors.push({ name: file.name, error: check.error });
		}

		if (!multiple) {
			// Un seul fichier : le nouveau remplace l'ancien
			if (accepted.length > 0) files = [accepted[0]];
		} else {
			const known = new Set(files.map(fileKey));
			const fresh = accepted.filter((f) => !known.has(fileKey(f)));
			const room = maxFiles - files.length;

			if (fresh.length > room) {
				errors.push({
					name: `${fresh.length - room} fichier(s) ignoré(s)`,
					error: `maximum ${maxFiles} fichiers`
				});
			}
			files = [...files, ...fresh.slice(0, Math.max(room, 0))];
		}

		rejected = errors;
	}

	function removeFile(file: File) {
		files = files.filter((f) => f !== file);
		rejected = [];
	}

	function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
		addFiles(e.currentTarget.files);
		// Vide l'input : sinon, re-choisir le même fichier après l'avoir retiré ne déclenche rien
		e.currentTarget.value = '';
	}

	// ===== GLISSER-DÉPOSER =====
	// Compteur : dragleave se déclenche aussi en survolant les enfants de la zone
	let dragDepth = $state(0);
	const isDragging = $derived(dragDepth > 0);

	function onDragEnter(e: DragEvent) {
		e.preventDefault();
		if (!disabled) dragDepth++;
	}
	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
	}
	function onDragOver(e: DragEvent) {
		e.preventDefault(); // obligatoire pour que le navigateur autorise le "drop"
	}
	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragDepth = 0;
		addFiles(e.dataTransfer?.files);
	}

	// ===== APERÇUS =====
	// Une URL locale (blob:…) par image ou PDF, pour l'afficher sans l'envoyer nulle part
	const items = $derived(
		files.map((file) => {
			const type = getMediaTypeFromMime(file.type);
			const needsUrl = type === 'IMAGE' || type === 'DOCUMENT';
			return {
				file,
				type,
				key: fileKey(file),
				url: needsUrl ? URL.createObjectURL(file) : null
			};
		})
	);

	// Le PDF à afficher en grand : seulement s'il est seul
	const embeddedPdf = $derived(
		preview && items.length === 1 && items[0].type === 'DOCUMENT' ? items[0] : null
	);

	// Libère la mémoire des anciennes URLs quand la liste change ou que le composant disparaît
	$effect(() => {
		const urls = items.map((i) => i.url).filter((u): u is string => u !== null);
		return () => urls.forEach((u) => URL.revokeObjectURL(u));
	});
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<label for={inputId} class="text-sm font-medium">{label}</label>
	{/if}

	<!-- Le vrai input, caché visuellement mais accessible -->
	<input
		bind:this={input}
		id={inputId}
		type="file"
		class="sr-only"
		accept={getAcceptAttribute(accept, { allowWord })}
		{multiple}
		{disabled}
		aria-describedby={hintId}
		onchange={handleInputChange}
	/>

	<!-- ===== ZONE DE DÉPÔT ===== -->
	{#if canAddMore}
		<button
			type="button"
			{disabled}
			onclick={() => input?.click()}
			ondragenter={onDragEnter}
			ondragleave={onDragLeave}
			ondragover={onDragOver}
			ondrop={onDrop}
			aria-describedby={hintId}
			class="focus-visible:ring-ring flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center
				transition-colors focus-visible:ring-2 focus-visible:outline-none
				disabled:cursor-not-allowed disabled:opacity-50
				{isDragging
				? 'border-primary bg-primary/5'
				: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}"
		>
			<Upload class="size-6 {isDragging ? 'text-primary' : 'text-muted-foreground'}" />

			<span class="text-sm font-medium">
				<!-- Souris : on propose le glisser-déposer -->
				<span class="hidden pointer-fine:inline">
					Glissez {multiple ? 'vos fichiers' : 'un fichier'} ici ou
					<span class="text-primary underline underline-offset-2">parcourez</span>
				</span>
				<!-- Écran tactile : pas de glisser-déposer -->
				<span class="pointer-fine:hidden">
					{multiple ? 'Choisir des fichiers' : 'Choisir un fichier'}
				</span>
			</span>

			<span id={hintId} class="text-muted-foreground text-xs">
				{hint}{multiple ? ` — ${maxFiles} fichiers max` : ''}
			</span>
		</button>
	{/if}

	<!-- ===== ERREURS ===== -->
	{#if rejected.length > 0}
		<ul class="text-destructive space-y-1 text-sm" role="alert">
			{#each rejected as item, i (i)}
				<li><span class="font-medium">{item.name}</span> : {item.error}</li>
			{/each}
		</ul>
	{/if}

	{#if error}
		<p class="text-destructive text-sm" role="alert">{error}</p>
	{/if}

	<!-- ===== FICHIERS CHOISIS ===== -->
	{#if items.length > 0}
		<ul class="flex flex-col gap-2">
			{#each items as item (item.key)}
				<li class="flex items-center gap-3 rounded-lg border p-2">
					<div
						class="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
					>
						{#if item.type === 'IMAGE' && item.url}
							<!-- alt vide : le nom du fichier est juste à côté -->
							<ImagePreview src={item.url} alt="" />
						{:else if item.type === 'VIDEO'}
							<Film class="text-muted-foreground size-5" />
						{:else if item.file.type === DOCX_MIME}
							<FileType class="size-5 text-blue-600" />
						{:else}
							<FileText class="size-5 text-red-600" />
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium" title={item.file.name}>{item.file.name}</p>
						{#if progress[item.key] !== undefined}
							<div class="mt-1 flex items-center gap-2">
								<div
									class="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
									role="progressbar"
									aria-valuenow={progress[item.key]}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label="Envoi de {item.file.name}"
								>
									<div
										class="bg-primary h-full transition-[width] duration-200"
										style:width="{progress[item.key]}%"
									></div>
								</div>
								<span class="text-muted-foreground w-9 text-right text-xs tabular-nums">
									{progress[item.key]} %
								</span>
							</div>
						{:else}
							<p class="text-muted-foreground text-xs">{formatBytes(item.file.size)}</p>
						{/if}
					</div>

					{#if item.type === 'DOCUMENT' && item.url}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							class="{buttonVariants({ variant: 'outline', size: 'sm' })} {embeddedPdf
								? 'lg:hidden'
								: ''}"
							aria-label="Aperçu de {item.file.name} dans un nouvel onglet"
						>
							<Eye class="size-4" />
							<span class="hidden sm:inline">Aperçu</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}

					<Button
						type="button"
						variant="ghost"
						size="icon"
						{disabled}
						onclick={() => removeFile(item.file)}
						aria-label="Retirer {item.file.name}"
					>
						<X class="size-4" />
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
	<!-- ===== PRÉVISUALISATION PDF (PC) ===== -->
	{#if embeddedPdf?.url}
		<object
			data={embeddedPdf.url}
			type="application/pdf"
			class="hidden h-96 w-full rounded-lg border lg:block"
			aria-label="Aperçu de {embeddedPdf.file.name}"
		>
			<p class="text-muted-foreground p-4 text-sm">
				Votre navigateur ne peut pas afficher l'aperçu. Utilisez le bouton « Aperçu ».
			</p>
		</object>
	{/if}
</div>
