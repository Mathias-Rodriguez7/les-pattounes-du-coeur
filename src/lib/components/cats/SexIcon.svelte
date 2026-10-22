<script lang="ts">
	import { Mars, Venus, CircleQuestionMark } from '@lucide/svelte';

	type Props = {
		sex: string | null;
		class?: string;
	};

	let { sex, class: className = '' }: Props = $props();

	const sexColors: Record<string, string> = {
		MALE: 'text-blue-500',
		FEMALE: 'text-pink-500',
		UNKNOWN: 'text-muted-foreground'
	};

	const colorClass = $derived(sexColors[sex ?? 'UNKNOWN'] ?? sexColors.UNKNOWN);
</script>

{#if sex === 'MALE'}
	<Mars class="{colorClass} {className}" />
{:else if sex === 'FEMALE'}
	<Venus class="{colorClass} {className}" />
{:else}
	<CircleQuestionMark class="{colorClass} {className}" />
{/if}
