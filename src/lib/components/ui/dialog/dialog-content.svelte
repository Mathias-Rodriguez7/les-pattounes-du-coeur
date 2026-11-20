<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import DialogPortal from './dialog-portal.svelte';
	import * as Dialog from './index.js';
	import { cn, type WithoutChildrenOrChild } from '#lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		size = 'md',
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		showCloseButton?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
	} = $props();

	const sizes = {
		sm: 'max-w-[95vw] sm:max-w-sm',
		md: 'max-w-[95vw] sm:max-w-md lg:max-w-lg',
		lg: 'max-w-[95vw] sm:max-w-lg lg:max-w-2xl',
		xl: 'max-w-[95vw] sm:max-w-xl lg:max-w-6xl',
		xxl: 'max-w-[95vw] sm:max-w-xl lg:max-w-[96rem]'
	} as const;
</script>

<DialogPortal {...portalProps}>
	<Dialog.Overlay />

	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			// Base layout (shadcn + UX safe)
			'fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-2xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none',

			// Animation states (bits-ui)
			'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',

			// UX important: scroll safe
			'max-h-[90vh] overflow-y-auto',

			// Responsive size system
			sizes[size],

			// Téléphone (< 640 px) : la fenêtre devient un panneau qui monte du bas, pleine largeur.
			// Les champs restent au-dessus du clavier, les boutons (sticky) à portée de pouce.
			// max-sm: passe après les classes de la page (ex : max-h-[90dvh]), donc il les remplace
			'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[92dvh] max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none max-sm:pt-8',
			'max-sm:data-open:zoom-in-100 max-sm:data-open:slide-in-from-bottom-1/2 max-sm:data-closed:zoom-out-100 max-sm:data-closed:slide-out-to-bottom-1/2',

			className
		)}
		{...restProps}
	>
		<!-- Téléphone : la petite poignée du panneau (décorative) -->
		<span
			aria-hidden="true"
			class="pointer-events-none absolute top-2.5 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/30 sm:hidden"
		></span>

		{@render children?.()}

		{#if showCloseButton}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button variant="ghost" class="absolute top-4 right-4" size="icon-sm" {...props}>
						<XIcon />
						<span class="sr-only">Fermer</span>
					</Button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
