<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { ActiveBlacklist } from '#lib/types/blacklist.ts';

	interface Props {
		blacklist: ActiveBlacklist;
	}

	let { blacklist }: Props = $props();

	// La raison au survol (souris) ; les lecteurs d'écran la lisent grâce au texte sr-only
	const details = $derived(
		`Blacklisté depuis le ${formatDateNum(blacklist.createdAt)} : ${blacklist.description}`
	);
</script>

<Badge class="shrink-0 bg-red-100 text-red-700" title={details}>
	Blacklisté
	<span class="sr-only">{details}</span>
</Badge>
