<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ClipboardCheck, History, Plus } from '@lucide/svelte';
	import type { Task } from '#lib/tasks/tasks.ts';
	import { TASK_URGENCY } from '#lib/constants/tasks.ts';
	import { publicMediaUrl } from '#lib/media/urls.ts';
	import { catDisplayName } from '#lib/utils/catHelpers.ts';

	// Le panneau de droite quand aucun chat n'est choisi : au lieu d'un grand vide,
	// ses tâches sur des chats (les plus urgentes) et les derniers chats modifiés.

	interface RecentCat {
		id: string;
		name: string | null;
		status: string;
		catNumber: string | null;
		updatedAt: Date | string;
		media: { file: { storageKey: string } }[];
	}

	interface Props {
		tasks: Task[];
		recentCats: RecentCat[];
		onSelect: (catId: string) => void;
		onCreate: () => void;
	}

	let { tasks, recentCats, onSelect, onCreate }: Props = $props();

	/** « aujourd'hui », « hier », « il y a 3 j » */
	function since(date: Date | string): string {
		const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
		if (days <= 0) return 'aujourd’hui';
		if (days === 1) return 'hier';
		return `il y a ${days} j`;
	}
</script>

<Card.Root class="h-full gap-0 py-0">
	<Card.Header class="border-b px-5 py-4">
		<Card.Title class="text-base font-semibold">Vue d'ensemble</Card.Title>
		<p class="text-sm text-muted-foreground">
			Choisissez un chat dans la liste, ou commencez par ce qui attend.
		</p>
	</Card.Header>

	<Card.Content class="flex flex-col gap-6 px-5 py-5">
		<!-- ===== À FAIRE ===== -->
		<section class="flex flex-col gap-2" aria-labelledby="overview-tasks">
			<h3 id="overview-tasks" class="flex items-center gap-2 text-sm font-semibold">
				<ClipboardCheck class="size-4 text-primary" aria-hidden="true" />
				À faire sur vos chats
			</h3>
			{#if tasks.length === 0}
				<p class="text-sm text-muted-foreground">Rien à faire sur vos chats pour le moment.</p>
			{:else}
				<ul class="flex flex-col gap-1">
					{#each tasks as task (task.id)}
						<li>
							<button
								type="button"
								onclick={() => onSelect(task.link.id)}
								class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted"
							>
								<span
									class="size-2 shrink-0 rounded-full {TASK_URGENCY[task.urgency].dot}"
									title={TASK_URGENCY[task.urgency].label}
								></span>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium">{task.title}</span>
									<span class="block truncate text-xs text-muted-foreground">{task.short}</span>
								</span>
								{#if task.badge}
									<span
										class="shrink-0 rounded-md px-1.5 text-xs font-medium {TASK_URGENCY[
											task.urgency
										].color}"
									>
										{task.badge}
									</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<!-- ===== MODIFIÉS RÉCEMMENT ===== -->
		{#if recentCats.length > 0}
			<section class="flex flex-col gap-2" aria-labelledby="overview-recent">
				<h3 id="overview-recent" class="flex items-center gap-2 text-sm font-semibold">
					<History class="size-4 text-primary" aria-hidden="true" />
					Modifiés récemment
				</h3>
				<ul class="flex flex-col gap-1">
					{#each recentCats as cat (cat.id)}
						<li>
							<button
								type="button"
								onclick={() => onSelect(cat.id)}
								class="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-muted"
							>
								<img
									src={cat.media[0]
										? publicMediaUrl(cat.media[0].file.storageKey)
										: '/img/logo.png'}
									alt=""
									class="size-9 shrink-0 rounded-full object-cover"
								/>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium">{catDisplayName(cat)}</span>
									<span class="block truncate text-xs text-muted-foreground">
										{cat.catNumber ?? '—'}
									</span>
								</span>
								<span class="shrink-0 text-xs text-muted-foreground">{since(cat.updatedAt)}</span>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<Button variant="outline" class="self-start rounded-2xl" onclick={onCreate}>
			<Plus class="size-4" />
			Nouveau chat
		</Button>
	</Card.Content>
</Card.Root>
