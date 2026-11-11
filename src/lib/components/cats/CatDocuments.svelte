<script lang="ts">
	import SectionCard from '../cards/SectionCard.svelte';
	import DocumentPreview from '../media/DocumentPreview.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import CatDocumentCreateDialog from './CatDocumentCreateDialog.svelte';
	import { CAT_SECTION_CONFIG, CAT_DOCUMENT_KIND } from '#lib/constants/cat.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import { ADOPTION_STATUS } from '#lib/constants/adoption.ts';

	interface Props {
		cat: CatFull;
		/** Admin, ou bénévole associée au chat */
		canManage?: boolean;
	}

	let { cat, canManage = false }: Props = $props();

	const documents = $derived(cat.documents ?? []);
</script>

<SectionCard
	icon={CAT_SECTION_CONFIG.documents.icon}
	title="{CAT_SECTION_CONFIG.documents.label} ({documents.length})"
	color={CAT_SECTION_CONFIG.documents.color}
>
	{#snippet action()}
		{#if canManage}
			<CatDocumentCreateDialog catId={cat.id} adoptions={cat.adoptions ?? []} />
		{/if}
	{/snippet}

	{#if documents.length > 0}
		<ul class="space-y-4">
			{#each documents as doc (doc.id)}
				<!-- PC : 1 + 2 + 2 colonnes | Mobile : empilé (comme les maladies) -->
				<li
					class="relative grid grid-cols-1 gap-3 rounded-xl border border-amber-500 bg-amber-100 px-4 py-2 pr-12 text-sm sm:grid-cols-5 sm:gap-4"
				>
					<!-- Type + date -->
					<div class="sm:col-span-1">
						<span class="block text-xs text-muted-foreground">Document</span>
						<span class="font-medium">{CAT_DOCUMENT_KIND[doc.kind].label}</span>

						<div class="pt-2">
							<span class="block text-xs text-muted-foreground">Date</span>
							<span class="text-xs">{formatDateNum(doc.date)}</span>
						</div>
					</div>

					<!-- Adoption liée + note -->
					<div class="space-y-2 sm:col-span-2">
						{#if doc.adoption}
							<div>
								<span class="block text-xs text-muted-foreground">Adoptant</span>
								<span class="text-xs">
									{doc.adoption.profil.firstName}
									{doc.adoption.profil.lastName}
									<span class="text-muted-foreground"
										>· {ADOPTION_STATUS[doc.adoption.status].label}</span
									>
								</span>
							</div>
						{/if}
						<div>
							<span class="block text-xs text-muted-foreground">Note</span>
							<p class="text-xs wrap-break-word whitespace-pre-line">{doc.note ?? '—'}</p>
						</div>
					</div>

					<!-- Fichier -->
					<div class="min-w-0 sm:col-span-2">
						<span class="mb-1 block text-xs text-muted-foreground">Fichier</span>
						<!-- Lien vers NOTRE route : la connexion est vérifiée à chaque ouverture -->
						<DocumentPreview
							variant="compact"
							src="/api/media/{doc.media.id}"
							name={doc.media.originalName}
							sizeBytes={doc.media.sizeBytes}
						/>
					</div>

					{#if canManage}
						<div class="absolute top-1 right-1">
							<DeleteButton
								iconOnly
								entityId={doc.id}
								firstName={CAT_DOCUMENT_KIND[doc.kind].label}
								lastName={formatDateNum(doc.date)}
								showDelete={true}
								actionName="?/deleteCatDocument"
								fieldName="documentId"
								deleteConfirmMessage="Supprimer ce document ? Le fichier sera définitivement effacé."
							/>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
			<p>Aucun document</p>
		</div>
	{/if}
</SectionCard>
