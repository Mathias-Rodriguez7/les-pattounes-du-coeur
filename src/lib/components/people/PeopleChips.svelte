<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { UserPlus, X } from '@lucide/svelte';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import VolunteerCombobox from '#lib/components/volunteers/VolunteerCombobox.svelte';

	// Plusieurs personnes sur un dossier : des pastilles (avec ✕ pour retirer) et « Ajouter ».
	// Sert aux renforts d'un SOS et aux admins d'une candidature bénévole / colab.
	// Les actions (`addAction`, `removeAction`) reçoivent `idName` = `id` et `volunteerId`.
	interface Props {
		/** Les personnes déjà là (la première peut être marquée, ex : « responsable ») */
		people: { id: string; name: string; tag?: string; locked?: boolean }[];
		/** Celles qu'on peut ajouter */
		choices: { id: string; name: string }[];
		/** Le nom et la valeur du champ qui désigne le dossier (ex : sosId) */
		idName: string;
		id: string;
		addAction: string;
		removeAction: string;
		addLabel: string;
		canAdd: boolean;
		/** Retirer cette personne ? (ex : l'admin, ou soi-même) */
		canRemove: (personId: string) => boolean;
		empty?: string;
	}

	let {
		people,
		choices,
		idName,
		id,
		addAction,
		removeAction,
		addLabel,
		canAdd,
		canRemove,
		empty = 'Personne'
	}: Props = $props();

	let open = $state(false);
	let chosen = $state('');
	const available = $derived(choices.filter((c) => !people.some((p) => p.id === c.id)));

	const initials = (name: string) =>
		name
			.split(' ')
			.map((part) => part.charAt(0))
			.join('')
			.slice(0, 2)
			.toUpperCase();

	const withToast: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				chosen = '';
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
			await update({ reset: false });
		};
	};
</script>

<div class="flex flex-wrap items-center gap-1.5">
	{#each people as person (person.id)}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 py-0.5 pr-1 pl-0.5 text-sm"
		>
			<span
				class="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary"
			>
				{initials(person.name)}
			</span>
			{person.name}
			{#if person.tag}<span class="text-xs text-muted-foreground">{person.tag}</span>{/if}
			{#if !person.locked && canRemove(person.id)}
				<form method="POST" action={removeAction} use:enhance={withToast}>
					<input type="hidden" name={idName} value={id} />
					<input type="hidden" name="volunteerId" value={person.id} />
					<button
						type="submit"
						aria-label="Retirer {person.name}"
						class="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
					>
						<X class="size-3.5" />
					</button>
				</form>
			{:else}
				<span class="w-1"></span>
			{/if}
		</span>
	{:else}
		<span class="text-sm text-muted-foreground">{empty}</span>
	{/each}

	{#if canAdd && available.length > 0}
		<Popover.Root bind:open>
			<Popover.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
					>
						<UserPlus class="size-3.5" />
						{addLabel}
					</button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-72 p-3" align="start">
				<form method="POST" action={addAction} use:enhance={withToast} class="grid gap-2">
					<input type="hidden" name={idName} value={id} />
					<VolunteerCombobox volunteers={available} bind:value={chosen} />
					<Button type="submit" size="sm" disabled={!chosen}>Ajouter</Button>
				</form>
			</Popover.Content>
		</Popover.Root>
	{/if}
</div>
