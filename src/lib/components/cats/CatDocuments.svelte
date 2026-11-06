<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import SectionCard from '../cards/SectionCard.svelte';
	import DocumentPreview from '../media/DocumentPreview.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import CatDocumentCreateDialog from './CatDocumentCreateDialog.svelte';
	import { CAT_SECTION_CONFIG, CAT_DOCUMENT_KIND } from '$lib/constants/cat';
	import { formatDateNum } from '$lib/utils/date';
	import type { CatFull } from '$lib/types/cat';

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

	{#if documents.length === 0}
		<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
			<p class="text-muted-foreground text-sm">Aucun document</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-4">
			{#each documents as doc (doc.id)}
				{@const kindInfo = CAT_DOCUMENT_KIND[doc.kind]}
				<li class="flex flex-col gap-2">
					<div class="flex flex-wrap items-center gap-2">
						<Badge class={kindInfo.color}>{kindInfo.label}</Badge>
						<span class="text-muted-foreground text-xs">{formatDateNum(doc.date)}</span>
						{#if doc.adoption}
							<span class="text-muted-foreground text-xs">
								· {doc.adoption.profil.firstName}
								{doc.adoption.profil.lastName}
							</span>
						{/if}

						{#if canManage}
							<div class="ml-auto">
								<DeleteButton
									entityId={doc.id}
									firstName={kindInfo.label}
									lastName={formatDateNum(doc.date)}
									showDelete={true}
									actionName="?/deleteCatDocument"
									fieldName="documentId"
									deleteConfirmMessage="Supprimer ce document ? Le fichier sera définitivement effacé."
								/>
							</div>
						{/if}
					</div>

					<!-- Lien vers NOTRE route : la connexion est vérifiée à chaque ouverture -->
					<DocumentPreview
						src="/api/media/{doc.media.id}"
						name={doc.media.originalName}
						sizeBytes={doc.media.sizeBytes}
					/>

					{#if doc.note}
						<p class="text-muted-foreground text-sm whitespace-pre-line">{doc.note}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</SectionCard>
