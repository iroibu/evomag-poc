import React, { useRef, useState, useMemo, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import { ChevronRight, Clock, ShoppingCart, Smartphone, Laptop, Tv, Gamepad2, Heart, Percent, Thermometer, SlidersHorizontal, ChevronDown, X, RefreshCcw, ShieldCheck, Wrench, Truck, Cpu, HardDrive, Monitor, Coffee, Printer, Camera, Disc, Router, Sparkles, Dumbbell, Smile, Home, Paperclip, Watch, Gift, PackageOpen, type LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { loadPreferences } from "../services/userPreferences";
import { getRecentlyViewed } from "../services/recentlyViewed";
import type { Product } from "../../data/types";
import categories from "../../data/categories.json";
import heroBanners from "../../data/heroBanners.json";
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

function SectionHeader({ title, subtitle, showSeeAll = true, onSeeAll }: { title: string, subtitle?: string, showSeeAll?: boolean, onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {showSeeAll && (
        <button onClick={onSeeAll} className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
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

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) setDragged(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragged) {
      e.stopPropagation();
      e.preventDefault();
    }
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[101] max-w-md mx-auto p-5 max-h-[85vh] overflow-y-auto shadow-2xl"
          >
             <div className="flex items-center justify-between mb-5">
               <h3 className="text-xl font-bold">{getTitle()}</h3>
               <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="space-y-6">
               {activeFilter === "stoc" && (
                 <div>
                   <div className="flex flex-col gap-3">
                     <button 
                       onClick={() => { setStoc("magazin"); onClose(); }}
                       className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-colors text-left ${stoc === 'magazin' ? 'border-[#E31E24] text-[#E31E24] bg-red-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                     >
                       În stoc magazin
                     </button>
                     <button 
                       onClick={() => { setStoc("furnizor"); onClose(); }}
                       className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-colors text-left ${stoc === 'furnizor' ? 'border-[#E31E24] text-[#E31E24] bg-red-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                     >
                       În stoc furnizor
                     </button>
                   </div>
                 </div>
               )}
               
               {activeFilter === "culoare" && (
                 <div>
                   <div className="flex flex-wrap gap-2">
                     {['Alb', 'Negru', 'Roz', 'Albastru', 'Verde', 'Argintiu'].map(c => (
                       <button 
                         key={c} 
                         onClick={() => { setCuloare(c); onClose(); }}
                         className={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-colors ${culoare === c ? 'border-[#E31E24] text-[#E31E24] bg-red-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                       >
                         {c}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
               
               {activeFilter === "pret" && (
                 <div>
                   <div className="flex items-center gap-3">
                     <input 
                       type="number" 
                       placeholder="Minim" 
                       value={pret.min}
                       onChange={(e) => setPret({ ...pret, min: e.target.value })}
                       className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#E31E24] outline-none" 
                     />
                     <span className="text-gray-400 font-medium">-</span>
                     <input 
                       type="number" 
                       placeholder="Maxim" 
                       value={pret.max}
                       onChange={(e) => setPret({ ...pret, max: e.target.value })}
                       className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#E31E24] outline-none" 
                     />
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

interface HomeFeedProps {
  isLoading?: boolean;
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  onSeeAllClick?: (title: string, products: any[]) => void;
}

const getProductsForCategory = (category: string) => {
  return products.filter(p => (p.category && p.category.toLowerCase().includes(category)));
};

export function HomeFeed({ isLoading, onProductClick, onAddToCart, onSeeAllClick }: HomeFeedProps) {
  const [activeFilter, setActiveFilter] = useState<"stoc" | "culoare" | "pret" | null>(null);
  const [stoc, setStoc] = useState<"magazin" | "furnizor" | null>(null);
  const [culoare, setCuloare] = useState<string | null>(null);
  const [pret, setPret] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => getRecentlyViewed());

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

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4 pb-24">
        <Skeleton className="h-8 w-48 mx-4" />
        <div className="flex px-4 gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-36 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-3 bg-[#f8f9fa] min-h-full flex flex-col gap-3 relative">
      <FiltersPanel 
        activeFilter={activeFilter} 
        onClose={() => setActiveFilter(null)} 
        stoc={stoc}
        setStoc={setStoc}
        culoare={culoare}
        setCuloare={setCuloare}
        pret={pret}
        setPret={setPret}
      />
      
      {/* 1. Categories Row */}
      <div className="bg-white pt-4 pb-3 shadow-sm rounded-b-2xl z-10 relative">
        <ProductScroll>
          {categoriesWithIcons.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center gap-2 shrink-0 snap-start w-[88px] cursor-pointer" onClick={() => onSeeAllClick?.(cat.name, getProductsForCategory(cat.id))}>
                <div className={`w-14 h-14 ${cat.bg} ${cat.border} rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95`}>
                  <Icon className={`h-6 w-6 ${cat.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight h-7 flex items-start justify-center line-clamp-2 px-1">{cat.name}</span>
              </div>
            );
          })}
        </ProductScroll>
      </div>

      {/* Filter Row */}
      <div className="px-4 py-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {hasActiveFilters ? (
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white border border-transparent rounded-full text-xs font-semibold shrink-0 shadow-sm hover:bg-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> 
            Reset
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shrink-0 text-gray-800">
            <SlidersHorizontal className="w-3.5 h-3.5" /> 
            Filtrează:
          </span>
        )}
        <button 
          onClick={() => setActiveFilter("stoc")}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold shrink-0 shadow-sm transition-colors ${stoc ? 'bg-red-50 border-[#E31E24] text-[#E31E24]' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'}`}
        >
          {stoc === 'magazin' ? 'În stoc magazin' : stoc === 'furnizor' ? 'În stoc furnizor' : 'Stoc'} <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setActiveFilter("culoare")}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold shrink-0 shadow-sm transition-colors ${culoare ? 'bg-red-50 border-[#E31E24] text-[#E31E24]' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'}`}
        >
          {culoare || 'Culoare'} <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setActiveFilter("pret")}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold shrink-0 shadow-sm transition-colors ${(pret.min || pret.max) ? 'bg-red-50 border-[#E31E24] text-[#E31E24]' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'}`}
        >
          {(pret.min || pret.max) ? `${pret.min || 0} - ${pret.max || '∞'} Lei` : 'Preț'} <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Main Hero Banners */}
      <section className="pt-2">
        <ProductScroll>
          {heroBanners.map(banner => {
            let productsToPass: typeof products = products.filter(p => (p as any).heroBannerId === banner.id);

            return (
              <div 
                key={banner.id} 
                className={`relative w-[320px] shrink-0 snap-center h-[160px] rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br ${banner.gradient} flex items-center cursor-pointer group`}
                onClick={() => onSeeAllClick?.(banner.title, productsToPass)}
              >
                <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0 pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
                
                <div className="relative z-10 p-4 w-full flex flex-col h-full justify-between">
                  <div className="flex items-center gap-2">
                    {/* evoMAG Logo mockup text */}
                    <div className="text-white font-black text-sm tracking-tighter bg-[#E31E24] px-1.5 py-0.5 rounded-sm">evoMAG</div>
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-bold tracking-wide uppercase shadow-sm">
                      {banner.badge}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h2 className="text-xl font-black text-white leading-tight mb-1 drop-shadow-md">{banner.title}</h2>
                    <p className="text-sm font-semibold text-gray-200 drop-shadow-md mb-2">{banner.subtitle}</p>
                    {/* Required text on every banner */}
                    <p className="text-[8px] font-bold text-white/80 uppercase tracking-wider">SARBATORIM 21 ANI. FARA ARTIFICII. REDUCERI. ATAT</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ProductScroll>
      </section>

      {/* 3. Oferte pentru tine */}
      <section className="bg-red-50 py-5 mt-2 shadow-sm border-t border-b border-red-100">
        <div className="px-4 mb-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="bg-[#E31E24] w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 text-white fill-white" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Oferte pentru tine</h2>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              {hasPersonalization ? "Personalizat după preferințele tale" : "Picks for you"}
            </p>
          </div>
          <button onClick={() => onSeeAllClick?.("Oferte pentru tine", personalizedOferte)} className="flex items-center gap-0.5 text-xs font-bold text-[#E31E24] bg-white px-2.5 py-1.5 rounded-full shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
            Toate
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <ProductScroll>
          {personalizedOferte.map((product) => (
            <div key={product.id} className="w-[160px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 4. Noutati (New Section with Big Image Cards) */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader title="Noutăți" showSeeAll={false} />
        <ProductScroll>
          {noutati.map((item) => (
            <div key={item.id} className="relative w-[280px] h-[220px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-sm group cursor-pointer">
              <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-lg font-black mb-1 leading-tight">{item.title}</h3>
                <p className="text-sm font-medium text-gray-200">{item.description}</p>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* Servicii */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader title="Servicii evoMAG" subtitle="Alege serviciul dorit" showSeeAll={false} />
        <ProductScroll>
          {servicii.map((srv) => (
            <div 
              key={srv.id} 
              className="relative w-[160px] h-[200px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-300"
              onClick={() => onSeeAllClick?.(srv.title, srv.subServices as any)}
            >
              <div className="h-[100px] w-full overflow-hidden bg-gray-100">
                <img src={srv.image} alt={srv.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-3 bg-white h-[100px] flex flex-col justify-between relative z-10">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1 group-hover:text-[#E31E24] transition-colors line-clamp-2">{srv.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">{srv.description}</p>
                </div>
                <div className="text-[10px] font-bold text-[#E31E24] flex items-center gap-0.5 mt-1 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Vezi opțiuni <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 6. Văzute recent */}
      {recentlyViewed.length > 0 && (
        <section className="bg-white py-5 shadow-sm">
          <SectionHeader title="Văzute recent" onSeeAll={() => onSeeAllClick?.("Văzute recent", recentlyViewed)} />
          <ProductScroll>
            {recentlyViewed.map((product) => (
              <div key={product.id} className="w-[150px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product)}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice ?? product.oldPrice}
                  images={product.images ?? (product.image ? [product.image] : [])}
                  badge={product.badge}
                  onAddToCart={() => onAddToCart?.(product)}
                />
              </div>
            ))}
          </ProductScroll>
        </section>
      )}

    </div>
  );
}
