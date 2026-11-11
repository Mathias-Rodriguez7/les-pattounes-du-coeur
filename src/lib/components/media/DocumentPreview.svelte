<!-- src/lib/components/media/DocumentPreview.svelte -->
<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { FileText, FileType, ExternalLink, Download } from '@lucide/svelte';
	import { formatBytes, DOCX_MIME } from '$lib/media/rules';

	interface Props {
		src: string;
		name?: string | null;
		sizeBytes?: number | null;
		/** Pour distinguer un PDF d'un Word (par défaut : PDF) */
		mimeType?: string | null;
		/**
		 * card    : carte avec bouton « Ouvrir » (défaut)
		 * embed   : lecteur intégré sur PC, carte sur mobile
		 * compact : une ligne cliquable (listes dans des cartes : soins, documents)
		 */
		variant?: 'card' | 'embed' | 'compact';
		class?: string;
	}

	let { src, name, sizeBytes, mimeType, variant = 'card', class: classList = '' }: Props = $props();

	const isWord = $derived(mimeType === DOCX_MIME);
	const formatLabel = $derived(isWord ? 'Word' : 'PDF');
	const displayName = $derived(name || `Document ${formatLabel}`);
</script>

<!-- ===== CARTE ===== -->
{#snippet card()}
	<div class="flex items-center gap-3 rounded-lg border border-border p-3">
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-md
		{isWord ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}"
		>
			{#if isWord}<FileType class="size-5 text-blue-600" />{:else}<FileText
					class="size-5 text-red-600"
				/>{/if}
		</div>

		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium" title={displayName}>{displayName}</p>
			<p class="text-xs text-muted-foreground">
				{formatLabel}{sizeBytes ? ` · ${formatBytes(sizeBytes)}` : ''}
			</p>
		</div>

		<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
		<a
			href={src}
			target={isWord ? undefined : '_blank'}
			rel="noopener noreferrer"
			download={isWord ? displayName : undefined}
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			aria-label="{isWord ? 'Télécharger' : 'Ouvrir'} {displayName}"
		>
			{#if isWord}<Download class="size-4" />{:else}<ExternalLink class="size-4" />{/if}
			<span class="hidden sm:inline">{isWord ? 'Télécharger' : 'Ouvrir'}</span>
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/snippet}

<!-- ===== LIGNE COMPACTE ===== -->
{#snippet compact()}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
	<a
		href={src}
		target={isWord ? undefined : '_blank'}
		rel="noopener noreferrer"
		download={isWord ? displayName : undefined}
		class="flex min-w-0 items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-2 py-1.5 text-xs transition-colors hover:bg-white"
		aria-label="{isWord ? 'Télécharger' : 'Ouvrir'} {displayName}"
	>
		{#if isWord}
			<FileType class="size-4 shrink-0 text-blue-600" />
		{:else}
			<FileText class="size-4 shrink-0 text-red-600" />
		{/if}
		<span class="min-w-0 flex-1 truncate font-medium">{displayName}</span>
		{#if sizeBytes}
			<span class="shrink-0 text-muted-foreground">{formatBytes(sizeBytes)}</span>
		{/if}
		{#if isWord}
			<Download class="size-3.5 shrink-0 text-muted-foreground" />
		{:else}
			<ExternalLink class="size-3.5 shrink-0 text-muted-foreground" />
		{/if}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/snippet}

<div class={classList}>
	{#if variant === 'embed' && !isWord}
		<!-- PC : lecteur intégré. Si le navigateur ne sait pas l'afficher, il montre la carte -->
		<object
			data={src}
			type="application/pdf"
			class="hidden h-200 w-full rounded-lg border border-border lg:block"
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
