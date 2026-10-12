<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		profileId?: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		isBlacklisting?: boolean;
		isSaving?: boolean;
		isDeleting?: boolean;
		showBlacklist?: boolean;
		onSuccess?: () => void;
		actionName?: string;
		buttonLabel?: string;
	}

	let {
		profileId,
		firstName = '',
		lastName = '',
		email = '',
		isBlacklisting = false,
		isSaving = false,
		isDeleting = false,
		showBlacklist = true,
		onSuccess,
		actionName = '?/blacklistVolunteer',
		buttonLabel = 'Ajouter à la liste noire'
	}: Props = $props();

	let showBlacklistDialog = $state(false);
	let blacklistReason = $state('');

	const handleBlacklistClick = () => {
		showBlacklistDialog = true;
		blacklistReason = '';
	};

	// ✅ ENHANCE POUR BLACKLIST
	const handleBlacklistEnhance: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Profil Blacklister ! 🚫');
				showBlacklistDialog = false;
				blacklistReason = '';
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				toast.error(result.data?.error || 'Erreur lors de la mise en liste noire');
				console.error('Erreur blacklist:', result.data);
			}

			await update();
		};
	};

	const handleCancelBlacklist = () => {
		showBlacklistDialog = false;
		blacklistReason = '';
	};

	const isDisabled = isSaving || isDeleting || isBlacklisting;
</script>

<div>
	{#if showBlacklist}
		<!-- ✅ BOUTON POUR OUVRIR LE DIALOG -->
		<Button
			type="button"
			variant="destructive"
			disabled={isDisabled}
			onclick={handleBlacklistClick}
			class="w-full"
		>
			<Icon name="blacklist" class="mr-2 h-4 w-4" />
			{#if isBlacklisting}
				Blacklistage...
			{:else}
				{buttonLabel}
			{/if}
		</Button>
	{/if}
</div>

<!-- ✅ DIALOG BLACKLIST -->
<Dialog open={showBlacklistDialog} onOpenChange={(open) => (showBlacklistDialog = open)}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle class="text-destructive">🚫 Blacklister</DialogTitle>
			<DialogDescription class="pt-2">
				Vous êtes sur le point de blacklister <strong>{firstName} {lastName}</strong>.
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<label for="reason-input" class="text-sm font-medium text-gray-700">Raison</label>
				<textarea
					id="reason-input"
					bind:value={blacklistReason}
					placeholder="Entrez la raison de la mise en liste noire..."
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					rows="4"
					disabled={isBlacklisting}
				></textarea>
			</div>
		</div>

		<!-- ✅ FORM BLACKLIST -->
		<form method="POST" action={actionName} use:enhance={handleBlacklistEnhance}>
			<input type="hidden" name="profileId" value={profileId} />
			<input type="hidden" name="email" value={email} />
			<input type="hidden" name="description" value={blacklistReason} />

			<DialogFooter class="flex gap-2">
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					onclick={handleCancelBlacklist}
					disabled={isBlacklisting}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					variant="destructive"
					class="flex-1"
					disabled={isBlacklisting || !blacklistReason.trim()}
				>
					{#if isBlacklisting}
						Blacklistage...
					{:else}
						Confirmer le blacklistage
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
