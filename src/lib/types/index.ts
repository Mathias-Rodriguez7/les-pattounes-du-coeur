export type {
	Profil,
	Volunteer,
	Host,
	Cat,
	Placement,
	Adoption,
	Session,
	Form,
	Care,
	Sickness,
	MediaCat,
	News,
	NewsCat,
	CatVolunteer,
	BlacklistHistoric,
	District,
	ColabActivity,
	VolunteerRole,
	HostType,
	Heal,
	Socialize,
	BabyFeeding,
	SexCat,
	CatStatus,
	HairLength,
	Vaccinate,
	CareType,
	NewsType,
	PlacementType,
	FormType,
	FormStatus,
	SicknessStatus
} from '@prisma/client';

export type { HostFull, HostEditData, HostFormErrors } from './host';

export type {
	VolunteerWithRelations,
	VolunteerEditData,
	CatVolunteerWithRelations,
	VolunteerEditFormState
} from './volunteer';

export type { CatFull, CatMedia, Cat as CatType } from './cat';

export type { PlacementFull } from './placement';
export type { CatWithMedia, AdoptionTrendItem } from './media';

// Config & labels - TOUT
export {
	hostTypeLabel,
	colabActivityLabel,
	healLabel,
	socializeLabel,
	babyFeedingLabel,
	FORM_TYPE_CONFIG,
	FORM_TYPE_LABELS,
	FORM_TYPES,
	STATUS_CONFIG
} from './labels';
