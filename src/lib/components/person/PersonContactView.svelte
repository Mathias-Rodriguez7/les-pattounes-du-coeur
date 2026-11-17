<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';

	// Section « Contact » en LECTURE : liens cliquables (appel, mail)
	interface Props {
		phone?: string | null;
		email?: string | null;
		/** Largeur de la carte dans la grille du panneau (ex : « @2xl:col-span-3 ») */
		class?: string;
	}

	let { phone, email, class: className = '' }: Props = $props();
</script>

<SectionCard
	icon={PERSON_SECTION_CONFIG.contact.icon}
	title={PERSON_SECTION_CONFIG.contact.label}
	color={PERSON_SECTION_CONFIG.contact.color}
	class={className}
>
	<div class="ml-6 grid min-w-0 gap-4">
		<div>
			<p class="font-medium text-muted-foreground">Tel</p>
			<div class="flex items-center gap-2">
				<Icon name="phone" iconClass="h-4 w-4 text-muted-foreground" />
				{#if phone}
					<a href="tel:{phone}" class="text-xs text-blue-500 underline hover:text-primary">
						{phone}
					</a>
				{:else}
					<p>—</p>
				{/if}
			</div>
		</div>

		<div>
			<p class="font-medium text-muted-foreground">Mail</p>
			<!-- min-w-0 + break-all : un mail trop long passe à la ligne au lieu de sortir de la carte -->
			<div class="flex min-w-0 items-center gap-2">
				<Icon name="mail" iconClass="h-4 w-4 shrink-0 text-muted-foreground" />
				{#if email}
					<a
						href="mailto:{email}"
						class="min-w-0 text-xs break-all text-blue-500 underline hover:text-primary"
					>
						{email}
					</a>
				{:else}
					<p>—</p>
				{/if}
			</div>
		</div>
	</div>
</SectionCard>
