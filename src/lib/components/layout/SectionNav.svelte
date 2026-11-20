<script module lang="ts">
	/** À mettre sur chaque rubrique : la place de l'en-tête (téléphone) et de la barre au-dessus */
	export const SECTION_SCROLL_MARGIN = 'scroll-mt-28 lg:scroll-mt-16';
</script>

<script lang="ts">
	// La barre d'ancres d'une fiche (chat, FA, bénévole) : collée en haut du panneau pendant qu'on défile.
	// Le panneau doit être en overflow-clip (pas hidden), sinon elle ne reste pas collée.
	// Un clic descend jusqu'à la rubrique ; en défilant, la pastille de la rubrique visible s'allume.

	interface Section {
		/** L'id de l'élément de la rubrique dans la page */
		id: string;
		label: string;
	}

	let { sections }: { sections: Section[] } = $props();

	let active = $state('');

	// La rubrique « visible » : celle qui passe dans la bande du haut de l'écran
	$effect(() => {
		const elements = sections
			.map((section) => document.getElementById(section.id))
			.filter((el): el is HTMLElement => !!el);
		if (elements.length === 0) return;
		active = sections[0].id;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting);
				if (visible.length > 0) active = visible[0].target.id;
			},
			{ rootMargin: '-25% 0px -65% 0px' }
		);
		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});

	function goTo(id: string) {
		active = id;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<!-- Collée en haut : sous la barre du panneau sur téléphone (3,25 rem), tout en haut sur ordinateur -->
<nav
	aria-label="Rubriques de la fiche"
	class="sticky top-13 z-10 -mx-6 bg-card/95 px-6 backdrop-blur lg:top-0"
>
	<ul class="flex gap-1.5 overflow-x-auto">
		{#each sections as section (section.id)}
			<li>
				<button
					type="button"
					onclick={() => goTo(section.id)}
					aria-current={active === section.id ? 'true' : undefined}
					class="rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors {active ===
					section.id
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				>
					{section.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
