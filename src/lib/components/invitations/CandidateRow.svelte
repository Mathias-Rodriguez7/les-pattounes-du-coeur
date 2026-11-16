<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { ChevronRight, Hourglass } from '@lucide/svelte';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { PendingInvitation } from '#lib/server/invitations/queries.ts';

	// Une candidature dans la liste des FA ou des bénévoles : pas encore de fiche,
	// donc un badge à la place des colonnes (type, chats, soins… n'existent pas encore)
	interface Props {
		candidate: PendingInvitation;
		isSelected?: boolean;
		onclick: () => void;
		/** Le nombre de colonnes du tableau, nom et flèche mobile compris */
		columns: number;
	}

	let { candidate, isSelected = false, onclick, columns }: Props = $props();
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'bg-amber-50/60 hover:bg-amber-50'} h-14 cursor-pointer transition-colors"
	{onclick}
	data-row-id={candidate.id}
>
	<Table.Cell class="max-w-40 truncate font-semibold text-gray-900" title={candidate.name}>
		{candidate.name}
	</Table.Cell>

	<!-- Toutes les colonnes restantes, sauf la flèche mobile -->
	<Table.Cell colspan={columns - 2}>
		<div class="flex flex-wrap items-center gap-2">
			{#if candidate.expired}
				<Badge class="bg-red-100 text-red-800">Lien expiré</Badge>
			{:else}
				<Badge class="bg-amber-100 text-amber-800">
					<Hourglass class="size-3" />
					En attente de validation
				</Badge>
			{/if}
			<span class="hidden text-xs text-muted-foreground sm:inline">
				envoyée le {formatDateNum(candidate.createdAt)}
			</span>
		</div>
	</Table.Cell>

	<Table.Cell class="w-8 text-muted-foreground sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
