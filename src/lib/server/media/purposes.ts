import type { MediaType } from '@prisma/client';
import type { AppUser } from '$lib/types/user';
import type { UploadPurpose } from '$lib/media/rules';
import type { StorageFolder } from '$lib/server/storage';
import { canManageNews } from '$lib/permissions/news';
import { canManageCat } from '$lib/server/permissions/cat';

type PurposeConfig = {
	allowed: MediaType[];
	isPrivate: boolean;
	/** true : il faut un targetId (l'id du chat) */
	needsTarget: boolean;
	folder: (targetId: string) => StorageFolder;
	canUpload: (user: AppUser, targetId: string) => boolean | Promise<boolean>;
};

export const UPLOAD_PURPOSE_CONFIG: Record<UploadPurpose, PurposeConfig> = {
	news: {
		allowed: ['DOCUMENT'],
		isPrivate: false,
		needsTarget: false, // la news n'existe pas encore quand on la crée
		folder: () => 'news',
		canUpload: (user) => canManageNews(user.role)
	},
	catDocument: {
		allowed: ['DOCUMENT'],
		isPrivate: true,
		needsTarget: true,
		folder: (catId) => `cats/${catId}/documents`,
		canUpload: (user, catId) => canManageCat(user, catId)
	},
	careDocument: {
		allowed: ['DOCUMENT'],
		isPrivate: true,
		needsTarget: true,
		folder: (catId) => `cats/${catId}/cares`,
		canUpload: (user, catId) => canManageCat(user, catId)
	},
	catGallery: {
		allowed: ['IMAGE', 'VIDEO'],
		isPrivate: false,
		needsTarget: true,
		folder: (catId) => `cats/${catId}/gallery`,
		canUpload: (user, catId) => canManageCat(user, catId)
	}
};
