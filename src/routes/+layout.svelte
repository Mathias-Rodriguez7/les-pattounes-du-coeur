<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { Toaster } from 'svelte-sonner';
	import '../app.css';

	const { data } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

{#if data.user}
	<!-- DASHBOARD LAYOUT -->
	<div class="flex min-h-screen flex-col">
		<div class="flex flex-1">
			<Sidebar user={data.user} />

			<div class="flex-1 overflow-auto">
				<slot />
			</div>
		</div>

		<Footer />
	</div>
{:else}
	<!-- PUBLIC LAYOUT -->
	<div class="flex min-h-screen flex-col">
		<Navbar />

		<div class="flex-1">
			<slot />

			<Footer />
		</div>
	</div>
{/if}

<Toaster />
