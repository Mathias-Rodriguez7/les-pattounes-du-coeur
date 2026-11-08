<!-- src/lib/components/media/DocumentPreview.svelte -->
<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { FileText, ExternalLink } from '@lucide/svelte';
	import { formatBytes } from '$lib/media/rules';

	interface Props {
		src: string;
		name?: string | null;
		sizeBytes?: number | null;
		/**
		 * card    : carte avec bouton « Ouvrir » (défaut)
		 * embed   : lecteur intégré sur PC, carte sur mobile
		 * compact : une ligne cliquable (listes dans des cartes : soins, documents)
		 */
		variant?: 'card' | 'embed' | 'compact';
		class?: string;
	}

	let { src, name, sizeBytes, variant = 'card', class: classList = '' }: Props = $props();

	const displayName = $derived(name || 'Document PDF');
</script>

<!-- ===== CARTE ===== -->
{#snippet card()}
	<div class="border-border flex items-center gap-3 rounded-lg border p-3">
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

		<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
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
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/snippet}

<!-- ===== LIGNE COMPACTE ===== -->
{#snippet compact()}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
	<a
		href={src}
		target="_blank"
		rel="noopener noreferrer"
		class="flex min-w-0 items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-2 py-1.5 text-xs transition-colors hover:bg-white"
		aria-label="Ouvrir {displayName} dans un nouvel onglet"
	>
		<FileText class="size-4 shrink-0 text-red-600" />
		<span class="min-w-0 flex-1 truncate font-medium">{displayName}</span>
		{#if sizeBytes}
			<span class="text-muted-foreground shrink-0">{formatBytes(sizeBytes)}</span>
		{/if}
		<ExternalLink class="text-muted-foreground size-3.5 shrink-0" />
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/snippet}

<div class={classList}>
	{#if variant === 'embed'}
		<!-- PC : lecteur intégré. Si le navigateur ne sait pas l'afficher, il montre la carte -->
		<object
			data={src}
			type="application/pdf"
			class="border-border hidden h-200 w-full rounded-lg border lg:block"
			aria-label={displayName}
		>
			{@render card()}
		</object>

		<!-- Mobile : la carte, qui ouvre la visionneuse du téléphone -->
		<div class="lg:hidden">
			{@render card()}
		</div>
	{:else if variant === 'compact'}
		{@render compact()}
	{:else}
		{@render card()}
	{/if}
</div>
