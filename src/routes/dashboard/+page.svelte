<script lang="ts">
	import AdoptedBadge from '$lib/components/AdoptedBadge.svelte';
	import CatCard from '$lib/components/CatCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { Cat, Users, HouseHeart, Mail, PawPrint } from 'lucide-svelte';

	const { data } = $props();

	// fallback propre si pas connecté
	const stats = data.stats;

	const latestAdoptedCats = data.latestAdoptedCats ?? [];

	const role = data.user?.role;

	const fullName = data.user ? `${data.user.firstName} ${data.user.lastName}` : 'invité';
</script>

<main class="flex flex-col gap-10 p-16">
	<!-- 📊 STATS GLOBAL -->
	<section class="grid grid-cols-1 gap-6 md:grid-cols-5">
		<div class="from-primary/10 to-accent/10 rounded-3xl bg-linear-to-r p-6 shadow-sm">
			<h1 class="text-2xl font-bold">
				Bienvenue {fullName} 👋
			</h1>

			<p class="text-muted-foreground mt-2">Heureux de vous revoir</p>
		</div>

		<StatCard
			title="Vos stats"
			stats={[
				{
					label: 'Chats suivis',
					value: stats.volunteerCats,
					total: stats.totalAvailableCats,
					icon: Cat
				},
				{
					label: 'Familles associées',
					value: stats.volunteerHosts,
					total: stats.totalActiveHosts,
					icon: HouseHeart
				},
				{
					label: 'Adoptions réalisées',
					value: stats.volunteerAdoptions,
					total: stats.totalYearAdoptions,
					icon: PawPrint
				}
			]}
		/>
	</section>

	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold">Actions rapides</h2>
		</div>

		<div class="text-foreground grid grid-cols-4 gap-4 font-bold">
			<!-- ADMIN -->
			{#if role === 'ADMIN'}
				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/cats/new"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Cat size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Ajouter un chat</h3>

							<p class="text-muted-foreground mt-2 text-sm">Créer un nouveau chat.</p>
						</div>
					</a>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/hosts/new"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<HouseHeart size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Ajouter une FA</h3>

							<p class="text-muted-foreground mt-2 text-sm">
								Créer une nouvelle Famille d'accueil.
							</p>
						</div>
					</a>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/forms"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Mail size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Les candidatures</h3>

							<p class="text-muted-foreground mt-2 text-sm">Consulter les formulaires.</p>
						</div>
					</a>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/volunteer"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Users size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Les candidatures</h3>

							<p class="text-muted-foreground mt-2 text-sm">Consulter les formulaires.</p>
						</div>
					</a>
				</div>
			{/if}

			<!-- MANAGER -->
			{#if role === 'MANAGER'}
				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/cats/new"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Cat size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Ajouter un chat</h3>

							<p class="text-muted-foreground mt-2 text-sm">
								Créer une nouvelle fiche chat à l’adoption.
							</p>
						</div>
					</a>
				</div>
			{/if}

			<!-- COMMUNICATION -->
			{#if role === 'COMMUNICATION'}
				<div class="grid grid-cols-1 gap-4">
					<a
						href="/dashboard/news"
						class="group bg-popover hover:border-primary/40 flex min-h-45 flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div
							class="from-accent to-primary flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						>
							<Mail size={28} />
						</div>

						<div>
							<h3 class="mt-4 text-lg font-semibold">Publier une news</h3>

							<p class="text-muted-foreground mt-2 text-sm">Créer une News.</p>
						</div>
					</a>
				</div>
			{/if}
		</div>
	</section>

	<!-- 🐱 ACTIVITÉ RÉCENTE -->
	<!-- ADOPTIONS -->
	<section class="bg-popover rounded-2xl px-16 py-8 shadow-sm">
		<h2 class="text-foreground mb-4 text-lg font-semibold">Derniers chats adoptés</h2>

		<div class="grid grid-cols-4 gap-8">
			{#each latestAdoptedCats as cat (cat.id)}
				<div class="relative overflow-hidden rounded-3xl">
					<AdoptedBadge />

					<CatCard {cat} />
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">Aucune adoption récente</p>
			{/each}
		</div>
	</section>

	<!-- DISPONIBLES -->
</main>
