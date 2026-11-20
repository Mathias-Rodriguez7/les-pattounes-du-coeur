<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';
	import MyStatsCard, { type StatRow } from './MyStatsCard.svelte';
	import {
		Cat,
		ClipboardList,
		Clock,
		Eye,
		Hourglass,
		MailPlus,
		Megaphone,
		Newspaper,
		Sprout,
		TrendingDown,
		UserSearch
	} from '@lucide/svelte';

	// « Mes stats », selon le rôle. L'admin bascule entre sa vue admin et sa vue bénévole
	// avec le même interrupteur que ses tâches.
	interface Props {
		stats: PageData['myStats'];
		view: 'VOLUNTEER' | 'COMMUNICATION' | 'ADMIN';
	}

	let { stats, view }: Props = $props();

	const year = new Date().getFullYear();
	const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

	const volunteer = $derived(stats.volunteer);
	const communication = $derived(stats.communication);
	const admin = $derived(stats.admin);

	// ----- Bénévole (manager, et l'admin dans sa vue « Bénévole ») -----
	const volunteerRows = $derived<StatRow[]>(
		volunteer
			? [
					{
						id: 'mine',
						label: plural(volunteer.myCats, 'Mon chat', 'Mes chats'),
						value: volunteer.myCats,
						icon: Cat,
						tone: 'bg-blue-100 text-blue-700',
						href: resolve('dashboard/chat')
					},
					{
						id: 'visible',
						label: plural(volunteer.visible, 'Publié', 'Publiés'),
						value: volunteer.visible,
						icon: Eye,
						tone: 'bg-pink-100 text-pink-700',
						href: resolve('dashboard/chat')
					},
					{
						id: 'socialize',
						label: 'En sociabilisation',
						value: volunteer.socialize,
						icon: Sprout,
						tone: 'bg-orange-100 text-orange-700',
						href: resolve('dashboard/chat?statut=SOCIALIZE')
					},
					{
						id: 'to-request',
						label: 'Publication à demander',
						value: volunteer.toRequest,
						icon: Megaphone,
						tone: 'bg-amber-100 text-amber-700',
						emphasis: 'todo',
						href: resolve('dashboard/chat')
					},
					{
						id: 'forms',
						label: 'Candidatures à traiter',
						value: volunteer.formsToHandle,
						icon: ClipboardList,
						tone: 'bg-amber-100 text-amber-700',
						emphasis: 'todo',
						href: resolve('dashboard/forms')
					}
				]
			: []
	);

	// ----- Communication -----
	const communicationRows = $derived<StatRow[]>(
		communication
			? [
					{
						id: 'to-publish',
						label: 'À publier',
						value: communication.toPublish,
						icon: Clock,
						tone: 'bg-amber-100 text-amber-700',
						emphasis: 'todo',
						href: resolve('dashboard/chat')
					},
					{
						id: 'online',
						label: 'En ligne',
						value: communication.online,
						icon: Eye,
						tone: 'bg-violet-100 text-violet-700',
						href: resolve('dashboard/chat')
					},
					{
						id: 'stale',
						label: 'À remettre en avant',
						hint: 'en ligne depuis +2 mois, aucune candidature',
						value: communication.stale,
						icon: TrendingDown,
						tone: 'bg-red-100 text-red-700',
						emphasis: 'alert',
						href: resolve('dashboard/chat')
					},
					{
						id: 'news',
						label: 'News ce mois-ci',
						value: communication.news,
						icon: Newspaper,
						tone: 'bg-teal-100 text-teal-700',
						href: resolve('dashboard/news')
					}
				]
			: []
	);

	// ----- Admin -----
	const adminRows = $derived<StatRow[]>(
		admin
			? [
					{
						id: 'unassigned',
						label: 'Candidatures sans référente',
						value: admin.unassigned,
						icon: UserSearch,
						tone: 'bg-red-100 text-red-700',
						emphasis: 'alert',
						href: resolve('dashboard/forms?scope=all')
					},
					{
						id: 'invitations',
						label: 'Candidature en attente',
						value: admin.invitations,
						icon: MailPlus,
						tone: 'bg-amber-100 text-amber-700',
						href: resolve('dashboard/benevole')
					},
					{
						id: 'delay',
						label: 'Délai moyen de traitement',
						value: admin.averageDays === null ? '–' : `${admin.averageDays} j`,
						icon: Hourglass,
						tone: 'bg-blue-100 text-blue-700'
					},
					// Ses propres chats : seulement si elle en suit
					...(volunteer && volunteer.myCats > 0
						? [
								{
									id: 'mine',
									label: plural(volunteer.myCats, 'Mon chat', 'Mes chats'),
									value: volunteer.myCats,
									icon: Cat,
									tone: 'bg-blue-100 text-blue-700',
									href: resolve('dashboard/chat')
								}
							]
						: [])
				]
			: []
	);
