import { Clock, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  getAIProductSuggestions,
  type AISuggestedProduct,
} from "../services/geminiSearch";
import { AISearchBar } from "./AISearchBar";
import { ProductCard } from "./ProductCard";
import { Badge } from "./ui/badge";

const trendingSearches = [
  "iPhone 15 Pro Max",
  "PlayStation 5",
  "AirPods Pro",
  "MacBook Air M3",
  "Samsung S24 Ultra",
];

const recentSearches = ["Laptop gaming", "Căști wireless", "Monitor 4K"];

export function SearchScreen({
  onProductClick,
  onCancel,
}: {
  onProductClick?: (product: any) => void;
  onCancel?: () => void;
}){
  const [searchBarValue, setSearchBarValue] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [aiResults, setAiResults] = useState<AISuggestedProduct[]>([]);
  const [aiInsight, setAiInsight] = useState("");
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchBarValue(query);
    if (!query.trim()) {
      setHasSearched(false);
      setAiResults([]);
      setAiInsight("");
    }
  };

  const handleConfirmSearch = async (
    query: string,
    products: AISuggestedProduct[],
    insight: string,
  ) => {
    if (!query.trim()) return;
    setCurrentQuery(query);
    if (products.length > 0) {
      setAiResults(products);
      setAiInsight(insight);
      setHasSearched(true);
    } else {
      setHasSearched(true);
      setIsLoadingResults(true);
      try {
        const result = await getAIProductSuggestions(query);
        setAiResults(result.products);
        setAiInsight(result.insight);
      } catch {
        setAiResults([]);
        setAiInsight("");
      } finally {
        setIsLoadingResults(false);
      }
    }
  };

  const handleTrendingClick = (search: string) => {
    setSearchBarValue(search);
    handleConfirmSearch(search, [], "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="shrink-0 bg-background z-10 px-4 pt-4 pb-2 flex gap-2 items-center border-b">
        <div className="flex-1">
          <AISearchBar
            value={searchBarValue}
            onSearch={handleSearch}
            onConfirmSearch={handleConfirmSearch}
            onProductSelect={onProductClick}
          />
        </div>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-primary px-2 whitespace-nowrap"
        >
          Anulare
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 py-6">
      {!hasSearched ? (
        <>
          {/* Trending Searches */}
          <div className="space-y-3 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2>Trending acum</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(search)}
                  className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="space-y-3 px-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2>Căutări recente</h2>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(search)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <span className="text-sm">{search}</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Search Tips */}
          <div className="px-4">
            <div className="bg-gradient-to-br from-primary/10 to-red-600/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3>Căutare inteligentă</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Poți căuta în limbaj natural: "laptop pentru programare sub 5000
                Lei" sau "telefon cu cameră bună pentru poze"
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Search Results Header */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-2">
              <h2>Rezultate pentru "{currentQuery}"</h2>
              <Badge variant="secondary">{aiResults.length} produse</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Am găsit cele mai relevante produse pentru tine
            </p>
          </div>

          {/* AI Recommendation */}
          <div className="px-4">
            <div className="bg-gradient-to-br from-primary to-red-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <h3>Recomandare</h3>
              </div>
              {isLoadingResults || !aiInsight ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-white/90">
                    Se analizează produsele...
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/90">{aiInsight}</p>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="px-4">
            {isLoadingResults ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-muted animate-pulse h-64"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {aiResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onProductClick?.(product)}
                    className="cursor-pointer"
                  >
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
