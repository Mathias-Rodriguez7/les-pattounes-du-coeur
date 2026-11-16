<script lang="ts">
	import EntityLink from '#lib/components/links/EntityLink.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import * as Accordion from '#lib/components/ui/accordion/index.ts';
	import * as Table from '#lib/components/ui/table/index.js';
	import { statusLabel } from '#lib/utils/catHelpers.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	// Historique des chats d'une bénévole, replié par défaut (comme celui des placements d'une FA) :
	// - les chats adoptés : elle les suit toujours, ils sont « en cours » ;
	// - les chats dont elle a été retirée : terminés, avec les dates.
	interface Props {
		volunteer: VolunteerWithRelations;
	}

	let { volunteer }: Props = $props();

	type HistoryRow = {
		key: string;
		catId: string;
		catName: string | null;
		catStatus: string;
		startedAt: Date;
		/** null : elle suit encore ce chat (adopté) */
		endedAt: Date | null;
	};

	const rows = $derived.by<HistoryRow[]>(() => {
		const adopted = volunteer.cats
			.filter((cv) => cv.cat.status === 'ADOPTED')
			.map((cv) => ({
				key: `current-${cv.catId}`,
				catId: cv.catId,
				catName: cv.cat.name,
				catStatus: cv.cat.status,
				startedAt: cv.createdAt,
				endedAt: null
			}));
		const ended = (volunteer.catHistory ?? []).map((h) => ({
			key: h.id,
			catId: h.catId,
			catName: h.cat.name,
			catStatus: h.cat.status,
			startedAt: h.startedAt,
			endedAt: h.endedAt
		}));
		// Le plus récent en haut : les « en cours » d'abord, puis par date de fin
		return [...adopted, ...ended].sort(
			(a, b) =>
				new Date(b.endedAt ?? Date.now()).getTime() - new Date(a.endedAt ?? Date.now()).getTime()
		);
	});
</script>

<section>
	<Accordion.Root type="single">
		<Accordion.Item value="history">
			<Accordion.Trigger class="py-4 text-base font-semibold hover:no-underline sm:text-lg">
				<div class="flex items-center gap-2">
					<Icon name="history" class="h-5 w-5 text-slate-600" />
					<span>Historique des chats</span>
					<Badge variant="secondary" class="ml-2">{rows.length}</Badge>
				</div>
			</Accordion.Trigger>
			<Accordion.Content>
				{#if rows.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">
						Pas encore de chat adopté ni de chat terminé.
					</p>
				{:else}
					<div class="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Chat</Table.Head>
									<Table.Head>Statut</Table.Head>
									<Table.Head>Suivi</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each rows as row (row.key)}
									<Table.Row>
										<Table.Cell class="font-semibold text-gray-900">
											<EntityLink kind="cat" id={row.catId}>{row.catName ?? 'Sans nom'}</EntityLink>
										</Table.Cell>
										<Table.Cell>
											<Badge variant="outline">{statusLabel[row.catStatus] ?? row.catStatus}</Badge>
										</Table.Cell>
										<Table.Cell class="text-sm text-muted-foreground">
											{#if row.endedAt}
												du {formatDateNum(row.startedAt)} au {formatDateNum(row.endedAt)}
											{:else}
												depuis le {formatDateNum(row.startedAt)} · toujours suivi
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</section>
