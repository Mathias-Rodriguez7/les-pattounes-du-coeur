<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { Toaster } from 'svelte-sonner';
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<Navbar />

<slot />

<Toaster />

<Footer />
