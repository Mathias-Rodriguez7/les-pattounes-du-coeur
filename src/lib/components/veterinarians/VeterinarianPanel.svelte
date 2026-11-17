<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import VeterinarianDialog from './VeterinarianDialog.svelte';
	import { Clock, Globe, MapPin, Phone, Stethoscope, TriangleAlert } from '@lucide/svelte';
	import { VETERINARIAN_CATEGORY } from '#lib/constants/veterinarian.ts';
	import { mapsAddressUrl } from '#lib/utils/geo.ts';
	import type { VeterinarianRow } from '#lib/server/veterinarians/queries.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Le panneau d'un vétérinaire : coordonnées, horaires, à savoir ; l'admin le modifie ou le retire
	interface Props {
		vet: VeterinarianRow | null;
		isAdmin: boolean;
	}

	let { vet, isAdmin }: Props = $props();

	let busy = $state(false);

	const handleActive: SubmitFunction = () => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success') toast.success(result.data?.message as string);
			else if (result.type === 'failure') toast.error((result.data?.error as string) ?? 'Erreur');
			await update();
		};
	};
</script>

{#if vet}
	{@const category = VETERINARIAN_CATEGORY[vet.category]}
	<Card.Root class="flex h-full flex-col">
		<Card.Header class="gap-3">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<Badge class={category.color}>{category.one}</Badge>
						{#if !vet.isActive}
							<Badge variant="outline">Retiré de la liste</Badge>
						{/if}
					</div>
					<Card.Title class="mt-2 text-2xl font-bold">{vet.name}</Card.Title>
					{#if vet.doctors}
						<Card.Description class="mt-1 text-base">{vet.doctors}</Card.Description>
					{/if}
					{#if vet.specialty}
						<p class="mt-1 text-sm">
							Spécialité : <span class="font-medium">{vet.specialty}</span>
						</p>
					{/if}
				</div>
				{#if isAdmin}
					<VeterinarianDialog {vet} />
				{/if}
			</div>
			<p class="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{category.hint}</p>
		</Card.Header>

		<Card.Content class="flex flex-col gap-6 text-sm">
			<Separator />

			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SectionCard icon="map" title="Coordonnées" color="blue">
					<div class="grid gap-2">
						{#if vet.area || vet.address}
							<p class="flex gap-2">
								<MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<span>
									{#if vet.area}<span class="font-medium">{vet.area}</span><br />{/if}
									{vet.address ?? ''}
								</span>
							</p>
						{/if}
						{#if vet.phone}
							<p class="flex items-center gap-2">
								<Phone class="size-4 shrink-0 text-muted-foreground" />
								<a
									href={`tel:${vet.phone.replace(/[^\d+]/g, '')}`}
									class="text-blue-600 underline hover:text-primary">{vet.phone}</a
								>
							</p>
						{/if}
						<!-- Des sites externes (le site du véto, Google Maps) : pas des routes de l'appli -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						{#if vet.website}
							<p class="flex min-w-0 items-center gap-2">
								<Globe class="size-4 shrink-0 text-muted-foreground" />
								<a
									href={vet.website}
									target="_blank"
									rel="noopener noreferrer"
									class="truncate text-blue-600 underline hover:text-primary">Site web</a
								>
							</p>
						{/if}
						{#if vet.address}
							<a
								href={mapsAddressUrl(vet.address)}
								target="_blank"
								rel="noopener noreferrer"
								class="text-xs text-blue-600 underline hover:text-primary">Itinéraire dans Maps</a
							>
						{/if}
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</div>
				</SectionCard>

				<SectionCard icon="clock" title="Horaires" color="indigo">
					{#if vet.hours}
						<p class="flex gap-2">
							<Clock class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<span class="whitespace-pre-line">{vet.hours}</span>
						</p>
					{:else}
						<p class="text-muted-foreground">Non renseignés</p>
					{/if}
				</SectionCard>
			</section>

			{#if vet.notes}
				<p class="flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-900">
					<TriangleAlert class="size-4 shrink-0" />
					<span>{vet.notes}</span>
				</p>
			{/if}
			<Separator />
			{#if isAdmin}
				<form
					method="POST"
					action="?/setVeterinarianActive"
					use:enhance={handleActive}
					class="flex items-center justify-between gap-2"
				>
					<span class="text-xs text-muted-foreground">
						Utilisé pour {vet._count.cares} soin{vet._count.cares > 1 ? 's' : ''}
					</span>
					<input type="hidden" name="veterinarianId" value={vet.id} />
					<input type="hidden" name="isActive" value={vet.isActive ? 'false' : 'true'} />
					<Button
						type="submit"
						variant="ghost"
						size="sm"
						class={vet.isActive ? 'text-destructive' : ''}
						disabled={busy}
					>
						{vet.isActive ? 'Retirer de la liste' : 'Remettre dans la liste'}
					</Button>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Stethoscope class="mx-auto mb-2 size-8 opacity-50" />
			<p class="text-sm">Sélectionnez un vétérinaire</p>
		</Card.Content>
	</Card.Root>
{/if}
