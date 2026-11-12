<script lang="ts">
	import { Ban } from '@lucide/svelte';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { BlacklistInfo } from '#lib/types/form.ts';

	// Tout en haut de la demande : impossible à manquer
	let { blacklist, isAdmin = false }: { blacklist: BlacklistInfo; isAdmin?: boolean } = $props();
</script>

<div role="alert" class="flex gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800">
	<Ban class="mt-0.5 size-5 shrink-0" />
	<div class="grid gap-1">
		<p class="font-semibold">Adoptant blacklisté depuis le {formatDateNum(blacklist.since)}</p>
		<p class="whitespace-pre-line">{blacklist.reason}</p>
		<p class="text-xs text-red-700">
			{isAdmin
				? "Vous pouvez autoriser l'adoption malgré tout, à la création."
				: 'Seule une administratrice peut autoriser cette adoption.'}
		</p>
	</div>
</div>
