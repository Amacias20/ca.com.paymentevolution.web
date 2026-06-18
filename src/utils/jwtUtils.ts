import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes the JWT stored in localStorage and returns the payload.
 * Returns null if no token or invalid token.
 */
export const getDecodedToken = (): JwtPayload | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

/**
 * Returns the username from the token payload.
 */
export const getTokenUser = (): string => {
  const payload = getDecodedToken();
  return payload?.name ?? payload?.sub ?? payload?.email ?? 'User';
};

/**
 * Returns the roles from the token. Always returns an array.
 */
export const getTokenRoles = (): string[] => {
  const payload = getDecodedToken();
  if (!payload?.role) return [];
  return Array.isArray(payload.role) ? payload.role : [payload.role];
};

/**
 * Checks if the token is expired.
 */
export const isTokenExpired = (): boolean => {
  const payload = getDecodedToken();
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
};

/**
 * Checks if the current user has a given role.
 */
export const hasRole = (role: string): boolean => {
  return getTokenRoles().includes(role);
};
