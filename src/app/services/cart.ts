import type { CartItemType } from "../components/CartScreen";

const STORAGE_KEY = "evomag_cart";

export function getCart(): CartItemType[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItemType[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItemType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  localStorage.removeItem(STORAGE_KEY);
}
