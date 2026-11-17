import { describe, expect, it } from 'vitest';
import { formatAddress, formatCoordinates, mapsUrl, parseCoordinates } from './geo';

describe('parseCoordinates', () => {
	it('lit des coordonnées simples, avec point ou virgule décimale', () => {
		expect(parseCoordinates('43.5672, 3.9001')).toEqual({ latitude: 43.5672, longitude: 3.9001 });
		expect(parseCoordinates('43,5672 3,9001')).toEqual({ latitude: 43.5672, longitude: 3.9001 });
		expect(parseCoordinates('-33.86;151.2')).toEqual({ latitude: -33.86, longitude: 151.2 });
	});

	it('lit les liens Google Maps (lieu, carte, recherche)', () => {
		expect(
			parseCoordinates(
				'https://www.google.com/maps/place/Lattes/@43.56,3.89,14z/data=!3m1!4b1!4m6!3m5!3d43.5672!4d3.9001'
			)
		).toEqual({ latitude: 43.5672, longitude: 3.9001 });
		expect(parseCoordinates('https://www.google.com/maps/@43.6108,3.8767,15z')).toEqual({
			latitude: 43.6108,
			longitude: 3.8767
		});
		expect(parseCoordinates('https://maps.google.com/?q=43.6,3.88')).toEqual({
			latitude: 43.6,
			longitude: 3.88
		});
	});

	it('refuse ce qui n’est pas une position', () => {
		expect(parseCoordinates('')).toBeNull();
		expect(parseCoordinates('12 rue des Lilas')).toBeNull();
		expect(parseCoordinates('https://maps.app.goo.gl/abc123')).toBeNull();
		expect(parseCoordinates('95, 3')).toBeNull(); // latitude impossible
	});
});

describe('mapsUrl / formatCoordinates', () => {
	it('construit le lien et le texte', () => {
		const point = { latitude: 43.5672, longitude: 3.9001 };
		expect(mapsUrl(point)).toBe('https://www.google.com/maps/search/?api=1&query=43.5672,3.9001');
		expect(formatCoordinates(point)).toBe('43.567200, 3.900100');
	});
});

describe('formatAddress', () => {
	it('assemble les parties remplies', () => {
		expect(
			formatAddress({ address: '12 rue des Lilas', postalCode: '34970', city: 'Lattes' })
		).toBe('12 rue des Lilas, 34970 Lattes');
		expect(formatAddress({ city: 'Lattes' })).toBe('Lattes');
		expect(formatAddress({})).toBeNull();
	});
});
