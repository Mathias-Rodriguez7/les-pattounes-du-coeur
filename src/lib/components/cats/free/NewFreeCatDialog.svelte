<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle } from '@lucide/svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';
	import VolunteerCombobox from '#lib/components/volunteers/VolunteerCombobox.svelte';
	import VeterinarianSelect from '#lib/components/veterinarians/VeterinarianSelect.svelte';
	import FreeCatFields from './FreeCatFields.svelte';
	import { emptyFreeCatFields } from './freeCatForm.ts';
	import type { VeterinarianOption } from '#lib/server/veterinarians/queries.ts';
	import type { VolunteerBasic } from '#lib/types/volunteer.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';

	// Créer un chat libre : attrapé, stérilisé, relâché. Le serveur crée en une fois le chat,
	// ses infos, le soin de stérilisation et le lien avec la bénévole qui l'a attrapé.
	interface Props {
		open?: boolean;
		volunteers: VolunteerBasic[];
		veterinarians: VeterinarianOption[];
		/** L'admin choisit la bénévole ; une bénévole crée ses propres chats libres */
		isAdmin: boolean;
		/** Après la création : la page ouvre la fiche du nouveau chat */
		onCreated?: (catId: string) => void;
	}

	let { open = $bindable(false), volunteers, veterinarians, isAdmin, onCreated }: Props = $props();

	let fields = $state(emptyFreeCatFields());
	let volunteerId = $state('');
	let sterilizedAt = $state<Date | undefined>(undefined);
	let vetChoice = $state('');
	let vetOther = $state('');
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	const volunteerChoices = $derived(
		volunteers.map((v) => ({ id: v.id, name: `${v.profil.firstName} ${v.profil.lastName}` }))
	);

	// À chaque ouverture : un formulaire vide
	$effect(() => {
		if (!open) return;
		fields = emptyFreeCatFields();
		volunteerId = '';
		sterilizedAt = undefined;
		vetChoice = '';
		vetOther = '';
		errors = {};
	});

	const handleEnhance: SubmitFunction = ({ formData }) => {
		// format() : la date locale, sans décalage de fuseau horaire
		formData.set('sterilizedAt', sterilizedAt ? format(sterilizedAt, 'yyyy-MM-dd') : '');
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				await update();
				if (typeof result.data?.catId === 'string') onCreated?.(result.data.catId);
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			} else {
				toast.error('Erreur serveur');
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content size="xl" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Nouveau chat libre</Dialog.Title>
			<Dialog.Description>
				Un chat attrapé, stérilisé puis relâché sur son lieu de vie. Seuls l'identification, le N°
				Pattounes (sauf si l'asso paye) et les infos supplémentaires sont facultatifs.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createFreeCat" use:enhance={handleEnhance} class="grid gap-4">
			<FreeCatFields bind:fields {error} disabled={submitting} idPrefix="free-new-">
				{#snippet manager()}
					<div class="grid gap-2">
						<span class="text-xs font-medium text-gray-700">
							Gestionnaire (qui a attrapé le chat)
						</span>
						{#if isAdmin}
							<VolunteerCombobox volunteers={volunteerChoices} bind:value={volunteerId} />
							{#if error('volunteerId')}
								<p class="text-xs text-destructive">{error('volunteerId')}</p>
							{/if}
						{:else}
							<p class="text-sm">Vous</p>
						{/if}
					</div>
				{/snippet}
				{#snippet sterilization()}
					<div class="grid gap-4 sm:grid-cols-2">
						<DatePicker
							name="sterilizedAt"
							label="Date de la stérilisation"
							value={sterilizedAt}
							onSelect={(d) => (sterilizedAt = d)}
							error={error('sterilizedAt')}
						/>
						<VeterinarianSelect
							id="free-new-veterinarian"
							{veterinarians}
							bind:choice={vetChoice}
							bind:other={vetOther}
							required
							choiceError={error('veterinarianId')}
							error={error('veterinary')}
							disabled={submitting}
						/>
					</div>
				{/snippet}
			</FreeCatFields>

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
					Créer le chat libre
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
