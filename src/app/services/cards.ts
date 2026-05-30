const STORAGE_KEY = "evomag_cards";

export interface PaymentCard {
  id: string;
  number: string;
  expiry: string;
  type: string;
  isMain: boolean;
}

const DEFAULT_CARDS: PaymentCard[] = [
  { id: "c1", number: "**** **** **** 4242", expiry: "12/26", type: "Visa", isMain: true },
  { id: "c2", number: "**** **** **** 5555", expiry: "08/25", type: "Mastercard", isMain: false },
];

export function seedCards(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveCards(DEFAULT_CARDS);
  } else {
    try {
      const parsed = JSON.parse(raw) as PaymentCard[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        saveCards(DEFAULT_CARDS);
      }
    } catch {
      saveCards(DEFAULT_CARDS);
    }
  }
}

export function loadCards(): PaymentCard[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_CARDS;
  try {
    return JSON.parse(raw) as PaymentCard[];
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: PaymentCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function addCard(card: Omit<PaymentCard, "id">): PaymentCard[] {
  const cards = loadCards();
  const newCard: PaymentCard = { ...card, id: Date.now().toString() };
  const updated = [...cards, newCard];
  saveCards(updated);
  return updated;
}

export function setMainCard(id: string): PaymentCard[] {
  const cards = loadCards();
  const updated = cards.map(c => ({ ...c, isMain: c.id === id }));
  saveCards(updated);
  return updated;
}

export function deleteCard(id: string): PaymentCard[] {
  const cards = loadCards();
  const updated = cards.filter(c => c.id !== id);
  // if deleted card was main, promote first remaining card
  if (updated.length > 0 && !updated.some(c => c.isMain)) {
    updated[0].isMain = true;
  }
  saveCards(updated);
  return updated;
}
