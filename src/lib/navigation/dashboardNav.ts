import type { Path } from '$app/types';
import type { VolunteerRole } from '@prisma/client';
import {
	LayoutDashboard,
	Cat,
	HouseHeart,
	Users,
	Newspaper,
	ClipboardList,
	FileQuestionMark,
	Stethoscope,
	Siren,
	Ban
} from '@lucide/svelte';

// Les pages du dashboard : UNE liste pour la sidebar (ordinateur) et la barre d'onglets (mobile).
// `section` range les pages dans le panneau « Plus » du mobile ; sans section = onglet du bas.

export type DashboardSection = 'Suivi' | 'Communication' | 'Ressources';

export interface DashboardNavItem {
	label: string;
	icon: typeof LayoutDashboard;
	href: Path;
	roles: VolunteerRole[];
	section?: DashboardSection;
	/** Un onglet du bas qu'on retrouve AUSSI dans « Plus », dans cette rubrique */
	alsoInMore?: DashboardSection;
}

const ALL: VolunteerRole[] = ['ADMIN', 'MANAGER', 'COMMUNICATION'];

export const DASHBOARD_NAV: DashboardNavItem[] = [
	{ label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard', roles: ALL },
	{
		label: 'Chats',
		icon: Cat,
		href: 'dashboard/chat',
		roles: ALL,
		alsoInMore: 'Suivi'
	},
	{ label: 'SOS', icon: Siren, href: 'dashboard/sos', roles: ALL },
	{
		label: "Familles d'accueil",
		icon: HouseHeart,
		href: 'dashboard/famille_d_accueil',
		roles: ['ADMIN'],
		section: 'Suivi'
	},
	{
		label: 'Bénévoles',
		icon: Users,
		href: 'dashboard/benevole',
		roles: ['ADMIN'],
		section: 'Suivi'
	},
	{
		label: 'News',
		icon: Newspaper,
		href: 'dashboard/news',
		roles: ['ADMIN', 'COMMUNICATION'],
		section: 'Communication'
	},
	{
		label: 'Formulaires',
		icon: ClipboardList,
		href: 'dashboard/forms',
		roles: ALL,
		section: 'Ressources'
	},
	{ label: 'Blacklist', icon: Ban, href: 'dashboard/blacklist', roles: ALL, section: 'Ressources' },
	{
		label: 'Documents',
		icon: FileQuestionMark,
		href: 'dashboard/information',
		roles: ALL,
		section: 'Ressources'
	},
	{
		label: 'Vétérinaires',
		icon: Stethoscope,
		href: 'dashboard/veterinaires',
		roles: ALL,
		section: 'Ressources'
	}
];

/** Les pages qu'une bénévole voit, selon son rôle */
export function navFor(role: VolunteerRole): DashboardNavItem[] {
	return DASHBOARD_NAV.filter((item) => item.roles.includes(role));
}

export interface QuickAction {
	key: string;
	label: string;
	icon: typeof LayoutDashboard;
	/** La page qui s'ouvre avec son formulaire de création (?nouveau=1) */
	page: Path;
	roles: VolunteerRole[];
}

/** Le « + » du mobile : les créations rapides, selon le rôle */
export const MOBILE_QUICK_ACTIONS: QuickAction[] = [
	{ key: 'cat', label: 'Chat', icon: Cat, page: 'dashboard/chat', roles: ALL },
	{ key: 'sos', label: 'SOS', icon: Siren, page: 'dashboard/sos', roles: ['ADMIN'] },
	{
		key: 'fa',
		label: 'FA',
		icon: HouseHeart,
		page: 'dashboard/famille_d_accueil',
		roles: ['ADMIN']
	},
	{ key: 'news', label: 'News', icon: Newspaper, page: 'dashboard/news', roles: ['COMMUNICATION'] }
];
