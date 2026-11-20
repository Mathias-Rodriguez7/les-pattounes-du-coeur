<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import SosGpsField from './SosGpsField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import { format } from 'date-fns';
	import { LoaderCircle } from '@lucide/svelte';
	import { SOS_CATEGORY_OPTIONS } from '#lib/constants/sos.ts';
	import type { SosView } from '#lib/server/sos/queries.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Modifier un SOS : la personne qui signale (et la date), le signalement (catégorie, situation),
	// le lieu (adresse + GPS).
	// Affiché à la place des cartes du panneau (même principe que la fiche d'une FA)
	interface Props {
		sos: SosView;
		/** Enregistré ou annulé : le panneau revient en lecture */
		onDone: () => void;
	}

	let { sos, onDone }: Props = $props();

	// Les valeurs de départ : celles du SOS au moment d'ouvrir le formulaire
	// svelte-ignore state_referenced_locally
	let reportedAt = $state<Date>(new Date(sos.reportedAt));
	// svelte-ignore state_referenced_locally
	let firstName = $state(sos.reporterFirstName);
	// svelte-ignore state_referenced_locally
	let lastName = $state(sos.reporterLastName);
	// svelte-ignore state_referenced_locally
	let phone = $state(sos.reporterPhone ?? '');
	// svelte-ignore state_referenced_locally
	let email = $state(sos.reporterEmail ?? '');
	// svelte-ignore state_referenced_locally
	let category = $state(sos.category ?? '');
	// svelte-ignore state_referenced_locally
	let address = $state(sos.address ?? '');
	// svelte-ignore state_referenced_locally
	let city = $state(sos.city ?? '');
	// svelte-ignore state_referenced_locally
	let postalCode = $state(sos.postalCode ?? '');
	// svelte-ignore state_referenced_locally
	let district = $state<string | null>(sos.district ?? null);
	// svelte-ignore state_referenced_locally
	let latitude = $state<number | null>(sos.latitude);
	// svelte-ignore state_referenced_locally
	let longitude = $state<number | null>(sos.longitude);
	// svelte-ignore state_referenced_locally
	let description = $state(sos.description ?? '');

	let saving = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});

	const error = (key: string) => errors[key]?.[0];

	const handleEnhance: SubmitFunction = ({ formData }) => {
		// format() : la date locale, sans décalage de fuseau horaire
		formData.set('reportedAt', format(reportedAt, 'yyyy-MM-dd'));
		saving = true;
		return async ({ result, update }) => {
			saving = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				await update({ reset: false });
				onDone();
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
	import RequiredLegend from '#lib/components/fields/RequiredLegend.svelte';
</script>

<form method="POST" action="?/updateSos" use:enhance={handleEnhance} class="grid gap-4">
	<RequiredLegend />
	<input type="hidden" name="sosId" value={sos.id} />

	<!-- La personne qui signale, et la date du SOS -->
	<SectionCard icon="user" title="La personne qui signale" color="rose">
		<div class="grid gap-4 @lg:grid-cols-2">
			<InputField
				id="sos-edit-first-name"
				name="reporterFirstName"
				label="Prénom"
				bind:value={firstName}
				error={error('reporterFirstName')}
				required
				size="sm"
			/>
			<InputField
				id="sos-edit-last-name"
				name="reporterLastName"
				label="Nom"
				bind:value={lastName}
				error={error('reporterLastName')}
				required
				size="sm"
			/>
			<InputField
				id="sos-edit-phone"
				name="reporterPhone"
				label="Téléphone"
				bind:value={phone}
				error={error('reporterPhone')}
				size="sm"
			/>
			<InputField
				id="sos-edit-email"
				name="reporterEmail"
				label="Email"
				type="email"
				bind:value={email}
				error={error('reporterEmail')}
				size="sm"
			/>
			<DatePicker
				name="reportedAt"
				label="Date du SOS"
				value={reportedAt}
				onSelect={(d) => (reportedAt = d)}
				error={error('reportedAt')}
			/>
		</div>
		<p class="mt-2 text-xs text-muted-foreground">Un téléphone ou un email est obligatoire.</p>
	</SectionCard>

	<SectionCard icon="note" title="Le signalement" color="amber">
		<div class="grid gap-4">
			<SelectField
				id="sos-edit-category"
				name="category"
				label="Catégorie"
				options={SOS_CATEGORY_OPTIONS}
				bind:value={category}
				placeholder="À choisir"
				class="w-full @lg:w-64"
			/>
			<TextareaField
				id="sos-edit-description"
				name="description"
				label="Situation"
				bind:value={description}
				rows={4}
			/>
		</div>
	</SectionCard>

	<PersonAddressFields
		bind:address
		bind:city
		bind:postalCode
		bind:district
		required={false}
		title="Le lieu"
		streetLabel="Rue ou lieu"
		idPrefix="sos-edit-"
		errors={{
			address: errors.address?.[0],
			city: errors.city?.[0],
			postalCode: errors.postalCode?.[0]
		}}
	/>
	<SosGpsField bind:latitude bind:longitude error={errors.latitude?.[0]} />

	<div class="flex justify-end gap-2">
		<Button type="button" variant="outline" onclick={onDone} disabled={saving}>Annuler</Button>
		<Button type="submit" disabled={saving}>
			{#if saving}<LoaderCircle class="size-4 animate-spin" />{/if}
			Enregistrer
		</Button>
	</div>
</form>
