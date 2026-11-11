<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Checkbox } from '#lib/components/ui/checkbox/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';
	import InputField from '#lib/components/fields/InputField.svelte';
	import { LoaderCircle, Plus, Search } from '@lucide/svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	type CatOption = { id: string; name: string | null; catNumber: string };

	interface Props {
		open?: boolean;
		/** Tous les chats à l'adoption (visibles + AVAILABLE) : ceux qu'on peut ajouter */
		cats: CatOption[];
		/** Les candidats de la règle : pré-cochés */
		candidateIds: string[];
	}

	let { open = $bindable(false), cats, candidateIds }: Props = $props();

	let title = $state('');
	let search = $state('');
	let selectedIds = $state<string[]>([]);
	let addedIds = $state<string[]>([]); // ajoutés à la main par la bénévole
	let submitting = $state(false);

	// À chaque ouverture : on repart des candidats, tous cochés
	$effect(() => {
		if (!open) return;
		title = '';
		search = '';
		addedIds = [];
		// untrack : si les données se rechargent pendant que le dialogue est ouvert,
		// on ne veut PAS effacer les choix de la bénévole
		selectedIds = untrack(() => [...candidateIds]);
	});

	const catById = $derived(new Map(cats.map((cat) => [cat.id, cat])));
	const label = (cat: CatOption) => (cat.name ? `${cat.name} · ${cat.catNumber}` : cat.catNumber);

	// Les lignes à cocher : les candidats, puis les chats ajoutés à la main
	const rows = $derived(
		[...candidateIds, ...addedIds]
			.map((id) => catById.get(id))
			.filter((cat): cat is CatOption => cat !== undefined)
	);

	// La recherche : parmi les chats qui ne sont pas déjà dans la liste
	const results = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return [];
		const listed = new Set([...candidateIds, ...addedIds]);
		return cats
			.filter((cat) => !listed.has(cat.id) && label(cat).toLowerCase().includes(q))
			.slice(0, 8);
	});

	function toggle(id: string, checked: boolean) {
		selectedIds = checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id);
	}

	function add(id: string) {
		addedIds = [...addedIds, id];
		selectedIds = [...selectedIds, id];
		search = '';
	}

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (selectedIds.length === 0) {
			toast.error('Choisissez au moins un chat');
			cancel();
			return;
		}

		submitting = true;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'News chats créée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur lors de la génération');
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
</script>

<!-- src/lib/components/news/NewsCatsGenerateDialog.svelte -->

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Générer une News chats</Dialog.Title>
			<Dialog.Description>
				Les chats publiés ces 7 derniers jours, et pas encore annoncés, sont déjà cochés.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/generateCats"
			class="flex flex-col gap-5"
			use:enhance={handleEnhance}
		>
			<InputField
				id="news-cats-title"
				name="title"
				label="Titre (facultatif)"
				bind:value={title}
				placeholder="Les chats à l'adoption – semaine du …"
			/>

			<!-- ===== LES CHATS DE LA NEWS ===== -->
			<section class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-medium">Chats de la news</h3>
					<span class="text-xs text-muted-foreground tabular-nums">
						{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
					</span>
				</div>

				{#if rows.length === 0}
					<p class="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
						Aucun nouveau chat cette semaine. Ajoutez-en avec la recherche ci-dessous.
					</p>
				{:else}
					<ul class="flex flex-col gap-1">
						{#each rows as cat (cat.id)}
							<li>
								<label
									class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
								>
									<Checkbox
										checked={selectedIds.includes(cat.id)}
										onCheckedChange={(checked) => toggle(cat.id, !!checked)}
									/>
									<span class="min-w-0 flex-1 truncate">{label(cat)}</span>
									{#if addedIds.includes(cat.id)}
										<span class="text-xs text-muted-foreground">ajouté</span>
									{/if}
								</label>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- ===== AJOUTER UN CHAT ===== -->
			<section class="flex flex-col gap-2">
				<h3 class="text-sm font-medium">Ajouter un chat</h3>
				<div class="relative">
					<Search
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<!-- Entrée ne doit pas envoyer le formulaire depuis la recherche -->
					<Input
						type="search"
						bind:value={search}
						placeholder="Nom ou numéro"
						aria-label="Rechercher un chat à ajouter"
						class="pl-9"
						onkeydown={(e) => e.key === 'Enter' && e.preventDefault()}
					/>
				</div>

				{#if search.trim() && results.length === 0}
					<p class="text-sm text-muted-foreground">Aucun chat à l'adoption ne correspond.</p>
				{/if}

				<ul class="flex flex-col gap-1">
					{#each results as cat (cat.id)}
						<li>
							<button
								type="button"
								onclick={() => add(cat.id)}
								class="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
							>
								<Plus class="size-4 shrink-0 text-primary" />
								<span class="truncate">{label(cat)}</span>
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Une valeur « catIds » par chat coché : lue par formData.getAll('catIds') -->
			{#each selectedIds as id (id)}
				<input type="hidden" name="catIds" value={id} />
			{/each}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={submitting}
					>Annuler</Button
				>

				<Button type="submit" disabled={submitting || selectedIds.length === 0}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
						Création…
					{:else}
						Créer la news
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
