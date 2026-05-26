const STORAGE_KEY = "evomag_user_preferences";

export interface UserPreferences {
  selectedCategories: string[];
  selectedBrands: string[];
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function loadPreferences(): UserPreferences | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return null;
  }
}

export function clearPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}
