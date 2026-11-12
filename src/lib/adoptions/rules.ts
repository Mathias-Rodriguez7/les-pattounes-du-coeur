// =====================================================================
// Règles métier d'une demande d'ADOPTION, appliquées par le serveur à chaque enregistrement.
// Même raison que pour les FA et les bénévoles (voir hosts/rules.ts) : une case décochée fait
// disparaître ses champs de la page, le navigateur ne les envoie plus, et la fusion gardait
// les anciennes valeurs.
// =====================================================================

export function applyAdoptionRules<T extends Record<string, unknown>>(data: T): T {
	let result: Record<string, unknown> = data;
	// Pas d'extérieur ⇒ pas de taille d'extérieur
	if (result.hasGarden === false) result = { ...result, gardenSize: null };
	// Pas d'animaux ⇒ 0 chat, 0 chien (la valeur par défaut du formulaire public), pas d'autres
	if (result.hasPets === false) {
		result = { ...result, numberOfCats: 0, numberOfDogs: 0, otherPets: null };
	}
	return result as T;
}
