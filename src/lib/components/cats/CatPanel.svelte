<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Camera } from '@lucide/svelte';
	import type { CatFull } from '$lib/types/cat';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		statusLabel,
		sexLabel,
		hairLabel,
		vaccinateLabel,
		getLabel
	} from '$lib/utils/catHelpers';
	import CatEditForm from './CatEditForm.svelte';

	const {
		cat,
		hosts,
		volunteers,
		isAdmin = false
	}: {
		cat: CatFull | null;
		hosts: any[]; // ou ton type Prisma complet
		volunteers: any[];
		isAdmin?: boolean;
	} = $props();

	let editing = $state(false);
	let editimg = $state(false);

	function getCurrentPlacement() {
		if (!cat?.placements) return null;
		return cat.placements.find((p) => p.status !== 'CLOSED' && p.type === 'LONG') || null;
	}
</script>

<div>
	{#if cat}
		<!-- Card qui chevauche avec le Header -->
		<Card.Root class="relative col-span-1 overflow-auto">
			{#if editing}
				<CatEditForm {cat} {hosts} {volunteers} {isAdmin} onCancel={() => (editing = false)} />
			{:else}
				<!-- MODE LECTURE -->
				<Card.Header>
					<div class="flex flex-row items-start justify-between">
						<div>
							<Card.Title class="text-xl">{cat.name}</Card.Title>
							<Card.Description>
								{cat.ageBadge} · {getLabel(sexLabel, cat.sex)}
							</Card.Description>
							<span>ID</span>
							<span>{cat.id}</span>
						</div>
						<!-- FA & référent -->
						<div>
							<div class="grid grid-cols-2 gap-1 text-sm">
								<span class="text-muted-foreground">Bénévole</span>
								<span>
									{#if cat.referent}
										{cat.referent.firstName} {cat.referent.lastName}
									{:else}
										<span class="text-muted-foreground">—</span>
									{/if}
								</span>
								<span class="text-muted-foreground">FA</span>
								<span>
									{#if getCurrentPlacement()}
										{getCurrentPlacement().host.firstName} {getCurrentPlacement().host.lastName}
									{:else}
										<span class="text-red-500">Aucune</span>
									{/if}
								</span>
								<span>Note Placement</span>
							</div>
						</div>

						<div class="flex flex-col">
							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									editing = true;
								}}
							>
								<Pencil class="h-5 w-5" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									editimg = true;
								}}
							>
								<Camera class="W-5 h-5" />
							</Button>
						</div>
					</div>

					<!-- Statut & visibilité -->
					<div class="flex gap-4">
						<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
						{#if cat.isVisible}
							<Badge class="bg-green-100 text-green-700">Visible</Badge>
						{:else}
							<Badge class="bg-red-100 text-red-700">Masqué</Badge>
						{/if}
					</div>
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 text-sm">
					<Separator />

					<div class="grid grid-cols-2 gap-6">
						<!-- Infos physiques -->
						<div>
							<p class="mb-2 text-base font-medium">Infos physiques</p>
							<div class="grid grid-cols-2 gap-2 text-sm">
								<span class="text-muted-foreground">Âge</span>
								<span>{cat.formattedAge}</span>
								<span class="text-muted-foreground">Couleur</span>
								<span>{cat.color ?? '—'}</span>
								<span class="text-muted-foreground">Poil</span>
								<span>{getLabel(hairLabel, cat.hairLength)}</span>
								<span class="text-muted-foreground">Origine</span>
								<span>{cat.origin ?? '—'}</span>
							</div>
						</div>

						<!-- Compatibilités -->
						<div>
							<p class="mb-2 text-base font-medium">Compatibilités</p>
							<div class="grid grid-cols-2 gap-2 text-sm">
								<span class="text-muted-foreground">Chien</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkDog} />
								</div>
								<span class="text-muted-foreground">Chat</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkCat} />
								</div>
								<span class="text-muted-foreground">Enfant</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOkChild} />
								</div>
								<span class="text-muted-foreground">Jardin</span>
								<div class="flex justify-start">
									<BooleanIcon value={cat.isOutside} />
								</div>
							</div>
						</div>
					</div>

					<Separator />

					<!-- Santé -->
					<div class="grid grid-cols-1 gap-4">
						<div>
							<p class="mb-2 text-base font-medium">Santé</p>
							<section class="grid grid-cols-2 gap-6">
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Vaccin</span>
									<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
									<span class="text-muted-foreground">Test FIV</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isFivTest} />
									</div>
									<span class="text-muted-foreground">Vermifuge</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isDeworming} />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-2 text-sm">
									<span class="text-muted-foreground">Stérilisé·e</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isSterilize || cat.isAlreadySterilized} />
									</div>
									<span class="text-muted-foreground">Identifié·e</span>
									<div class="flex justify-start">
										<BooleanIcon value={cat.isIdentify} />
									</div>
									<span class="text-muted-foreground">Puce</span>
									<span>{cat.chipId ?? '—'}</span>
								</div>
							</section>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<span class="mb-2 text-base font-medium">Maladie</span>
								<span class="ml-4 block">{cat.sickness ?? '—'}</span>
							</div>
							<div>
								<span class="mb-2 text-base font-medium">Traitement</span>
								<span class="ml-4 block">{cat.treatment ?? '—'}</span>
							</div>
						</div>
					</div>
					<Separator />

					<!-- Description -->
					{#if cat.description}
						<div>
							<p class="mb-2 text-base font-medium">Description</p>
							<p class="text-muted-foreground text-sm">{cat.description}</p>
						</div>
					{/if}
				</Card.Content>
			{/if}
		</Card.Root>
	{:else}
		<Card.Content class="text-muted-foreground flex h-full items-center justify-center p-8 text-sm">
			Sélectionnez un chat pour voir ses détails
		</Card.Content>
	{/if}
</div>
