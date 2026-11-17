// =====================================================================
// La position GPS d'un SOS : la lire dans ce que colle la bénévole, et l'ouvrir dans Maps.
// =====================================================================

export type Coordinates = { latitude: number; longitude: number };

const isValid = (lat: number, lng: number) =>
	Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Lit une position dans un texte collé. Accepte :
 * - des coordonnées : « 43.5672, 3.9001 » (ou avec des espaces, ou « 43,5672 3,9001 ») ;
 * - un lien Google Maps : …/@43.5672,3.9001,17z  ·  …?q=43.5672,3.9001  ·  …!3d43.5672!4d3.9001
 * Renvoie null si rien n'est trouvé (ex : un lien court « maps.app.goo.gl/… », sans coordonnées).
 */
export function parseCoordinates(text: string): Coordinates | null {
	const input = text.trim();
	if (!input) return null;

	const patterns = [
		/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // lien d'un lieu : le point exact
		/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // lien d'une carte centrée
		/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/ // lien de recherche
	];
	for (const pattern of patterns) {
		const match = input.match(pattern);
		if (match) {
			const [lat, lng] = [Number(match[1]), Number(match[2])];
			if (isValid(lat, lng)) return { latitude: lat, longitude: lng };
		}
	}

	// Deux nombres seuls : « 43.5672, 3.9001 » ou « 43,5672 3,9001 » (virgule décimale française)
	const plain = input.match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);
	if (plain) {
		const lat = Number(plain[1].replace(',', '.'));
		const lng = Number(plain[2].replace(',', '.'));
		if (isValid(lat, lng)) return { latitude: lat, longitude: lng };
	}

	return null;
}

/** Le lien qui ouvre la position dans Google Maps (navigateur ou appli du téléphone) */
export function mapsUrl({ latitude, longitude }: Coordinates): string {
	return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** Le lien qui cherche une adresse dans Google Maps (quand on n'a pas de position GPS) */
export function mapsAddressUrl(address: string): string {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** « 43.567200, 3.900100 » : 6 décimales, environ 10 cm, largement assez */
export function formatCoordinates({ latitude, longitude }: Coordinates): string {
	return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/** Le lieu en une ligne : « 12 rue des Lilas, 34970 Lattes » (les parties vides sont omises) */
export function formatAddress(place: {
	address?: string | null;
	postalCode?: string | null;
	city?: string | null;
}): string | null {
	const town = [place.postalCode, place.city].filter(Boolean).join(' ');
	return [place.address, town].filter(Boolean).join(', ') || null;
}
