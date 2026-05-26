export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  badge?: string;
  discount?: string;
  isNew?: boolean;
  heroBannerId?: string;
  priceDropped?: boolean;
  /** welcome-screen category id (e.g. "gaming", "phones", "laptops", "tv", "pc", "smarthome") */
  category?: string;
  /** brand name matching welcome-screen brand options */
  brand?: string;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image1: string;
  image2: string;
  badge: string;
}

export interface SubService {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  subServices: SubService[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  gradient: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bg: string;
  border: string;
}

export interface Equipment {
  id: string;
  name: string;
  purchaseDate: string;
  upgradeScore: number;
  recommendation: string;
  productId: string;
}

export interface ProductsData {
  categories: Category[];
  heroBanners: HeroBanner[];
  noutati: NewsItem[];
  servicii: Service[];
  bundles: Bundle[];
  products: Product[];
  aiRecommendations: Product[];
  equipment: Equipment[];
}
