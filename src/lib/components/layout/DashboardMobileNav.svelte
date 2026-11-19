<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import type { Path } from '$app/types';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { anyPath } from '#lib/utils/paths.ts';
	import type { AppUser } from '#lib/types/user.ts';
	import { VOLUNTEER_ROLE_OPTIONS } from '#lib/constants/volunteer.ts';
	import { NEW_PARAM } from '#lib/navigation/entityLink.ts';
	import {
		navFor,
		MOBILE_QUICK_ACTIONS,
		type DashboardNavItem,
		type DashboardSection
	} from '#lib/navigation/dashboardNav.ts';
	import { LogOut, Menu, Plus } from '@lucide/svelte';

	// Le dashboard sur mobile, dans le style du site public :
	// - en haut, une pilule : ses initiales (profil) et le nom de l'asso ;
	// - en bas, une barre d'onglets : Accueil, Chats, [+ Créer], SOS, Plus ;
	// - le « + » déploie les créations rapides en demi-cercle (selon le rôle) ;
	// - « Plus » ouvre le reste des pages, rangé par rubrique, puis la déconnexion.

	type Props = {
		user: AppUser;
		/** Pastilles « à faire » par page, ex : { 'dashboard/chat': 2 } */
		badges?: Partial<Record<Path, number>>;
	};
	let { user, badges = {} }: Props = $props();

	let fanOpen = $state(false);
	let moreOpen = $state(false);

	afterNavigate(() => {
		fanOpen = false;
		moreOpen = false;
	});

	const items = $derived(navFor(user.role));
	const tabs = $derived(items.filter((item) => !item.section));
	const [leftTabs, rightTabs] = $derived([tabs.slice(0, 2), tabs.slice(2)]);
	const SECTIONS: DashboardSection[] = ['Suivi', 'Communication', 'Ressources'];
	const sections = $derived(
		SECTIONS.map((title) => ({ title, items: items.filter((i) => i.section === title) })).filter(
			(s) => s.items.length > 0
		)
	);

	const initials = $derived(`${user.profil.firstName[0]}${user.profil.lastName[0]}`.toUpperCase());
	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === user.role)?.label ?? user.role
	);

	// Actif aussi sur les sous-pages, sauf pour /dashboard lui-même (même règle que la sidebar)
	function isActive(href: Path): boolean {
		const path = page.url.pathname;
		const target = resolve(anyPath(href));
		return href === 'dashboard'
			? path === target
			: path === target || path.startsWith(`${target}/`);
	}
	const moreActive = $derived(
		sections.some((s) => s.items.some((i) => isActive(i.href))) || isActive('dashboard/profil')
	);

	// LE DEMI-CERCLE : les actions se répartissent sur un arc au-dessus du « + »
	const FAN_RADIUS = 104;
	const quickActions = $derived(
		MOBILE_QUICK_ACTIONS.filter((a) => a.roles.includes(user.role)).map((action, i, list) => {
			// 1 action : tout droit ; plusieurs : réparties de 150° à 30° (gauche → droite)
			const angle = list.length === 1 ? 90 : 150 - (120 * i) / (list.length - 1);
			const rad = (angle * Math.PI) / 180;
			return {
				...action,
				x: Math.round(Math.cos(rad) * FAN_RADIUS),
				y: Math.round(-Math.sin(rad) * FAN_RADIUS)
			};
		})
	);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && fanOpen && (fanOpen = false)} />

