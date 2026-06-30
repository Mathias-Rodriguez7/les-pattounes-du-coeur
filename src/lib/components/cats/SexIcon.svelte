<script lang="ts">
	import { Mars, Venus, CircleHelp } from 'lucide-svelte';

	type Props = {
		sex: string | null;
		class?: string;
	};

	let { sex, class: className = '' }: Props = $props();
</script>

{#if sex === 'MALE'}
	<Mars class={className} />
{:else if sex === 'FEMALE'}
	<Venus class={className} />
{:else}
	<CircleHelp class={className} />
{/if}
