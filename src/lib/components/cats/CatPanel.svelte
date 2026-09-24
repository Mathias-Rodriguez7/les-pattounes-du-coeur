<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Icon from '$lib/components/Icon.svelte';
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
	import { getAgeBadge, formatAge } from '$lib/utils/age';
	import SectionCard from '../cards/SectionCard.svelte';
	import { CAT_SECTION_CONFIG } from '$lib/constants/cat';

	const {
		cat,
		hosts,
		volunteers,
		isAdmin = false
	}: {
		cat: CatFull | null;
		hosts: any[];
		volunteers: any[];
		isAdmin?: boolean;
	} = $props();

	let editing = $state(false);

	function getCurrentPlacement() {
		if (!cat?.placements) return null;
		return cat.placements.find((p) => p.status !== 'CLOSED' && p.type === 'LONG') || null;
	}
</script>

{#if cat}
	<Card.Root class="relative col-span-1 overflow-auto">
		{#if editing}
			<CatEditForm {cat} {hosts} {volunteers} {isAdmin} onCancel={() => (editing = false)} />
		{:else}
			<!-- MODE LECTURE -->
			<Card.Header>
				<section class="flex h-35 justify-between">
					<div class="flex flex-col justify-around">
						<Card.Title class="text-2xl">{cat.name}</Card.Title>
						<Card.Description>
							{getAgeBadge(cat.birthDate)} · {getLabel(sexLabel, cat.sex)}
						</Card.Description>
						<div>
							<span>Num de suivi:</span>
							<span>{cat.catNumber}</span>
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
					</div>
					<!-- FA & référent -->
					<SectionCard
						icon={CAT_SECTION_CONFIG.volunteers.icon}
						title={CAT_SECTION_CONFIG.volunteers.label}
						color={CAT_SECTION_CONFIG.volunteers.color}
					>
						<div class="grid grid-cols-2 gap-1 text-sm">
							<span class="text-muted-foreground">Bénévole</span>
							<span>
								{#if cat.volunteer}
									{cat.volunteer.firstName} {cat.volunteer.lastName}
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
					</SectionCard>

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
				</section>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4 text-sm">
				<Separator />

				<div class="grid grid-cols-3 gap-4">
					<!-- Profil -->
					<SectionCard
						icon={CAT_SECTION_CONFIG.profile.icon}
						title={CAT_SECTION_CONFIG.profile.label}
						color={CAT_SECTION_CONFIG.profile.color}
					>
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Âge</span>
								<span>{formatAge(cat.birthDate)}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Couleur</span>
								<span>{cat.color ?? '—'}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Poil</span>
								<span>{getLabel(hairLabel, cat.hairLength)}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Origine</span>
								<span>{cat.origin ?? '—'}</span>
							</div>
						</div>
					</SectionCard>

					<!-- Compatibilités -->
					<SectionCard
						icon={CAT_SECTION_CONFIG.compatibility.icon}
						title={CAT_SECTION_CONFIG.compatibility.label}
						color={CAT_SECTION_CONFIG.compatibility.color}
					>
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Chien</span>

								<BooleanIcon value={cat.isOkDog} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Chat</span>

								<BooleanIcon value={cat.isOkCat} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Enfant</span>

								<BooleanIcon value={cat.isOkChild} />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Jardin</span>

								<BooleanIcon value={cat.isOutside} />
							</div>
						</div>
					</SectionCard>

					<SectionCard
						icon={CAT_SECTION_CONFIG.host.icon}
						title={CAT_SECTION_CONFIG.host.label}
						color={CAT_SECTION_CONFIG.host.color}
					></SectionCard>
				</div>

				<Separator />

				<!-- Santé -->
				<SectionCard
					icon={CAT_SECTION_CONFIG.health.icon}
					title={CAT_SECTION_CONFIG.health.label}
					color={CAT_SECTION_CONFIG.health.color}
				>
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
				</SectionCard>

				<Separator />

				<SectionCard
					icon={CAT_SECTION_CONFIG.sicknesses.icon}
					title={CAT_SECTION_CONFIG.sicknesses.label}
					color={CAT_SECTION_CONFIG.sicknesses.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<span class="mb-2 text-base font-medium">Maladie</span>
							<span class="ml-4 block">{cat.sicknesses.name ?? '—'}</span>
						</div>
						<div>
							<span class="mb-2 text-base font-medium">Traitement</span>
							<span class="ml-4 block">{cat.sicknesses.treatment ?? '—'}</span>
						</div>
					</div>
				</SectionCard>

				<!-- Description -->
				{#if cat.description}
					<SectionCard
						icon={CAT_SECTION_CONFIG.description.icon}
						title={CAT_SECTION_CONFIG.description.label}
						color={CAT_SECTION_CONFIG.description.color}
					>
						<p class="text-muted-foreground text-sm">{cat.description}</p>
					</SectionCard>
				{/if}
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="cat" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez un chat pour voir ses détails</p>
		</Card.Content>
	</Card.Root>
{/if}
