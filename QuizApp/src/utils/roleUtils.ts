import type { User } from '../types/user';

/**
 * Check if user has a specific role
 * @param user - The decoded JWT user object
 * @param role - The role to check for
 * @returns true if user has the role, false otherwise
 */
export const hasRole = (user: User | null, role: string): boolean => {
    if (!user) return false;

    if (!user.role) return false;

    // Role can be a string (single role) or an array of strings (multiple roles)
    if (typeof user.role === 'string') {
        return user.role === role;
    }

    return user.role.includes(role);
};

/**
 * Check if user is an admin
 * @param user - The decoded JWT user object
 * @returns true if user has Admin role, false otherwise
 */
export const isAdmin = (user: User | null): boolean => {
    return hasRole(user, 'Admin');
};

/**
 * Check if role is  admin
 * @param string - The passed role, can be null
 * @returns true if user has Admin role, false otherwise
 */
export const isAdminRole = (role: string | undefined): boolean => {
  return role === 'Admin';
};

/**
 * Check if user is a regular user
 * @param user - The decoded JWT user object
 * @returns true if user has User role, false otherwise
 */
export const isUser = (user: User | null): boolean => {
    return hasRole(user, 'User');
};

/**
 * Get all roles for a user
 * @param user - The decoded JWT user object
 * @returns Array of role names
 */
export const getUserRoles = (user: User | null): string[] => {
    if (!user || !user.role) return [];

    if (typeof user.role === 'string') {
        console.log('User role is a string:', user.role);
        return [user.role];
    }

    console.log('User roles are an array:', user.role);
    return user.role;
};
