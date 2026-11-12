import { z } from 'zod';
import { emailField } from '#lib/schemas/fields.ts';

const reasonField = (message: string) => z.string().trim().min(3, message);

/** Mettre un email blacklisté (le compte associé, s'il existe, est retrouvé par le serveur) */
export const addToBlacklistSchema = z.object({
	email: emailField(),
	reason: reasonField('Indiquez la raison (3 caractères minimum)')
});

/** Lever la blacklist d'un email : la raison est ajoutée à la description */
export const liftBlacklistSchema = z.object({
	email: emailField(),
	reason: reasonField('Indiquez pourquoi la blacklist est levée')
});

export type AddToBlacklistInput = z.infer<typeof addToBlacklistSchema>;
export type LiftBlacklistInput = z.infer<typeof liftBlacklistSchema>;
