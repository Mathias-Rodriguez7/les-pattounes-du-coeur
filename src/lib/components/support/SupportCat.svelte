<script lang="ts">
	import { resolve } from '$app/paths';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { HeartHandshake, House, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Le chat Leegloo passe la tête en bas à droite de l'accueil. Au clic, une bulle :
	// le partenariat SAFTI et le don.
	// - Il arrive 5 s après l'ouverture (avant, la vidéo capte le regard), avec un petit rebond ;
	// - puis un « coucou » toutes les 20 s, 3 fois au plus, et plus du tout dès qu'on l'a touché ;
	// - la bulle s'ouvre toute seule à chaque arrivée sur l'accueil, après un tiers de page.
	// Réglage « réduire les animations » : il apparaît en fondu, sans rebond ni coucou.

	const AUTO_OPEN_SCROLL = 1 / 3;
	const ARRIVAL_DELAY_MS = 5000;
	const WAVE_EVERY_MS = 20000;
	const WAVE_MAX = 3;
	const WAVE_DURATION_MS = 900;

	let open = $state(false);
	let arrived = $state(false);
	let waving = $state(false);
	// Dès que le visiteur a cliqué sur le chat ou ouvert la bulle : plus de coucou
	let interacted = false;

	function toggle() {
		open = !open;
		interacted = true;
	}

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const timers: ReturnType<typeof setTimeout>[] = [];
		let waveInterval: ReturnType<typeof setInterval> | undefined;

		// L'arrivée, puis les coucous
		timers.push(
			setTimeout(() => {
				arrived = true;
				if (reduceMotion) return;
				let waves = 0;
				waveInterval = setInterval(() => {
					if (interacted || open || waves >= WAVE_MAX) {
						clearInterval(waveInterval);
						return;
					}
					waves++;
					waving = true;
					timers.push(setTimeout(() => (waving = false), WAVE_DURATION_MS));
				}, WAVE_EVERY_MS);
			}, ARRIVAL_DELAY_MS)
		);

		// La bulle automatique : une fois à chaque arrivée sur l'accueil, pas avant le chat
		function onScroll() {
			if (!arrived) return;
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			if (scrollable > 0 && window.scrollY / scrollable < AUTO_OPEN_SCROLL) return;
			open = true;
			interacted = true;
			window.removeEventListener('scroll', onScroll);
		}
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			timers.forEach(clearTimeout);
			clearInterval(waveInterval);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && open && (open = false)} />

<div
	class="pointer-events-none fixed right-3 bottom-[4.75rem] z-40 flex flex-col items-end sm:right-6 md:bottom-0"
>
	<!-- LA BULLE -->
	{#if open}
		<div
			id="support-cat-bubble"
			role="dialog"
			aria-label="Nous soutenir"
			transition:fly={{ y: 12, duration: 200 }}
			class="pointer-events-auto relative mr-2 mb-2 w-72 rounded-2xl border border-orange-200 bg-card p-4 shadow-lg"
		>
			<button
				type="button"
				onclick={() => (open = false)}
				class="absolute top-2 right-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="Fermer"
			>
				<X class="size-4" />
			</button>

			<p class="pr-6 text-sm font-semibold text-orange-800">Partenariat SAFTI</p>
			<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
				Vous achetez ou vendez un bien immobilier ? Avec SAFTI, au moins
				<strong class="text-foreground">835 €</strong> sont reversés aux chats.
			</p>

			<div class="mt-3 flex flex-wrap gap-2">
				<a
					href={resolve('don#safti')}
					onclick={() => (open = false)}
					class="{buttonVariants({
						size: 'sm',
						variant: 'outline'
					})} border-orange-300 text-orange-800 hover:bg-orange-50 hover:text-orange-900"
				>
					<House class="size-4" />
					Comment ça marche
				</a>
				<a
					href={resolve('don')}
					onclick={() => (open = false)}
					class={buttonVariants({ size: 'sm' })}
				>
					<HeartHandshake class="size-4" />
					Faire un don
				</a>
			</div>

			<!-- La pointe de la bulle, vers le chat -->
			<span
				aria-hidden="true"
				class="absolute right-12 -bottom-2 size-4 rotate-45 border-r border-b border-orange-200 bg-card"
			></span>
		</div>
	{/if}

	<!-- LE CHAT : collé au bas de l'écran, il se redresse un peu au survol -->
	{#if arrived}
		<button
			type="button"
			onclick={toggle}
			aria-expanded={open}
			aria-controls="support-cat-bubble"
			aria-label="Nous soutenir : don et partenariat SAFTI"
			class="cat-arrive pointer-events-auto block w-20 translate-y-2 transition-transform duration-200 hover:translate-y-0 focus-visible:translate-y-0 motion-reduce:transition-none sm:w-28"
		>
			<img
				class:cat-wave={waving}
				src="/img/leegloo-chat-soutenir.webp"
				alt=""
				width="280"
				height="282"
				class="h-auto w-full drop-shadow-md"
			/>
		</button>
	{/if}
</div>

<style>
	/* L'arrivée : il sort du bas de l'écran et se pose avec un petit rebond */
	.cat-arrive {
		animation: cat-arrive 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	@keyframes cat-arrive {
		from {
			transform: translateY(110%);
		}
		to {
			transform: translateY(0);
		}
	}

	/* Le coucou : il se soulève en se dandinant, puis se repose */
	.cat-wave {
		animation: cat-wave 0.9s ease-in-out;
		transform-origin: bottom center;
	}
	@keyframes cat-wave {
		0%,
		100% {
			transform: translateY(0) rotate(0);
		}
		30% {
			transform: translateY(-14px) rotate(-5deg);
		}
		60% {
			transform: translateY(-10px) rotate(5deg);
		}
	}

	/* « Réduire les animations » : un simple fondu */
	@media (prefers-reduced-motion: reduce) {
		.cat-arrive {
			animation: cat-fade 0.4s ease-out both;
		}
		@keyframes cat-fade {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}
</style>
