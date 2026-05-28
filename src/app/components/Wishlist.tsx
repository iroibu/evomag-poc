import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Bell, TrendingDown, Package, Heart, Trash2, X, ChevronLeft } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { getWishlist, removeFromWishlist } from "../services/wishlist";
import type { Product } from "../../data/types";

interface WishlistProps {
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBack?: () => void;
}

export function Wishlist({ onProductClick, onAddToCart, onBack }: WishlistProps) {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>(() => getWishlist());

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromWishlist(id);
    setWishlistProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] pb-4 overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button 
                onClick={onBack} 
                className="p-2 -ml-2 rounded-full hover:bg-muted mr-1 flex items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6 text-[#111111]" />
              </button>
            ) : (
              <Heart className="w-6 h-6 text-[#E30613] fill-[#E30613]" />
            )}
            <h1 className="text-[22px] font-black text-[#111111] tracking-tight">Favorite</h1>
          </div>
          <Badge variant="secondary" className="bg-[#FEF2F2] text-[#E30613] hover:bg-[#FEF2F2] border-0 font-bold">{wishlistProducts.length} produse</Badge>
        </div>
        
        {/* Global Price Alert Toggle */}
        <div className="bg-[#F5F5F7] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <Bell className="h-5 w-5 text-[#E30613]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111111]">Alerte prețuri active</h3>
              <p className="text-[11px] font-medium text-[#6B7280]">Notificare la orice reducere</p>
            </div>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-[#E30613]" />
        </div>
      </div>

      {/* Wishlist Products */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="relative group cursor-pointer" onClick={() => onProductClick?.(product)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart?.(product)} />
              <button 
                onClick={(e) => handleRemove(e, product.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4 text-[#E30613]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State (hidden when there are items) */}
      {wishlistProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2">Lista ta de favorite este goală</h2>
          <p className="text-center text-muted-foreground">
            Începe să salvezi produsele preferate pentru a primi alerte când prețul scade
          </p>
        </div>
      )}
    </div>
  );
}
