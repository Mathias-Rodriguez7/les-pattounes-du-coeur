<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		value?: boolean;
	}

	const { value }: Props = $props();
</script>

<div class="flex items-center justify-center">
	{#if value === true}
		<Icon name="CircleCheck" iconClass="h-5 w-5 text-emerald-600" />
	{:else if value === false}
		<Icon name="CircleSlash" iconClass="h-5 w-5 text-red-400" />
	{:else}
		<Icon name="CircleQuestionMark" iconClass="h-5 w-5 text-amber-500" />
	{/if}
</div>
