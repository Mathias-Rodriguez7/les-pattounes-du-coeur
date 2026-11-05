<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { X, Search } from '@lucide/svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import { NEWS_SECTION_CONFIG, NEWS_TYPE_OPTIONS } from '$lib/constants/news';
	import type { NewsEditData } from '$lib/types/news';

	type CatOption = { id: string; name: string | null; catNumber: string };

	interface Props {
		editData: NewsEditData;
		newsId: string;
		cats?: CatOption[];
		canDelete?: boolean;
		onSuccess?: () => void;
		onCancel?: () => void;
	}

	let {
		editData = $bindable(),
		newsId,
		cats = [],
		canDelete = false,
		onSuccess,
		onCancel
	}: Props = $props();

	// États d'envoi : on les branchera avec les actions
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// ===== CHATS =====
	let catSearch = $state('');

	const isCatsNews = $derived(editData.type === 'NEWSCATS');

	const catLabel = (cat: CatOption) =>
		cat.name ? `${cat.name} · ${cat.catNumber}` : cat.catNumber;

	const selectedCats = $derived(cats.filter((cat) => editData.catIds.includes(cat.id)));

	const filteredCats = $derived.by(() => {
		const q = catSearch.trim().toLowerCase();
		if (!q) return cats;
		return cats.filter(
			(cat) => cat.catNumber.toLowerCase().includes(q) || cat.name?.toLowerCase().includes(q)
		);
	});

	function toggleCat(catId: string, checked: boolean) {
		editData.catIds = checked
			? [...editData.catIds, catId]
			: editData.catIds.filter((id) => id !== catId);
	}
</script>

<!-- Pour l'instant : envoi classique (rechargement). use:enhance arrive avec les actions -->
<form method="POST" action="?/update" class="flex flex-col gap-6">
	<input type="hidden" name="newsId" value={newsId} />

	<!-- ===== RÉSUMÉ ===== -->
	<SectionCard
		icon={NEWS_SECTION_CONFIG.summary.icon}
		title={NEWS_SECTION_CONFIG.summary.label}
		color={NEWS_SECTION_CONFIG.summary.color}
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="sm:col-span-2">
				<InputField
					id="edit-news-title"
					name="title"
					label="Titre"
					bind:value={editData.title}
					placeholder="Titre de la news"
					required
				/>
			</div>
			<SelectField
				id="edit-news-type"
				name="type"
				label="Type"
				options={NEWS_TYPE_OPTIONS}
				bind:value={editData.type}
				required
			/>
		</div>
	</SectionCard>

	<!-- ===== CONTENU ===== -->
	<SectionCard
		icon={NEWS_SECTION_CONFIG.content.icon}
		title={NEWS_SECTION_CONFIG.content.label}
		color={NEWS_SECTION_CONFIG.content.color}
	>
		<TextareaField
			id="edit-news-content"
			name="content"
			bind:value={editData.content}
			placeholder="Contenu de la news…"
			rows={6}
		/>
	</SectionCard>

	<!-- ===== MÉDIA ou CHATS selon le type ===== -->
	{#if isCatsNews}
		<SectionCard
			icon={NEWS_SECTION_CONFIG.cats.icon}
			title="{NEWS_SECTION_CONFIG.cats.label} ({editData.catIds.length})"
			color={NEWS_SECTION_CONFIG.cats.color}
		>
			<div class="flex flex-col gap-3">
				<!-- Chats sélectionnés : on peut les retirer d'un clic -->
				{#if selectedCats.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each selectedCats as cat (cat.id)}
							<Badge variant="secondary" class="gap-1 pr-1">
								{catLabel(cat)}
								<button
									type="button"
									class="hover:bg-muted-foreground/20 rounded-full p-0.5"
									onclick={() => toggleCat(cat.id, false)}
									aria-label="Retirer {catLabel(cat)}"
								>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-sm italic">Aucun chat sélectionné</p>
				{/if}

				<!-- Recherche -->
				<div class="relative">
					<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						type="search"
						placeholder="Chercher un chat (nom ou numéro)…"
						aria-label="Chercher un chat à associer"
						bind:value={catSearch}
						class="pl-9"
					/>
				</div>

				<!-- Liste à cocher -->
				<div class="max-h-60 overflow-y-auto rounded-md border p-2">
					{#each filteredCats as cat (cat.id)}
						<div class="hover:bg-muted/50 rounded-md px-2 py-1.5">
							<CheckboxField
								id="edit-news-cat-{cat.id}"
								label={catLabel(cat)}
								checked={editData.catIds.includes(cat.id)}
								onChange={(checked) => toggleCat(cat.id, checked)}
							/>
						</div>
					{:else}
						<p class="text-muted-foreground py-4 text-center text-sm">
							Aucun chat ne correspond à « {catSearch.trim()} »
						</p>
					{/each}
				</div>
			</div>

			<!-- Ce qui part vraiment au serveur : un champ caché par chat -->
			{#each editData.catIds as catId (catId)}
				<input type="hidden" name="catIds" value={catId} />
			{/each}
		</SectionCard>
	{:else}
		<SectionCard
			icon={NEWS_SECTION_CONFIG.media.icon}
			title={NEWS_SECTION_CONFIG.media.label}
			color={NEWS_SECTION_CONFIG.media.color}
		>
			<InputField
				id="edit-news-media"
				name="mediaUrl"
				label="Lien du média"
				type="url"
				bind:value={editData.mediaUrl}
				placeholder="https://… ou /news/fichier.pdf"
			/>
			<p class="text-muted-foreground mt-1 text-xs">
				Lien vers un PDF, une image ou une page externe.
			</p>
		</SectionCard>
	{/if}

	<Separator />

	<!-- ===== ACTIONS ===== -->
	<!-- PC : une ligne | Mobile : Enregistrer au-dessus de Supprimer -->
	<section class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			{#if canDelete}
				<DeleteButton
					entityId={newsId}
					firstName={editData.title}
					{isDeleting}
					{isSaving}
					showDelete={true}
					actionName="?/delete"
					fieldName="newsId"
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette news ? Cette action est définitive."
				/>
			{/if}
		</div>

		<SaveCancelButtons {onCancel} {isSaving} />
	</section>
</form>
