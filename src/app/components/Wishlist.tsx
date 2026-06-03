import { useState } from "react";
import { Bell, TrendingDown, Package, Heart, ShoppingCart, Shield, ChevronLeft } from "lucide-react";
import { Switch } from "./ui/switch";
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
    <div className="flex flex-col h-full bg-[#F5F5F7]">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 shadow-sm mb-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6 text-[#111111]" />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-[#E30613] fill-[#E30613]" />
            </div>
          )}
          <div>
            <h1 className="text-[26px] font-black text-[#111111] tracking-tight leading-tight">Favorite</h1>
            <p className="text-[13px] text-[#6B7280] font-medium">{wishlistProducts.length} produse salvate</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-4">

      {/* Price Alert Notification Banner */}
      <div className="mx-4 mb-3 bg-white rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
          <Bell className="h-5 w-5 text-[#E30613]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[#111111] leading-tight">Primiți notificări pentru reduceri</h3>
          <p className="text-[11px] text-[#6B7280] mt-0.5 leading-tight">
            Te anunțăm când scad prețurile produselor tale preferate.
          </p>
        </div>
        <Switch defaultChecked className="data-[state=checked]:bg-[#E30613] shrink-0" />
      </div>

      {/* Wishlist Products — Single Column List */}
      {wishlistProducts.length > 0 && (
        <div className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm mb-3">
          {wishlistProducts.map((product, index) => {
            const imageUrl = product.images?.[0] ?? product.image ?? "";
            const originalPrice = product.originalPrice ?? product.oldPrice;
            const discountPct =
              originalPrice && originalPrice > product.price
                ? Math.round((1 - product.price / originalPrice) * 100)
                : null;

            return (
              <div key={product.id}>
                {index > 0 && <div className="h-px bg-[#F0F0F0] mx-4" />}
                <div
                  className="flex items-center gap-3 px-4 py-4 cursor-pointer active:bg-gray-50"
                  onClick={() => onProductClick?.(product)}
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl bg-[#F8F8F8] flex items-center justify-center shrink-0">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-contain mix-blend-multiply"
                      draggable={false}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-[#111111] leading-snug line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[16px] font-black text-[#E30613] leading-none mb-1">
                      {product.price.toLocaleString("ro-RO")} Lei
                    </p>
                    {discountPct && (
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-[#22C55E]" />
                        <span className="text-[11px] font-medium text-[#22C55E]">
                          {discountPct}% de când urmărești
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleRemove(e, product.id)}
                      className="w-9 h-9 flex items-center justify-center"
                      aria-label="Șterge din favorite"
                    >
                      <Heart className="w-5 h-5 text-[#E30613] fill-[#E30613]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product);
                      }}
                      className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center"
                      aria-label="Adaugă în coș"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#E30613]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
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

      </div>{/* end scrollable */}

      {/* Privacy Footer — pinned to bottom */}
      <div className="mx-4 mb-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
        <Shield className="w-5 h-5 text-[#E30613] shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-[#111111]">Datele tale sunt în siguranță.</p>
          <p className="text-[11px] text-[#6B7280]">Doar tu vezi produsele salvate.</p>
        </div>
      </div>
    </div>
  );
}
