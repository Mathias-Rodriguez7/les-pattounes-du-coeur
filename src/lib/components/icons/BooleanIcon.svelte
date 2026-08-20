<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		value?: boolean;
	}

	const { value }: Props = $props();
</script>

<div class="flex items-center justify-center">
	{#if value === true}
		<Icon name="CircleCheck" iconClass="h-6 w-6 text-green-600" />
	{:else if value === false}
		<Icon name="CircleX" iconClass="h-6 w-6 text-red-600" />
	{:else}
		<Icon name="CircleQuestionMark" iconClass="h-6 w-6 text-amber-500" />
	{/if}
</div>
