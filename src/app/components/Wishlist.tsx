import { useState } from "react";
import { Bell, TrendingDown, Package } from "lucide-react";
import { Switch } from "./ui/switch";
import { getWishlist } from "../services/wishlist";
import type { Product } from "../../data/types";

export function Wishlist() {
  const [wishlistProducts] = useState<Product[]>(() => getWishlist());
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [productAlerts, setProductAlerts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(wishlistProducts.map((p) => [p.id, p.priceDropped ?? false]))
  );

  const dropsCount = wishlistProducts.filter((p) => p.priceDropped).length;

  const getSavings = (p: Product): string => {
    const original = p.oldPrice ?? p.originalPrice;
    if (!original) return "";
    const saved = original - p.price;
    return `${saved.toLocaleString("ro-RO")} lei economisiți`;
  };

  const getDiscountPct = (p: Product): number => {
    const original = p.oldPrice ?? p.originalPrice;
    if (!original) return 0;
    return Math.round(((original - p.price) / original) * 100);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-4 flex items-center justify-between mb-3.5">
        <h1 className="text-[22px] font-extrabold">Favorite</h1>
        {dropsCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
            <TrendingDown className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-bold text-orange-500">{dropsCount} reduceri azi</span>
          </div>
        )}
      </div>

      {/* Price alert banner */}
      <div className="mx-5 mb-3.5 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
        <Bell className="h-[18px] w-[18px] text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[13px] font-bold">Alerte prețuri active</p>
          <p className="text-[11px] text-muted-foreground">Notificare la orice reducere</p>
        </div>
        <Switch
          checked={alertsEnabled}
          onCheckedChange={setAlertsEnabled}
        />
      </div>

      {/* Product cards */}
      {wishlistProducts.length > 0 ? (
        <div className="px-5 flex flex-col gap-3">
          {wishlistProducts.map((p) => {
            const hasDrop = !!p.priceDropped;
            const original = p.oldPrice ?? p.originalPrice;
            const discountPct = getDiscountPct(p);
            const savings = getSavings(p);
            const imgSrc = p.imageUrl ?? p.image;
            const alertOn = productAlerts[p.id] ?? false;

            return (
              <div
                key={p.id}
                className={`bg-card rounded-2xl border overflow-hidden relative flex ${
                  hasDrop ? "border-orange-500/30" : "border-border"
                }`}
              >
                {hasDrop && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-orange-500 rounded-t-2xl" />
                )}
                {/* Image */}
                <div className="w-[90px] shrink-0 bg-muted">
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="p-3 flex-1">
                  {hasDrop && (
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown className="h-3 w-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-500 uppercase">
                        Preț scăzut{savings ? ` · ${savings}` : ""}
                      </span>
                    </div>
                  )}
                  <p className="text-[12px] font-bold leading-snug mb-1.5 line-clamp-2">{p.name}</p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[15px] font-extrabold">
                      {p.price.toLocaleString("ro-RO")} lei
                    </span>
                    {original && (
                      <span className="text-[11px] text-muted-foreground line-through">
                        {original.toLocaleString("ro-RO")}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <Bell className="h-3 w-3 text-muted-foreground" />
                    <Switch
                      checked={alertOn}
                      onCheckedChange={(v) =>
                        setProductAlerts((prev) => ({ ...prev, [p.id]: v }))
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
