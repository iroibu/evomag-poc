const STORAGE_KEY = "evomag_addresses";
const SEED_VERSION = "v2";
const VERSION_KEY = "evomag_addresses_version";

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  codPostal: string;
  isMain: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  { id: "a1", name: "Acasă", street: "Strada Primăverii, Nr. 14, Bl. A", city: "București, Sector 1", codPostal: "011972", isMain: true },
  { id: "a2", name: "Birou", street: "Bulevardul Pipera, Nr. 1", city: "București, Sector 2", codPostal: "077190", isMain: false },
];

export function seedAddresses(): void {
  const version = localStorage.getItem(VERSION_KEY);
  if (version !== SEED_VERSION) {
    saveAddresses(DEFAULT_ADDRESSES);
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
    return;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveAddresses(DEFAULT_ADDRESSES);
  } else {
    try {
      const parsed = JSON.parse(raw) as Address[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        saveAddresses(DEFAULT_ADDRESSES);
      }
    } catch {
      saveAddresses(DEFAULT_ADDRESSES);
    }
  }
}

export function loadAddresses(): Address[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ADDRESSES;
  try {
    return JSON.parse(raw) as Address[];
  } catch {
    return DEFAULT_ADDRESSES;
  }
}

export function saveAddresses(addresses: Address[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

export function addAddress(address: Omit<Address, "id">): Address[] {
  const addresses = loadAddresses();
  const newAddress: Address = { ...address, id: Date.now().toString() };
  const updated = [...addresses, newAddress];
  saveAddresses(updated);
  return updated;
}

export function updateAddress(id: string, changes: Partial<Omit<Address, "id">>): Address[] {
  const addresses = loadAddresses();
  const updated = addresses.map(a => a.id === id ? { ...a, ...changes } : a);
  saveAddresses(updated);
  return updated;
}

export function deleteAddress(id: string): Address[] {
  const addresses = loadAddresses();
  const remaining = addresses.filter(a => a.id !== id);
  // If the deleted address was main, promote the first remaining one
  if (remaining.length > 0 && !remaining.some(a => a.isMain)) {
    remaining[0] = { ...remaining[0], isMain: true };
  }
  saveAddresses(remaining);
  return remaining;
}

export function setMainAddress(id: string): Address[] {
  const addresses = loadAddresses();
  const updated = addresses.map(a => ({ ...a, isMain: a.id === id }));
  saveAddresses(updated);
  return updated;
}
