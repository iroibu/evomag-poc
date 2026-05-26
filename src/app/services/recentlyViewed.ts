import type { Product } from "../../data/types";

const STORAGE_KEY = "evomag_recently_viewed";
const MAX_ITEMS = 10;

export function addRecentlyViewed(product: Product): void {
  const current = getRecentlyViewed();
  const filtered = current.filter((p) => p.id !== product.id);
  const updated = [product, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed(): void {
  localStorage.removeItem(STORAGE_KEY);
}
