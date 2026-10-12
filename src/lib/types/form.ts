import type { FormType, Form, User, Profil } from '@prisma/client';

export type News = {
	id: string;
	title: string | null;
	content: string | null;
	type: FormType;
	mediaUrl: string | null;
	createdAt: Date;
	formattedDate: string;
	image: string;
	cats: any[]; // À typer selon ton besoin
};

export type FormWithRelations = Form & {
	assignedTo?:
		| (User & {
				profil: Profil;
		  })
		| null;
};

export type SOSType = 'abandon' | 'feeding_spot' | 'found' | 'danger' | 'autre';
