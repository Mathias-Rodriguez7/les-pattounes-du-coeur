<!-- src/routes/benevole/info/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { FileText, FileType, Download, Eye, Info } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	type Doc = (typeof data.documents)[number];

	let selected = $state<Doc | null>(null);
	let loading = $state(true);

	$effect(() => {
		if (!selected && data.documents.length > 0) {
			selected = data.documents[0];
		}
	});

	const isPdf = (file: string) => file.toLowerCase().endsWith('.pdf');
	const extension = (file: string) => file.split('.').pop()?.toUpperCase() ?? '';

	function select(doc: Doc) {
		if (selected?.file === doc.file) return;
		selected = doc;
		loading = true;
	}

	function onKeydown(e: KeyboardEvent, index: number) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const next =
				e.key === 'ArrowDown'
					? Math.min(index + 1, data.documents.length - 1)
					: Math.max(index - 1, 0);
			select(data.documents[next]);
			document.getElementById(`doc-${next}`)?.focus();
		}
	}
</script>

<svelte:head>
	<title>Informations bénévoles</title>
</svelte:head>

<div class="mx-auto p-8 sm:p-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-gray-900">Documents d'information</h1>
		<p class="mt-2 text-gray-600">
			Retrouvez ici les guides, procédures et modèles utiles dans vos missions.
		</p>
	</header>

	{#if data.documents.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-20 text-center"
		>
			<Info class="mb-4 h-10 w-10 text-gray-400" />
			<h2 class="text-lg font-semibold text-gray-900">Aucun document pour le moment</h2>
			<p class="mt-1 text-sm text-gray-500">
				Revenez plus tard, de nouveaux documents seront ajoutés.
			</p>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-[320px_1fr]">
			<!-- Liste des documents -->
			<aside>
				<div class="mb-3 flex items-center justify-between px-1">
					<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Documents</h2>
					<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
						{data.documents.length}
					</span>
				</div>

				<ul role="listbox" aria-label="Liste des documents" class="flex flex-col gap-2">
					{#each data.documents as doc, i (doc.file)}
						{@const active = selected?.file === doc.file}
						<li>
							<button
								id="doc-{i}"
								type="button"
								role="option"
								aria-selected={active}
								tabindex={active ? 0 : -1}
								onclick={() => select(doc)}
								onkeydown={(e) => onKeydown(e, i)}
								class="group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                    {active
									? 'border-blue-200 bg-blue-50 shadow-sm'
									: 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}"
							>
								<span
									class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                                        {active
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}"
								>
									{#if isPdf(doc.file)}
										<FileText class="h-5 w-5" />
									{:else}
										<FileType class="h-5 w-5" />
									{/if}
								</span>

								<span class="min-w-0 flex-1">
									<span class="flex items-center gap-2">
										<span class="truncate font-medium text-gray-900">{doc.title}</span>
										<span
											class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
										>
											{extension(doc.file)}
										</span>
									</span>
									{#if doc.description}
										<span class="mt-1 line-clamp-2 block text-sm text-gray-500"
											>{doc.description}</span
										>
									{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</aside>

			<!-- Aperçu -->
			<section
				class="flex min-h-[60vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
				aria-live="polite"
			>
				{#if selected}
					<header
						class="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div class="min-w-0">
							<h2 class="truncate text-lg font-semibold text-gray-900">{selected.title}</h2>
							{#if selected.description}
								<p class="truncate text-sm text-gray-500">{selected.description}</p>
							{/if}
						</div>
						<a
							href={selected.url}
							download
							class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
						>
							<Download class="h-4 w-4" />
							Télécharger
						</a>
					</header>

					{#if isPdf(selected.file)}
						<div class="relative flex-1 bg-gray-100">
							{#if loading}
								<div class="absolute inset-0 flex items-center justify-center">
									<div
										class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
									></div>
								</div>
							{/if}
							{#key selected.file}
								<iframe
									src={selected.url}
									title={selected.title}
									onload={() => (loading = false)}
									class="h-full min-h-[60vh] w-full border-0 transition-opacity {loading
										? 'opacity-0'
										: 'opacity-100'}"
								></iframe>
							{/key}
						</div>
					{:else}
						<div class="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
							<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
								<Eye class="h-8 w-8 text-gray-400" />
							</div>
							<div>
								<p class="font-medium text-gray-900">Aperçu indisponible</p>
								<p class="mt-1 text-sm text-gray-500">
									Ce format ({extension(selected.file)}) ne peut pas être affiché dans le
									navigateur.
								</p>
							</div>
							<a
								href={selected.url}
								download
								class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								<Download class="h-4 w-4" />
								Télécharger le fichier
							</a>
						</div>
					{/if}
				{/if}
			</section>
		</div>
	{/if}
</div>