</script>

{#if view === 'ADMIN' && admin}
	<MyStatsCard
		since={stats.since}
		rows={adminRows}
		series={[
			{
				label: 'Reçues',
				byMonth: admin.received.byMonth,
				barClass: 'bg-amber-300',
				currentClass: 'bg-amber-500'
			},
			{
				label: 'Traitées',
				byMonth: admin.processed.byMonth,
				barClass: 'bg-teal-300',
				currentClass: 'bg-teal-600'
			}
		]}
	>
		{#snippet headline()}
			<span class="text-teal-600">
				{admin.newHosts}
				FA et {admin.newVolunteers}
				{plural(admin.newVolunteers, 'bénévole', 'bénévoles')}
			</span>
			{plural(admin.newHosts + admin.newVolunteers, 'accueillie', 'accueillis')} cette année
		{/snippet}
		{#snippet summary()}
			En {year} :
			<span class="font-semibold text-foreground">{admin.received.year}</span>
			{plural(admin.received.year, 'candidature reçue', 'candidatures reçues')},
			<span class="font-semibold text-foreground">{admin.processed.year}</span>
			{plural(admin.processed.year, 'traitée', 'traitées')}
		{/snippet}
	</MyStatsCard>
{:else if view === 'COMMUNICATION' && communication}
	<MyStatsCard
		since={stats.since}
		rows={communicationRows}
		series={[
			{
				label: 'Publiés',
				byMonth: communication.published.byMonth,
				barClass: 'bg-violet-300',
				currentClass: 'bg-violet-500'
			},
			{
				label: 'Adoptés',
				byMonth: communication.adoptions.byMonth,
				barClass: 'bg-pink-300',
				currentClass: 'bg-pink-500'
			}
		]}
	>
		{#snippet headline()}
			<span class="text-violet-600">
				{communication.published.year}
				{plural(communication.published.year, 'chat publié', 'chats publiés')}
			</span>
			cette année, {communication.publishedAdopted} déjà {plural(
				communication.publishedAdopted,
				'adopté',
				'adoptés'
			)}
		{/snippet}
		{#snippet summary()}
			Ce mois-ci :
			<span class="font-semibold text-foreground">{communication.published.month}</span>
			{plural(communication.published.month, 'publié', 'publiés')},
			<span class="font-semibold text-foreground">{communication.adoptions.month}</span>
			{plural(communication.adoptions.month, 'adopté', 'adoptés')}
		{/snippet}
	</MyStatsCard>
{:else if volunteer}
	<MyStatsCard
		since={stats.since}
		rows={volunteerRows}
		series={[
			{
				label: 'Pris en gestion',
				byMonth: volunteer.catsTaken.byMonth,
				barClass: 'bg-blue-300',
				currentClass: 'bg-blue-500'
			},
			{
				label: 'Adoptés',
				byMonth: volunteer.adoptions.byMonth,
				barClass: 'bg-pink-300',
				currentClass: 'bg-pink-500'
			}
		]}
	>
		{#snippet headline()}
			{#if volunteer.adoptionsTotal > 0}
				<span class="text-pink-600">
					{volunteer.adoptionsTotal}
					{plural(volunteer.adoptionsTotal, 'chat adopté', 'chats adoptés')}
				</span>
				grâce à toi
			{:else}
				Ta première adoption arrive bientôt
			{/if}
		{/snippet}
		{#snippet summary()}
			En {year} :
			<span class="font-semibold text-foreground">{volunteer.catsTaken.year}</span>
			pris en gestion,
			<span class="font-semibold text-foreground">{volunteer.adoptions.year}</span>
			{plural(volunteer.adoptions.year, 'adopté', 'adoptés')}
			{#if volunteer.adoptionsDelta !== 0}
				·
				<span class={volunteer.adoptionsDelta > 0 ? 'text-green-700' : ''}>
					{volunteer.adoptionsDelta > 0 ? '+' : ''}{volunteer.adoptionsDelta} par rapport à {year -
						1}
				</span>
			{/if}
		{/snippet}
	</MyStatsCard>
{/if}
