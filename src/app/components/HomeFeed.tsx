import React, { useMemo, useEffect, useState } from "react";
import { ProductScroll } from "./ProductScroll";
import { Skeleton } from "./ui/skeleton";
import {
  ChevronRight, ShoppingCart, Smartphone, Laptop, Tv,
  Sparkles, Home, Gift,
  GitCompare, ArrowRight, Bell, TrendingDown, LayoutGrid, Gamepad2, Truck, Tag, Heart,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { loadPreferences } from "../services/userPreferences";
import { getRecentlyViewed } from "../services/recentlyViewed";
import { getAuthUser } from "../services/auth";
import { toggleWishlist, getWishlist } from "../services/wishlist";
import type { Product } from "../../data/types";
import products from "../../data/products.json";

const DISPLAY_CATEGORIES = [
  { id: "phones", name: "Telefoane", icon: Smartphone },
  { id: "laptops", name: "Laptopuri", icon: Laptop },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "smart-home", name: "Smart Home", icon: Home },
  { id: "tv-audio", name: "TV & Audio", icon: Tv },
  { id: "toate", name: "Toate categoriile", icon: LayoutGrid },
];

const quickActions = [
  { id: "recommend", label: "Recomandă-mi ceva nou", icon: Sparkles },
  { id: "laptop", label: "Vreau un laptop", icon: Laptop },
  { id: "gift", label: "Caut un cadou", icon: Gift },
  { id: "compare", label: "Compară produse", icon: GitCompare },
];

