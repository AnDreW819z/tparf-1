import type { User } from '@/shared/api/services/auth';

const ADMIN_ROLE = 'Administrator';
const BRAND_OWNER_ROLE = 'BrandOwner';

type RoleAwareUser = User & {
	role?: string | null;
};

function hasRole(user: RoleAwareUser | null | undefined, role: string): boolean {
	if (!user) return false;
	if (Array.isArray(user.roles) && user.roles.includes(role)) return true;
	return user.role === role;
}

export function isAdministrator(user: User | null | undefined): boolean {
	return hasRole(user, ADMIN_ROLE);
}

export function isBrandOwner(user: User | null | undefined): boolean {
	return hasRole(user, BRAND_OWNER_ROLE);
}

export function canAccessAdminPanel(user: User | null | undefined): boolean {
	return isAdministrator(user) || isBrandOwner(user);
}
