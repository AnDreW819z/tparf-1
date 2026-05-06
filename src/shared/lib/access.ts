import type { User } from '@/shared/api/services/auth';

const ADMIN_ROLE = 'Administrator';
const BRAND_OWNER_ROLE = 'BrandOwner';

export function isAdministrator(user: User | null | undefined): boolean {
	return !!user?.roles?.includes(ADMIN_ROLE);
}

export function isBrandOwner(user: User | null | undefined): boolean {
	return !!user?.roles?.includes(BRAND_OWNER_ROLE);
}

export function canAccessAdminPanel(user: User | null | undefined): boolean {
	return isAdministrator(user) || isBrandOwner(user);
}
