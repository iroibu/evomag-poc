import type { Product } from "../../data/types";

const STORAGE_KEY = "evomag_wishlist";

export function getWishlist(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().some((p) => p.id === productId);
}

export function addToWishlist(product: Product): void {
  const current = getWishlist();
  if (!current.some((p) => p.id === product.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, product]));
  }
}

export function removeFromWishlist(productId: string): void {
  const updated = getWishlist().filter((p) => p.id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function toggleWishlist(product: Product): boolean {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return false;
  } else {
    addToWishlist(product);
    return true;
  }
}
