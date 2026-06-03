import React, { useRef, useState, useMemo, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import {
  ChevronRight, ShoppingCart, Smartphone, Laptop, Tv,
  SlidersHorizontal, ChevronDown, X,
  Wrench, Cpu, HardDrive, Monitor, Coffee, Printer, Camera,
  Disc, Router, Sparkles, Dumbbell, Smile, Home, Paperclip, Watch, Gift, PackageOpen,
  type LucideIcon,
  Bot, Zap, GitCompare, Flame, ArrowRight, BellRing, TrendingUp, LayoutGrid,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { loadPreferences } from "../services/userPreferences";
import { getRecentlyViewed } from "../services/recentlyViewed";
import type { Product } from "../../data/types";
import categories from "../../data/categories.json";
import noutati from "../../data/noutati.json";
import servicii from "../../data/servicii.json";
import products from "../../data/products.json";

const categoryIconMap: Record<string, LucideIcon> = {
  Laptop, Smartphone, Tv, Cpu, HardDrive, Monitor, Coffee, Printer, Camera,
  Disc, Router, Sparkles, Dumbbell, Smile, Home, Paperclip, Watch, Wrench, Gift, PackageOpen,
};

const categoriesWithIcons = categories.map((c) => ({
  ...c,
  icon: categoryIconMap[c.iconName] ?? Laptop,
}));

const quickActions = [
  { id: "recommend", label: "Recomandă ceva", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { id: "laptop", label: "Găsește un Laptop", icon: Laptop, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { id: "gift", label: "Idee de Cadou", icon: Gift, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
  { id: "compare", label: "Compară Produse", icon: GitCompare, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
];

const trendingOrderCounts = [247, 183, 128, 95, 312, 156];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  showSeeAll = true,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div>
        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {showSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-[#E31E24] hover:text-red-700 transition-colors"
        >
          Vezi toate
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ProductScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) setDragged(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragged) { e.stopPropagation(); e.preventDefault(); }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={handleClickCapture}
      className={`flex overflow-x-auto scrollbar-hide px-4 scroll-pl-4 pb-4 gap-3 select-none touch-pan-x ${
        isDragging ? "snap-none cursor-grabbing" : "snap-x snap-mandatory cursor-grab"
      }`}
    >
      {children}
    </div>
  );
}

interface FiltersPanelProps {
  activeFilter: "stoc" | "culoare" | "pret" | null;
  onClose: () => void;
  stoc: "magazin" | "furnizor" | null;
  setStoc: (val: "magazin" | "furnizor" | null) => void;
  culoare: string | null;
  setCuloare: (val: string | null) => void;
  pret: { min: string; max: string };
  setPret: (val: { min: string; max: string }) => void;
}

function FiltersPanel({ activeFilter, onClose, stoc, setStoc, culoare, setCuloare, pret, setPret }: FiltersPanelProps) {
  const isOpen = activeFilter !== null;
  const getTitle = () => {
    if (activeFilter === "stoc") return "Disponibilitate Stoc";
    if (activeFilter === "culoare") return "Culoare";
    if (activeFilter === "pret") return "Preț";
    return "Filtrează";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[101] max-w-md mx-auto p-5 max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">{getTitle()}</h3>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              {activeFilter === "stoc" && (
                <div className="flex flex-col gap-3">
                  {(["magazin", "furnizor"] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => { setStoc(val); onClose(); }}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-colors text-left ${stoc === val ? "border-[#E31E24] text-[#E31E24] bg-red-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {val === "magazin" ? "În stoc magazin" : "În stoc furnizor"}
                    </button>
                  ))}
                </div>
              )}
              {activeFilter === "culoare" && (
                <div className="flex flex-wrap gap-2">
                  {["Alb", "Negru", "Roz", "Albastru", "Verde", "Argintiu"].map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCuloare(c); onClose(); }}
                      className={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-colors ${culoare === c ? "border-[#E31E24] text-[#E31E24] bg-red-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {activeFilter === "pret" && (
                <div>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Minim" value={pret.min}
                      onChange={(e) => setPret({ ...pret, min: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#E31E24] outline-none" />
                    <span className="text-gray-400 font-medium">-</span>
                    <input type="number" placeholder="Maxim" value={pret.max}
                      onChange={(e) => setPret({ ...pret, max: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#E31E24] outline-none" />
                  </div>
                  <button
                    className="w-full bg-[#E31E24] text-white font-bold py-3.5 rounded-xl mt-4 shadow-sm hover:bg-red-700 transition-colors"
                    onClick={onClose}
                  >
                    Aplică Prețul
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main HomeFeed ─────────────────────────────────────────────────────────────

interface HomeFeedProps {
  isLoading?: boolean;
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  onSeeAllClick?: (title: string, products: any[]) => void;
  onAIClick?: () => void;
}

const getProductsForCategory = (category: string) =>
  products.filter((p) => p.category && p.category.toLowerCase().includes(category));

export function HomeFeed({ isLoading, onProductClick, onAddToCart, onSeeAllClick, onAIClick }: HomeFeedProps) {
  const [activeFilter, setActiveFilter] = useState<"stoc" | "culoare" | "pret" | null>(null);
  const [stoc, setStoc] = useState<"magazin" | "furnizor" | null>(null);
  const [culoare, setCuloare] = useState<string | null>(null);
  const [pret, setPret] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => getRecentlyViewed());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const hasActiveFilters = stoc !== null || culoare !== null || pret.min !== "" || pret.max !== "";

  const handleResetFilters = () => {
    setStoc(null);
    setCuloare(null);
    setPret({ min: "", max: "" });
  };

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

  const hasPersonalization = useMemo(() => {
    const prefs = loadPreferences();
    return prefs && (prefs.selectedCategories.length > 0 || prefs.selectedBrands.length > 0);
  }, []);

  const trackedProducts = useMemo(() =>
    products.slice(0, 4).map((p) => ({
      ...p,
      priceDrop: Math.floor((p.id.charCodeAt(1) % 15) + 3),
    })),
  []);

  const trendingProducts = useMemo(() =>
    products.slice(4, 10).map((p, i) => ({
      ...p,
      ordersCount: trendingOrderCounts[i] ?? 50,
    })),
  []);

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4 pb-24 bg-[#F8F8FA]">
        <div className="mx-4 h-32 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="flex px-4 gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-2xl" />
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
    <div className="pb-6 bg-[#F8F8FA] min-h-full flex flex-col gap-4 relative">
      <FiltersPanel
        activeFilter={activeFilter}
        onClose={() => setActiveFilter(null)}
        stoc={stoc} setStoc={setStoc}
        culoare={culoare} setCuloare={setCuloare}
        pret={pret} setPret={setPret}
      />

      {/* ── 1. AI Assistant Hero Card ─────────────────────────────────── */}
      <section className="px-4 pt-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #FFF7F9 0%, #F8F2FF 100%)" }}
          onClick={onAIClick}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-[#FF6B6B] flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-snug">Bună ziua 👋</h2>
              <p className="text-sm font-medium text-gray-700 mt-0.5">Cum te pot ajuta azi?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Asistentul tău inteligent de cumpărături</p>
            </div>

            {/* CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); onAIClick?.(); }}
              className="shrink-0 bg-white text-[#E31E24] font-bold text-sm px-4 py-2.5 rounded-full shadow-[0_2px_8px_rgba(227,30,36,0.15)] hover:bg-red-50 transition-colors border border-red-100"
            >
              Ask AI
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── 2. Quick Actions ──────────────────────────────────────────── */}
      <section className="px-4">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onClick={onAIClick}
                className={`flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border ${action.border} active:scale-95 transition-all`}
              >
                <div className={`w-9 h-9 ${action.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── 3. Categories ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl mx-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="pt-4 pb-1">
          <SectionHeader title="Categorii" showSeeAll={false} />
        </div>
        <ProductScroll>
          {categoriesWithIcons.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="flex flex-col items-center gap-2 shrink-0 snap-start w-[80px] cursor-pointer"
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                  onSeeAllClick?.(cat.name, getProductsForCategory(cat.id));
                }}
              >
                <div className={`w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                  isSelected
                    ? "bg-[#E31E24] border-2 border-red-300"
                    : `${cat.bg} border ${cat.border}`
                }`}>
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-white" : cat.color}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`text-[10px] font-semibold text-center leading-tight h-7 flex items-start justify-center line-clamp-2 px-0.5 ${
                  isSelected ? "text-[#E31E24]" : "text-gray-600"
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </ProductScroll>
      </section>

      {/* ── Filter Pills ──────────────────────────────────────────────── */}
      <div className="px-4 flex items-center gap-2 overflow-x-auto scrollbar-hide -mt-2">
        {hasActiveFilters ? (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-semibold shrink-0 shadow-sm"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold shrink-0 text-gray-500">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrează:
          </span>
        )}
        {[
          {
            key: "stoc" as const,
            label: stoc === "magazin" ? "În stoc magazin" : stoc === "furnizor" ? "În stoc furnizor" : "Stoc",
            active: !!stoc,
          },
          { key: "culoare" as const, label: culoare || "Culoare", active: !!culoare },
          {
            key: "pret" as const,
            label: pret.min || pret.max ? `${pret.min || 0} – ${pret.max || "∞"} Lei` : "Preț",
            active: !!(pret.min || pret.max),
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold shrink-0 shadow-sm transition-colors ${
              f.active
                ? "bg-red-50 border-[#E31E24] text-[#E31E24]"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f.label} <ChevronDown className="w-3 h-3" />
          </button>
        ))}
      </div>

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
                className="w-[180px] shrink-0 snap-start cursor-pointer group"
                onClick={() => onProductClick?.(product)}
              >
                <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-[120px] bg-gray-50 flex items-center justify-center p-4">
                    <img
                      src={(product.images ?? (product.image ? [product.image] : []))[0]}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 h-8">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#E31E24]">
                        {product.price.toLocaleString("ro-RO")} Lei
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                        className="w-7 h-7 rounded-full bg-[#E31E24] flex items-center justify-center shadow-sm hover:bg-red-700 transition-colors"
                        aria-label="Adaugă în coș"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-white" />
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
          title="Recomandate pentru tine"
          subtitle={hasPersonalization ? "Personalizat după preferințele tale" : undefined}
          onSeeAll={() => onSeeAllClick?.("Recomandate pentru tine", personalizedOferte)}
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
                className="w-[170px] shrink-0 snap-start cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <div className="relative bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 h-full">
                  {discount && (
                    <div className="absolute top-2 left-2 z-10 bg-[#E31E24] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      -{discount}%
                    </div>
                  )}
                  <div className="h-[130px] bg-gray-50 flex items-center justify-center p-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>
                  <div className="p-3 pb-4">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 h-8">{product.name}</p>
                    <div className="flex flex-col gap-0.5 mb-3">
                      {product.oldPrice && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                          {product.oldPrice.toLocaleString("ro-RO")} Lei
                        </span>
                      )}
                      <span className="text-[15px] font-black text-[#E31E24] leading-none">
                        {product.price.toLocaleString("ro-RO")} Lei
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                      className="w-full py-1.5 bg-[#E31E24] text-white text-[11px] font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Adaugă în coș
                    </button>
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
          {/* Green – Fast Delivery */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            style={{ background: "linear-gradient(135deg, #00C853 0%, #1DE9B6 100%)" }}
          >
            <div className="p-4 flex flex-col h-[140px] justify-between">
              <div>
                <div className="text-2xl mb-1">🚀</div>
                <h3 className="text-white font-black text-sm leading-tight">Livrare rapidă</h3>
                <p className="text-green-100 text-[10px] mt-1 leading-snug">Comenzi livrate în aceeași zi</p>
              </div>
              <button className="self-start w-7 h-7 bg-white/25 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Purple – Deals */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            style={{ background: "linear-gradient(135deg, #7B1FA2 0%, #CE93D8 100%)" }}
          >
            <div className="p-4 flex flex-col h-[140px] justify-between">
              <div>
                <div className="text-2xl mb-1">🏷️</div>
                <h3 className="text-white font-black text-sm leading-tight">Reduceri & Oferte</h3>
                <p className="text-purple-200 text-[10px] mt-1 leading-snug">Până la -50% la mii de produse</p>
              </div>
              <button
                onClick={() => onSeeAllClick?.("Reduceri & Oferte", personalizedOferte)}
                className="self-start w-7 h-7 bg-white/25 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. Tracked Products ───────────────────────────────────────── */}
      <section>
        <SectionHeader title="Produse urmărite" subtitle="Monitorizăm prețurile pentru tine" showSeeAll={false} />
        <ProductScroll>
          {trackedProducts.map((product) => (
            <div
              key={product.id}
              className="w-[200px] shrink-0 snap-start cursor-pointer"
              onClick={() => onProductClick?.(product)}
            >
              <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 p-3">
                <div className="flex gap-3 items-start">
                  {/* Image */}
                  <div className="w-[60px] h-[60px] bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
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
                    <div className="flex flex-col gap-0.5">
                      {product.oldPrice && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                          {product.oldPrice.toLocaleString("ro-RO")} Lei
                        </span>
                      )}
                      <span className="text-sm font-black text-[#E31E24] leading-none">
                        {product.price.toLocaleString("ro-RO")} Lei
                      </span>
                    </div>
                  </div>
                  {/* Bell */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toast.success("Alertă activată pentru produs!"); }}
                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-[#E31E24] hover:text-white transition-colors shrink-0"
                  >
                    <BellRing className="w-3.5 h-3.5 text-[#E31E24] group-hover:text-white" />
                  </button>
                </div>
                {/* Price drop badge */}
                <div className="mt-2.5 flex items-center gap-1.5 bg-green-50 rounded-lg px-2.5 py-1.5">
                  <TrendingUp className="w-3 h-3 text-green-600 rotate-180" />
                  <span className="text-[10px] font-bold text-green-700">↓ Prețul a scăzut {product.priceDrop}%</span>
                </div>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* ── 8. Trending Purchases ─────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Oamenii cumpără"
          subtitle="Cele mai populare produse azi"
          onSeeAll={() => onSeeAllClick?.("Oamenii cumpără", trendingProducts)}
        />
        <ProductScroll>
          {trendingProducts.map((product) => {
            const discount =
              product.oldPrice && product.price < product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : null;
            return (
              <div
                key={product.id}
                className="w-[160px] shrink-0 snap-start cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <div className="relative bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  {/* Trending badge */}
                  <div className="absolute top-2 right-2 z-10 bg-orange-50 border border-orange-200 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    🔥 {product.ordersCount}
                  </div>
                  {discount && (
                    <div className="absolute top-2 left-2 z-10 bg-[#E31E24] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      -{discount}%
                    </div>
                  )}
                  <div className="h-[110px] bg-gray-50 flex items-center justify-center p-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold text-gray-700 line-clamp-2 leading-snug h-8 mb-1">{product.name}</p>
                    <span className="text-sm font-black text-[#E31E24]">
                      {product.price.toLocaleString("ro-RO")} Lei
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </ProductScroll>
      </section>

      {/* ── 9. Noutăți ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl mx-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden py-5">
        <SectionHeader title="Noutăți" showSeeAll={false} />
        <ProductScroll>
          {noutati.map((item) => (
            <div
              key={item.id}
              className="relative w-[260px] h-[200px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-base font-black mb-0.5 leading-tight">{item.title}</h3>
                <p className="text-xs font-medium text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* ── 10. Servicii ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl mx-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden py-5">
        <SectionHeader title="Servicii evoMAG" subtitle="Alege serviciul dorit" showSeeAll={false} />
        <ProductScroll>
          {servicii.map((srv) => (
            <div
              key={srv.id}
              className="w-[155px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-300 bg-white"
              onClick={() => onSeeAllClick?.(srv.title, srv.subServices as any)}
            >
              <div className="h-[90px] w-full overflow-hidden bg-gray-50">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-3 flex flex-col justify-between h-[90px]">
                <div>
                  <h4 className="font-bold text-[11px] text-gray-900 leading-tight mb-1 group-hover:text-[#E31E24] transition-colors line-clamp-2">
                    {srv.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-snug">{srv.description}</p>
                </div>
                <div className="text-[10px] font-bold text-[#E31E24] flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  Vezi opțiuni <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>
    </div>
  );
}
