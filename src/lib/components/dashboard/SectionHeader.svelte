<script lang="ts">
	type Props = {
		title: string;
	};

	let { title }: Props = $props();
</script>

<div class="flex items-end justify-between">
	<div class="flex flex-col gap-0.5">
		<h2 class="text-xl font-bold tracking-tight">{title}</h2>
	</div>
</div>
