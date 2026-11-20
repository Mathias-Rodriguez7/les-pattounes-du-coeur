<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, Pencil, Plus } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import CheckboxField from '#lib/components/fields/CheckboxField.svelte';
	import { VETERINARIAN_CATEGORY_OPTIONS } from '#lib/constants/veterinarian.ts';
	import type { VeterinarianRow } from '#lib/server/veterinarians/queries.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Ajouter un vétérinaire (sans `vet`) ou le modifier (avec) : les mêmes champs
	interface Props {
		vet?: VeterinarianRow;
	}

	let { vet }: Props = $props();

	const isEdit = $derived(!!vet);

	type Fields = {
		category: string;
		name: string;
		doctors: string;
		specialty: string;
		area: string;
		address: string;
		phone: string;
		website: string;
		hours: string;
		notes: string;
		isCityPartner: boolean;
	};

	const fromVet = (v: VeterinarianRow | undefined): Fields => ({
		category: v?.category ?? 'PARTNER',
		name: v?.name ?? '',
		doctors: v?.doctors ?? '',
		specialty: v?.specialty ?? '',
		area: v?.area ?? '',
		address: v?.address ?? '',
		phone: v?.phone ?? '',
		website: v?.website ?? '',
		hours: v?.hours ?? '',
		notes: v?.notes ?? '',
		isCityPartner: v?.isCityPartner ?? false
	});

	let open = $state(false);
	let fields = $state<Fields>(fromVet(undefined));
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	// À chaque ouverture : on repart des valeurs ACTUELLES (ou d'un formulaire vide)
	$effect(() => {
		if (!open) return;
		fields = fromVet(vet);
		errors = {};
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Enregistré');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			} else {
				toast.error('Une erreur est survenue. Réessayez.');
			}
		};
	};
	import RequiredLegend from '#lib/components/fields/RequiredLegend.svelte';
</script>

<Dialog.Root bind:open>
	{#if isEdit}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			aria-label="Modifier {vet?.name}"
		>
			<Pencil class="size-4" />
		</Dialog.Trigger>
	{:else}
		<Dialog.Trigger class="{buttonVariants({ size: 'sm' })} rounded-2xl">
			<Plus class="size-4" />
			Ajouter un vétérinaire
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? `Modifier ${vet?.name}` : 'Ajouter un vétérinaire'}</Dialog.Title>
			<Dialog.Description>
				Seul le nom de la clinique est obligatoire. La catégorie dit quand l'utiliser.
			</Dialog.Description>
		</Dialog.Header>
		<RequiredLegend class="-mt-3" />

		<form
			method="POST"
			action={isEdit ? '?/updateVeterinarian' : '?/createVeterinarian'}
			use:enhance={handleEnhance}
			class="grid gap-4"
		>
			{#if vet}
				<input type="hidden" name="veterinarianId" value={vet.id} />
			{/if}

			<div class="grid gap-4 sm:grid-cols-2">
				<InputField
					id="vet-name"
					name="name"
					label="Clinique"
					bind:value={fields.name}
					error={error('name')}
					required
					disabled={submitting}
				/>
				<SelectField
					id="vet-category"
					name="category"
					label="Catégorie"
					options={VETERINARIAN_CATEGORY_OPTIONS}
					bind:value={fields.category}
					disabled={submitting}
				/>
				<InputField
					id="vet-doctors"
					name="doctors"
					label="Vétérinaires"
					placeholder="Dr Dupont et Dr Martin"
					bind:value={fields.doctors}
					error={error('doctors')}
					disabled={submitting}
				/>
				<InputField
					id="vet-specialty"
					name="specialty"
					label="Spécialité"
					placeholder="Ophtalmologie"
					bind:value={fields.specialty}
					error={error('specialty')}
					disabled={submitting}
				/>
				<InputField
					id="vet-area"
					name="area"
					label="Secteur"
					placeholder="Montpellier / Port Marianne"
					bind:value={fields.area}
					error={error('area')}
					disabled={submitting}
				/>
				<InputField
					id="vet-phone"
					name="phone"
					label="Téléphone"
					placeholder="04 67 00 00 00"
					bind:value={fields.phone}
					error={error('phone')}
					disabled={submitting}
				/>
			</div>

			<CheckboxField
				id="vet-city-partner"
				name="isCityPartner"
				label="Partenaire mairie MPL"
				description="Stérilise les chats libres pour la mairie de Montpellier."
				checked={fields.isCityPartner}
				onChange={(checked) => (fields.isCityPartner = checked)}
				disabled={submitting}
			/>

			<InputField
				id="vet-address"
				name="address"
				label="Adresse"
				bind:value={fields.address}
				error={error('address')}
				disabled={submitting}
			/>
			<InputField
				id="vet-website"
				name="website"
				label="Site web"
				placeholder="https://…"
				bind:value={fields.website}
				error={error('website')}
				disabled={submitting}
			/>
			<TextareaField
				id="vet-hours"
				name="hours"
				label="Horaires"
				placeholder="Lundi au vendredi 8h30-12h et 14h-19h"
				bind:value={fields.hours}
				error={error('hours')}
				disabled={submitting}
			/>
			<TextareaField
				id="vet-notes"
				name="notes"
				label="À savoir"
				placeholder="Uniquement sur orientation d'un autre vétérinaire…"
				bind:value={fields.notes}
				error={error('notes')}
				disabled={submitting}
			/>

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}<LoaderCircle class="size-4 animate-spin" />{/if}
					Enregistrer
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
