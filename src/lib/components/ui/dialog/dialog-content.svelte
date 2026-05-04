<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import DialogPortal from './dialog-portal.svelte';
	import * as Dialog from './index.js';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
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
		size?: 'sm' | 'md' | 'lg' | 'xl';
	} = $props();

	const sizes = {
		sm: 'max-w-[95vw] sm:max-w-sm',
		md: 'max-w-[95vw] sm:max-w-md lg:max-w-lg',
		lg: 'max-w-[95vw] sm:max-w-lg lg:max-w-xl',
		xl: 'max-w-[95vw] sm:max-w-xl lg:max-w-6xl'
	} as const;
</script>

<DialogPortal {...portalProps}>
	<Dialog.Overlay />

	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			// Base layout (shadcn + UX safe)
			'bg-popover text-popover-foreground ring-foreground/10 fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-2xl p-6 text-sm ring-1 duration-100 outline-none',

			// Animation states (bits-ui)
			'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',

			// UX important: scroll safe
			'max-h-[90vh] overflow-y-auto',

			// Responsive size system
			sizes[size],

			className
		)}
		{...restProps}
	>
		{@render children?.()}

		{#if showCloseButton}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button variant="ghost" class="absolute top-4 right-4" size="icon-sm" {...props}>
						<XIcon />
						<span class="sr-only">Close</span>
					</Button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
