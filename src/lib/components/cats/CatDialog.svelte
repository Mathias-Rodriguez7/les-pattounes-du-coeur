<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button/index.js';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import SexIcon from '$lib/components/cats/SexIcon.svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import type { CatFull } from '$lib/types/cat';
	import { focalPointStyle, hairLabel, getLabel } from '$lib/utils/catHelpers';
	import { getAgeBadge, formatAge } from '$lib/utils/age';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';
	import { Play } from '@lucide/svelte';

	let { selectedCat }: { selectedCat: CatFull | null } = $props();

	// ----- Médias -----

	// Photos et vidéos mélangées dans le carrousel, photo principale en premier
	const gallery = $derived(
		(selectedCat?.media ?? [])
			.filter((m) => m.type === 'IMAGE' || m.type === 'VIDEO')
			.sort((a, b) => {
				// Photo principale d'abord, puis images avant vidéos
				if (a.isPrimary !== b.isPrimary) return Number(b.isPrimary) - Number(a.isPrimary);
				if (a.type !== b.type) return a.type === 'IMAGE' ? -1 : 1;
				return 0;
			})
	);

	let currentIndex = $state(0);

	$effect(() => {
		if (selectedCat) currentIndex = 0;
	});

	const current = $derived(gallery[currentIndex] ?? null);

	// ----- Dérivés métier -----

	const compatibilities = $derived(
		selectedCat
			? [
					{ key: 'dog', label: 'Chien', value: selectedCat.isOkDog ?? false },
					{ key: 'cat', label: 'Chat', value: selectedCat.isOkCat ?? false },
					{ key: 'child', label: 'Enfant', value: selectedCat.isOkChild ?? false },
					{ key: 'outside', label: 'Accès extérieur', value: selectedCat.isOutside ?? false }
				]
			: []
	);
</script>

<Dialog.Content size="lg" class="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
	{#if selectedCat}
		<!-- HEADER FIXE -->
		<Dialog.Header class="px-6 pt-6">
			<Dialog.Title class="text-2xl">
				{selectedCat.name}
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<SexIcon sex={selectedCat.sex} class="size-6" />
					<span>{getAgeBadge(selectedCat.birthDate)}</span>
				</div>
			</Dialog.Title>
		</Dialog.Header>

		<!-- CORPS SCROLLABLE -->
		<div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
			<!-- GALERIE -->
			{#if current}
				<div class="space-y-2">
					<div class="overflow-hidden rounded-2xl bg-black">
						{#if current.type === 'VIDEO'}
							<video
								src={current.url}
								controls
								preload="metadata"
								class="h-72 w-full object-contain"
								aria-label={current.originalName ?? `Vidéo de ${selectedCat.name}`}
							>
								<track kind="captions" />
							</video>
						{:else}
							<img
								src={current.url}
								alt={selectedCat.name ?? selectedCat.catNumber}
								class="h-72 w-full object-cover"
								style={focalPointStyle(current)}
							/>
						{/if}
					</div>

					{#if gallery.length > 1}
						<div class="flex gap-2 overflow-x-auto pb-1">
							{#each gallery as m, i (m.id)}
								<button
									type="button"
									onclick={() => (currentIndex = i)}
									class="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all {i ===
									currentIndex
										? 'border-primary'
										: 'border-transparent opacity-60 hover:opacity-100'}"
									aria-label={m.type === 'VIDEO' ? `Vidéo ${i + 1}` : `Photo ${i + 1}`}
								>
									{#if m.type === 'VIDEO'}
										<!-- Vignette vidéo : fond sombre avec icône play -->
										<div class="flex h-full w-full items-center justify-center bg-black">
											<Play class="h-5 w-5 text-white" />
										</div>
									{:else}
										<img
											src={m.url}
											alt=""
											class="h-full w-full object-cover"
											style={focalPointStyle(m)}
										/>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- profil / santé -->
			<section class="grid grid-cols-3 gap-4">
				<SectionCard
					icon={CAT_SECTION_CONFIG.profile.icon}
					title={CAT_SECTION_CONFIG.profile.label}
					color={CAT_SECTION_CONFIG.profile.color}
				>
					<div class="grid gap-3 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Âge</span><span
								>{formatAge(selectedCat.birthDate)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Couleur</span><span
								>{selectedCat.color ?? '—'}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Poil</span><span
								>{getLabel(hairLabel, selectedCat.hairLength)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Origine</span><span
								>{selectedCat.origin ?? '—'}</span
							>
						</div>
					</div>
				</SectionCard>

				<!-- COMPATIBILITÉS -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.compatibility.icon}
					title={CAT_SECTION_CONFIG.compatibility.label}
					color={CAT_SECTION_CONFIG.compatibility.color}
				>
					<div class="grid gap-3 text-sm">
						{#each compatibilities as c (c.key)}
							<div class="flex justify-between">
								<span class="text-muted-foreground">{c.label}</span>
								<BooleanIcon value={c.value} />
							</div>
						{/each}
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.health.icon}
					title={CAT_SECTION_CONFIG.health.label}
					color={CAT_SECTION_CONFIG.health.color}
				>
					<div class="grid gap-3 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Stérilisé·e</span><BooleanIcon
								value={(selectedCat.isSterilize ?? false) ||
									(selectedCat.isAlreadySterilized ?? false)}
							/>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Identifié·e</span><BooleanIcon
								value={selectedCat.isIdentify ?? false}
							/>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Test FIV</span><BooleanIcon
								value={selectedCat.isFivTest ?? false}
							/>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Vermifuge</span><BooleanIcon
								value={selectedCat.isDeworming ?? false}
							/>
						</div>
					</div>
				</SectionCard>
			</section>

			<!-- DESCRIPTION -->
			{#if selectedCat.description}
				<SectionCard
					icon={CAT_SECTION_CONFIG.description.icon}
					title={CAT_SECTION_CONFIG.description.label}
					color={CAT_SECTION_CONFIG.description.color}
				>
					<p class="text-muted-foreground ml-6 text-sm leading-relaxed">
						{selectedCat.description}
					</p>
				</SectionCard>
			{/if}
		</div>

		<!-- FOOTER FIXE -->
		<Dialog.Footer class="px-6 pb-6 sm:justify-end">
			<Button href={`/adoptions/chat/${selectedCat.id}`}>Offrir un foyer</Button>
		</Dialog.Footer>
	{/if}
</Dialog.Content>
