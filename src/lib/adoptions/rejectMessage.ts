// =====================================================================
// Le message de refus d'une demande d'adoption, écrit par la bénévole.
// On lui propose un début de message, avec un passage à compléter entre crochets :
// tant qu'il reste, le message n'est pas envoyé (vérifié dans le dialogue ET sur le serveur).
// =====================================================================

export const REJECT_PLACEHOLDER = '[Expliquez ici la raison du refus, avec bienveillance]';

/** Le message proposé à la bénévole, qu'elle complète avant l'envoi */
export function defaultRejectMessage(requesterName: string, catName?: string | null): string {
	const greeting = requesterName ? `Bonjour ${requesterName},` : 'Bonjour,';
	const about = catName ? ` de ${catName}` : '';
	return [
		greeting,
		'',
		`Merci pour votre demande d’adoption${about}. Après étude, nous ne pouvons malheureusement pas y donner une suite favorable.`,
		'',
		REJECT_PLACEHOLDER,
		'',
		'N’hésitez pas à me répondre directement si vous avez des questions.'
	].join('\n');
}

/** Le passage à compléter est-il encore là ? */
export function hasPlaceholder(message: string): boolean {
	return message.includes(REJECT_PLACEHOLDER);
}
