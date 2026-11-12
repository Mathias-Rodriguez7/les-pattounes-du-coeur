<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { BlacklistPerson } from '#lib/types/blacklist.ts';
	import { ACCOUNT_LABELS, personName } from './blacklistDisplay.ts';

	interface Props {
		person: BlacklistPerson;
		isSelected?: boolean;
		onclick: () => void;
	}

	let { person, isSelected = false, onclick }: Props = $props();

	const name = $derived(personName(person));
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<!-- Nom + email : l'email passe sous le nom pour tenir sur un téléphone -->
	<Table.Cell class="max-w-0">
		<p class="truncate font-medium" title={name ?? person.email}>{name ?? '—'}</p>
		<p class="truncate text-xs text-muted-foreground" title={person.email}>{person.email}</p>
	</Table.Cell>
	<Table.Cell class="hidden sm:table-cell">
		{#if person.account}
			<Badge variant="secondary">{ACCOUNT_LABELS[person.account]}</Badge>
		{:else}
			<span class="text-sm text-muted-foreground">—</span>
		{/if}
	</Table.Cell>
	<Table.Cell>
		<span class="text-sm text-muted-foreground">{formatDateNum(person.since)}</span>
	</Table.Cell>
</Table.Row>
