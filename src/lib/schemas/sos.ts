import { z } from 'zod';
import { District, SosCategory, SosDismissReason } from '@prisma/client';
import { emailField } from '#lib/schemas/fields.ts';

// Un champ vide envoyé par un formulaire ('') devient null
const emptyToNull = (value: unknown) => (value === '' ? null : value);
const optionalText = (max: number) =>
	z.preprocess(emptyToNull, z.string().trim().max(max, `Max ${max} caractères`).nullish());
const optionalNumber = (min: number, max: number) =>
	z.preprocess(emptyToNull, z.coerce.number().min(min).max(max).nullish());

/** Le lieu, comme une adresse de profil (rue, ville, code postal, quartier), et le GPS */
const placeShape = {
	address: optionalText(500),
	city: optionalText(100),
	postalCode: optionalText(10),
	district: z.preprocess(emptyToNull, z.enum(District).nullish()),
	latitude: optionalNumber(-90, 90),
	longitude: optionalNumber(-180, 180)
};

const withBothCoordinates = <T extends { latitude?: number | null; longitude?: number | null }>(
	data: T
) => (data.latitude == null) === (data.longitude == null);
const coordinatesMessage = {
	message: 'Position GPS incomplète',
	path: ['latitude']
};

/** La personne qui signale, et la date du SOS : à la création comme à la modification */
const reporterShape = {
	// Format « AAAA-MM-JJ », celui que renvoie le DatePicker
	reportedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
	reporterFirstName: z.string().trim().min(1, 'Le prénom est obligatoire').max(100),
	reporterLastName: z.string().trim().min(1, 'Le nom est obligatoire').max(100),
	reporterPhone: optionalText(30),
	reporterEmail: z.preprocess(emptyToNull, emailField().nullish())
};

const withContact = <T extends { reporterPhone?: string | null; reporterEmail?: string | null }>(
	data: T
) => !!data.reporterPhone || !!data.reporterEmail;
const contactMessage = {
	message: 'Un téléphone ou un email est obligatoire',
	path: ['reporterPhone']
};

/** Un SOS saisi à la main (téléphone, mail…) : la bénévole qui le saisit le traite */
export const createSosSchema = z
	.object({
		source: z.enum(['PHONE', 'EMAIL', 'OTHER'], 'Choisissez la provenance'),
		...reporterShape,
		description: optionalText(5000),
		category: z.preprocess(emptyToNull, z.enum(SosCategory).nullish()),
		...placeShape
	})
	.refine(withBothCoordinates, coordinatesMessage)
	.refine(withContact, contactMessage);

/** Modifier un SOS : la personne, la date, le signalement, le lieu (celle qui le traite, ou l'admin) */
export const updateSosSchema = z
	.object({
		sosId: z.uuid('SOS invalide'),
		...reporterShape,
		category: z.preprocess(emptyToNull, z.enum(SosCategory).nullish()),
		description: optionalText(5000),
		...placeShape
	})
	.refine(withBothCoordinates, coordinatesMessage)
	.refine(withContact, contactMessage);

export const sosIdSchema = z.object({ sosId: z.uuid('SOS invalide') });

/** Confier un SOS à une autre bénévole (admin) */
export const assignSosSchema = z.object({
	sosId: z.uuid('SOS invalide'),
	volunteerId: z.uuid('Choisissez une bénévole')
});

/** Classer sans suite : la raison est obligatoire, la note facultative */
export const dismissSosSchema = z.object({
	sosId: z.uuid('SOS invalide'),
	dismissReason: z.enum(SosDismissReason, 'Choisissez une raison'),
	dismissNote: optionalText(2000)
});

/** Rattacher un chat qui existe déjà à un SOS (ou l'en détacher : sosId vide) */
export const linkCatSosSchema = z.object({
	catId: z.uuid('Chat invalide'),
	sosId: z.preprocess(emptyToNull, z.uuid('SOS invalide').nullish())
});

export type CreateSosInput = z.infer<typeof createSosSchema>;
