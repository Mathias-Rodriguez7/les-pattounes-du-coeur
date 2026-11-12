/**
 * Règle métier : une FA SANS animaux au domicile n'a ni nombre de chats, ni de chiens, ni
 * « autres animaux ».
 *
 * Pourquoi côté serveur ? Quand on décoche « Animaux au domicile », les champs des nombres
 * disparaissent de la page : le navigateur ne les envoie plus. Le serveur, qui ne met à jour que
 * les champs reçus, gardait les anciens nombres en base. C'est donc au serveur d'appliquer la règle.
 *
 * Ne fait rien si `hasAnimalsAtHome` n'est pas explicitement `false` (champ absent = pas de changement).
 */
export function withoutAnimalCounts<T extends Record<string, unknown>>(data: T): T {
	if (data.hasAnimalsAtHome !== false) return data;
	return { ...data, numberOfCatsAtHome: null, numberOfDogsAtHome: null, otherAnimalsAtHome: null };
}
