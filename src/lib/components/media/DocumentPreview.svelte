<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { FileText, ExternalLink } from '@lucide/svelte';
	import { formatBytes } from '$lib/media/rules';

	interface Props {
		src: string;
		name?: string | null;
		sizeBytes?: number | null;
		variant?: 'card' | 'embed';
		class?: string;
	}

	let { src, name, sizeBytes, variant = 'card', class: classList = '' }: Props = $props();

	const displayName = $derived(name || 'Document PDF');
</script>

{#snippet card()}
	<div class="flex items-center gap-3 rounded-lg border p-3">
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600"
		>
			<FileText class="size-5" />
		</div>

		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium" title={displayName}>{displayName}</p>
			<p class="text-muted-foreground text-xs">
				PDF{sizeBytes ? ` · ${formatBytes(sizeBytes)}` : ''}
			</p>
		</div>

		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- fichier média, pas une route -->
		<a
			href={src}
			target="_blank"
			rel="noopener noreferrer"
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			aria-label="Ouvrir {displayName} dans un nouvel onglet"
		>
			<ExternalLink class="size-4" />
			<span class="hidden sm:inline">Ouvrir</span>
		</a>
	</div>
{/snippet}

<div class={classList}>
	{#if variant === 'embed'}
		<!-- PC : lecteur intégré. Si le navigateur ne sait pas l'afficher, il montre la carte -->
		<object
			data={src}
			type="application/pdf"
			class="hidden h-200 w-full rounded-lg border lg:block"
			aria-label={displayName}
		>
			{@render card()}
		</object>

		<!-- Mobile : la carte, qui ouvre la visionneuse du téléphone -->
		<div class="lg:hidden">
			{@render card()}
		</div>
	{:else}
		{@render card()}
	{/if}
</div>
