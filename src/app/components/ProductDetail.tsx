import { useState } from "react";
import { Heart, Share2, Star, TrendingDown, Sparkles, ShoppingCart, ChevronLeft, Check, Truck, Scale } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";

interface ProductDetailProps {
  onBack?: () => void;
  onAddToCart?: (product: any) => void;
}

const productImages = [
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
  "https://images.unsplash.com/photo-1695048133096-f7b64e4b4c85?w=600&q=80",
  "https://images.unsplash.com/photo-1695048071543-598ba9f8fb4d?w=600&q=80",
];

const colors = [
  { name: "Natural Titanium", color: "#8B8680" },
  { name: "Blue Titanium", color: "#5B7C99" },
  { name: "White Titanium", color: "#E8E6E3" },
  { name: "Black Titanium", color: "#3D3D3D" },
];

const storage = ["128GB", "256GB", "512GB", "1TB"];

export function ProductDetail({ onBack, onAddToCart }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-4 border-b bg-background">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-muted">
            <Share2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-2 rounded-full hover:bg-muted"
          >
            <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-muted">
          <motion.img
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={productImages[selectedImage]}
            alt="Product"
            className="w-full h-full object-contain p-8"
          />
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
            -7% OFF
          </Badge>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedImage === index ? "bg-primary w-6" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Title, Price & Key Info */}
          <div>
            <h1 className="text-xl font-bold mb-2">iPhone 15 Pro Max 256GB, Natural Titanium</h1>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm">4.8</span>
                <span className="text-xs text-muted-foreground underline ml-1">(342 recenzii)</span>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold px-2 py-0.5">În stoc</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">6.799 Lei</span>
                <span className="text-sm text-muted-foreground line-through">7.299 Lei</span>
              </div>
            </div>

            {/* Delivery ETA */}
            <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Livrare Mâine</p>
                <p className="text-xs text-muted-foreground">Comandă în următoarele 3 ore</p>
              </div>
            </div>
          </div>

          {/* AI Review Summary */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm rounded-xl">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  Rezumat Recenzii AI
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cumpărătorii apreciază <strong>autonomia excelentă a bateriei</strong> și <strong>calitatea camerei foto</strong>. Unii utilizatori au menționat că telefonul se poate încălzi ușor în timpul jocurilor intense.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons: Compare */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold border-gray-200">
              <Scale className="h-4 w-4 mr-2" />
              Compară
            </Button>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3>Culoare: {colors[selectedColor].name}</h3>
            <div className="flex gap-3">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`relative w-14 h-14 rounded-full border-2 transition-all ${
                    selectedColor === index ? "border-primary scale-110" : "border-muted"
                  }`}
                  style={{ backgroundColor: color.color }}
                >
                  {selectedColor === index && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Selection */}
          <div className="space-y-3">
            <h3>Capacitate</h3>
            <div className="grid grid-cols-4 gap-2">
              {storage.map((size, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedStorage(index)}
                  className={`py-3 rounded-xl border-2 transition-all font-medium ${
                    selectedStorage === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="specs" className="flex-1">Specificații</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Recenzii</TabsTrigger>
              <TabsTrigger value="delivery" className="flex-1">Livrare</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="space-y-3 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Display</span>
                  <span className="font-medium">6.7" Super Retina XDR</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Procesor</span>
                  <span className="font-medium">A17 Pro</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Cameră</span>
                  <span className="font-medium">48MP + 12MP + 12MP</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-muted-foreground">Baterie</span>
                  <span className="font-medium">4422 mAh</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4 mt-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 border-0 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">Andrei M.</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Telefon excelent! Performanța este incredibilă și camera face poze superbe chiar și noaptea.
                  </p>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="delivery" className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Livrare gratuită</p>
                  <p className="text-sm text-muted-foreground">Estimat: 1-2 zile lucrătoare</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 border-t bg-white px-4 py-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] sticky bottom-0 z-50">
        <div className="flex gap-3 items-center">
          <div className="flex flex-col flex-1 shrink-0 px-1">
             <span className="text-2xl font-black text-primary leading-none">6.799 Lei</span>
             <span className="text-xs font-semibold text-green-600 mt-1">În stoc</span>
          </div>
          <Button 
            size="default" 
            className="h-11 flex-[1.2] rounded-full text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all"
            onClick={() => onAddToCart?.({
              id: "pd-1",
              name: "iPhone 15 Pro Max 256GB",
              price: 6799,
              imageUrl: productImages[0],
            })}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adaugă în coș
          </Button>
        </div>
      </div>
    </div>
  );
}
