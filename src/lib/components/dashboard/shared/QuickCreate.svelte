<script lang="ts">
	import type { VolunteerRole } from '@prisma/client';
	import { resolve } from '$app/paths';
	import { Cat, HouseHeart, Newspaper, Plus, Siren, UserPlus } from '@lucide/svelte';
	import { NEW_PARAM } from '#lib/navigation/entityLink.ts';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';

	// Actions rapides : créer en un clic. Chaque tuile ouvre la page avec son formulaire
	// de création déjà ouvert (?nouveau=1). Les tuiles dépendent du rôle.
	interface Props {
		role: VolunteerRole;
	}

	let { role }: Props = $props();

	const ACTIONS = [
		{
			label: 'Chat',
			theme: 'cats',
			hint: 'Asso ou libre',
			icon: Cat,
			href: resolve(`dashboard/chat?${NEW_PARAM}=1`),
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'SOS',
			theme: 'dog',
			hint: 'Appel, mail…',
			icon: Siren,
			href: resolve(`dashboard/sos?${NEW_PARAM}=1`),
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Famille d’accueil',
			theme: 'fa',
			hint: 'Nouvelle FA',
			icon: HouseHeart,
			href: resolve(`dashboard/famille_d_accueil?${NEW_PARAM}=1`),
			roles: ['ADMIN']
		},
		{
			label: 'Bénévole',
			theme: 'volunteers',
			hint: 'Nouvelle bénévole',
			icon: UserPlus,
			href: resolve(`dashboard/benevole?${NEW_PARAM}=1`),
			roles: ['ADMIN']
		},
		{
			label: 'News',
			theme: 'news',
			hint: 'Nouvelle actu',
			icon: Newspaper,
			href: resolve(`dashboard/news?${NEW_PARAM}=1`),
			roles: ['ADMIN', 'COMMUNICATION']
		}
	] satisfies {
		label: string;
		hint: string;
		icon: typeof Cat;
		href: string;
		roles: VolunteerRole[];
		theme: string;
	}[];

	const actions = $derived(ACTIONS.filter((action) => action.roles.includes(role)));
</script>

<!-- Même présentation que « À faire » : un titre, puis des cartes qui se partagent la largeur -->
<section class="flex flex-col gap-4">
	<h2 class="text-xl font-bold tracking-tight">Actions rapides</h2>
	<nav
		aria-label="Actions rapides"
		class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3"
	>
		{#each actions as action (action.label)}
			<a
				href={action.href}
				class="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<!-- L'icône : le même dégradé que la « Vue d'ensemble » -->
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
					style="background: {getGradientStyle(action.theme)}"
				>
					<action.icon class="size-5" />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block truncate font-semibold">{action.label}</span>
					<span class="block truncate text-xs text-muted-foreground">{action.hint}</span>
				</span>
				<!-- Le « + » : discret, il s'affirme au survol -->
				<span
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
				>
					<Plus class="size-4" />
				</span>
			</a>
		{/each}
	</nav>
</section>
