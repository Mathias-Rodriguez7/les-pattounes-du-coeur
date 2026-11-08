<!-- src/routes/(app)/dashboard/information/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import type { InfoDocumentCategory } from '@prisma/client';
	import { fade, fly } from 'svelte/transition';
	import { FileText, FileType, Download, Eye, Info, Search, SearchX } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { DOCX_MIME, formatBytes } from '$lib/media/rules';
	import {
		INFO_DOCUMENT_CATEGORY,
		INFO_DOCUMENT_CATEGORY_ORDER
	} from '$lib/constants/infoDocument';
	import InfoDocumentCreateDialog from '$lib/components/infoDocuments/InfoDocumentCreateDialog.svelte';
	import InfoDocumentEditDialog from '$lib/components/infoDocuments/InfoDocumentEditDialog.svelte';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';

	let { data }: { data: PageData } = $props();

	type Doc = PageData['documents'][number];

	// ===== FORMAT =====
	const isWord = (doc: Doc) => doc.file.mimeType === DOCX_MIME;
	const formatLabel = (doc: Doc) => (isWord(doc) ? 'Word' : 'PDF');

	function iconClass(doc: Doc, active: boolean) {
		if (active) return 'bg-primary text-primary-foreground';
		// -100 et non -50 : le panneau est rose, un fond trop pâle disparaîtrait
		return isWord(doc) ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600';
	}

	// ===== FILTRES =====
	let query = $state('');
	let category = $state<InfoDocumentCategory | 'ALL'>('ALL');

	/** « Santé » → « sante » : la recherche ignore les majuscules et les accents */
	const normalize = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();

	const filtered = $derived.by(() => {
		const q = normalize(query.trim());
		return data.documents.filter(
			(doc) =>
				(category === 'ALL' || doc.category === category) &&
				(!q || normalize(`${doc.title} ${doc.description ?? ''}`).includes(q))
		);
	});

	// Les groupes non vides, dans l'ordre des constantes
	const groups = $derived(
		INFO_DOCUMENT_CATEGORY_ORDER.map((cat) => ({
			category: cat,
			docs: filtered.filter((doc) => doc.category === cat)
		})).filter((group) => group.docs.length > 0)
	);

	// La liste « à plat », dans l'ordre affiché : pour les flèches du clavier
	const ordered = $derived(groups.flatMap((group) => group.docs));

	// Les puces : « Tous », puis les catégories qui ont au moins un document
	const chips = $derived([
		{ value: 'ALL' as const, label: 'Tous', count: data.documents.length },
		...INFO_DOCUMENT_CATEGORY_ORDER.map((cat) => ({
			value: cat,
			label: INFO_DOCUMENT_CATEGORY[cat].plural,
			count: data.documents.filter((doc) => doc.category === cat).length
		})).filter((chip) => chip.count > 0)
	]);

	function resetFilters() {
		query = '';
		category = 'ALL';
	}

	// ===== SÉLECTION (PC) =====
	let selectedId = $state<string | null>(null);

	// Le document choisi s'il est encore visible, sinon le premier de la liste
	const selected = $derived(ordered.find((doc) => doc.id === selectedId) ?? ordered[0] ?? null);

	// Le chargement est fini quand l'iframe du document affiché a déclenché onload
	let loadedId = $state<string | null>(null);
	const loading = $derived(selected !== null && !isWord(selected) && loadedId !== selected.id);

	function onKeydown(e: KeyboardEvent, doc: Doc) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();

		const index = ordered.indexOf(doc);
		const nextIndex =
			e.key === 'ArrowDown' ? Math.min(index + 1, ordered.length - 1) : Math.max(index - 1, 0);
		const next = ordered[nextIndex];

		selectedId = next.id;
		document.getElementById(`doc-${next.id}`)?.focus();
	}
</script>

<svelte:head>
	<title>Documents d'information</title>
</svelte:head>

