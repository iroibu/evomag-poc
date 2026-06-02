import React, { useRef, useState, useMemo } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { getWishlist } from "../services/wishlist";
import { getOrders } from "../services/orders";
import productsJson from "../../data/products.json";
import type { Product } from "../../data/types";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}

function ProductScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  return (
    <div
      ref={scrollRef}
      onMouseDown={(e) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setDragged(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
      }}
      onMouseLeave={() => setIsDragging(false)}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={(e) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) setDragged(true);
        scrollRef.current.scrollLeft = scrollLeft - walk;
      }}
      onClickCapture={(e) => {
        if (dragged) { e.stopPropagation(); e.preventDefault(); }
      }}
      className={`flex overflow-x-auto scrollbar-hide px-4 scroll-pl-4 pb-4 gap-3 select-none touch-pan-x ${
        isDragging ? "snap-none cursor-grabbing" : "snap-x snap-mandatory cursor-grab"
      }`}
    >
      {children}
    </div>
  );
}

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
}

interface CartScreenProps {
  cartItems: CartItemType[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

export function CartScreen({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onProductClick, onAddToCart }: CartScreenProps) {
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const wishlistProducts = useMemo<Product[]>(() => getWishlist(), []);

  const buyAgainProducts = useMemo(() => {
    const orders = getOrders();
    const seen = new Set<string>();
    return orders
      .flatMap((o) => o.products)
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
  }, []);

  const frequentlyBought = useMemo<Product[]>(() => {
    const shuffled = [...productsJson].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8) as Product[];
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coșul tău este gol</h2>
        <p className="text-muted-foreground text-sm">
          Alege produsele dorite și adaugă-le în coș pentru a finaliza comanda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold ml-2 flex-1">Coșul meu</h1>
        <span className="text-sm font-semibold bg-muted px-2 py-1 rounded-full">
          {cartItems.reduce((acc, i) => acc + i.quantity, 0)} articole
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-muted/30 rounded-lg p-2 shrink-0">
              <img src={item.images?.[0] ?? ""} alt={item.name} className="w-full h-full object-contain" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-medium line-clamp-2 mb-1">{item.name}</h3>
                <span className="text-sm font-bold text-primary">{item.price.toLocaleString('ro-RO')} Lei</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 bg-muted/50 rounded-full px-1 py-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Subtotal & Cost livrare */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{total.toLocaleString('ro-RO')} Lei</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Cost livrare</span>
            <span className="font-semibold text-green-600">Gratuit</span>
          </div>
        </div>

        {/* Cumpărate frecvent împreună */}
        <section className="bg-white rounded-xl py-4 shadow-sm -mx-4 px-0">
          <SectionHeader title="Cumpărate frecvent împreună" />
          <ProductScroll>
            {frequentlyBought.map((product) => (
              <div key={product.id} className="w-[150px] shrink-0 snap-start" onClick={() => onProductClick?.(product)}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice ?? product.oldPrice}
                  images={product.images ?? []}
                  badge={product.badge}
                  onAddToCart={() => onAddToCart?.(product)}
                />
              </div>
            ))}
          </ProductScroll>
        </section>

        {/* Produsele tale favorite */}
        {wishlistProducts.length > 0 && (
          <section className="bg-white rounded-xl py-4 shadow-sm -mx-4 px-0">
            <SectionHeader title="Produsele tale favorite" />
            <ProductScroll>
              {wishlistProducts.map((product) => (
                <div key={product.id} className="w-[150px] shrink-0 snap-start" onClick={() => onProductClick?.(product)}>
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

        {/* Cumpara din nou */}
        {buyAgainProducts.length > 0 && (
          <section className="bg-white rounded-xl py-4 shadow-sm -mx-4 px-0">
            <SectionHeader title="Cumpara din nou" />
            <ProductScroll>
              {buyAgainProducts.map((product) => (
                <div key={product.id} className="w-[150px] shrink-0 snap-start" onClick={() => onProductClick?.({ id: product.id, name: product.name, price: product.paidPrice, images: product.images })}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.paidPrice}
                    images={product.images ?? []}
                    onAddToCart={() => onAddToCart?.({ id: product.id, name: product.name, price: product.paidPrice, images: product.images })}
                  />
                </div>
              ))}
            </ProductScroll>
          </section>
        )}
      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Total estimat</span>
          <span className="font-black text-xl text-primary">{total.toLocaleString('ro-RO')} Lei</span>
        </div>
        <Button onClick={onCheckout} className="w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20">
          Continuă
        </Button>
      </div>
    </div>
  );
}