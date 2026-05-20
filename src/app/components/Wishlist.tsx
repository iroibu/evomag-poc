import { ProductCard } from "./ProductCard";
import { Bell, TrendingDown, Package } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";

const wishlistProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    price: 6799,
    originalPrice: 7299,
    rating: 4.8,
    reviewCount: 342,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    badge: "-7%",
    priceAlert: true,
    priceDropped: true,
  },
  {
    id: "2",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 1899,
    originalPrice: 2199,
    rating: 4.9,
    reviewCount: 567,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
    badge: "-14%",
    priceAlert: true,
  },
  {
    id: "3",
    name: "Apple MacBook Air M3 13.6\" 16GB RAM 512GB SSD",
    price: 7299,
    rating: 4.8,
    reviewCount: 423,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    priceAlert: false,
  },
];

export function Wishlist() {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h1>Favorite</h1>
          <Badge variant="secondary">{wishlistProducts.length} produse</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Produsele tale salvate și alerte de preț
        </p>
      </div>

      {/* Price Alert Card */}
      <div className="px-4">
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Preț redus!</h3>
              <p className="text-sm text-muted-foreground">
                iPhone 15 Pro Max a scăzut cu 500 Lei
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Price Insights */}
      <div className="px-4">
        <Card className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Alerte inteligente de preț</h3>
              <p className="text-sm text-muted-foreground">
                AI-ul nostru monitorizează zilnic prețurile și te notifică când găsește oferte mai bune
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-t first:border-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 object-contain rounded-lg bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold">
                        {product.price.toLocaleString('ro-RO')} Lei
                      </span>
                      {product.priceDropped && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                          -500 Lei
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch checked={product.priceAlert} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Wishlist Products */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
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
