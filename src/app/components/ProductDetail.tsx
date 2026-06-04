import { useState, useEffect, useMemo, useRef } from "react";
import {
  Heart, Share2, Star, ShoppingCart, ChevronLeft, Check, Truck,
  Minus, Plus, ChevronRight, CreditCard, PenLine, Store,
  Monitor, Cpu, MemoryStick, HardDrive, Layers, BatteryFull,
  Wifi, Globe, Scale, Camera, Tag, Settings2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { motion } from "motion/react";
import { isInWishlist, toggleWishlist } from "../services/wishlist";
import { getRecentlyViewed } from "../services/recentlyViewed";
import specificationsData from "../../data/specifications.json";
import reviewsData from "../../data/reviews.json";
import productsData from "../../data/products.json";
import { ProductCard } from "./ProductCard";

const SPEC_ICONS: Record<string, React.ReactNode> = {
  "Display": <Monitor className="h-4 w-4 text-muted-foreground" />,
  "Procesor": <Cpu className="h-4 w-4 text-muted-foreground" />,
  "RAM": <MemoryStick className="h-4 w-4 text-muted-foreground" />,
  "Stocare": <HardDrive className="h-4 w-4 text-muted-foreground" />,
  "Grafică": <Layers className="h-4 w-4 text-muted-foreground" />,
  "GPU": <Layers className="h-4 w-4 text-muted-foreground" />,
  "Baterie": <BatteryFull className="h-4 w-4 text-muted-foreground" />,
  "Conectivitate": <Wifi className="h-4 w-4 text-muted-foreground" />,
  "Sistem de operare": <Globe className="h-4 w-4 text-muted-foreground" />,
  "Greutate": <Scale className="h-4 w-4 text-muted-foreground" />,
  "Cameră față": <Camera className="h-4 w-4 text-muted-foreground" />,
  "Cameră spate": <Camera className="h-4 w-4 text-muted-foreground" />,
  "Tip": <Tag className="h-4 w-4 text-muted-foreground" />,
};
function getSpecIcon(label: string) {
  return SPEC_ICONS[label] ?? <Settings2 className="h-4 w-4 text-muted-foreground" />;
}

interface ProductDetailProps {
  product: any;
  onBack?: () => void;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

export function ProductDetail({ product, onBack, onAddToCart, onProductClick }: ProductDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(String(product.id)));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [product.id]);
  const [city, setCity] = useState<string | null>(null);
  const [cityLoading, setCityLoading] = useState(true);

  const deliveryDate = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("ro-RO", { day: "numeric", month: "long" });
  })();

  useEffect(() => {
    if (!navigator.geolocation) {
      setCityLoading(false);
      setCity("BUCUREȘTI");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "ro" } }
          );
          const data = await res.json();
          const name =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "BUCUREȘTI";
          setCity(name);
        } catch {
          setCity("BUCUREȘTI");
        } finally {
          setCityLoading(false);
        }
      },
      () => {
        setCity("BUCUREȘTI");
        setCityLoading(false);
      }
    );
  }, []);

  const imageList: string[] = product.images ?? [];
  const oldPrice: number | undefined = product.oldPrice ?? product.originalPrice;
  const productColors: { name: string; color: string }[] | undefined = product.colors;
  const productStorage: string[] | undefined = product.storage;
  const discountPercent = oldPrice ? Math.round((1 - product.price / oldPrice) * 100) : null;
  const productSpecs = specificationsData.find((s) => s.productId === String(product.id))?.specs ?? [];
  const productReviews = reviewsData.filter((r) => r.productId === String(product.id));
  const reviewCount = productReviews.length;
  const computedRating = reviewCount > 0
    ? Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : null;

  const generatedReviewSummary = useMemo(() => {
    if (reviewCount === 0) return null;
    const positive = productReviews.filter(r => r.rating >= 4);
    const negative = productReviews.filter(r => r.rating <= 2);
    const sentimentLabel =
      computedRating !== null && computedRating >= 4.5 ? "foarte mulțumiți" :
      computedRating !== null && computedRating >= 3.5 ? "mulțumiți în general" :
      computedRating !== null && computedRating >= 2.5 ? "împărțiți în opinii" :
      "nemulțumiți în general";

    // Extract key phrases from positive reviews
    const positiveTexts = positive.map(r => r.text).join(" ");
    const negativeTexts = negative.map(r => r.text).join(" ");

    const positiveKeywords: string[] = [];
    const negativeKeywords: string[] = [];

    const keywordMap: Record<string, string> = {
      "performan": "performanță excelentă",
      "rapid": "viteză mare",
      "bater": "autonomie bună",
      "ecran": "ecran de calitate",
      "design": "design elegant",
      "calitat": "calitate bună",
      "silențio": "funcționare silențioasă",
      "compact": "format compact",
      "ușor": "greutate redusă",
      "camera": "cameră foto bună",
      "foto": "cameră foto bună",
      "sunet": "sunet de calitate",
      "display": "display excelent",
    };

    for (const [key, label] of Object.entries(keywordMap)) {
      if (positiveTexts.toLowerCase().includes(key) && !positiveKeywords.includes(label)) {
        positiveKeywords.push(label);
      }
      if (negativeTexts.toLowerCase().includes(key) && !negativeKeywords.includes(label)) {
        negativeKeywords.push(label);
      }
    }

    let summary = `Din cele ${reviewCount} recenzii, clienții sunt ${sentimentLabel} de acest produs.`;

    if (positiveKeywords.length > 0) {
      summary += ` Aspectele apreciate includ: **${positiveKeywords.slice(0, 3).join("**, **")}**.`;
    } else if (positive.length > 0) {
      summary += ` Majoritatea cumpărătorilor recomandă produsul.`;
    }

    if (negative.length > 0 && negativeKeywords.length > 0) {
      summary += ` Unii utilizatori menționează rezerve legate de: **${negativeKeywords.slice(0, 2).join("**, **")}**.`;
    } else if (negative.length > 0) {
      summary += ` ${negative.length} ${negative.length === 1 ? "recenzie menționează" : "recenzii menționează"} aspecte negative.`;
    }

    return summary;
  }, [productReviews, reviewCount, computedRating]);

  const allProducts = productsData as any[];
  const recommended = useMemo(() =>
    allProducts.filter(p => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 8),
    [product.id, product.category]
  );
  const recentlyViewed = useMemo(() =>
    getRecentlyViewed().filter(p => String(p.id) !== String(product.id)),
    [product.id]
  );
  const boughtByOthers = useMemo(() =>
    allProducts.filter(p => String(p.id) !== String(product.id)).slice(3, 11),
    [product.id]
  );

  return (
    <div className="flex flex-col h-full bg-background">
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
            onClick={() => {
              const added = toggleWishlist({
                id: String(product.id),
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice ?? product.originalPrice,
                images: imageList,
                rating: product.rating,
                reviews: product.reviews ?? product.reviewCount,
              });
              setIsWishlisted(added);
            }}
            className="p-2 rounded-full hover:bg-muted"
          >
            <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Image Gallery */}
        <motion.div
          className="relative aspect-square bg-[#F5F5F7] overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) {
              setSelectedImage(i => Math.min(i + 1, imageList.length - 1));
            } else if (info.offset.x > 50) {
              setSelectedImage(i => Math.max(i - 1, 0));
            }
          }}
        >
          <motion.img
            key={selectedImage}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            src={imageList[selectedImage]}
            alt="Product"
            className="w-full h-full object-contain p-8 pointer-events-none"
            draggable={false}
          />
          {discountPercent && (
            <Badge className="absolute top-4 left-4 bg-[#E31E24] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imageList.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`h-2 rounded-full transition-all ${
                  selectedImage === index ? "bg-[#E31E24] w-5" : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Thumbnail Strip */}
        {imageList.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-gray-100">
            {imageList.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all bg-[#F5F5F7] ${
                  selectedImage === index ? "border-[#E31E24]" : "border-gray-200"
                }`}
              >
                <img src={img} alt={`thumb-${index}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-5 space-y-6">
          {/* Title, Price & Key Info */}
          <div>
            {/* Special offer badge */}
            {product.badge && (
              <Badge className="mb-2 bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 font-semibold text-xs px-2 py-0.5">
                {product.badge === "Ofertă" ? "Ofertă specială" : product.badge}
              </Badge>
            )}
            <h1 className="text-xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm">{computedRating ?? "—"}</span>
                <span className="text-xs text-muted-foreground underline ml-1">({reviewCount} recenzii)</span>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold px-2 py-0.5">În stoc</Badge>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-black text-primary">{product.price.toLocaleString('ro-RO')} Lei</span>
              {oldPrice && <span className="text-sm text-muted-foreground line-through">{oldPrice.toLocaleString('ro-RO')} Lei</span>}
              {discountPercent && (
                <Badge className="bg-destructive/10 text-destructive border-0 font-bold text-xs">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Include TVA și garanție 24 luni</p>

            {/* Delivery & Pickup */}
            <div className="mt-4 space-y-2">
              {/* Delivery ETA */}
              {cityLoading ? (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      Livrare estimată în {city!.toUpperCase()} pe {deliveryDate}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Ridicare personală (depozit)</p>
                  <p className="text-xs text-gray-500">Gratuit din showroom</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          {productColors && productColors.length > 0 && (
          <div className="space-y-3">
            <h3>Culoare: {productColors[selectedColor].name}</h3>
            <div className="flex gap-3">
              {productColors.map((color, index) => (
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
          )}

          {/* Storage Selection */}
          {productStorage && productStorage.length > 0 && (
          <div className="space-y-3">
            <h3>Capacitate</h3>
            <div className="grid grid-cols-4 gap-2">
              {productStorage.map((size, index) => (
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
          )}

          {/* Review Summary */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  Rezumat Recenzii
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {generatedReviewSummary
                    ? generatedReviewSummary.split(/\*\*(.+?)\*\*/g).map((part: string, i: number) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )
                    : "Nu există recenzii disponibile pentru a genera un rezumat."}
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

          {/* Tabs */}
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="specs" className="flex-1">Specificații</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Recenzii ({reviewCount})</TabsTrigger>
              <TabsTrigger value="delivery" className="flex-1">Livrare</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="space-y-3 mt-4">
              <div className="space-y-0">
                {productSpecs.length > 0 ? (
                  productSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 gap-3">
                      <div className="flex items-center gap-2 min-w-0 shrink-0">
                        {getSpecIcon(spec.label)}
                        <span className="text-gray-500 text-sm">{spec.label}</span>
                      </div>
                      <span className="font-medium text-sm text-right text-[#111111]">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm py-4 text-center">
                    Specificațiile nu sunt disponibile pentru acest produs.
                  </p>
                )}
              </div>

              {/* Cumperi în rate */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden mt-2">
                <button className="w-full flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-amber-900">Cumperi în rate</p>
                    <p className="text-xs text-amber-700">De la {Math.ceil(product.price / 12).toLocaleString("ro-RO")} Lei/lună</p>
                    <p className="text-xs text-amber-600">Vezi opțiunile de plată în rate</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
                </button>
              </div>

              {/* Reviews summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 mt-2">
                <h3 className="font-bold text-base text-[#111111] mb-3">Recenzii ({reviewCount})</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = computedRating ?? 0;
                        return (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm font-semibold text-[#111111]">{computedRating ?? "—"}</span>
                    <span className="text-sm text-gray-400">{reviewCount} recenzii</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-xs border-[#E31E24] text-[#E31E24] hover:bg-red-50">
                    <PenLine className="h-3.5 w-3.5 mr-1" />
                    Scrie o recenzie
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = computedRating ?? 0;
                      return (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-semibold text-[#111111]">{computedRating ?? "—"}</span>
                  <span className="text-sm text-gray-400">({reviewCount} recenzii)</span>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-full text-xs border-[#E31E24] text-[#E31E24] hover:bg-red-50">
                  <PenLine className="h-3.5 w-3.5 mr-1" />
                  Scrie o recenzie
                </Button>
              </div>
              {productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <Card key={review.id} className="p-4 border border-gray-100 shadow-sm rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-[#111111]">{review.firstName} {review.lastName}</span>
                    </div>
                    <p className="text-sm text-gray-500">{review.text}</p>
                  </Card>
                ))
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">
                  Nu există recenzii pentru acest produs.
                </p>
              )}
            </TabsContent>
            <TabsContent value="delivery" className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Livrare standard</p>
                  <p className="text-xs text-gray-500">Estimat: 1-2 zile lucrătoare (Gratuit)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Ridicare personală din locker</p>
                  <p className="text-xs text-gray-500">Disponibil în toată țara</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Ridicare personală (depozit)</p>
                  <p className="text-xs text-gray-500">Gratuit din showroom evoMAG</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product Carousels */}
        {[
          { title: "S-ar putea să-ți placă", items: recommended },
          { title: "Cumpărate de alți clienți", items: boughtByOthers },
          { title: "Văzute recent", items: recentlyViewed },
        ].map(({ title, items }) => items.length > 0 && (
          <div key={title} className="py-4 border-t border-gray-100">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-base font-bold text-[#111111]">{title}</h2>
              <button className="text-xs font-semibold text-[#E31E24]">Vezi toate</button>
            </div>
            <Carousel opts={{ align: "start", dragFree: true }}>
              <CarouselContent className="-ml-2 px-4">
                {items.map((p: any) => (
                  <CarouselItem key={p.id} className="pl-2 basis-[160px]">
                    <ProductCard
                      id={String(p.id)}
                      name={p.name}
                      price={p.price}
                      originalPrice={p.oldPrice}
                      images={p.images ?? (p.image ? [p.image] : [])}
                      badge={p.badge}
                      onProductClick={() => onProductClick?.(p)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.07)] sticky bottom-0 z-50">
        <div className="flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-sm text-[#111111]">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            size="default"
            className="flex-1 h-12 rounded-full text-base font-bold bg-[#E31E24] hover:bg-[#c71a1f] text-white shadow-md shadow-red-200 transition-all"
            onClick={() => onAddToCart?.({
              id: product.id,
              name: product.name,
              price: product.price,
              images: imageList,
              quantity,
            })}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Adaugă în coș
          </Button>
        </div>
      </div>
    </div>
  );
}
