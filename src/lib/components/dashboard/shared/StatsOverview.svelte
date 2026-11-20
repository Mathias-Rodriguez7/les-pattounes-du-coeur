<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import MonthBars from '#lib/components/charts/MonthBars.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const stats = $derived(data.stats);

	const now = new Date();
	const year = now.getFullYear();
	// Une ligne « ce mois-ci / cette année » avec ses barres mois par mois
	const series = $derived([
		{
			id: 'adoptions',
			label: 'Adoptions',
			icon: 'heart',
			iconTheme: 'adoptions',
			data: stats.adoptions,
			bar: 'bg-pink-200',
			current: 'bg-pink-500'
		},
		{
			id: 'cats-in',
			label: "Chats entrés à l'asso",
			icon: 'cat',
			iconTheme: 'cats',
			data: stats.catsIn,
			bar: 'bg-blue-200',
			current: 'bg-blue-500'
		}
	]);

	// Les FA : celles qui ont un chat, sur toutes celles qui pourraient en avoir un
	const hostsTotal = $derived(stats.hostsWithCat + stats.availableHosts);
	const hostsPercent = $derived(
		hostsTotal === 0 ? 0 : Math.round((stats.hostsWithCat / hostsTotal) * 100)
	);
</script>

<section class="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
	{#each series as item (item.id)}
		<div class="flex flex-col gap-3 px-5 py-4">
			<div class="flex items-center gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
					style="background: {getGradientStyle(item.iconTheme)}"
				>
					<Icon name={item.icon} iconClass="h-4 w-4 text-white" />
				</div>
				<h3 class="min-w-0 flex-1 text-sm font-medium text-muted-foreground">{item.label}</h3>
			</div>

			<div class="flex items-end justify-between">
				<p class="flex items-baseline gap-1.5">
					<span class="text-3xl leading-none font-bold tabular-nums">{item.data.month}</span>
					<span class="text-xs text-muted-foreground">ce mois-ci</span>
				</p>
				<p class="flex flex-col items-end">
					<span class="text-lg leading-none font-semibold tabular-nums">{item.data.year}</span>
					<span class="mt-1 text-xs text-muted-foreground">en {year}</span>
				</p>
			</div>

			<MonthBars
				series={[
					{
						label: item.label,
						byMonth: item.data.byMonth,
						barClass: item.bar,
						currentClass: item.current
					}
				]}
			/>
		</div>
		<Separator />
	{/each}

	<!-- Les chats en FA, et la place qu'il reste -->
	<div class="flex flex-col gap-3 px-5 py-4">
		<div class="flex items-center gap-3">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
				style="background: {getGradientStyle('fa')}"
			>
				<Icon name="house" iconClass="h-4 w-4 text-white" />
			</div>
			<h3 class="min-w-0 flex-1 text-sm font-medium text-muted-foreground">Chats en FA</h3>
		</div>
		<p class="flex items-baseline gap-1.5">
			<span class="text-3xl leading-none font-bold tabular-nums">{stats.catsInHost}</span>
			<span class="text-xs text-muted-foreground">en ce moment, dans {stats.hostsWithCat} FA</span>
		</p>
		<div
			class="h-2 overflow-hidden rounded-full bg-muted"
			role="img"
			aria-label="{stats.hostsWithCat} FA occupées sur {hostsTotal}"
		>
			<div class="h-full rounded-full bg-teal-600" style="width: {hostsPercent}%"></div>
		</div>
		<p class="text-xs text-muted-foreground">
			<span class="font-semibold text-foreground">{stats.availableHosts}</span>
			{stats.availableHosts > 1 ? 'FA disponibles' : 'FA disponible'} sans chat
		</p>
	</div>
</section>
