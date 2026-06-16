<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Pencil, X, Save } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { CatFull } from '$lib/types/cat';
	import {
		statusLabel,
		sexLabel,
		hairLabel,
		vaccinateLabel,
		getLabel,
		dot
	} from '$lib/utils/catHelpers';

	const {
		cat,
		hosts,
		volunteers,
		isAdmin = false
	}: {
		cat: CatFull | null;
		hosts: { id: string; firstName: string; lastName: string }[];
		volunteers: { id: string; role: string; firstName: string; lastName: string }[];
		isAdmin?: boolean;
	} = $props();

	let editing = $state(false);
</script>

<Card.Root class="col-span-1 overflow-auto">
	{#if cat}
		<div class="h-48 w-full overflow-hidden">
			<img
				src={cat.media?.[0]?.picture ?? '/img/logo.png'}
				alt={cat.name}
				class="h-full w-full object-cover"
			/>
		</div>

		<Card.Header class="flex flex-row items-start justify-between">
			<div>
				<Card.Title>{cat.name}</Card.Title>
				<Card.Description>
					{cat.ageBadge} · {getLabel(sexLabel, cat.sex)}
				</Card.Description>
			</div>
			{#if !editing}
				<Button variant="ghost" size="icon" onclick={() => (editing = true)}>
					<Pencil class="h-4 w-4" />
				</Button>
			{/if}
		</Card.Header>

		<Card.Content class="flex flex-col gap-3 text-sm">
			{#if editing}
				<!-- ───── MODE ÉDITION ───── -->
				<form
					method="POST"
					action="?/updateCat"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
							await invalidateAll();
							editing = false;
						};
					}}
					class="flex flex-col gap-4"
				>
					<input type="hidden" name="id" value={cat.id} />

					<!-- Infos générales -->
					<p class="font-medium">Informations générales</p>
					<div class="grid grid-cols-2 items-center gap-2">
						<label for="name" class="text-muted-foreground">Nom</label>
						<Input id="name" name="name" value={cat.name ?? ''} />

						<label for="sex" class="text-muted-foreground">Sexe</label>
						<select
							id="sex"
							name="sex"
							value={cat.sex}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							{#each Object.entries(sexLabel) as [val, label] (val)}
								<option value={val}>{label}</option>
							{/each}
						</select>

						<label for="age" class="text-muted-foreground">Âge (mois)</label>
						<Input id="age" name="age" type="number" value={cat.age ?? ''} />

						<label for="status" class="text-muted-foreground">Statut</label>
						<select
							id="status"
							name="status"
							value={cat.status}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							{#each Object.entries(statusLabel) as [val, label] (val)}
								<option value={val}>{label}</option>
							{/each}
						</select>

						<label for="isVisible" class="text-muted-foreground">Visible</label>
						<select
							id="isVisible"
							name="isVisible"
							value={cat.isVisible ? 'true' : 'false'}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							<option value="true">Oui</option>
							<option value="false">Non</option>
						</select>

						<label for="color" class="text-muted-foreground">Couleur</label>
						<Input id="color" name="color" value={cat.color ?? ''} />

						<label for="hairLength" class="text-muted-foreground">Poil</label>
						<select
							id="hairLength"
							name="hairLength"
							value={cat.hairLength ?? ''}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							<option value="">—</option>
							{#each Object.entries(hairLabel) as [val, label] (val)}
								<option value={val}>{label}</option>
							{/each}
						</select>

						<label for="origin" class="text-muted-foreground">Origine</label>
						<Input id="origin" name="origin" value={cat.origin ?? ''} />
					</div>

					<!-- Santé -->
					<p class="font-medium">Santé</p>
					<div class="grid grid-cols-2 items-center gap-2">
						<label for="vaccinate" class="text-muted-foreground">Vaccin</label>
						<select
							id="vaccinate"
							name="vaccinate"
							value={cat.vaccinate ?? ''}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							<option value="">—</option>
							{#each Object.entries(vaccinateLabel) as [val, label] (val)}
								<option value={val}>{label}</option>
							{/each}
						</select>

						{#each [{ label: 'FIV', name: 'isFivTest', val: cat.isFivTest }, { label: 'Vermifuge', name: 'isDeworming', val: cat.isDeworming }, { label: 'Stérilisé', name: 'isSterilize', val: cat.isSterilize }, { label: 'Identifié', name: 'isIdentify', val: cat.isIdentify }] as f (f.name)}
							<label for={f.name} class="text-muted-foreground">{f.label}</label>
							<select
								id={f.name}
								name={f.name}
								value={f.val ? 'true' : 'false'}
								class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
							>
								<option value="true">Oui</option>
								<option value="false">Non</option>
							</select>
						{/each}

						<label for="chipId" class="text-muted-foreground">Puce</label>
						<Input id="chipId" name="chipId" value={cat.chipId ?? ''} />

						<label for="sickness" class="text-muted-foreground">Maladie</label>
						<Input id="sickness" name="sickness" value={cat.sickness ?? ''} />

						<label for="treatment" class="text-muted-foreground">Traitement</label>
						<Input id="treatment" name="treatment" value={cat.treatment ?? ''} />
					</div>

					<!-- Compatibilités -->
					<p class="font-medium">Compatibilités</p>
					<div class="grid grid-cols-2 items-center gap-2">
						{#each [{ label: 'Chien', name: 'isOkDog', val: cat.isOkDog }, { label: 'Chat', name: 'isOkCat', val: cat.isOkCat }, { label: 'Enfant', name: 'isOkChild', val: cat.isOkChild }, { label: 'Jardin', name: 'isOutside', val: cat.isOutside }] as f (f.name)}
							<label for={f.name} class="text-muted-foreground">{f.label}</label>
							<select
								id={f.name}
								name={f.name}
								value={f.val ? 'true' : 'false'}
								class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
							>
								<option value="true">Oui</option>
								<option value="false">Non</option>
							</select>
						{/each}
					</div>

					<!-- Gestion -->
					<p class="font-medium">Gestion</p>
					<div class="grid grid-cols-2 items-center gap-2">
						<label for="hostId" class="text-muted-foreground">FA</label>
						<select
							id="hostId"
							name="hostId"
							value={cat.currentHost?.id ?? ''}
							class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
						>
							<option value="">Aucune</option>
							{#each hosts as h (h.id)}
								<option value={h.id}>{h.firstName} {h.lastName}</option>
							{/each}
						</select>
					</div>

					<!-- Description -->
					<p class="font-medium">Description</p>
					<Textarea id="description" name="description" value={cat.description ?? ''} rows={4} />

					<!-- Boutons -->
					<div class="flex gap-2">
						<Button type="submit" class="flex-1 gap-2">
							<Save class="h-4 w-4" />
							Sauvegarder
						</Button>
						<Button
							type="button"
							variant="outline"
							class="flex-1 gap-2"
							onclick={() => (editing = false)}
						>
							<X class="h-4 w-4" />
							Annuler
						</Button>
					</div>
				</form>

				<!-- Formulaire séparé pour le référent (admin seulement) -->
				{#if isAdmin}
					<form
						id="volunteerForm"
						method="POST"
						action="?/assignVolunteer"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
							};
						}}
						class="flex flex-col gap-2"
					>
						<input type="hidden" name="catId" value={cat.id} />
						<p class="font-medium">Référent</p>
						<div class="grid grid-cols-2 items-center gap-2">
							<label for="volunteerId" class="text-muted-foreground">Référent</label>
							<select
								id="volunteerId"
								name="volunteerId"
								value={cat.referent?.id ?? ''}
								class="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
							>
								<option value="">Aucun</option>
								{#each volunteers as v (v.id)}
									<option value={v.id}>{v.firstName} {v.lastName}</option>
								{/each}
							</select>
						</div>
						<Button type="submit" variant="outline" size="sm">Assigner le référent</Button>
					</form>
				{/if}
			{:else}
				<!-- ───── MODE LECTURE ───── -->

				<!-- Statut & visibilité -->
				<div class="flex gap-2">
					<Badge variant="outline">{statusLabel[cat.status] ?? cat.status}</Badge>
					{#if cat.isVisible}
						<Badge class="bg-green-100 text-green-700">Visible</Badge>
					{:else}
						<Badge class="bg-red-100 text-red-700">Masqué</Badge>
					{/if}
				</div>

				<!-- Infos physiques -->
				<div class="grid grid-cols-2 gap-1">
					<span class="text-muted-foreground">Âge</span>
					<span>{cat.formattedAge}</span>
					<span class="text-muted-foreground">Couleur</span>
					<span>{cat.color ?? '—'}</span>
					<span class="text-muted-foreground">Poil</span>
					<span>{getLabel(hairLabel, cat.hairLength)}</span>
					<span class="text-muted-foreground">Origine</span>
					<span>{cat.origin ?? '—'}</span>
				</div>

				<!-- Santé -->
				<p class="font-medium">Santé</p>
				<div class="grid grid-cols-2 gap-1">
					<span class="text-muted-foreground">Vaccin</span>
					<span>{getLabel(vaccinateLabel, cat.vaccinate)}</span>
					<span class="text-muted-foreground">FIV</span>
					<span class={dot(cat.isFivTest)}></span>
					<span class="text-muted-foreground">Vermifuge</span>
					<span class={dot(cat.isDeworming)}></span>
					<span class="text-muted-foreground">Stérilisé</span>
					<span class={dot(cat.isSterilize || cat.isAlreadySterilized)}></span>
					<span class="text-muted-foreground">Identifié</span>
					<span class={dot(cat.isIdentify)}></span>
				</div>

				{#if cat.sickness}
					<p><span class="text-muted-foreground">Maladie : </span>{cat.sickness}</p>
				{/if}
				{#if cat.treatment}
					<p><span class="text-muted-foreground">Traitement : </span>{cat.treatment}</p>
				{/if}
				{#if cat.chipId}
					<p><span class="text-muted-foreground">Puce : </span>{cat.chipId}</p>
				{/if}

				<!-- Compatibilités -->
				<p class="font-medium">Compatibilités</p>
				<div class="grid grid-cols-2 gap-1">
					<span class="text-muted-foreground">Chien</span>
					<span class={dot(cat.isOkDog)}></span>
					<span class="text-muted-foreground">Chat</span>
					<span class={dot(cat.isOkCat)}></span>
					<span class="text-muted-foreground">Enfant</span>
					<span class={dot(cat.isOkChild)}></span>
					<span class="text-muted-foreground">Jardin</span>
					<span class={dot(cat.isOutside)}></span>
				</div>

				<!-- FA & référent -->
				<p class="font-medium">Gestion</p>
				<div class="grid grid-cols-2 gap-1">
					<span class="text-muted-foreground">FA</span>
					<span>
						{#if cat.currentHost}
							{cat.currentHost.firstName} {cat.currentHost.lastName}
						{:else}
							<span class="text-red-500">Aucune</span>
						{/if}
					</span>
					<span class="text-muted-foreground">Référent</span>
					<span>
						{#if cat.referent}
							{cat.referent.firstName} {cat.referent.lastName}
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</span>
				</div>

				{#if cat.description}
					<p class="font-medium">Description</p>
					<p class="text-muted-foreground">{cat.description}</p>
				{/if}
			{/if}
		</Card.Content>
	{:else}
		<Card.Content class="text-muted-foreground flex h-full items-center justify-center p-8 text-sm">
			Sélectionnez un chat pour voir ses détails
		</Card.Content>
	{/if}
</Card.Root>
