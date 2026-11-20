<script lang="ts" module>
	export interface RecapBlock {
		title: string;
		/** L'étape où se trouvent ces champs (bouton « Modifier ») */
		step: number;
		rows: { label: string; value: string | null | undefined }[];
	}
</script>

<script lang="ts">
	import { Pencil } from '@lucide/svelte';

	// Le récapitulatif avant d'envoyer une demande d'adoption : ce qui a été saisi aux étapes
	// précédentes, avec « Modifier » pour y revenir. On évite d'envoyer une adresse ou un
	// téléphone mal tapé, que l'asso découvrirait trop tard.

	let { blocks, onEdit }: { blocks: RecapBlock[]; onEdit: (step: number) => void } = $props();
</script>

<section
	class="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
	aria-labelledby="adoption-recap-title"
>
	<div>
		<h2 id="adoption-recap-title" class="text-base font-semibold">Vérifiez avant d'envoyer</h2>
		<p class="text-sm text-muted-foreground">
			Un numéro ou une adresse mal tapé, et nous ne pourrions pas vous recontacter.
		</p>
	</div>

	{#each blocks as block (block.title)}
		<div class="rounded-xl bg-card p-3">
			<div class="mb-2 flex items-center justify-between gap-2">
				<h3 class="text-sm font-semibold">{block.title}</h3>
				<button
					type="button"
					onclick={() => onEdit(block.step)}
					class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
					aria-label="Modifier : {block.title}"
				>
					<Pencil class="size-3.5" aria-hidden="true" />
					Modifier
				</button>
			</div>
			<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
				{#each block.rows as row (row.label)}
					<dt class="text-muted-foreground">{row.label}</dt>
					<dd class="min-w-0 break-words">{row.value || '—'}</dd>
				{/each}
			</dl>
		</div>
	{/each}
</section>