{#snippet tab(item: DashboardNavItem)}
	{@const active = isActive(item.href)}
	{@const badge = badges[item.href] ?? 0}
	<li>
		<a
			href={resolve(anyPath(item.href))}
			aria-current={active ? 'page' : undefined}
			class="relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors {active
				? 'text-primary'
				: 'text-foreground/70'}"
		>
			<item.icon class="size-5" />
			{item.label === 'Dashboard' ? 'Accueil' : item.label}
			{#if badge > 0}
				<span
					class="absolute top-1.5 left-1/2 ml-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white"
					aria-hidden="true"
				>
					{badge > 9 ? '9+' : badge}
				</span>
				<span class="sr-only">({badge} à traiter)</span>
			{/if}
		</a>
	</li>
{/snippet}

<!-- ================= EN HAUT : la pilule ================= -->
<div class="shrink-0 px-3 pt-2 lg:hidden">
	<div
		class="flex h-14 items-center gap-2 rounded-full border border-accent/40 bg-accent/70 px-2 shadow-md backdrop-blur-lg"
	>
		<a
			href={resolve('dashboard/profil')}
			aria-label="Mon profil"
			class="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-sm font-bold text-primary-foreground shadow-sm"
		>
			{initials}
		</a>
		<span class="flex-1 truncate text-center font-semibold">Pattounes du Cœur</span>
		<!-- Équilibre les initiales, pour que le nom reste au centre -->
		<span class="size-10 shrink-0" aria-hidden="true"></span>
	</div>
</div>

<!-- ================= LE DEMI-CERCLE DES CRÉATIONS ================= -->
{#if fanOpen}
	<button
		type="button"
		aria-label="Fermer les créations rapides"
		onclick={() => (fanOpen = false)}
		class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
	></button>
{/if}

<!-- ================= EN BAS : la barre d'onglets ================= -->
<nav
	aria-label="Navigation du dashboard"
	class="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 lg:hidden"
>
	<ul
		class="grid h-16 grid-cols-5 items-center rounded-full border border-accent/40 bg-accent/80 px-1 shadow-lg backdrop-blur-lg"
	>
		{#each leftTabs as item (item.href)}{@render tab(item)}{/each}

		<!-- « + Créer » : la médaille au centre, qui déploie les actions en demi-cercle -->
		<li class="relative flex justify-center">
			{#each quickActions as action, i (action.key)}
				<a
					href={resolve(`${anyPath(action.page)}?${NEW_PARAM}=1`)}
					tabindex={fanOpen ? 0 : -1}
					aria-hidden={!fanOpen}
					style="transform: translate({fanOpen ? action.x : 0}px, {fanOpen
						? action.y
						: 0}px) scale({fanOpen ? 1 : 0.4}); transition-delay: {fanOpen ? i * 40 : 0}ms;"
					class="absolute -top-14 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 transition-all duration-300 ease-out motion-reduce:transition-none {fanOpen
						? 'opacity-100'
						: 'pointer-events-none opacity-0'}"
				>
					<span
						class="flex size-12 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-2 ring-amber-300"
					>
						<action.icon class="size-5" />
					</span>
					<span
						class="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm"
					>
						{action.label}
					</span>
				</a>
			{/each}

			<button
				type="button"
				onclick={() => (fanOpen = !fanOpen)}
				aria-expanded={fanOpen}
				aria-label={fanOpen ? 'Fermer les créations rapides' : 'Créer'}
				class="relative z-10 -mt-8 flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary"
			>
				<span
					class="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-amber-300"
				>
					<Plus class="size-7 transition-transform duration-300 {fanOpen ? 'rotate-45' : ''}" />
				</span>
				Créer
			</button>
		</li>

		{#each rightTabs as item (item.href)}{@render tab(item)}{/each}

		<!-- « Plus » : le reste des pages -->
		<li>
			<Sheet.Root bind:open={moreOpen}>
				<Sheet.Trigger
					class="flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium {moreActive
						? 'text-primary'
						: 'text-foreground/70'}"
				>
					<Menu class="size-5" />
					Plus
				</Sheet.Trigger>

				<Sheet.Content
					side="bottom"
					class="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-3xl border-0 p-0"
				>
					<!-- Le profil, en haut -->
					<Sheet.Title class="p-0">
						<a href={resolve('dashboard/profil')} class="flex items-center gap-3 px-5 pt-5 pb-2">
							<span
								class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-sm font-bold text-primary-foreground shadow-md"
							>
								{initials}
							</span>
							<span class="flex min-w-0 flex-col">
								<span class="truncate font-semibold">
									{user.profil.firstName}
									{user.profil.lastName}
								</span>
								<span class="text-xs font-normal text-muted-foreground">
									{roleLabel} · Mon profil
								</span>
							</span>
						</a>
					</Sheet.Title>

					<div class="flex flex-col gap-5 p-5 pb-8">
						{#each sections as section (section.title)}
							<section aria-labelledby="dash-more-{section.title}">
								<h3
									id="dash-more-{section.title}"
									class="mb-1 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									{section.title}
								</h3>
								<ul class="flex flex-col">
									{#each section.items as item (item.href)}
										{@const active = isActive(item.href)}
										<li>
											<a
												href={resolve(anyPath(item.href))}
												aria-current={active ? 'page' : undefined}
												class="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent {active
													? 'bg-primary/10 text-primary'
													: ''}"
											>
												<item.icon class="size-5 shrink-0 text-primary" />
												{item.label}
											</a>
										</li>
									{/each}
								</ul>
							</section>
						{/each}

						<!-- Tout en bas : la déconnexion -->
						<form method="POST" action="/logout" use:enhance>
							<button
								type="submit"
								class="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
							>
								<LogOut class="size-5 shrink-0" />
								Déconnexion
							</button>
						</form>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</li>
	</ul>
</nav>
