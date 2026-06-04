const AUTH_KEY = "evomag_auth";

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  rememberMe: boolean;
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return getAuthUser() !== null;
}
