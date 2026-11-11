<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle } from '@lucide/svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	type FocalMedia = {
		id: string;
		url: string;
		alt: string;
		/** En pourcentage, comme object-position : 0 = bord gauche/haut, 100 = bord droit/bas */
		focalPointX: number;
		focalPointY: number;
	};

	interface Props {
		open?: boolean;
		media: FocalMedia | null;
	}

	let { open = $bindable(false), media }: Props = $props();

	// Les formats d'affichage de l'appli
	const FORMATS = [
		{ label: 'Miniature (carré)', ratio: 1 },
		{ label: 'Bandeau', ratio: 16 / 9 }
	];

	let x = $state(50);
	let y = $state(50);
	let ratio = $state(FORMATS[0].ratio);
	let imageRatio = $state<number | null>(null); // largeur / hauteur de la photo
	let saving = $state(false);

	// À chaque ouverture, on repart du cadrage ENREGISTRÉ
	$effect(() => {
		if (open && media) {
			untrack(() => {
				x = media.focalPointX;
				y = media.focalPointY;
				ratio = FORMATS[0].ratio;
				imageRatio = null; // recalculé quand l'image est chargée
			});
		}
	});

	const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

	// ===== LE CADRE (tout en % de l'image affichée) =====
	const frame = $derived.by(() => {
		if (!imageRatio) return null;

		if (imageRatio > ratio) {
			// Photo plus large que le format : cadre sur toute la hauteur, il glisse de gauche à droite
			const width = (ratio / imageRatio) * 100;
			return { width, height: 100, left: (x / 100) * (100 - width), top: 0 };
		}
		// Photo plus haute que le format : cadre sur toute la largeur, il glisse de haut en bas
		const height = (imageRatio / ratio) * 100;
		return { width: 100, height, left: 0, top: (y / 100) * (100 - height) };
	});

	/** Place le cadre (coin haut gauche, en %) et en déduit le point focal */
	function placeFrame(left: number, top: number) {
		if (!frame) return;
		const freeX = 100 - frame.width;
		const freeY = 100 - frame.height;
		if (freeX > 0) x = (clamp(left, 0, freeX) / freeX) * 100;
		if (freeY > 0) y = (clamp(top, 0, freeY) / freeY) * 100;
	}

	// ===== SOURIS ET DOIGT =====
	let stage = $state<HTMLDivElement | null>(null);
	let drag: {
		startX: number;
		startY: number;
		left: number;
		top: number;
		w: number;
		h: number;
	} | null = null;

	function onPointerDown(event: PointerEvent) {
		if (!stage || !frame) return;
		const rect = stage.getBoundingClientRect();

		// Clic à côté du cadre : on le centre sur le point touché
		const onFrame = (event.target as HTMLElement).closest('[data-frame]');
		if (!onFrame) {
			const px = ((event.clientX - rect.left) / rect.width) * 100;
			const py = ((event.clientY - rect.top) / rect.height) * 100;
			placeFrame(px - frame.width / 2, py - frame.height / 2);
		}

		// Puis on suit le glissement, même si le pointeur sort de l'image
		drag = {
			startX: event.clientX,
			startY: event.clientY,
			left: frame.left,
			top: frame.top,
			w: rect.width,
			h: rect.height
		};
		stage.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!drag) return;
		const dx = ((event.clientX - drag.startX) / drag.w) * 100;
		const dy = ((event.clientY - drag.startY) / drag.h) * 100;
		placeFrame(drag.left + dx, drag.top + dy);
	}

	function onPointerUp() {
		drag = null;
	}

	// ===== CLAVIER : flèches (Maj = plus grand pas) =====
	const MOVES: Record<string, [number, number]> = {
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, -1],
		ArrowDown: [0, 1]
	};

	function moveWithKeys(event: KeyboardEvent) {
		const move = MOVES[event.key];
		if (!move) return;
		event.preventDefault();
		const step = event.shiftKey ? 10 : 2;
		x = clamp(x + move[0] * step);
		y = clamp(y + move[1] * step);
	}

	// ===== ENREGISTREMENT =====
	const handleSave: SubmitFunction = () => {
		saving = true;
		return async ({ result, update }) => {
			saving = false;
			if (result.type === 'success') {
				toast.success('Cadrage enregistré');
				open = false;
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Impossible d'enregistrer le cadrage");
			}
			await update();
		};
	};

	// Dimensions RÉELLES du fichier (pas celles de l'affichage), connues une fois l'image chargée
	function handleImageLoad(event: Event) {
		if (event.currentTarget instanceof HTMLImageElement) {
			imageRatio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Régler le cadrage</Dialog.Title>
			<Dialog.Description>
				Faites glisser le cadre sur la partie à garder visible. Au clavier : les flèches, et Maj
				pour aller plus vite.
			</Dialog.Description>
		</Dialog.Header>

		{#if media}
			<!-- Choix du format à vérifier -->
			<div class="flex flex-wrap gap-2" role="group" aria-label="Format d'affichage">
				{#each FORMATS as format (format.label)}
					<Button
						type="button"
						size="sm"
						class="rounded-2xl"
						variant={ratio === format.ratio ? 'default' : 'outline'}
						aria-pressed={ratio === format.ratio}
						onclick={() => (ratio = format.ratio)}>{format.label}</Button
					>
				{/each}
			</div>

			<div class="flex justify-center">
				<!-- Les déplacements à la souris et au doigt sont gérés ici ;
				     l'équivalent clavier est sur le cadre lui-même (un vrai bouton) -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					bind:this={stage}
					class="relative inline-block touch-none overflow-hidden rounded-lg select-none"
					onpointerdown={onPointerDown}
					onpointermove={onPointerMove}
					onpointerup={onPointerUp}
					onpointercancel={onPointerUp}
				>
					<img
						src={media.url}
						alt={media.alt}
						draggable="false"
						class="block max-h-[50dvh] w-auto max-w-full"
						onload={handleImageLoad}
					/>

					{#if frame}
						<button
							type="button"
							data-frame
							class="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.55)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
							style:left="{frame.left}%"
							style:top="{frame.top}%"
							style:width="{frame.width}%"
							style:height="{frame.height}%"
							onkeydown={moveWithKeys}
							aria-label="Zone visible de la photo. Flèches pour la déplacer."
						>
							<!-- Grille des tiers -->
							<span class="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/50"></span>
							<span class="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/50"></span>
							<span class="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/50"></span>
							<span class="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/50"></span>
						</button>
					{/if}
				</div>
			</div>

			{#if frame && frame.width >= 100 && frame.height >= 100}
				<p class="text-center text-sm text-muted-foreground">
					Cette photo a déjà ce format : elle sera affichée en entier.
				</p>
			{/if}

			<form
				method="POST"
				action="?/updateCatMediaFocalPoint"
				use:enhance={handleSave}
				class="contents"
			>
				<input type="hidden" name="mediaId" value={media.id} />
				<input type="hidden" name="focalPointX" value={x.toFixed(1)} />
				<input type="hidden" name="focalPointY" value={y.toFixed(1)} />

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (open = false)} disabled={saving}
						>Annuler</Button
					>

					<Button type="submit" disabled={saving}>
						{#if saving}
							<LoaderCircle class="size-4 animate-spin" />
						{/if}
						Enregistrer
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
