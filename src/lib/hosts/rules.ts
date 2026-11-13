// =====================================================================
// Règles métier d'une FA, appliquées par le SERVEUR à chaque enregistrement.
//
// Pourquoi côté serveur ? Quand on décoche une case (« Animaux au domicile », « Extérieur »),
// les champs qui en dépendent disparaissent de la page : le navigateur ne les envoie plus.
// Le serveur, qui ne met à jour que les champs reçus, gardait les anciennes valeurs en base.
//
// Chaque règle ne fait rien si la case n'est pas explicitement `false`
// (champ absent = modification partielle, pas de changement).
// =====================================================================

/** Pas d'animaux au domicile ⇒ ni nombre de chats, ni de chiens, ni « autres animaux » */
export function withoutAnimalCounts<T extends Record<string, unknown>>(data: T): T {
	if (data.hasAnimalsAtHome !== false) return data;
	return { ...data, numberOfCatsAtHome: null, numberOfDogsAtHome: null, otherAnimalsAtHome: null };
}

/** Pas d'extérieur ⇒ pas de description de l'extérieur */
export function withoutOutsideDescription<T extends Record<string, unknown>>(data: T): T {
	if (data.outside !== false) return data;
	return { ...data, outsideDescription: null };
}

/** Toutes les règles d'une FA, dans l'ordre */
export function applyHostRules<T extends Record<string, unknown>>(data: T): T {
	return withoutOutsideDescription(withoutAnimalCounts(data));
}
