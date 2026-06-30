<script lang="ts">
	import { Search, Plus, ClipboardList, Cat } from '@lucide/svelte';

	type DashboardTask = {
		label: string;
		value: number;
		description: string;
		icon: string;
	};

	type Props = {
		title: string;
		tasks: DashboardTask[];
	};

	let { title, tasks }: Props = $props();

	const icons = {
		search: Search,
		plus: Plus,
		clipboard: ClipboardList,
		cat: Cat
	};
</script>

<div
	class="
		bg-card
		border-border
		overflow-hidden
		rounded-3xl
	"
>
	<div class="flex flex-col gap-2 p-6">
		<!-- HEADER -->
		<div>
			<h2 class="text-xl font-bold tracking-tight">
				{title}
			</h2>
		</div>

		<!-- TASKS -->
		<div class="divide-border flex flex-col divide-y">
			{#each tasks as task (task.label)}
				<div class="flex items-center justify-between py-2">
					<!-- LEFT -->
					<div class="flex items-center gap-4">
						<div
							class="
								from-accent
								to-primary
								flex
								h-10
								w-10
								items-center
								justify-center
								rounded-2xl
								bg-linear-to-br
								shadow-lg
							"
						>
							<svelte:component this={icons[task.icon]} class="h-5 w-5" />
						</div>

						<div>
							<p class="text-sm font-medium">
								{task.label}
							</p>

							<p class="text-muted-foreground text-xs">
								{task.description}
							</p>
						</div>
					</div>

					<!-- RIGHT -->
					<div class="flex flex-col items-end">
						<p class="text-3xl font-black tracking-tight">
							{task.value}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