<!-- ===== UNE LIGNE DE LA LISTE (partagée entre PC et mobile) ===== -->
<!-- Le parent porte la classe « group » : l'icône et le titre réagissent à son survol -->
{#snippet docRow(doc: Doc, active: boolean)}
	<span
		class="flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 {iconClass(
			doc,
			active
		)}"
	>
		{#if isWord(doc)}
			<FileType class="size-5" />
		{:else}
			<FileText class="size-5" />
		{/if}
	</span>
	<span class="min-w-0 flex-1">
		<span
			class="group-hover:text-accent-foreground block truncate text-sm font-medium transition-colors {active
				? 'text-accent-foreground'
				: ''}"
		>
			{doc.title}
		</span>
		<span class="text-muted-foreground block text-xs">
			{formatLabel(doc)} · {formatBytes(doc.file.sizeBytes)}
		</span>
	</span>
{/snippet}

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ===== EN-TÊTE ===== -->
		<header class="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
					Documents d'information
					<span class="text-muted-foreground text-base font-normal">· {data.documents.length}</span>
				</h1>
				<p class="text-muted-foreground mt-1 text-sm sm:text-base">
					Guides, procédures et modèles utiles dans vos missions.
				</p>
			</div>
			{#if data.isAdmin}
				<InfoDocumentCreateDialog />
			{/if}
		</header>

		{#if data.documents.length === 0}
			<!-- ===== AUCUN DOCUMENT ===== -->
			<div
				class="bg-muted/40 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center"
			>
				<Info class="text-muted-foreground mb-4 size-10" />
				<h2 class="text-lg font-semibold">Aucun document pour le moment</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Revenez plus tard, de nouveaux documents seront ajoutés.
				</p>
			</div>
		{:else}
			<div class="grid gap-4 lg:grid-cols-[320px_1fr] lg:gap-6">
				<!-- ===== LISTE : panneau translucide, comme la sidebar ===== -->
				<aside
					class="bg-accent/10 border-accent/40 flex min-w-0 flex-col gap-3 rounded-2xl border p-3 shadow-sm backdrop-blur-lg sm:p-4"
				>
					<div class="relative">
						<Search
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
						/>
						<Input
							type="search"
							bind:value={query}
							placeholder="Rechercher un document"
							aria-label="Rechercher un document"
							class="bg-background/80 pl-9"
						/>
					</div>

					<!-- Mobile : les puces défilent jusqu'au bord du panneau ; PC : elles passent à la ligne -->
					<div
						role="group"
						aria-label="Filtrer par catégorie"
						class="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0 lg:flex-wrap lg:overflow-visible"
					>
						{#each chips as chip (chip.value)}
							{@const on = category === chip.value}
							<button
								type="button"
								aria-pressed={on}
								onclick={() => (category = chip.value)}
								class="focus-visible:ring-ring shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none
									{on
									? 'border-primary bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground border-black/10 bg-white/60 hover:bg-white'}"
							>
								{chip.label}
								<span class="ml-0.5 tabular-nums">{chip.count}</span>
							</button>
						{/each}
					</div>

					{#if groups.length === 0}
						<!-- ===== AUCUN RÉSULTAT ===== -->
						<div
							class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-black/15 bg-white/40 px-4 py-10 text-center"
						>
							<SearchX class="text-muted-foreground size-8" />
							<p class="text-sm font-medium">Aucun document ne correspond</p>
							<Button variant="outline" size="sm" class="rounded-2xl" onclick={resetFilters}>
								Réinitialiser
							</Button>
						</div>
					{:else}
						<nav aria-label="Documents" class="flex flex-col gap-4">
							{#each groups as group (group.category)}
								<section aria-labelledby="group-{group.category}">
									<h2
										id="group-{group.category}"
										class="text-muted-foreground mb-1.5 px-1 text-xs font-semibold tracking-wide uppercase"
									>
										{INFO_DOCUMENT_CATEGORY[group.category].plural}
									</h2>

									<ul class="flex flex-col gap-1">
										{#each group.docs as doc (doc.id)}
											{@const active = selected?.id === doc.id}
											<li class="flex items-center gap-1">
												<!-- PC : affiche le document dans l'aperçu -->
												<button
													id="doc-{doc.id}"
													type="button"
													aria-current={active ? 'true' : undefined}
													onclick={() => (selectedId = doc.id)}
													onkeydown={(e) => onKeydown(e, doc)}
													class="group focus-visible:ring-ring hidden w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none lg:flex
			{active
														? 'bg-background ring-primary/30 shadow-sm ring-1'
														: 'hover:bg-background/70 hover:ring-primary/20 hover:translate-x-0.5 hover:shadow-sm hover:ring-1'}"
												>
													{@render docRow(doc, active)}
												</button>

												<!-- Mobile : ouvre le PDF dans la visionneuse du téléphone, télécharge un Word -->
												<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
												<a
													href={isWord(doc) ? doc.downloadUrl : doc.url}
													target={isWord(doc) ? undefined : '_blank'}
													rel="noopener noreferrer"
													class="group active:bg-background/70 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 transition-colors lg:hidden"
												>
													{@render docRow(doc, false)}
												</a>
												<!-- eslint-enable svelte/no-navigation-without-resolve -->

												<!-- Mobile, admins : sur PC, ces boutons sont dans l'en-tête de l'aperçu -->
												{#if data.isAdmin}
													<div class="flex shrink-0 items-center lg:hidden">
														<InfoDocumentEditDialog {doc} iconOnly />
														<DeleteButton
															iconOnly
															entityId={doc.id}
															firstName={doc.title}
															lastName=""
															showDelete={true}
															actionName="?/deleteInfoDocument"
															fieldName="documentId"
															deleteConfirmMessage="Supprimer ce document ? Le fichier sera définitivement effacé."
														/>
													</div>
												{/if}
											</li>
										{/each}
									</ul>
								</section>
							{/each}
						</nav>
					{/if}
				</aside>

				<!-- ===== APERÇU (PC uniquement) ===== -->
				<section
					aria-live="polite"
					class="bg-card hidden min-h-[70vh] flex-col overflow-hidden rounded-2xl shadow-sm lg:flex"
				>
					{#if selected}
						<header class="flex items-start justify-between gap-4 border-b px-5 py-4">
							<div class="min-w-0">
								<span
									class="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-medium"
								>
									{INFO_DOCUMENT_CATEGORY[selected.category].label}
								</span>
								<h2 class="mt-1.5 truncate text-lg font-semibold">{selected.title}</h2>
								{#if selected.description}
									<p class="text-muted-foreground mt-0.5 text-sm">{selected.description}</p>
								{/if}
							</div>

							<div class="flex shrink-0 items-center gap-2">
								<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
								<a href={selected.downloadUrl} class="{buttonVariants({ size: 'sm' })} rounded-2xl">
									<Download class="size-4" />
									Télécharger
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
								<!-- Étape 3c : Modifier / Supprimer (admins) -->
								{#if data.isAdmin}
									<InfoDocumentEditDialog doc={selected} />
									<DeleteButton
										iconOnly
										entityId={selected.id}
										firstName={selected.title}
										lastName=""
										showDelete={true}
										actionName="?/deleteInfoDocument"
										fieldName="documentId"
										deleteConfirmMessage="Supprimer ce document ? Le fichier sera définitivement effacé."
									/>
								{/if}
							</div>
						</header>

						{#if isWord(selected)}
							<!-- Un navigateur ne sait pas afficher un Word -->
							<div class="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
								<div class="bg-muted flex size-16 items-center justify-center rounded-2xl">
									<Eye class="text-muted-foreground size-8" />
								</div>
								<div>
									<p class="font-medium">Aperçu indisponible</p>
									<p class="text-muted-foreground mt-1 text-sm">
										Un document Word ne peut pas s'afficher dans le navigateur.
									</p>
								</div>
							</div>
						{:else}
							<div class="bg-muted relative flex-1">
								{#if loading}
									<div class="absolute inset-0 flex items-center justify-center">
										<div
											class="border-muted-foreground/30 border-t-primary size-8 animate-spin rounded-full border-4"
										></div>
									</div>
								{/if}

								<!-- {#key} : une nouvelle iframe pour chaque document -->
								{#key selected.id}
									<iframe
										src={selected.url}
										title={selected.title}
										onload={() => (loadedId = selected?.id ?? null)}
										class="absolute inset-0 h-full w-full border-0 transition-opacity
											{loading ? 'opacity-0' : 'opacity-100'}"
									></iframe>
								{/key}
							</div>
						{/if}
					{/if}
				</section>
			</div>
		{/if}
	</div>
</main>
