<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, Plus } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import SosGpsField from './SosGpsField.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import { SOS_CATEGORY_OPTIONS, SOS_MANUAL_SOURCE_OPTIONS } from '#lib/constants/sos.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';

	// Saisir à la main un SOS reçu par téléphone, mail… (ou un ancien SOS) :
	// la bénévole qui le saisit le traite
	interface Props {
		/** Le nouveau SOS est créé : la page l'ouvre */
		onCreated?: (sosId: string) => void;
		/** Ouvert depuis l'extérieur (« + SOS » du dashboard) */
		open?: boolean;
	}

	let { onCreated, open = $bindable(false) }: Props = $props();
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	let source = $state('PHONE');
	let reportedAt = $state<Date>(new Date());
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let email = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let district = $state<string | null>(null);
	let latitude = $state<number | null>(null);
	let longitude = $state<number | null>(null);
	let category = $state('');
	let description = $state('');

	$effect(() => {
		if (open) return;
		source = 'PHONE';
		reportedAt = new Date();
		firstName = '';
		lastName = '';
		phone = '';
		email = '';
		address = '';
		city = '';
		postalCode = '';
		district = null;
		latitude = null;
		longitude = null;
		category = '';
		description = '';
		errors = {};
	});

	const handleEnhance: SubmitFunction = ({ formData }) => {
		// format() : la date locale, sans décalage de fuseau horaire
		formData.set('reportedAt', format(reportedAt, 'yyyy-MM-dd'));
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				await update();
				if (typeof result.data?.sosId === 'string') onCreated?.(result.data.sosId);
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="{buttonVariants({ size: 'sm' })} rounded-2xl">
		<Plus class="size-4" />
		<span class="hidden sm:inline">Nouveau SOS</span>
		<span class="sm:hidden">Ajouter</span>
	</Dialog.Trigger>
	<Dialog.Content size="lg">
		<Dialog.Header>
			<Dialog.Title>Nouveau SOS</Dialog.Title>
			<Dialog.Description>
				Un signalement reçu par téléphone ou par mail, ou un ancien SOS. Vous le traiterez. Les SOS
				envoyés depuis le site arrivent tout seuls.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createSos" use:enhance={handleEnhance} class="grid gap-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<SelectField
					id="sos-source"
					name="source"
					label="Reçu par"
					options={SOS_MANUAL_SOURCE_OPTIONS}
					bind:value={source}
				/>
				<DatePicker
					name="reportedAt"
					label="Date du SOS"
					value={reportedAt}
					onSelect={(d) => (reportedAt = d)}
					error={error('reportedAt')}
				/>
				<InputField
					id="sos-first-name"
					name="reporterFirstName"
					label="Prénom de la personne"
					bind:value={firstName}
					error={error('reporterFirstName')}
					required
				/>
				<InputField
					id="sos-last-name"
					name="reporterLastName"
					label="Nom"
					bind:value={lastName}
					error={error('reporterLastName')}
					required
				/>
				<InputField
					id="sos-phone"
					name="reporterPhone"
					label="Téléphone"
					bind:value={phone}
					error={error('reporterPhone')}
				/>
				<InputField
					id="sos-email"
					name="reporterEmail"
					label="Email"
					type="email"
					bind:value={email}
					error={error('reporterEmail')}
				/>
			</div>

			<!-- Le lieu : la même carte qu'une adresse de profil, mais rien d'obligatoire -->
			<PersonAddressFields
				bind:address
				bind:city
				bind:postalCode
				bind:district
				required={false}
				title="Le lieu"
				streetLabel="Rue ou lieu"
				idPrefix="sos-new-"
				errors={{
					address: error('address'),
					city: error('city'),
					postalCode: error('postalCode')
				}}
			/>
			<SosGpsField bind:latitude bind:longitude error={error('latitude')} />

			<SelectField
				id="sos-category"
				name="category"
				label="Catégorie (vous pourrez la choisir plus tard)"
				options={SOS_CATEGORY_OPTIONS}
				bind:value={category}
				placeholder="À choisir"
			/>
			<TextareaField
				id="sos-description"
				name="description"
				label="Situation"
				placeholder="Ce que la personne a décrit…"
				bind:value={description}
				error={error('description')}
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
