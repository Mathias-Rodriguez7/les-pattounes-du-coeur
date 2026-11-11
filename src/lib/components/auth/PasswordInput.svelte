<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Lock, Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'type' | 'value'> & {
		value?: string;
		/** Affiche la bordure rouge d'erreur */
		invalid?: boolean;
	};

	let { value = $bindable(''), invalid = false, ...rest }: Props = $props();

	let visible = $state(false);
	let capsLockOn = $state(false);

	function checkCapsLock(event: KeyboardEvent) {
		capsLockOn = event.getModifierState('CapsLock');
	}
</script>

<InputGroup.Root class="rounded-2xl">
	<InputGroup.Addon>
		<Lock />
	</InputGroup.Addon>

	<InputGroup.Input
		{...rest}
		type={visible ? 'text' : 'password'}
		bind:value
		aria-invalid={invalid || undefined}
		onkeydown={checkCapsLock}
		onkeyup={checkCapsLock}
	/>

	<InputGroup.Addon align="inline-end">
		<InputGroup.Button
			size="icon-xs"
			onclick={() => (visible = !visible)}
			aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
			aria-pressed={visible}
		>
			{#if visible}
				<EyeOff />
			{:else}
				<Eye />
			{/if}
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>

{#if capsLockOn}
	<p class="text-xs text-amber-600">⚠️ Majuscules activées</p>
{/if}
