import { z } from 'zod';
import { District } from '@prisma/client';

// Les briques communes des formulaires qui ont un lieu (SOS, relâchage d'un chat libre)

/** Un champ vide envoyé par un formulaire ('') devient null */
export const emptyToNull = (value: unknown) => (value === '' ? null : value);

export const optionalText = (max: number) =>
	z.preprocess(emptyToNull, z.string().trim().max(max, `Max ${max} caractères`).nullish());

export const requiredText = (max: number, message: string) =>
	z.string(message).trim().min(1, message).max(max, `Max ${max} caractères`);

export const optionalNumber = (min: number, max: number) =>
	z.preprocess(emptyToNull, z.coerce.number().min(min).max(max).nullish());

/** Le lieu, comme une adresse de profil (rue, ville, code postal, quartier), et le GPS */
export const placeShape = {
	address: optionalText(500),
	city: optionalText(100),
	postalCode: optionalText(10),
	district: z.preprocess(emptyToNull, z.enum(District).nullish()),
	latitude: optionalNumber(-90, 90),
	longitude: optionalNumber(-180, 180)
};

/** Le GPS se donne entier (latitude ET longitude) ou pas du tout */
export const withBothCoordinates = <
	T extends { latitude?: number | null; longitude?: number | null }
>(
	data: T
) => (data.latitude == null) === (data.longitude == null);

export const coordinatesMessage = {
	message: 'Position GPS incomplète',
	path: ['latitude']
};
