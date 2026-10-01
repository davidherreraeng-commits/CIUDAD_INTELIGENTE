import { useAuth } from '../provider/useAuth';

export function usePermission () {
  const { authUser } = useAuth();

  const hasPermission = (requiredRoles = []) => {
    if (!authUser || !authUser.roleId) return false;
    const normalizedRoleName = String(authUser.roleName || '').trim().toLocaleLowerCase();
    return requiredRoles.includes(authUser.roleId) || requiredRoles.some(
      (role) => typeof role === 'string' && role.trim().toLocaleLowerCase() === normalizedRoleName
    );
  };

  return { hasPermission };
}
