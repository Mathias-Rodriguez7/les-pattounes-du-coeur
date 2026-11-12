/** Une ligne de BlacklistHistoric (jamais supprimée : lever = isBlacklisted passe à false) */
export type BlacklistEntry = {
	id: string;
	description: string;
	isBlacklisted: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Une personne blacklistée : toutes les lignes d'un même email regroupées.
 * Le nom vient de son compte s'il existe, sinon de sa dernière demande.
 */
export type BlacklistPerson = {
	/** En minuscules : sert d'identifiant dans la page */
	email: string;
	firstName: string | null;
	lastName: string | null;
	phone: string | null;
	/** Compte bénévole ou FA : il est désactivé tant que la blacklist est active */
	account: 'VOLUNTEER' | 'HOST' | null;
	/** La raison et la date de la blacklist ACTIVE la plus récente */
	reason: string;
	since: Date;
	/** Toutes les lignes de cet email, de la plus récente à la plus ancienne */
	history: BlacklistEntry[];
	/** Nombre de demandes (formulaires) envoyées avec cet email */
	formsCount: number;
};
