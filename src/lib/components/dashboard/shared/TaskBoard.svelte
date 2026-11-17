<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { VolunteerRole } from '@prisma/client';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import {
		ArrowRight,
		Cat,
		ChevronRight,
		HeartHandshake,
		IdCard,
		PartyPopper,
		Siren
	} from '@lucide/svelte';
	import { ENTITY_PAGES, ENTITY_PARAM } from '#lib/navigation/entityLink.ts';
	import {
		TASK_URGENCY,
		type TaskBoardCard,
		type TaskBoardKind,
		type TaskUrgency
	} from '#lib/constants/tasks.ts';
	import { buildBoard, countByUrgency } from '#lib/tasks/board.ts';
	import type { Task, TaskLink } from '#lib/tasks/tasks.ts';

	// « À traiter » : une carte par sujet, une ligne par sorte de tâche, avec une pastille
	// colorée selon l'urgence. Un clic sur une ligne la déplie : chaque tâche mène à sa fiche.
	// Les tâches arrivent déjà choisies (adminTasks, volunteerTasks, tasksOf).
	interface Props {
		tasks: Task[];
		/** Le tableau des actions d'administration, ou celui d'une bénévole */
		kind: TaskBoardKind;
		/** Le rôle de la personne dont ce sont les tâches */
		role?: VolunteerRole;
		/** Qui regarde : l'admin voit toutes les demandes (lien vers la page Formulaires) */
		isAdmin?: boolean;
		title?: string;
		/** Sans les lignes vides : le panneau d'une bénévole */
		hideEmpty?: boolean;
		/** Sous les cartes (ex : le lien vers le suivi des bénévoles) */
		footer?: Snippet;
	}

	let {
		tasks,
		kind,
		role,
		isAdmin = false,
		title = 'À traiter',
		hideEmpty = false,
		footer
	}: Props = $props();

	const board = $derived(buildBoard(tasks, kind, { role, hideEmpty }));
	const counts = $derived(countByUrgency(tasks));

	const CARD_STYLE = {
		sos: { icon: Siren, class: 'bg-red-100 text-red-700' },
		cats: { icon: Cat, class: 'bg-blue-100 text-blue-700' },
		adoptions: { icon: HeartHandshake, class: 'bg-pink-100 text-pink-700' },
		applications: { icon: IdCard, class: 'bg-amber-100 text-amber-700' }
	} satisfies Record<TaskBoardCard['key'], { icon: typeof Cat; class: string }>;

	// La couleur d'une pastille : celle de l'urgence, gris quand il n'y a rien
	const pillClass = (urgency: TaskUrgency | null) =>
		urgency ? TASK_URGENCY[urgency].color : 'bg-muted text-muted-foreground';

	// Les lignes ouvertes (tout est replié au chargement)
	let openRows = $state<string[]>([]);
	function toggle(key: string) {
		openRows = openRows.includes(key) ? openRows.filter((k) => k !== key) : [...openRows, key];
	}

	/** Le lien d'une tâche : la fiche, panneau ouvert. L'admin voit toutes les demandes */
	function taskHref(link: TaskLink) {
		const id = encodeURIComponent(link.id);
		if (link.kind === 'form') {
			return link.allForms || isAdmin
				? resolve(`dashboard/forms?${ENTITY_PARAM}=${id}&scope=all`)
				: resolve(`dashboard/forms?${ENTITY_PARAM}=${id}`);
		}
		return resolve(`${ENTITY_PAGES[link.kind]}?${ENTITY_PARAM}=${id}`);
	}
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center gap-2">
		<h2 class="text-xl font-bold tracking-tight">{title}</h2>
		{#if counts.URGENT > 0}
			<span class="rounded-full px-2.5 py-0.5 text-sm font-medium {TASK_URGENCY.URGENT.color}">
				{counts.URGENT} urgente{counts.URGENT > 1 ? 's' : ''}
			</span>
		{/if}
		{#if counts.WEEK > 0}
			<span class="rounded-full px-2.5 py-0.5 text-sm font-medium {TASK_URGENCY.WEEK.color}">
				{counts.WEEK} cette semaine
			</span>
		{/if}
		{#if tasks.length === 0}
			<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
				<PartyPopper class="size-4" /> Tout est à jour
			</span>
		{/if}
	</div>

	<!-- Les cartes sur une ligne quand il y a la place (2 sur tablette, 1 sur téléphone) -->
	<div class="@container">
		<div class="grid gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
			{#each board as card (card.key)}
				{@const style = CARD_STYLE[card.key]}
				<div class="flex flex-col rounded-2xl border border-border bg-card p-4">
					<div class="mb-2 flex items-center gap-3">
						<span class="flex size-9 items-center justify-center rounded-xl {style.class}">
							<style.icon class="size-5" />
						</span>
						<h3 class="font-semibold">{card.title}</h3>
					</div>

					{#each card.rows as row (row.key)}
						{@const isOpen = openRows.includes(row.key)}
						{@const first = row.tasks[0]}
						<div class="border-t border-border">
							<button
								type="button"
								onclick={() => toggle(row.key)}
								disabled={row.tasks.length === 0}
								aria-expanded={isOpen}
								class="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left transition-colors enabled:hover:bg-muted disabled:cursor-default"
							>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium">{row.label}</span>
									<span class="block truncate text-xs text-muted-foreground">
										{first
											? `${first.short}${first.badge ? ` · ${first.badge}` : ''}`
											: 'Rien à signaler'}
									</span>
								</span>
								<span
									class="flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-sm font-semibold {pillClass(
										row.urgency
									)}"
								>
									{row.tasks.length}
								</span>
								<ChevronRight
									class="size-4 shrink-0 text-muted-foreground transition-transform {isOpen
										? 'rotate-90'
										: ''} {row.tasks.length === 0 ? 'invisible' : ''}"
								/>
							</button>

							{#if isOpen}
								<ul
									transition:slide={{ duration: 150 }}
									class="mb-2 grid max-h-64 gap-0.5 overflow-y-auto"
								>
									{#each row.tasks as task (task.id)}
										<li>
											<a
												href={taskHref(task.link)}
												title="{task.title} — {task.detail}"
												class="flex items-center gap-2 rounded-md px-1 py-1.5 text-xs transition-colors hover:bg-muted"
											>
												<span
													class="w-11 shrink-0 rounded-md px-1 py-0.5 text-center font-medium {TASK_URGENCY[
														task.urgency
													].color}"
												>
													{task.badge ?? '•'}
												</span>
												<span class="min-w-0 flex-1 truncate">
													{task.short}
												</span>
												<ArrowRight class="size-3.5 shrink-0 text-muted-foreground" />
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
	{@render footer?.()}
</section>
