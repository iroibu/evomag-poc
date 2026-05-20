import React, { useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import { ChevronRight, Sparkles } from "lucide-react";
import { Card } from "./ui/card";

const recentlyViewed = [
  {
    id: "r1",
    name: "Apple MacBook Air M3 13.6\" 16GB RAM 512GB SSD",
    price: 7299,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
  },
  {
    id: "r2",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 1899,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
  },
  {
    id: "r3",
    name: "Dell UltraSharp 27\" 4K USB-C Monitor U2723DE",
    price: 2699,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
  }
];

const similarProducts = [
  {
    id: "s1",
    name: "Apple MacBook Pro 14\" M3 Pro 18GB 512GB",
    price: 9999,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
  },
  {
    id: "s2",
    name: "Bose QuietComfort Ultra Headphones",
    price: 1999,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
  },
  {
    id: "s3",
    name: "LG 27\" UltraFine 5K Monitor",
    price: 3499,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
  }
];

const dealsAndDiscounts = [
  {
    id: "d1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    price: 6799,
    originalPrice: 7299,
    badge: "-7%",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
  },
  {
    id: "d2",
    name: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 5299,
    originalPrice: 6299,
    badge: "-16%",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
  },
  {
    id: "d3",
    name: "Apple Watch Series 9 GPS 45mm",
    price: 1899,
    originalPrice: 2299,
    badge: "-17%",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80",
  }
];

const trendingProducts = [
  {
    id: "t1",
    name: "PlayStation 5 Console Slim",
    price: 2499,
    badge: "🔥 Trending",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80",
  },
  {
    id: "t2",
    name: "iPad Pro 12.9\" M2 256GB Space Gray",
    price: 6499,
    badge: "🔥 Trending",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
  },
  {
    id: "t3",
    name: "Logitech MX Master 3S Wireless Mouse",
    price: 499,
    badge: "🔥 Trending",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
  }
];

const bundles = [
  {
    id: "b1",
    products: [
      { id: "bp1", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80" },
      { id: "bp2", imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80" }
    ],
    price: 8299,
  },
  {
    id: "b2",
    products: [
      { id: "bp3", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80" },
      { id: "bp4", imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80" },
      { id: "bp5", imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80" }
    ],
    price: 9999,
  }
];

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
          See all
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
    const walk = (x - startX) * 2; // Scroll factor
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
      className={`flex overflow-x-auto scrollbar-hide px-4 pb-4 gap-3 select-none touch-pan-x ${
        isDragging ? "snap-none cursor-grabbing" : "snap-x snap-mandatory cursor-grab"
      }`}
    >
      {children}
    </div>
  );
}

interface HomeFeedProps {
  isLoading?: boolean;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (product: any) => void;
  onSeeAllClick?: (title: string, products: any[]) => void;
}

export function HomeFeed({ isLoading, onProductClick, onAddToCart, onSeeAllClick }: HomeFeedProps) {
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
    <div className="pb-24 bg-gray-200 min-h-full flex flex-col gap-4">
      
      {/* AI Suggestion Indicator */}
      <div className="bg-white pt-4 pb-4 px-4 shadow-sm">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-[11px] font-medium text-primary/90 leading-snug">
            Rezultatele sunt afișate pe baza sugestiilor AI personalizate pentru tine.
          </p>
        </div>
      </div>

      {/* 1. Recently Viewed */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader title="Recently Viewed" onSeeAll={() => onSeeAllClick?.("Recently Viewed", recentlyViewed)} />
        <ProductScroll>
          {recentlyViewed.map((product) => (
            <div key={product.id} className="w-[140px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product.id)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 2. Similar to What You Viewed */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader 
          title="Similar to What You Viewed" 
          subtitle="Based on your activity"
          onSeeAll={() => onSeeAllClick?.("Similar to What You Viewed", similarProducts)}
        />
        <ProductScroll>
          {similarProducts.map((product) => (
            <div key={product.id} className="w-[140px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product.id)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 3. Deals & Discounts */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader 
          title="Deals & Discounts" 
          subtitle="Recommended for you"
          onSeeAll={() => onSeeAllClick?.("Deals & Discounts", dealsAndDiscounts)}
        />
        <ProductScroll>
          {dealsAndDiscounts.map((product) => (
            <div key={product.id} className="w-[140px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product.id)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 4. Trending Products */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader title="Trending Now" onSeeAll={() => onSeeAllClick?.("Trending Now", trendingProducts)} />
        <ProductScroll>
          {trendingProducts.map((product) => (
            <div key={product.id} className="w-[140px] shrink-0 snap-start cursor-pointer" onClick={() => onProductClick?.(product.id)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
            </div>
          ))}
        </ProductScroll>
      </section>

      {/* 5. Frequently Bought Together (Bundles) */}
      <section className="bg-white py-5 shadow-sm">
        <SectionHeader title="Frequently Bought Together" showSeeAll={false} />
        <ProductScroll>
          {bundles.map((bundle) => (
            <div key={bundle.id} className="w-[280px] shrink-0 snap-start">
              <Card className="p-3 border border-gray-100 shadow-sm bg-white rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3 h-[100px] bg-muted/30 rounded-lg p-2">
                  {bundle.products.map((p, index) => (
                    <React.Fragment key={p.id}>
                      <div className="w-16 h-16 flex-shrink-0 bg-white rounded shadow-sm p-1">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                      {index < bundle.products.length - 1 && (
                        <span className="text-muted-foreground font-medium text-lg">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-xs font-medium text-primary mb-0.5">Save more together</span>
                    <span className="text-lg font-bold text-foreground">{bundle.price.toLocaleString('ro-RO')} Lei</span>
                  </div>
                  <button className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                    Add Bundle
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </ProductScroll>
      </section>

    </div>
  );
}
