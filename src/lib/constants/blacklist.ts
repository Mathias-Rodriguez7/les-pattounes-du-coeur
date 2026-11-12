/** Filtre « Blacklist » des pages Bénévoles et FA ('' = tout le monde) */
export const BLACKLIST_FILTER_OPTIONS = [
	{ value: 'BLACKLISTED', label: 'Blacklistés' },
	{ value: 'NOT_BLACKLISTED', label: 'Non blacklistés' }
];

/** La personne passe-t-elle le filtre ? (blacklists = sa blacklist active, 0 ou 1 ligne) */
export function matchesBlacklistFilter(filter: string, blacklists: unknown[] | undefined): boolean {
	const isBlacklisted = (blacklists?.length ?? 0) > 0;
	if (filter === 'BLACKLISTED') return isBlacklisted;
	if (filter === 'NOT_BLACKLISTED') return !isBlacklisted;
	return true;
}
