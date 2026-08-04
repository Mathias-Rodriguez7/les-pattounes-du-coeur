<script lang="ts">
	import AdminDashboard from '$lib/components/dashboard/roles/AdminDashboard.svelte';
	import ManagerDashboard from '$lib/components/dashboard/roles/ManagerDashboard.svelte';
	import CommunicationDashboard from '$lib/components/dashboard/roles/CommunicationDashboard.svelte';
	import Radial from '$lib/components/charts/Radial.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const userRole = $derived(data.user?.role ?? 'MANAGER');
</script>

<main class="flex flex-col gap-8 p-8">
	<div>
		{#if userRole === 'ADMIN'}
			<AdminDashboard {data} />
		{:else if userRole === 'COMMUNICATION'}
			<CommunicationDashboard {data} />
		{:else}
			<ManagerDashboard {data} />
		{/if}
	</div>

	<section class="flex flex-col gap-4">
		<h2 class="text-xl font-bold">Mes stats</h2>
		<div class="bg-card border-border rounded-2xl border p-6">
			<div class="flex items-stretch gap-4">
				<div class="flex flex-1 items-center justify-center">
					<Radial
						title="Chats en gestion"
						description="Sous votre responsabilité"
						volunteerValue={data.volunteerStats.catsManaged.volunteerValue}
						totalValue={data.volunteerStats.catsManaged.totalValue}
						unit="Chats"
						volunteerColor="#3b82f6"
						otherColor="#e5e7eb"
					/>
				</div>
				<div class="bg-border w-px"></div>
				<div class="flex flex-1 items-center justify-center">
					<Radial
						title="Adoptions {new Date().getFullYear()}"
						description="Succès réalisés cette année"
						volunteerValue={data.volunteerStats.adoptionsThisYear.volunteerValue}
						totalValue={data.volunteerStats.adoptionsThisYear.totalValue}
						unit="Adoptions"
						volunteerColor="#10b981"
						otherColor="#d1d5db"
					/>
				</div>
				<div class="bg-border w-px"></div>
				<div class="flex flex-1 items-center justify-center">
					<Radial
						title="Candidatures traitées"
						description="Dossiers finalisés"
						volunteerValue={data.volunteerStats.applicationsProcessed.volunteerValue}
						totalValue={data.volunteerStats.applicationsProcessed.totalValue}
						unit="Dossiers"
						volunteerColor="#f59e0b"
						otherColor="#fef3c7"
					/>
				</div>
			</div>
		</div>
	</section>
</main>