const trendingOrderCounts = [128, 93, 81, 67, 49];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  showSeeAll = true,
  onSeeAll,
}: {
  title: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">{title}</h2>
      {showSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-[#E31E24] hover:text-red-700 transition-colors"
        >
          Vezi toate
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Main HomeFeed ─────────────────────────────────────────────────────────────

interface HomeFeedProps {
  isLoading?: boolean;
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  onSeeAllClick?: (title: string, products: any[], catId?: string) => void;
  onAIClick?: () => void;
  onAIQuickAction?: (prompt: string) => void;
}

const getProductsForCategory = (category: string) =>
  products.filter((p) => p.category && p.category.toLowerCase().includes(category));

export function HomeFeed({ isLoading, onProductClick, onAddToCart, onSeeAllClick, onAIClick, onAIQuickAction }: HomeFeedProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => getRecentlyViewed());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(
    () => new Set(getWishlist().map((p) => p.id))
  );

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const nowInWishlist = toggleWishlist(product);
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      nowInWishlist ? next.add(product.id) : next.delete(product.id);
      return next;
    });
    toast.success(nowInWishlist ? "Adăugat la favorite!" : "Eliminat din favorite!");
  };

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const personalizedOferte = useMemo(() => {
    const prefs = loadPreferences();
    const allProducts = products as Array<typeof products[0] & { category?: string; brand?: string }>;
    if (!prefs || (prefs.selectedCategories.length === 0 && prefs.selectedBrands.length === 0)) {
      return allProducts;
    }
    const { selectedCategories, selectedBrands } = prefs;
    return allProducts.filter((p) => {
      const brandMatch = p.brand && selectedBrands.includes(p.brand);
      const categoryMatch = p.category && selectedCategories.includes(p.category);
      return brandMatch || categoryMatch;
    });
  }, []);

  const trackedProducts = useMemo(() =>
    products.slice(0, 3).map((p) => ({
      ...p,
      priceDrop: Math.floor((p.id.charCodeAt(1) % 15) + 3),
    })),
  []);

  const discountedProducts = useMemo(() =>
    (products as any[]).filter((p) => p.oldPrice && p.price < p.oldPrice),
  []);

  const trendingProducts = useMemo(() =>
    products.slice(4, 9).map((p, i) => ({
      ...p,
      ordersCount: trendingOrderCounts[i] ?? 49,
    })),
  []);

  const authUser = useMemo(() => getAuthUser(), []);
  const firstName = authUser?.firstName ?? "tu";

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4 pb-24 bg-white">
        <div className="mx-4 h-32 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="flex px-4 gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-36 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex px-4 gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-14 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex px-4 gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-44 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6 bg-white min-h-full flex flex-col gap-5 relative">

      {/* ── 1. AI Assistant Hero Card ─────────────────────────────────── */}
      <section className="px-4 pt-4">
        <div
          className="rounded-3xl p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FFF0F0 0%, #FDF4FF 100%)" }}
          role="button"
          tabIndex={0}
          aria-label="Deschide asistentul EvoMi"
        >
          <div className="flex items-center gap-3">
            {/* Robot mascot */}
            <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden">
              <img
                src="/evomag-poc/welcome_robot.png"
                alt="EvoMi"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-black text-gray-900 leading-tight">
                Bună, {firstName}! 👋
              </h2>
              <p className="text-[14px] font-semibold text-gray-700 mt-0.5">
                Cu ce te pot ajuta astăzi?
              </p>
              <p className="text-[11px] font-medium text-[#E31E24] mt-1">
                EvoMi, asistentul tău de shopping inteligent
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); onAIClick?.(); }}
              className="shrink-0 bg-white text-[#E31E24] font-bold text-[12px] px-3 py-2 rounded-full border border-red-200 flex items-center gap-1.5 shadow-sm hover:bg-red-50 transition-colors whitespace-nowrap"
              aria-label="Întreabă EvoMi"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Întreabă EvoMi
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-3 pb-1" onClick={(e) => e.stopPropagation()}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  onClick={(e) => { e.stopPropagation(); onAIQuickAction ? onAIQuickAction(action.label) : onAIClick?.(); }}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-red-100 rounded-full text-[12px] font-semibold text-gray-700 shrink-0 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all shadow-sm"
                >
                  <Icon className="w-4 h-4 text-[#E31E24]" strokeWidth={1.5} />
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Categories ─────────────────────────────────────────────── */}
      <section>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide px-4 pb-2">
          {DISPLAY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-2 shrink-0 w-[72px] cursor-pointer"
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                  if (cat.id !== "toate") {
                    onSeeAllClick?.(cat.name, getProductsForCategory(cat.id), cat.id);
                  } else {
                    onSeeAllClick?.(cat.name, products as any[]);
                  }
                }}
                aria-label={cat.name}
                aria-pressed={isSelected}
              >
                <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? "bg-[#E31E24]"
                    : "bg-gray-100"
                }`}>
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-white" : "text-gray-500"}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${
                  isSelected ? "text-[#E31E24]" : "text-gray-500"
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. Continue Shopping (Recently Viewed) ────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section>
          <SectionHeader
            title="Continuă de unde ai rămas"
            onSeeAll={() => onSeeAllClick?.("Văzute recent", recentlyViewed)}
          />
          <ProductScroll>
            {recentlyViewed.map((product) => (
              <div
                key={product.id}
                className="w-[160px] shrink-0 snap-start cursor-pointer group"
                onClick={() => onProductClick?.(product)}
              >
                <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                  <button
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    aria-label="Adaugă la favorite"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${wishlistedIds.has(product.id) ? "fill-[#E31E24] text-[#E31E24]" : "text-gray-400"}`}
                    />
                  </button>
                  <div className="h-[120px] bg-white flex items-center justify-center p-3">
                    <img
                      src={(product.images ?? (product.image ? [product.image] : []))[0]}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 h-8">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-black text-[#E31E24]">
                        {product.price.toLocaleString("ro-RO")} Lei
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                        className="w-7 h-7 rounded-full border border-[#E31E24] flex items-center justify-center hover:bg-[#E31E24] hover:text-white text-[#E31E24] transition-colors"
                        aria-label="Adaugă în coș"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ProductScroll>
        </section>
      )}

      {/* ── 5. Recommended for You ────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Recomandat pentru tine"
          onSeeAll={() => onSeeAllClick?.("Recomandat pentru tine", personalizedOferte)}
        />
        <ProductScroll>
          {personalizedOferte.slice(0, 10).map((product) => {
            const discount =
              product.oldPrice && product.price < product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : null;
            return (
              <div
                key={product.id}
                className="w-[158px] shrink-0 snap-start cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  {discount && (
                    <div className="absolute top-2 left-2 z-10 bg-[#E31E24] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>
                  )}
                  <button
                    onClick={(e) => handleToggleWishlist(e, product as Product)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    aria-label="Adaugă la favorite"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${wishlistedIds.has(product.id) ? "fill-[#E31E24] text-[#E31E24]" : "text-gray-400"}`}
                    />
                  </button>
                  <div className="h-[130px] bg-white flex items-center justify-center p-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5 h-8">{product.name}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        {product.oldPrice && (
                          <span className="text-[10px] text-gray-400 line-through leading-none block">
                            {product.oldPrice.toLocaleString("ro-RO")} Lei
                          </span>
                        )}
                        <span className="text-[14px] font-black text-[#E31E24] leading-none">
                          {product.price.toLocaleString("ro-RO")} Lei
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                        className="w-7 h-7 rounded-full border border-[#E31E24] flex items-center justify-center hover:bg-[#E31E24] hover:text-white text-[#E31E24] transition-colors"
                        aria-label="Adaugă în coș"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ProductScroll>
      </section>

      {/* ── 6. Promotional Banners ────────────────────────────────────── */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Green – Next-day delivery */}
          <div
            className="rounded-2xl overflow-hidden cursor-pointer bg-[#EDFAF2] relative min-h-[110px] flex flex-col justify-between p-4"
            onClick={() => onSeeAllClick?.("Livrare mâine", products as any[])}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-[13px] text-gray-900 leading-tight">Livrare mâine</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Comandă până la 16:00<br />și primești mâine</p>
              </div>
            </div>
            <button
              className="self-end mt-2 w-7 h-7 shrink-0 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              aria-label="Livrare mâine"
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

          </div>

          {/* Purple – Better prices */}
          <div
            className="rounded-2xl overflow-hidden cursor-pointer bg-[#F3EEFF] relative min-h-[110px] flex flex-col justify-between p-4"
            onClick={() => onSeeAllClick?.("Prețuri mai bune", discountedProducts)}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-[13px] text-gray-900 leading-tight">Prețuri mai bune</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Produse cu reduceri<br />de până la -40%</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSeeAllClick?.("Prețuri mai bune", discountedProducts); }}
              className="self-end mt-2 w-7 h-7 shrink-0 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
              aria-label="Prețuri mai bune"
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

          </div>
        </div>
      </section>

      {/* ── 7. Tracked Products ───────────────────────────────────────── */}
      <section>
        <SectionHeader title="Produse urmărite" onSeeAll={() => onSeeAllClick?.("Produse urmărite", trackedProducts)} />
        <ProductScroll>
          {trackedProducts.map((product) => (
            <div
              key={product.id}
              className="w-[200px] shrink-0 snap-start cursor-pointer"
              onClick={() => onProductClick?.(product)}
            >
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 p-3">
                <div className="flex gap-3 items-center">
                  {/* Image */}
                  <div className="w-[52px] h-[52px] bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply p-1"
                      draggable={false}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{product.name}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown className="w-3 h-3 text-green-600" />
                      <span className="text-[10px] font-bold text-green-600">A scăzut cu {product.priceDrop}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-[#E31E24] leading-none">
                        {product.price.toLocaleString("ro-RO")} Lei
                      </span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-gray-400 line-through leading-none mt-0.5">
                          {product.oldPrice.toLocaleString("ro-RO")} Lei
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Bell */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toast.success("Alertă activată pentru produs!"); }}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 transition-colors shrink-0"
                    aria-label="Activează alertă de preț"
                  >
                    <Bell className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* ── 8. Se cumpără acum (Trending) ────────────────────────────── */}
      <section>
        <SectionHeader
          title="Se cumpără acum"
          onSeeAll={() => onSeeAllClick?.("Se cumpără acum", trendingProducts)}
        />
        <ProductScroll>
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="w-[110px] shrink-0 snap-start cursor-pointer flex flex-col items-center gap-2"
              onClick={() => onProductClick?.(product)}
            >
              <div className="relative w-full">
                <div className="bg-white rounded-2xl border border-gray-100 h-[90px] flex items-center justify-center p-3 hover:shadow-md transition-all duration-200">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full object-contain mix-blend-multiply"
                    draggable={false}
                  />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-500 text-center">
                🔥 {product.ordersCount} comenzi
              </span>
            </div>
          ))}
        </ProductScroll>
      </section>

    </div>
  );
}
