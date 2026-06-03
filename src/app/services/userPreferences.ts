const STORAGE_KEY = "evomag_user_preferences";

export interface UserPreferences {
  selectedCategories: string[];
  selectedBrands: string[];
  selectedPriorities: string[];
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function loadPreferences(): UserPreferences | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      selectedCategories: parsed.selectedCategories ?? [],
      selectedBrands: parsed.selectedBrands ?? [],
      selectedPriorities: parsed.selectedPriorities ?? [],
    };
  } catch {
    return null;
  }
}

export function clearPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}
