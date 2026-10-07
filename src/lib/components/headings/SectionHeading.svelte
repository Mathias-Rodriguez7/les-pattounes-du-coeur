<script lang="ts">
	type Props = {
		title: string;
		subtitle?: string;
		icon?: string;
	};

	let { title, subtitle, icon }: Props = $props();
</script>

<div class="mb-4">
	<div class="flex items-center gap-2">
		{#if icon}
			<div class="h-5 w-5 text-gray-500">
				<!-- Icon component -->
			</div>
		{/if}
		<h3 class="text-sm font-semibold text-gray-900">{title}</h3>
	</div>
	{#if subtitle}
		<p class="mt-1 text-xs text-gray-600">{subtitle}</p>
	{/if}
</div>
