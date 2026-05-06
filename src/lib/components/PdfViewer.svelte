<script lang="ts">
	import pdfjsLib from '$lib/pdf/pdf';

	let { url } = $props<{ url: string }>();

	let canvas: HTMLCanvasElement;

	async function renderPdf() {
		console.log('🚀 START render');
		console.log('📄 URL:', url);

		if (!url || !canvas) {
			console.log('❌ url or canvas missing');
			return;
		}

		try {
			const pdf = await pdfjsLib.getDocument(url).promise;

			console.log('📦 PDF loaded');

			const page = await pdf.getPage(1);

			const viewport = page.getViewport({ scale: 1.5 });

			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('No canvas context');

			// reset canvas
			canvas.width = viewport.width;
			canvas.height = viewport.height;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const renderTask = page.render({
				canvas,
				canvasContext: ctx,
				viewport
			});

			await renderTask.promise;

			console.log('✅ render done');
		} catch (e) {
			console.error('💥 PDF ERROR:', e);
		}
	}

	$effect(() => {
		renderPdf();
	});
</script>

<canvas bind:this={canvas} class="w-full border" />
