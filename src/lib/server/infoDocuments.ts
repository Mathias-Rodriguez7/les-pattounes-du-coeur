// src/lib/server/infoDocuments.ts
export type InfoDocument = {
	title: string;
	description?: string;
	file: string;
};

export const infoDocuments: InfoDocument[] = [
	{
		title: 'Manuel de la gestionnaire',
		description: 'Manuel de la gestionnaire.',
		file: 'Manuel_gestionnaire.pdf'
	},
	{
		title: "Certificat d'engagement",
		description: "Certificat d'engagement à signer et à remettre à l'association.",
		file: 'CERTIF_ENGAGEMENT.pdf'
	},
	{
		title: 'Contrat d’adoption',
		description: 'Modèle de contrat d’adoption à compléter.',
		file: 'Contrat_adoption_vierge.docx'
	},
	{
		title: 'Contrat de cession',
		description: 'Modèle de contrat de cession à compléter.',
		file: 'Contrat_de_cession.pdf'
	},
	{
		title: "Hébergement d'association",
		description: 'Modèle de contrat d’adoption à compléter.',
		file: 'dossier_hebergement_association.docx'
	},
	{
		title: 'Fiche stérilisation Mairie Mtpl',
		description: 'Fiche stérilisation Mairie Mtpl.',
		file: 'Fiche_stérilisation_Mairie_Mtpl.pdf'
	},
	{
		title: 'Guide des adoptants',
		description: 'Guide des adoptants.',
		file: 'Guide_adoptants.pdf'
	},
	{
		title: "J'ai perdu mon chat",
		description: "J'ai perdu mon chat.",
		file: "J'ai_perdu_mon_chat.pdf"
	},
	{
		title: 'Liste des vétérinaires 2025',
		description: 'Liste des vétérinaires.',
		file: 'Liste_complete_veterinaires_partenaires_et_specialistes_2025.pdf'
	},
	{
		title: 'Information hébergement',
		description: 'Information sur l’hébergement.',
		file: 'note_informative_hebergement_nodejs.docx'
	},
	{
		title: 'Protocoles de cohabitation entre chats',
		description: 'Protocoles de cohabitation entre chats.',
		file: 'protocole_cohabitation_entre_chats.pdf'
	},
	{
		title: 'TARIFS & PROCESS ADOPTIONS',
		description: 'Tarifs et processus d’adoption.',
		file: 'TARIFS_&_PROCESS_ADOPTIONS.pdf'
	}
];
