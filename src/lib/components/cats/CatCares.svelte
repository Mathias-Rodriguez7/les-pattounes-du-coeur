<script lang="ts">
	import SectionCard from '../cards/SectionCard.svelte';
	import DocumentPreview from '../media/DocumentPreview.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import CareCreateDialog from './CareCreateDialog.svelte';
	import { CAT_SECTION_CONFIG, CAT_CARE_TYPES } from '#lib/constants/cat.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { CatFull } from '#lib/types/cat.ts';

	interface Props {
		cat: CatFull;
		/** Admin, ou bénévole associée au chat */
		canManage?: boolean;
	}

	let { cat, canManage = false }: Props = $props();

	const cares = $derived(cat.cares ?? []);
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.cares.icon}
	title="{CAT_SECTION_CONFIG.cares.label} ({cares.length})"
	color={CAT_SECTION_CONFIG.cares.color}
>
	{#snippet action()}
		{#if canManage}
			<CareCreateDialog catId={cat.id} sicknesses={cat.sicknesses ?? []} />
		{/if}
	{/snippet}

	{#if cares.length > 0}
		<ul class="space-y-4">
			{#each cares as care (care.id)}
				<!-- PC : 1 + 2 + 2 colonnes | Mobile : empilé (comme les maladies) -->
				<li
					class="relative grid grid-cols-1 gap-3 rounded-xl border border-emerald-500 bg-emerald-100 px-4 py-2 pr-12 text-sm sm:grid-cols-5 sm:gap-4"
				>
					<!-- Type, date, véto -->
					<div class="sm:col-span-1">
						<span class="block text-xs text-muted-foreground">Soin</span>
						<span class="font-medium">{CAT_CARE_TYPES[care.type].label}</span>

						<div class="flex flex-wrap gap-x-4 gap-y-2 pt-2">
							<div>
								<span class="block text-xs text-muted-foreground">Date</span>
								<span class="text-xs">{formatDateNum(care.date)}</span>
							</div>
							{#if care.veterinary}
								<div class="min-w-0">
									<span class="block text-xs text-muted-foreground">Vétérinaire</span>
									<span class="text-xs wrap-break-word">{care.veterinary}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Motif + compte-rendu -->
					<div class="space-y-2 sm:col-span-2">
						<div>
							<span class="block text-xs text-muted-foreground">Motif</span>
							<p class="text-xs wrap-break-word whitespace-pre-line">{care.reason}</p>
						</div>
						{#if care.description}
							<div>
								<span class="block text-xs text-muted-foreground">Compte-rendu</span>
								<p class="text-xs wrap-break-word whitespace-pre-line">{care.description}</p>
							</div>
						{/if}
					</div>

					<!-- Maladie liée + documents -->
					<div class="min-w-0 space-y-2 sm:col-span-2">
						{#if care.sickness}
							<div>
								<span class="block text-xs text-muted-foreground">Maladie</span>
								<span class="text-xs">{care.sickness.name}</span>
							</div>
						{/if}
						<div>
							<span class="mb-1 block text-xs text-muted-foreground">
								Documents ({care.documents.length})
							</span>
							{#if care.documents.length > 0}
								<div class="space-y-1">
									{#each care.documents as doc (doc.id)}
										<DocumentPreview
											variant="compact"
											src="/api/media/{doc.media.id}"
											name={doc.media.originalName}
											sizeBytes={doc.media.sizeBytes}
										/>
									{/each}
								</div>
							{:else}
								<span class="text-xs">—</span>
							{/if}
						</div>
					</div>

					{#if canManage}
						<div class="absolute top-1 right-1">
							<DeleteButton
								iconOnly
								entityId={care.id}
								firstName={CAT_CARE_TYPES[care.type].label}
								lastName={formatDateNum(care.date)}
								showDelete={true}
								actionName="?/deleteCare"
								fieldName="careId"
								deleteConfirmMessage="Supprimer ce soin ? Ses documents seront définitivement effacés. La fiche du chat ne sera pas modifiée."
							/>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
			<p>Aucun soin enregistré</p>
		</div>
	{/if}
</SectionCard>
