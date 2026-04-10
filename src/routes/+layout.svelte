<script lang="ts">
	import favicon from "$lib/components/assets/favicon.svg";
	import './layout.css';


	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
