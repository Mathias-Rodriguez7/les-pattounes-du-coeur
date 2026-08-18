<script lang="ts">
	import {
		BarChart,
		Bar,
		XAxis,
		YAxis,
		CartesianGrid,
		Tooltip,
		Legend,
		ResponsiveContainer,
		RadarChart,
		PolarGrid,
		PolarAngleAxis,
		PolarRadiusAxis,
		Radar
	} from 'svelte-charts';

	// ============================================
	// TYPES
	// ============================================
	interface Cat {
		id: string;
		name: string;
		status: 'AVAILABLE' | 'SOCIALIZE' | 'ADOPTED' | 'FREE';
		managedBy: string;
		managedSince: string;
		adoptedAt?: string;
	}

	interface Volunteer {
		id: string;
		name: string;
	}

	// ============================================
	// PROPS (à adapter selon tes données réelles)
	// ============================================
	export let volunteers: Volunteer[] = [
		{ id: '1', name: 'Marie Dupont' },
		{ id: '2', name: 'Jean Petit' },
		{ id: '3', name: 'Sophie Martin' },
		{ id: '4', name: 'Lucas Bernard' },
		{ id: '5', name: 'Emma Moreau' },
		{ id: '6', name: 'Hugo Leroy' }
	];

	export let cats: Cat[] = [
		// Marie - 8 chats gérés, 3 adoptés
		{ id: '1', name: 'Mimi', status: 'AVAILABLE', managedBy: '1', managedSince: '2026-01-15' },
		{ id: '2', name: 'Garfield', status: 'SOCIALIZE', managedBy: '1', managedSince: '2026-02-20' },
		{
			id: '3',
			name: 'Minou',
			status: 'ADOPTED',
			managedBy: '1',
			managedSince: '2026-03-10',
			adoptedAt: '2026-06-15'
		},
		{
			id: '4',
			name: 'S Whiskers',
			status: 'AVAILABLE',
			managedBy: '1',
			managedSince: '2026-04-05'
		},
		{ id: '5', name: 'Tom', status: 'FREE', managedBy: '1', managedSince: '2026-01-20' },
		{
			id: '6',
			name: 'Félix',
			status: 'ADOPTED',
			managedBy: '1',
			managedSince: '2026-02-14',
			adoptedAt: '2026-05-20'
		},
		{ id: '7', name: 'Luna', status: 'SOCIALIZE', managedBy: '1', managedSince: '2026-05-01' },
		{
			id: '8',
			name: 'Noir',
			status: 'ADOPTED',
			managedBy: '1',
			managedSince: '2026-03-25',
			adoptedAt: '2026-06-01'
		},

		// Jean - 6 chats gérés, 2 adoptés
		{ id: '9', name: 'Oliver', status: 'AVAILABLE', managedBy: '2', managedSince: '2026-01-08' },
		{ id: '10', name: 'Simba', status: 'SOCIALIZE', managedBy: '2', managedSince: '2026-02-28' },
		{
			id: '11',
			name: 'Nala',
			status: 'ADOPTED',
			managedBy: '2',
			managedSince: '2026-03-15',
			adoptedAt: '2026-05-10'
		},
		{ id: '12', name: 'Leo', status: 'FREE', managedBy: '2', managedSince: '2026-04-12' },
		{ id: '13', name: 'Milo', status: 'AVAILABLE', managedBy: '2', managedSince: '2026-05-20' },
		{
			id: '14',
			name: 'Bella',
			status: 'ADOPTED',
			managedBy: '2',
			managedSince: '2026-02-01',
			adoptedAt: '2026-04-25'
		},

		// Sophie - 10 chats gérés, 5 adoptés
		{ id: '15', name: 'Chester', status: 'AVAILABLE', managedBy: '3', managedSince: '2026-01-25' },
		{ id: '16', name: 'Smokey', status: 'SOCIALIZE', managedBy: '3', managedSince: '2026-02-10' },
		{
			id: '17',
			name: 'Ash',
			status: 'ADOPTED',
			managedBy: '3',
			managedSince: '2026-03-05',
			adoptedAt: '2026-05-30'
		},
		{ id: '18', name: 'Dusty', status: 'FREE', managedBy: '3', managedSince: '2026-04-18' },
		{ id: '19', name: 'Pepper', status: 'AVAILABLE', managedBy: '3', managedSince: '2026-05-08' },
		{
			id: '20',
			name: 'Ginger',
			status: 'ADOPTED',
			managedBy: '3',
			managedSince: '2026-01-12',
			adoptedAt: '2026-03-20'
		},
		{ id: '21', name: 'Cinnamon', status: 'SOCIALIZE', managedBy: '3', managedSince: '2026-06-02' },
		{
			id: '22',
			name: ' Nutmeg',
			status: 'ADOPTED',
			managedBy: '3',
			managedSince: '2026-02-22',
			adoptedAt: '2026-05-05'
		},
		{ id: '23', name: 'Paprika', status: 'AVAILABLE', managedBy: '3', managedSince: '2026-05-25' },
		{
			id: '24',
			name: 'Sage',
			status: 'ADOPTED',
			managedBy: '3',
			managedSince: '2026-04-08',
			adoptedAt: '2026-06-10'
		},

		// Lucas - 7 chats gérés, 2 adoptés
		{ id: '25', name: 'Shadow', status: 'AVAILABLE', managedBy: '4', managedSince: '2026-01-30' },
		{ id: '26', name: 'Inky', status: 'SOCIALIZE', managedBy: '4', managedSince: '2026-03-12' },
		{ id: '27', name: 'Blaze', status: 'FREE', managedBy: '4', managedSince: '2026-04-22' },
		{
			id: '28',
			name: 'Storm',
			status: 'ADOPTED',
			managedBy: '4',
			managedSince: '2026-02-18',
			adoptedAt: '2026-04-15'
		},
		{ id: '29', name: 'Misty', status: 'AVAILABLE', managedBy: '4', managedSince: '2026-05-15' },
		{ id: '30', name: 'Zara', status: 'SOCIALIZE', managedBy: '4', managedSince: '2026-06-05' },
		{
			id: '31',
			name: 'Juno',
			status: 'ADOPTED',
			managedBy: '4',
			managedSince: '2026-03-28',
			adoptedAt: '2026-05-22'
		},

		// Emma - 9 chats gérés, 4 adoptés
		{ id: '32', name: 'Oscar', status: 'AVAILABLE', managedBy: '5', managedSince: '2026-01-05' },
		{ id: '33', name: 'Jasper', status: 'SOCIALIZE', managedBy: '5', managedSince: '2026-02-25' },
		{
			id: '34',
			name: 'Dexter',
			status: 'ADOPTED',
			managedBy: '5',
			managedSince: '2026-03-18',
			adoptedAt: '2026-05-28'
		},
		{ id: '35', name: 'Theo', status: 'FREE', managedBy: '5', managedSince: '2026-04-30' },
		{ id: '36', name: 'Felix', status: 'AVAILABLE', managedBy: '5', managedSince: '2026-05-12' },
		{ id: '37', name: 'Simon', status: 'SOCIALIZE', managedBy: '5', managedSince: '2026-06-08' },
		{
			id: '38',
			name: 'Bruno',
			status: 'ADOPTED',
			managedBy: '5',
			managedSince: '2026-02-08',
			adoptedAt: '2026-04-10'
		},
		{
			id: '39',
			name: 'Max',
			status: 'ADOPTED',
			managedBy: '5',
			managedSince: '2026-03-22',
			adoptedAt: '2026-05-15'
		},
		{
			id: '40',
			name: 'Charlie',
			status: 'ADOPTED',
			managedBy: '5',
			managedSince: '2026-01-28',
			adoptedAt: '2026-03-30'
		},

		// Hugo - 5 chats gérés, 1 adopté
		{ id: '41', name: 'Salem', status: 'AVAILABLE', managedBy: '6', managedSince: '2026-02-05' },
		{ id: '42', name: 'Cleo', status: 'SOCIALIZE', managedBy: '6', managedSince: '2026-03-30' },
		{ id: '43', name: 'Tigger', status: 'FREE', managedBy: '6', managedSince: '2026-05-18' },
		{
			id: '44',
			name: 'Mittens',
			status: 'ADOPTED',
			managedBy: '6',
			managedSince: '2026-01-15',
			adoptedAt: '2026-03-10'
		},
		{ id: '45', name: 'Patches', status: 'AVAILABLE', managedBy: '6', managedSince: '2026-06-12' }
	];

	const currentYear = new Date().getFullYear();

	// ============================================
	// CONSTANTES
	// ============================================
	const STATUS_LABELS: Record<Cat['status'], string> = {
		AVAILABLE: 'Disponibles',
		SOCIALIZE: 'En socialisation',
		ADOPTED: 'Adoptés',
		FREE: 'Libérés'
	};

	const STATUS_COLORS: Record<Cat['status'], string> = {
		AVAILABLE: '#10b981', // emerald
		SOCIALIZE: '#f59e0b', // amber
		ADOPTED: '#8b5cf6', // violet
		FREE: '#06b6d4' // cyan
	};

	// ============================================
	// DONNÉES GRAPHIQUE 1 : Chats gérés par bénévole (année en cours)
	// ============================================
	$: catsManagedData = volunteers.map((v) => {
		const count = cats.filter(
			(c) => c.managedBy === v.id && new Date(c.managedSince).getFullYear() === currentYear
		).length;
		return { name: v.name, chats: count };
	});

	// ============================================
	// DONNÉES GRAPHIQUE 2 : Chats adoptés par bénévole (année en cours)
	// ============================================
	$: catsAdoptedData = volunteers.map((v) => {
		const count = cats.filter(
			(c) =>
				c.managedBy === v.id &&
				c.status === 'ADOPTED' &&
				c.adoptedAt &&
				new Date(c.adoptedAt).getFullYear() === currentYear
		).length;
		return { name: v.name, adoptions: count };
	});

	// ============================================
	// DONNÉES GRAPHIQUE 3 : Radar Chart - Stats par bénévole
	// ============================================
	$: radarData = volunteers.map((v) => {
		const volunteerCats = cats.filter((c) => c.managedBy === v.id);
		const counts = {
			name: v.name,
			AVAILABLE: volunteerCats.filter((c) => c.status === 'AVAILABLE').length,
			SOCIALIZE: volunteerCats.filter((c) => c.status === 'SOCIALIZE').length,
			ADOPTED: volunteerCats.filter((c) => c.status === 'ADOPTED').length,
			FREE: volunteerCats.filter((c) => c.status === 'FREE').length
		};
		return counts;
	});

	// ============================================
	// TOTAUX pour les cards summary
	// ============================================
	$: totalCats = cats.length;
	$: totalAdoptions = cats.filter((c) => c.status === 'ADOPTED').length;
	$: availableCats = cats.filter((c) => c.status === 'AVAILABLE').length;
	$: socializingCats = cats.filter((c) => c.status === 'SOCIALIZE').length;
