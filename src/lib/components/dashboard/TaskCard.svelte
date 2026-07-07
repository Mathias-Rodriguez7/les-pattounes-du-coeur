<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Icon from '@lucide/svelte';

	type DashboardTask = {
		label: string;
		value: number;
		description: string;
		icon: string;
		href?: string;
	};

	interface Props {
		task: DashboardTask;
	}

	let { task }: Props = $props();

	// Map des icônes disponibles
	const iconMap: Record<string, any> = {
		search: Icon.Search,
		plus: Icon.Plus,
		clipboard: Icon.Clipboard,
		cat: Icon.Cat,
		house: Icon.House,
		mail: Icon.Mail,
		users: Icon.Users,
		'alert-circle': Icon.AlertCircle
	};

	const IconComponent = iconMap[task.icon] || Icon.AlertCircle;
</script>

<Card.Root
	class="group hover:border-primary/50 relative overflow-hidden transition-all hover:shadow-md"
>
	<Card.Content class="space-y-3 p-4">
		<!-- Header: Icon + Label + Badge -->
		<div class="flex items-start justify-between gap-3">
			<div class="flex flex-1 items-center gap-2">
				<div class="bg-primary/10 text-primary rounded-lg p-2">
					<svelte:component this={IconComponent} class="h-4 w-4" />
				</div>
				<div class="min-w-0 flex-1">
					<h4 class="truncate text-sm leading-tight font-medium">{task.label}</h4>
				</div>
			</div>

			<!-- Badge du nombre de tâches -->
			<div
				class="bg-accent/50 text-accent-foreground flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
			>
				{task.value}
			</div>
		</div>

		<!-- Description -->
		<p class="text-muted-foreground line-clamp-2 text-xs">{task.description}</p>

		<!-- Bouton d'action (optionnel) -->
		{#if task.href}
			<Button
				href={task.href}
				variant="outline"
				size="sm"
				class="w-full text-xs opacity-0 transition-opacity group-hover:opacity-100"
			>
				Consulter
			</Button>
		{/if}
	</Card.Content>

	<!-- Gradient background subtil -->
	<div
		class="from-primary pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-5"
	></div>
</Card.Root>
