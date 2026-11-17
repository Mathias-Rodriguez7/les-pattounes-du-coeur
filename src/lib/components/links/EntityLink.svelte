<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ENTITY_PAGES, ENTITY_PARAM, type EntityKind } from '#lib/navigation/entityLink.ts';

	// Un nom cliquable : ouvre la page du chat, de la bénévole ou de la FA, panneau ouvert dessus
	interface Props {
		kind: EntityKind;
		/** L'id du chat, de la bénévole ou de la FA (absent : simple texte) */
		id: string | null | undefined;
		class?: string;
		/** Infobulle (par défaut : « Ouvrir sa fiche ») */
		title?: string;
		children: Snippet;
	}

	let { kind, id, class: className = '', title = 'Ouvrir sa fiche', children }: Props = $props();

	// Les pages Bénévoles et FA sont réservées à l'admin : pour les autres, le nom reste du texte.
	// Les pages Chats et SOS sont ouvertes à toutes.
	// (Le serveur protège déjà ces pages : ici, on évite juste un lien qui ne mènerait nulle part.)
	const isAdmin = $derived(page.data.user?.role === 'ADMIN');
	const href = $derived(
		id && (kind === 'cat' || kind === 'sos' || isAdmin)
			? resolve(`${ENTITY_PAGES[kind]}?${ENTITY_PARAM}=${encodeURIComponent(id)}`)
			: null
	);
</script>

{#if href}
	<!-- stopPropagation : le lien peut être dans une ligne ou une carte cliquable -->
	<a
		{href}
		{title}
		onclick={(e) => e.stopPropagation()}
		class="rounded-sm underline decoration-current/40 decoration-dotted underline-offset-3 transition-colors hover:text-primary hover:decoration-solid focus-visible:outline-2 focus-visible:outline-ring {className}"
	>
		{@render children()}
	</a>
{:else}
	<span class={className}>{@render children()}</span>
{/if}
