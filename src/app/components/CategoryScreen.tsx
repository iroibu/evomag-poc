import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Filter, Sparkles, TrendingUp, Star, ArrowDownAZ, ArrowUpZA, X } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface CategoryScreenProps {
  title: string;
  products: any[];
  catId?: string;
  onBack: () => void;
  onProductClick: (product: any) => void;
  onAddToCart: (product: any) => void;
}

export function CategoryScreen({ title, products, catId, onBack, onProductClick, onAddToCart }: CategoryScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'bestseller' | 'price-asc' | 'price-desc' | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getBannerImage = (catId?: string) => {
    const t = catId?.toLowerCase() ?? '';
    if (t.includes('laptops')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80';
    if (t.includes('phones')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
    if (t.includes('tv-audio')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80';
    if (t.includes('gaming') || t.includes('pc')) return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80';
    if (t.includes('appliances')) return 'https://images.unsplash.com/photo-1626806787426-5910811b6325?w=800&q=80';
    return 'https://images.unsplash.com/photo-1601237660234-4b77ca300409?w=800&q=80';
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...(products || [])];
    if (activeFilter === 'bestseller') {
      result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (activeFilter === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeFilter === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return result;
  }, [products, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-safe overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#E31E24]/10 to-transparent z-0 pointer-events-none"></div>

      <header className="shrink-0 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 shadow-sm transition-all">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-red-50 text-gray-800 transition-colors mr-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-black text-gray-900 tracking-tight line-clamp-1">{title}</h1>
        </div>
        <button className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-700 shadow-sm">
          <Filter className="h-4 w-4" />
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 z-10 space-y-6">
        
        {/* Eye-catching Hero Area for the Category */}
        <div className={`rounded-2xl p-4 text-white shadow-md relative overflow-hidden transition-all duration-700 transform flex items-end min-h-[120px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <img src={getBannerImage(catId)} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-1.5 bg-[#E31E24] text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-1.5 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-white" /> Selecție Premium
            </div>
            <h2 className="text-xl font-black leading-tight mb-0.5">
              Totul pentru <span className="text-[#E31E24]">{title}</span>
            </h2>
          </div>
        </div>

        {/* Filters/Tags Row */}
        <div className={`flex gap-2 items-center overflow-x-auto pb-2 scrollbar-hide transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {activeFilter && (
            <button 
              onClick={() => setActiveFilter(null)}
              className="shrink-0 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 hover:bg-gray-800 transition-colors"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
          
          <button 
            onClick={() => setActiveFilter(activeFilter === 'bestseller' ? null : 'bestseller')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 transition-colors ${activeFilter === 'bestseller' ? 'bg-[#E31E24] text-white border border-[#E31E24]' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            <TrendingUp className="w-3 h-3" /> Cel mai vândut
          </button>
          
          <button 
            onClick={() => setActiveFilter(activeFilter === 'price-asc' ? null : 'price-asc')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 transition-colors ${activeFilter === 'price-asc' ? 'bg-[#E31E24] text-white border border-[#E31E24]' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            <ArrowDownAZ className="w-3 h-3" /> Preț crescător
          </button>
          
          <button 
            onClick={() => setActiveFilter(activeFilter === 'price-desc' ? null : 'price-desc')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 transition-colors ${activeFilter === 'price-desc' ? 'bg-[#E31E24] text-white border border-[#E31E24]' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            <ArrowUpZA className="w-3 h-3" /> Preț descrescător
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? filteredAndSortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`transition-all duration-700 transform relative ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
              style={{ transitionDelay: `${150 + ((index % 10) * 50)}ms` }}
            >
              <div className="cursor-pointer h-full" onClick={() => onProductClick(product)}>
                <ProductCard 
                  {...product} 
                  onAddToCart={(e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    onAddToCart(product);
                  }} 
                />
              </div>
            </div>
          )) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Nu am găsit produse</h3>
              <p className="text-sm text-gray-500">Încearcă să explorezi alte categorii.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}