</script>

<!-- ============================================
     SECTION GRAPHIQUES - Dashboard Bénévoles
     ============================================ -->
<section class="w-full px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8">
		<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
			📊 Statistiques {currentYear}
		</h2>
		<p class="mt-1 text-slate-500 dark:text-slate-400">
			Vue d'ensemble de l'activité des bénévoles
		</p>
	</div>

	<!-- Summary Cards -->
	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
		<div
			class="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-lg"
		>
			<p class="text-sm opacity-90">Total chats gérés</p>
			<p class="text-3xl font-bold">{totalCats}</p>
		</div>
		<div
			class="rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-4 text-white shadow-lg"
		>
			<p class="text-sm opacity-90">Adoptions</p>
			<p class="text-3xl font-bold">{totalAdoptions}</p>
		</div>
		<div class="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white shadow-lg">
			<p class="text-sm opacity-90">En socialisation</p>
			<p class="text-3xl font-bold">{socializingCats}</p>
		</div>
		<div class="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white shadow-lg">
			<p class="text-sm opacity-90">Disponibles</p>
			<p class="text-3xl font-bold">{availableCats}</p>
		</div>
	</div>

	<!-- Charts Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- ============================================
         GRAPHIQUE 1 : Chats gérés par bénévole
         ============================================ -->
		<div
			class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
					🐱 Chats gérés en {currentYear}
				</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Nombre de chats que chaque bénévole a géré cette année
				</p>
			</div>

			<div class="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={catsManagedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
						<YAxis tick={{ fontSize: 12 }} stroke="#64748b" allowDecimals={false} />
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(255,255,255,0.95)',
								borderRadius: '8px',
								border: '1px solid #e2e8f0',
								boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
							}}
						/>
						<Bar dataKey="chats" fill="#10b981" radius={[6, 6, 0, 0]} name="Chats gérés" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>

		<!-- ============================================
         GRAPHIQUE 2 : Chats adoptés par bénévole
         ============================================ -->
		<div
			class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
					🏠 Adoptions en {currentYear}
				</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Nombre de chats adoptés via chaque bénévole cette année
				</p>
			</div>

			<div class="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={catsAdoptedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
						<YAxis tick={{ fontSize: 12 }} stroke="#64748b" allowDecimals={false} />
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(255,255,255,0.95)',
								borderRadius: '8px',
								border: '1px solid #e2e8f0',
								boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
							}}
						/>
						<Bar dataKey="adoptions" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Adoptions" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>

		<!-- ============================================
         GRAPHIQUE 3 : Radar Chart - Répartition par statut
         ============================================ -->
		<div
			class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
					🎯 Répartition par statut
				</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Détail des statuts des chats gérés par chaque bénévole
				</p>
			</div>

			<!-- Legend personnalisée -->
			<div class="mb-4 flex flex-wrap justify-center gap-4">
				{#each Object.entries(STATUS_LABELS) as [key, label]}
					<div class="flex items-center gap-2">
						<span class="h-3 w-3 rounded-full" style="background-color: {STATUS_COLORS[key]}"
						></span>
						<span class="text-sm text-slate-600 dark:text-slate-300">{label}</span>
					</div>
				{/each}
			</div>

			<div class="h-[400px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
						<PolarGrid stroke="#e2e8f0" />
						<PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
						<PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} stroke="#64748b" />

						<!-- Barres pour chaque statut avec labels customs -->
						<Radar
							name={STATUS_LABELS.AVAILABLE}
							dataKey="AVAILABLE"
							stroke={STATUS_COLORS.AVAILABLE}
							fill={STATUS_COLORS.AVAILABLE}
							fillOpacity={0.5}
						/>
						<Radar
							name={STATUS_LABELS.SOCIALIZE}
							dataKey="SOCIALIZE"
							stroke={STATUS_COLORS.SOCIALIZE}
							fill={STATUS_COLORS.SOCIALIZE}
							fillOpacity={0.5}
						/>
						<Radar
							name={STATUS_LABELS.ADOPTED}
							dataKey="ADOPTED"
							stroke={STATUS_COLORS.ADOPTED}
							fill={STATUS_COLORS.ADOPTED}
							fillOpacity={0.5}
						/>
						<Radar
							name={STATUS_LABELS.FREE}
							dataKey="FREE"
							stroke={STATUS_COLORS.FREE}
							fill={STATUS_COLORS.FREE}
							fillOpacity={0.5}
						/>

						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(255,255,255,0.95)',
								borderRadius: '8px',
								border: '1px solid #e2e8f0',
								boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
							}}
						/>
						<Legend verticalAlign="bottom" height={36} />
					</RadarChart>
				</ResponsiveContainer>
			</div>
		</div>
	</div>
</section>

<style>
	/* Animations subtiles */
	section {
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Hover effects sur les cards */
	section > div.grid > div:first-child {
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	section > div.grid > div:first-child:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}
</style>
