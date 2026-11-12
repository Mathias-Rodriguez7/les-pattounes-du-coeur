<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// Les textes libres d'une FA (seuls ceux qui sont remplis s'affichent)
	interface Props {
		host: HostFull;
	}

	let { host }: Props = $props();
</script>

<section class="grid grid-cols-1 gap-6">
	{#if host.homeDescription}
		<SectionCard
			icon={HOST_SECTION_CONFIG.homeDescription.icon}
			title={HOST_SECTION_CONFIG.homeDescription.label}
			color={HOST_SECTION_CONFIG.homeDescription.color}
		>
			<p class="text-sm whitespace-pre-line text-gray-700">{host.homeDescription}</p>
		</SectionCard>
	{/if}

	{#if host.presence}
		<SectionCard
			icon={HOST_SECTION_CONFIG.presence.icon}
			title={HOST_SECTION_CONFIG.presence.label}
			color={HOST_SECTION_CONFIG.presence.color}
		>
			<p class="text-sm whitespace-pre-line text-gray-700">{host.presence}</p>
		</SectionCard>
	{/if}

	{#if host.outside && host.outsideDescription}
		<SectionCard
			icon={HOST_SECTION_CONFIG.outsideDescription.icon}
			title={HOST_SECTION_CONFIG.outsideDescription.label}
			color={HOST_SECTION_CONFIG.outsideDescription.color}
		>
			<p class="text-sm whitespace-pre-line text-gray-700">{host.outsideDescription}</p>
		</SectionCard>
	{/if}

	{#if host.stopActivity && host.actif === 'STOP'}
		<SectionCard
			icon={HOST_SECTION_CONFIG.stopActivity.icon}
			title={HOST_SECTION_CONFIG.stopActivity.label}
			color={HOST_SECTION_CONFIG.stopActivity.color}
		>
			<p class="text-sm whitespace-pre-line text-gray-700">{host.stopActivity}</p>
		</SectionCard>
	{/if}

	{#if host.additionalInformation}
		<SectionCard
			icon={HOST_SECTION_CONFIG.additionalInformation.icon}
			title={HOST_SECTION_CONFIG.additionalInformation.label}
			color={HOST_SECTION_CONFIG.additionalInformation.color}
		>
			<p class="text-sm whitespace-pre-line text-gray-700">
				{host.additionalInformation}
			</p>
		</SectionCard>
	{/if}
</section>
