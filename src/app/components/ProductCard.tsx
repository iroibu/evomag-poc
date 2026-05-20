import { Info, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  badge?: string | React.ReactNode;
  aiReason?: string;
  onAddToCart?: () => void;
  onWishlist?: () => void;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  rating = 4.5,
  reviewCount = 120,
  imageUrl,
  badge,
  aiReason,
  onAddToCart,
  onWishlist,
}: ProductCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="touch-manipulation h-full"
    >
      <Card className="overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col bg-white">
        <div className="relative aspect-square bg-white">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain p-4"
          />
          {badge && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0 font-bold tracking-wide shadow-sm">
              {badge}
            </Badge>
          )}
          {aiReason && (
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTooltipOpen((v) => !v);
                  }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  aria-label="Motivul recomandării AI"
                >
                  <Info className="h-3.5 w-3.5 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-[180px] text-center"
              >
                {aiReason}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="p-3 pt-1 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="line-clamp-2 text-xs font-medium text-foreground/90 leading-tight mb-1.5">
              {name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-medium">{rating}</span>
              <span className="text-[10px] text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto pt-2 gap-1">
            <div className="flex flex-col gap-0.5 min-w-0">
              {originalPrice && (
                <span className="text-[10px] text-muted-foreground line-through whitespace-nowrap">
                  {originalPrice.toLocaleString("ro-RO")} Lei
                </span>
              )}
              <span className="text-sm font-bold text-primary truncate">
                {price.toLocaleString("ro-RO")} Lei
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.();
              }}
              className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors flex-shrink-0 shadow-sm mb-0.5"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
