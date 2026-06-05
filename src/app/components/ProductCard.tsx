import { Heart, Info, ShoppingCart, Star } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import reviewsData from "../../data/reviews.json";
import { isInWishlist, toggleWishlist } from "../services/wishlist";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  badge?: string | React.ReactNode;
  aiReason?: string;
  stockPercent?: number;
  onAddToCart?: () => void;
  onWishlist?: () => void;
  onProductClick?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  images,
  badge,
  aiReason,
  stockPercent,
  onAddToCart,
  onProductClick,
}: ProductCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(id));

  const productReviews = reviewsData.filter((r) => r.productId === String(id));
  const reviewCount = productReviews.length;
  const rating = reviewCount > 0
    ? Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : null;

  return (
    <div onClick={() => onProductClick?.(id)} className="relative bg-white rounded-2xl border border-red-100 hover:border-[#E31E24] shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 h-full flex flex-col">

      {stockPercent !== undefined && (
        <div className="absolute bottom-0 left-0 h-1.5 bg-red-100 w-full rounded-b-2xl overflow-hidden z-20">
          <div
            className="h-full bg-gradient-to-r from-[#E31E24] to-orange-500"
            style={{ width: `${stockPercent}%` }}
          />
        </div>
      )}

      {badge && (
        <div className="absolute top-2 left-2 bg-[#E31E24] text-white text-[11px] font-black px-2 py-1 rounded-md shadow-sm z-20 transform -rotate-2 group-hover:rotate-0 transition-transform">
          {badge}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          const newState = toggleWishlist({ id, name, price, originalPrice, images });
          setWishlisted(newState);
          toast.success(newState ? "Adăugat la favorite!" : "Eliminat din favorite!");
        }}
        className={`absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-20`}
        aria-label={wishlisted ? "Elimină din favorite" : "Adaugă la favorite"}
      >
        <Heart className={`h-3.5 w-3.5 transition-colors ${wishlisted ? "fill-[#E31E24] text-[#E31E24]" : "text-gray-400"}`} />
      </button>

      {aiReason && (
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTooltipOpen((v) => !v);
              }}
              className="absolute top-2 right-10 h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-20"
              aria-label="Motivul recomandării"
            >
              <Info className="h-3.5 w-3.5 text-[#E31E24]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[180px] text-center">
            {aiReason}
          </TooltipContent>
        </Tooltip>
      )}

      <div className="h-[140px] p-4 flex items-center justify-center bg-white rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={images[0]}
          alt={name}
          className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 relative z-10"
          draggable={false}
        />
      </div>

      <div className="p-3 pb-5 flex flex-col bg-white rounded-b-2xl flex-1">
        <h3 className="text-xs font-semibold line-clamp-2 mb-1.5 text-gray-800 leading-snug h-8 group-hover:text-[#E31E24] transition-colors">
          {name}
        </h3>
        {(rating !== null || reviewCount > 0) && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {rating !== null && (
              <span className="text-[10px] font-medium text-gray-700">{rating}</span>
            )}
            {reviewCount > 0 && (
              <span className="text-[10px] text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-1 font-medium">
                {originalPrice.toLocaleString("ro-RO")} Lei
              </span>
            )}
            <span className="text-[16px] font-black text-[#E31E24] leading-none">
              {price.toLocaleString("ro-RO")} Lei
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="w-8 h-8 rounded-full bg-red-50 text-[#E31E24] flex items-center justify-center hover:bg-[#E31E24] hover:text-white transition-colors group-hover:bg-[#E31E24] group-hover:text-white"
            aria-label="Adaugă în coș"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
