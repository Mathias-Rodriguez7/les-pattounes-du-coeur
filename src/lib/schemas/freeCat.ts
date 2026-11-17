import { z } from 'zod';
import { SexCat, SterilizationPayer } from '@prisma/client';
import { CAT_NUMBER_FORMAT_MESSAGE, catNumberRegex } from '#lib/schemas/cat.ts';
import { ASSO_CAT_STATUSES } from '#lib/constants/freeCat.ts';
import {
	coordinatesMessage,
	emptyToNull,
	optionalText,
	placeShape,
	requiredText,
	withBothCoordinates
} from '#lib/schemas/place.ts';

const optionalCatNumber = z.preprocess(
	emptyToNull,
	z.string().trim().regex(catNumberRegex, CAT_NUMBER_FORMAT_MESSAGE).nullish()
);

/** Ce qui se modifie après la création : le chat, qui paye, le relâchage, le nourrisseur */
const freeCatShape = {
	sex: z.enum(SexCat, 'Choisissez le sexe'),
	// L'identification est facultative : une puce OU un tatouage, et son numéro
	identificationKind: z.preprocess(emptyToNull, z.enum(['CHIP', 'TATTOO']).nullish()),
	identificationNumber: optionalText(50),
	// Le N° Pattounes : obligatoire seulement si l'asso paye la stérilisation
	catNumber: optionalCatNumber,

	payer: z.enum(SterilizationPayer, 'Choisissez qui paye la stérilisation'),
	payerOther: optionalText(255),

	// Le lieu de relâchage : le lieu et la ville sont obligatoires
	...placeShape,
	address: requiredText(500, 'Le lieu de relâchage est obligatoire'),
	city: requiredText(100, 'La ville du relâchage est obligatoire'),

	feederName: requiredText(255, 'Le nom du nourrisseur est obligatoire'),
	feederContact: requiredText(255, 'Un moyen de contact est obligatoire'),
	notes: optionalText(5000)
};

type FreeCatRules = {
	payer: SterilizationPayer;
	payerOther?: string | null;
	catNumber?: string | null;
	identificationKind?: 'CHIP' | 'TATTOO' | null;
	identificationNumber?: string | null;
	latitude?: number | null;
	longitude?: number | null;
};

/** Les règles entre les champs, communes à la création et à la modification */
function checkFreeCat(data: FreeCatRules, ctx: z.RefinementCtx) {
	if (data.payer === 'ASSO' && !data.catNumber) {
		ctx.addIssue({
			code: 'custom',
			path: ['catNumber'],
			message: "Obligatoire quand l'asso paye la stérilisation"
		});
	}
	if (data.payer === 'OTHER' && !data.payerOther) {
		ctx.addIssue({ code: 'custom', path: ['payerOther'], message: 'Indiquez qui paye' });
	}
	if (data.identificationKind && !data.identificationNumber) {
		ctx.addIssue({ code: 'custom', path: ['identificationNumber'], message: 'Indiquez le numéro' });
	}
	if (!withBothCoordinates(data)) {
		ctx.addIssue({ code: 'custom', ...coordinatesMessage });
	}
}

/** Créer un chat libre : en plus, la gestionnaire et la stérilisation (date + vétérinaire) */
export const createFreeCatSchema = z
	.object({
		...freeCatShape,
		// La bénévole qui l'a attrapé : choisie par l'admin (une bénévole, c'est elle-même)
		volunteerId: z.preprocess(emptyToNull, z.uuid('Bénévole invalide').nullish()),
		// Format « AAAA-MM-JJ », celui que renvoie le DatePicker
		sterilizedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
		// Un vétérinaire de la liste, ou « Autre… » avec son nom : l'un des deux est obligatoire
		veterinarianId: z.preprocess(emptyToNull, z.uuid('Vétérinaire invalide').nullish()),
		veterinary: optionalText(255)
	})
	.superRefine((data, ctx) => {
		checkFreeCat(data, ctx);
		if (!data.veterinarianId && !data.veterinary) {
			ctx.addIssue({
				code: 'custom',
				path: ['veterinarianId'],
				message: 'Choisissez le vétérinaire'
			});
		}
	});

/** Modifier un chat libre (la stérilisation, elle, est un soin : onglet Soins) */
export const updateFreeCatSchema = z
	.object({ ...freeCatShape, catId: z.uuid('Chat invalide') })
	.superRefine(checkFreeCat);

/** Passer un chat libre en chat asso : la bénévole choisit le statut */
export const convertFreeCatSchema = z.object({
	catId: z.uuid('Chat invalide'),
	status: z.enum(ASSO_CAT_STATUSES, 'Choisissez le statut'),
	// Obligatoire si le chat n'en a pas encore (vérifié par l'action, qui lit le chat en base)
	catNumber: optionalCatNumber
});

export type CreateFreeCatInput = z.infer<typeof createFreeCatSchema>;
export type UpdateFreeCatInput = z.infer<typeof updateFreeCatSchema>;
