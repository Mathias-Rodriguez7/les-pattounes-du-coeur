<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import type { AdoptionFormJson, FormWithBlacklist } from '#lib/types/form.ts';

	// Section « Demandes d'adoption » de la fiche d'un chat : une ligne par demande en attente,
	// juste de quoi appeler l'adoptant. Le détail s'ouvre avec « Traiter ».
	interface Props {
		/** Les demandes précises en attente pour ce chat (avec leur éventuelle blacklist) */
		requests: FormWithBlacklist[];
		/**
		 * « Traiter » : le composant ne décide pas quoi afficher, il PRÉVIENT son parent.
		 * C'est CatPanel qui remplace alors la fiche par le panneau de la demande.
		 */
		onOpen: (formId: string) => void;
	}

	let { requests, onOpen }: Props = $props();
</script>

<!-- Aucune demande : la section n'apparaît pas -->
{#if requests.length > 0}
	<SectionCard
		icon={CAT_SECTION_CONFIG.adoptions.icon}
		title="Demandes d'adoption ({requests.length})"
		color="amber"
	>
		<!-- Une ligne par demande : juste de quoi appeler l'adoptant (détail dans « Traiter ») -->
		<!-- @container : sur une fiche étroite, le contact passe sous le nom -->
		<ul
			class="@container divide-y divide-amber-200 rounded-xl border border-amber-300 bg-amber-100"
		>
			{#each requests as request (request.id)}
				{@const answers = request.data as AdoptionFormJson}
				<li
					class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 py-2 @lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.5fr)_auto]"
				>
					<p class="flex min-w-0 items-center gap-2 font-semibold">
						<span class="truncate">
							{answers.firstName ?? ''}
							{answers.lastName ?? ''}
						</span>
						{#if request.blacklist}
							<Badge
								class="shrink-0 bg-red-100 text-xs text-red-700"
								title={request.blacklist.reason}
							>
								Blacklisté
							</Badge>
						{/if}
					</p>

					{#if answers.phone}
						<div class="col-start-1 flex min-w-0 items-center gap-2 @lg:col-start-auto">
							<Icon name="phone" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
							<a
								href={`tel:${answers.phone}`}
								class="text-xs text-blue-500 underline hover:text-primary"
							>
								{answers.phone}
							</a>
						</div>
					{:else}
						<span class="col-start-1 text-xs text-muted-foreground @lg:col-start-auto">—</span>
					{/if}

					<div class="col-start-1 flex min-w-0 items-center gap-2 @lg:col-start-auto">
						<Icon name="mail" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
						<a
							href={`mailto:${request.email}`}
							title={request.email}
							class="truncate text-xs text-blue-500 underline hover:text-primary"
						>
							{request.email}
						</a>
					</div>

					<Button
						size="sm"
						variant="outline"
						class="col-start-2 row-span-3 row-start-1 @lg:col-start-auto @lg:row-span-1 @lg:row-start-auto"
						onclick={() => onOpen(request.id)}
					>
						Traiter
					</Button>
				</li>
			{/each}
		</ul>
	</SectionCard>
{/if}
