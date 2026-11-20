<script module lang="ts">
	export interface MonthSeries {
		/** Ce que comptent les barres (« Adoptions ») : bulle et lecteur d'écran */
		label: string;
		/** Le nombre par mois, de janvier au mois en cours */
		byMonth: number[];
		/** La couleur des mois passés et celle du mois en cours (classes Tailwind) */
		barClass: string;
		currentClass: string;
	}
</script>

<script lang="ts">
	// Des barres mois par mois, de janvier au mois en cours : le mois en cours est plus foncé.
	// Une ou plusieurs séries : leurs barres d'un même mois sont côte à côte.
	// Au survol (et pour un lecteur d'écran) : « mars : 4 adoptions ».

	interface Props {
		series: MonthSeries[];
		/** La hauteur des barres (classe Tailwind) */
		heightClass?: string;
	}

	let { series, heightClass = 'h-10' }: Props = $props();

	const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
	const year = new Date().getFullYear();
	const monthName = (index: number) =>
		new Date(year, index, 1).toLocaleDateString('fr-FR', { month: 'long' });

	// Toutes les séries sur la même échelle, pour pouvoir les comparer
	const max = $derived(Math.max(1, ...series.flatMap((s) => s.byMonth)));
	const months = $derived(series[0]?.byMonth.length ?? 0);
	const height = (count: number) => (count === 0 ? 2 : Math.max(8, (count / max) * 100));
	const describe = (index: number) =>
		`${monthName(index)} : ` +
		series.map((s) => `${s.byMonth[index]} ${s.label.toLowerCase()}`).join(', ');
</script>

<div>
	<ul
		class="flex items-end {series.length > 1 ? 'gap-2' : 'gap-1'} {heightClass}"
		aria-label="{series.map((s) => s.label).join(' et ')} par mois en {year}"
	>
		{#each { length: months }, index (index)}
			<li
				class="flex h-full flex-1 items-end gap-px"
				title={describe(index)}
				aria-label={describe(index)}
			>
				{#each series as s (s.label)}
					<span
						class="block flex-1 rounded-t-sm {index === months - 1 ? s.currentClass : s.barClass}"
						style="height: {height(s.byMonth[index])}%"
					></span>
				{/each}
			</li>
		{/each}
	</ul>
	<div
		class="mt-1 flex text-[11px] text-muted-foreground {series.length > 1 ? 'gap-2' : 'gap-1'}"
		aria-hidden="true"
	>
		{#each MONTH_INITIALS.slice(0, months) as initial, index (index)}
			<span class="flex-1 text-center">{initial}</span>
		{/each}
	</div>
</div>
