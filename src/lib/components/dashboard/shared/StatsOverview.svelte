<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from '../../routes/dashboard/$types';
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

<section
	class="border-border bg-card lg:grid-cols grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border pt-2"
>
	{#each overviewItems as item (item.id)}
		<div class="px-6 py-2">
			<div class="flex items-center justify-between">
				<div class="flex flex-col gap-2">
					<p class="text-sm font-medium text-gray-600">{item.label}</p>
					<Icon
						name={item.icon}
						withWrapper={true}
						wrapperClass="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg"
						iconClass="h-5 w-5 text-white"
						style="background: linear-gradient(135deg, var(--icon-{item.iconTheme}-from), var(--icon-{item.iconTheme}-to))"
					/>
				</div>
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
					style="background: linear-gradient(135deg, var(--icon-{item.iconTheme}-from), var(--icon-{item.iconTheme}-to))"
				>
					{item.value}
				</span>
			</div>
		</div>
		<Separator />
	{/each}
</section>
