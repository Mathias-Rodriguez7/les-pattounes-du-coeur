<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Check, LoaderCircle } from '@lucide/svelte';
	import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';

	// =====================================================================
	// Un PDF dessiné DANS la page, avec pdf.js (la bibliothèque de Firefox).
	// Contrairement à un <iframe> (le lecteur du navigateur, une boîte fermée), on voit le
	// défilement : on peut savoir quand la personne est arrivée à la fin du document.
	// Les pages sont dessinées au fur et à mesure qu'elles approchent de l'écran (mémoire).
	// =====================================================================

	interface Props {
		url: string;
		title: string;
		/** Appelé une fois, quand la fin du document est atteinte (ou s'il ne peut pas s'afficher) */
		onReachedEnd: () => void;
	}

	let { url, title, onReachedEnd }: Props = $props();

	let scroller = $state<HTMLDivElement>();
	let pages = $state<{ number: number; ratio: number }[]>([]);
	let canvases = $state<HTMLCanvasElement[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let currentPage = $state(1);
	let reachedEnd = $state(false);

	// Les pages déjà dessinées (ou en cours) : on ne dessine jamais deux fois la même.
	// Volontairement NON réactif (rien à l'écran n'en dépend) : un Set ordinaire suffit
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const rendered = new Set<number>();
	let loadingTask: PDFDocumentLoadingTask | null = null;
	let pdf: PDFDocumentProxy | null = null;

	function markEnd() {
		if (reachedEnd) return;
		reachedEnd = true;
		onReachedEnd();
	}

	async function renderPage(index: number) {
		const canvas = canvases[index];
		if (!pdf || !canvas || rendered.has(index)) return;
		rendered.add(index);

		const page = await pdf.getPage(index + 1);
		// Netteté : la largeur affichée × la densité de l'écran (plafonnée, pour la mémoire)
		const cssWidth = canvas.clientWidth;
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		const base = page.getViewport({ scale: 1 });
		const viewport = page.getViewport({ scale: (cssWidth / base.width) * ratio });
		canvas.width = Math.floor(viewport.width);
		canvas.height = Math.floor(viewport.height);
		await page.render({ canvas, viewport }).promise;
	}

	/** Au défilement : la page en cours, et la fin du document */
	function handleScroll() {
		if (!scroller || status !== 'ready') return;
		const middle = scroller.scrollTop + scroller.clientHeight / 2;
		// La page en cours : la dernière dont le haut est passé au-dessus du milieu de la zone
		let index = 0;
		canvases.forEach((canvas, i) => {
			if (canvas && canvas.offsetTop <= middle) index = i;
		});
		currentPage = index + 1;

		// 40 px de marge : inutile d'exiger le tout dernier pixel
		if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 40) markEnd();
	}

	onMount(() => {
		let observer: IntersectionObserver | undefined;
		let cancelled = false;

		(async () => {
			try {
				// Chargé seulement sur cette page : le reste du site ne s'alourdit pas
				const pdfjs = await import('pdfjs-dist');
				const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
				pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

				loadingTask = pdfjs.getDocument({ url });
				pdf = await loadingTask.promise;
				if (cancelled) return;

				// D'abord la taille de chaque page : la zone qui défile a tout de suite sa vraie hauteur
				const sizes = [];
				for (let number = 1; number <= pdf.numPages; number++) {
					const viewport = (await pdf.getPage(number)).getViewport({ scale: 1 });
					sizes.push({ number, ratio: viewport.width / viewport.height });
				}
				pages = sizes;
				status = 'ready';
				await tick();

				// Puis on dessine les pages quand elles approchent de l'écran
				observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								void renderPage(canvases.indexOf(entry.target as HTMLCanvasElement));
							}
						}
					},
					{ root: scroller, rootMargin: '100% 0px' }
				);
				canvases.forEach((canvas) => canvas && observer?.observe(canvas));

				// Un document assez court pour tenir sans défiler : la fin est déjà visible
				handleScroll();
			} catch (error) {
				console.error('❌ PDF non affiché :', error);
				status = 'error';
				// Sans affichage, impossible de défiler : on ne bloque pas la personne
				// (elle a le lien « Télécharger » pour lire le document)
				markEnd();
			}
		})();

		return () => {
			cancelled = true;
			observer?.disconnect();
			// Libère le document et son « worker » (le fil de calcul de pdf.js)
			void loadingTask?.destroy();
		};
	});
</script>

<div class="grid gap-2">
	<!-- La zone qui défile. tabindex : on doit pouvoir la faire défiler au clavier (flèches),
	     d'où le focus sur une zone non interactive (règle WCAG des zones défilantes) -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={scroller}
		onscroll={handleScroll}
		tabindex="0"
		role="region"
		aria-label="Document : {title}"
		class="overflow-y-auto rounded-xl border bg-muted/50 p-2 sm:p-4"
		style="height: 70vh; min-height: 24rem"
	>
		{#if status === 'loading'}
			<div class="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
				<LoaderCircle class="size-5 animate-spin" />
				Chargement du document…
			</div>
		{:else if status === 'error'}
			<p class="p-4 text-sm text-muted-foreground">
				Le document ne peut pas s'afficher ici. Téléchargez-le pour le lire, puis revenez sur cette
				page pour le valider.
			</p>
		{/if}

		<div class="mx-auto grid max-w-3xl gap-3">
			{#each pages as page, index (page.number)}
				<!-- aspect-ratio : chaque page a sa hauteur AVANT d'être dessinée -->
				<canvas
					bind:this={canvases[index]}
					class="w-full rounded-md bg-white shadow-sm"
					style="aspect-ratio: {page.ratio}"
					aria-label="Page {page.number} sur {pages.length}"
				></canvas>
			{/each}
		</div>
	</div>

	{#if status === 'ready'}
		<div class="flex flex-wrap items-center justify-between gap-2 text-sm">
			<span class="text-muted-foreground">Page {currentPage} / {pages.length}</span>
			{#if reachedEnd}
				<span class="flex items-center gap-1 font-medium text-green-700">
					<Check class="size-4" />
					Vous êtes arrivée à la fin du document
				</span>
			{:else}
				<span class="text-muted-foreground"
					>Faites défiler jusqu'à la fin pour pouvoir accepter</span
				>
			{/if}
		</div>
	{/if}
</div>
