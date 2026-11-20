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
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';

	// Créer un chat libre : attrapé, stérilisé, relâché. Le serveur crée en une fois le chat,
	// ses infos, le soin de stérilisation et le lien avec la bénévole qui l'a attrapé.
	interface Props {
		open?: boolean;
		volunteers: { id: string; name: string }[];
		/** Créé depuis un SOS : le chat y est rattaché, le SOS est clôturé */
		sosId?: string | null;
		/** Le lieu du SOS : le relâchage part de là (on peut le changer) */
		initialPlace?: {
			address: string | null;
			city: string | null;
			postalCode: string | null;
			district: string | null;
			latitude: number | null;
			longitude: number | null;
		} | null;
		veterinarians: VeterinarianOption[];
		/** L'admin choisit la bénévole ; une bénévole crée ses propres chats libres */
		isAdmin: boolean;
		/** Après la création : la page ouvre la fiche du nouveau chat */
		onCreated?: (catId: string) => void;
	}

	let {
		open = $bindable(false),
		volunteers,
		veterinarians,
		isAdmin,
		onCreated,
		sosId = null,
		initialPlace = null
	}: Props = $props();

	let fields = $state(emptyFreeCatFields());
	let volunteerId = $state('');
	let sterilizedAt = $state<Date | undefined>(undefined);
	let vetChoice = $state('');
	let vetOther = $state('');
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	// À chaque ouverture : un formulaire vide
	$effect(() => {
		if (!open) return;
		// Depuis un SOS : le lieu du relâchage part du lieu du SOS
		fields = {
			...emptyFreeCatFields(),
			...(initialPlace && {
				address: initialPlace.address ?? '',
				city: initialPlace.city ?? '',
				postalCode: initialPlace.postalCode ?? '',
				district: initialPlace.district,
				latitude: initialPlace.latitude,
				longitude: initialPlace.longitude
			})
		};
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
				toast.error('Une erreur est survenue. Réessayez.');
			}
		};
	};
	import RequiredLegend from '#lib/components/fields/RequiredLegend.svelte';
</script>

<Dialog.Root bind:open>
	<Dialog.Content size="xl" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title
				>{sosId ? 'Créer un chat libre depuis ce SOS' : 'Nouveau chat libre'}</Dialog.Title
			>
			<Dialog.Description>
				Un chat attrapé, stérilisé puis relâché sur son lieu de vie. Seuls l'identification, le N°
				Pattounes (sauf si l'asso paye) et les infos supplémentaires sont facultatifs.
			</Dialog.Description>
		</Dialog.Header>
		<RequiredLegend class="-mt-3" />

		<form method="POST" action="?/createFreeCat" use:enhance={handleEnhance} class="grid gap-4">
			{#if sosId}
				<!-- Le serveur rattache le chat au SOS, clôture le SOS, et y associe ses bénévoles -->
				<input type="hidden" name="sosId" value={sosId} />
			{/if}
			<FreeCatFields bind:fields {error} disabled={submitting} idPrefix="free-new-">
				{#snippet manager()}
					<div class="grid gap-2">
						<span class="text-xs font-medium text-gray-700">
							Gestionnaire (qui a attrapé le chat)
						</span>
						{#if isAdmin}
							<VolunteerCombobox {volunteers} bind:value={volunteerId} />
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

			<!-- Collé en bas : toujours visible, même en faisant défiler -->
			<div
				class="sticky bottom-0 z-10 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-popover/95 px-6 py-4 backdrop-blur"
			>
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
