export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  badge?: string;
  discount?: string;
  isNew?: boolean;
  heroBannerId?: string;
  priceDropped?: boolean;
  /** welcome-screen category id (e.g. "gaming", "phones", "laptops", "tv-audio", "pc", "smart-home") */
  category?: string;
  /** brand name matching welcome-screen brand options */
  brand?: string;
}
