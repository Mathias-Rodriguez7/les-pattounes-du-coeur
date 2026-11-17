<script lang="ts">
	import type { Snippet } from 'svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import SosGpsField from '#lib/components/sos/SosGpsField.svelte';
	import { CAT_SEX } from '#lib/constants/cat.ts';
	import {
		IDENTIFICATION_KIND_OPTIONS,
		STERILIZATION_PAYER_OPTIONS
	} from '#lib/constants/freeCat.ts';
	import type { FreeCatFormFields } from './freeCatForm.ts';

	// Les champs d'un chat libre, à la création comme à la modification : le chat, qui paye la
	// stérilisation, le lieu de relâchage et le nourrisseur. La création ajoute la date et le
	// vétérinaire dans la carte « Stérilisation » (snippet `sterilization`).
	interface Props {
		fields: FreeCatFormFields;
		/** Le premier message d'erreur d'un champ */
		error: (key: string) => string | undefined;
		disabled?: boolean;
		/** Préfixe des id (création et modification peuvent être sur la même page) */
		idPrefix: string;
		/** En haut de la carte « Le chat » : la gestionnaire, à la création */
		manager?: Snippet;
		/** Dans la carte « Stérilisation », sous « Qui paye » : la date et le vétérinaire */
		sterilization?: Snippet;
	}

	let {
		fields = $bindable(),
		error,
		disabled = false,
		idPrefix,
		manager,
		sterilization
	}: Props = $props();

	const identificationOptions = [
		{ value: 'NONE', label: 'Aucune' },
		...IDENTIFICATION_KIND_OPTIONS
	];
	const catNumberRequired = $derived(fields.payer === 'ASSO');
</script>

<div class="grid gap-4 lg:grid-cols-2">
	<SectionCard icon="cat" title="Le chat" color="cyan">
		<div class="grid gap-4 sm:grid-cols-2">
			{#if manager}
				<div class="sm:col-span-2">{@render manager()}</div>
			{/if}
			<div>
				<SelectField
					id="{idPrefix}sex"
					name="sex"
					label="Sexe"
					options={CAT_SEX}
					bind:value={fields.sex}
					placeholder="Choisir"
					required
					{disabled}
				/>
				{#if error('sex')}<p class="mt-1 text-xs text-destructive">{error('sex')}</p>{/if}
			</div>
			<InputField
				id="{idPrefix}catNumber"
				name="catNumber"
				label={catNumberRequired ? 'N° Pattounes (asso payeuse)' : 'N° Pattounes (facultatif)'}
				placeholder="C2511004"
				bind:value={fields.catNumber}
				error={error('catNumber')}
				required={catNumberRequired}
				size="sm"
				{disabled}
			/>
			<!-- Le select ne sait pas revenir à '' : « Aucune » envoie un champ vide -->
			<SelectField
				id="{idPrefix}identificationKind"
				label="Identification (facultatif)"
				options={identificationOptions}
				bind:value={fields.identificationKind}
				{disabled}
			/>
			<input
				type="hidden"
				name="identificationKind"
				value={fields.identificationKind === 'NONE' ? '' : fields.identificationKind}
			/>
			{#if fields.identificationKind !== 'NONE'}
				<InputField
					id="{idPrefix}identificationNumber"
					name="identificationNumber"
					label={fields.identificationKind === 'CHIP' ? 'Numéro de puce' : 'Numéro de tatouage'}
					bind:value={fields.identificationNumber}
					error={error('identificationNumber')}
					required
					size="sm"
					{disabled}
				/>
			{/if}
		</div>
	</SectionCard>

	<SectionCard icon="syringe" title="Stérilisation" color="violet">
		<div class="grid gap-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<SelectField
						id="{idPrefix}payer"
						name="payer"
						label="Qui paye"
						options={STERILIZATION_PAYER_OPTIONS}
						bind:value={fields.payer}
						placeholder="Choisir"
						required
						{disabled}
					/>
					{#if error('payer')}<p class="mt-1 text-xs text-destructive">{error('payer')}</p>{/if}
				</div>
				{#if fields.payer === 'OTHER'}
					<InputField
						id="{idPrefix}payerOther"
						name="payerOther"
						label="Nom du payeur"
						bind:value={fields.payerOther}
						error={error('payerOther')}
						required
						size="sm"
						{disabled}
					/>
				{/if}
			</div>
			{@render sterilization?.()}
		</div>
	</SectionCard>

	<div class="grid gap-4">
		<PersonAddressFields
			bind:address={fields.address}
			bind:city={fields.city}
			bind:postalCode={fields.postalCode}
			bind:district={fields.district}
			postalCodeRequired={false}
			title="Lieu de relâchage"
			streetLabel="Lieu (adresse ou repère)"
			idPrefix="{idPrefix}release-"
			errors={{
				address: error('address'),
				city: error('city'),
				postalCode: error('postalCode')
			}}
			{disabled}
		/>
		<SosGpsField
			bind:latitude={fields.latitude}
			bind:longitude={fields.longitude}
			error={error('latitude')}
			{disabled}
		/>
	</div>

	<SectionCard icon="user" title="Nourrisseur ou contact sur place" color="amber">
		<div class="grid gap-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<InputField
					id="{idPrefix}feederName"
					name="feederName"
					label="Nom"
					bind:value={fields.feederName}
					error={error('feederName')}
					required
					size="sm"
					{disabled}
				/>
				<InputField
					id="{idPrefix}feederContact"
					name="feederContact"
					label="Contact (téléphone, email…)"
					bind:value={fields.feederContact}
					error={error('feederContact')}
					required
					size="sm"
					{disabled}
				/>
			</div>
			<p class="text-xs text-muted-foreground">
				Visible seulement par l'admin et la bénévole du chat.
			</p>
			<TextareaField
				id="{idPrefix}notes"
				name="notes"
				label="Infos supplémentaires (facultatif)"
				placeholder="Nourri tous les soirs vers 19 h…"
				bind:value={fields.notes}
				error={error('notes')}
				{disabled}
			/>
		</div>
	</SectionCard>
</div>
