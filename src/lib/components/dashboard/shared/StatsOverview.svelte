<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from '../../routes/dashboard/$types';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const stats = $derived(data.stats);

	const overviewItems = $derived([
		{
			id: 'adoptions',
			label: 'Adoptions cette année',
			value: stats.totalYearAdoptions,
			icon: 'heart',
			iconTheme: 'adoptions'
		},
		{
			id: 'cats',
			label: 'Chats',
			value: stats.totalCatsInManagement,
			icon: 'cat',
			iconTheme: 'cats'
		},
		{
			id: 'FA',
			label: 'FA actives',
			value: stats.totalActiveHosts,
			icon: 'house',
			iconTheme: 'fa'
		},
		{
			id: 'volunteers',
			label: 'Bénévoles actifs',
			value: stats.totalActiveVolunteers,
			icon: 'users',
			iconTheme: 'volunteers'
		},
		{
			id: 'pending-apps',
			label: 'Candidatures',
			value: stats.pendingApplications,
			icon: 'mail',
			iconTheme: 'pending'
		}
	]);
</script>

<section class="border-border bg-card flex flex-col gap-0 overflow-hidden rounded-2xl border">
	{#each overviewItems as item, index (item.id)}
		<div class="flex flex-1 flex-col px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex flex-col gap-1">
					<p class="text-sm font-medium text-gray-600">{item.label}</p>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
						style="background: {getGradientStyle(item.iconTheme)}"
					>
						<Icon name={item.icon} iconClass="h-5 w-5 text-white" />
					</div>
				</div>
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
					style="background: {getGradientStyle(item.iconTheme)}"
				>
					{item.value}
				</span>
			</div>
		</div>
		{#if index < overviewItems.length - 1}
			<Separator />
		{/if}
	{/each}
</section>
