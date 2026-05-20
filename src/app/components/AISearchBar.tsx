import { Loader2, Search, Sparkles, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  getAIProductSuggestions,
  type AISuggestedProduct,
} from "../services/geminiSearch";
import { Input } from "./ui/input";

interface AISearchBarProps {
  value?: string;
  onSearch?: (query: string) => void;
  onConfirmSearch?: (
    query: string,
    products: AISuggestedProduct[],
    insight: string,
  ) => void;
  onProductSelect?: (id: string) => void;
}

const quickSuggestions = [
  "Laptop pentru gaming sub 5000 Lei",
  "iPhone cu cea mai bună cameră",
  "Căști noise-cancelling pentru călătorii",
  "Monitor 4K pentru design",
];

export function AISearchBar({
  value,
  onSearch,
  onConfirmSearch,
  onProductSelect,
}: AISearchBarProps) {
  const [query, setQuery] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestedProduct[]>([]);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValueRef = useRef(value);
  const isExternalUpdateRef = useRef(false);

  // Sync externally-set value (e.g. trending/recent click) without opening dropdown
  useEffect(() => {
    if (value !== undefined && value !== prevValueRef.current) {
      prevValueRef.current = value;
      isExternalUpdateRef.current = true;
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    // Skip debounce for external value updates — caller handles the fetch
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setInsight("");
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getAIProductSuggestions(query);
        setSuggestions(result.products);
        setInsight(result.insight);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Eroare la obținerea sugestiilor AI",
        );
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleInputChange = (newValue: string) => {
    prevValueRef.current = newValue;
    setQuery(newValue);
    onSearch?.(newValue);
  };

  const handleClear = () => {
    prevValueRef.current = "";
    setQuery("");
    setSuggestions([]);
    setInsight("");
    setError(null);
    onSearch?.("");
  };

  const handleConfirm = () => {
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsFocused(false);
    onConfirmSearch?.(query, suggestions, insight);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
  };

  const showDropdown = isFocused && (query.length >= 2 || !query);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Caută cu AI..."
          className="h-14 pl-12 pr-12 rounded-2xl bg-muted border-0 text-base"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background/50"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-lg border z-50 overflow-hidden"
          >
            {/* Empty state: quick suggestions */}
            {!query && (
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground px-2">
                  Sugestii AI
                </p>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange(suggestion)}
                    className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {query.length >= 2 && isLoading && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    AI analizează căutarea...
                  </p>
                </div>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 animate-pulse"
                  >
                    <div className="w-14 h-14 bg-muted rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {query.length >= 2 && !isLoading && error && (
              <div className="p-4 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {/* AI product suggestions */}
            {query.length >= 2 &&
              !isLoading &&
              !error &&
              suggestions.length > 0 && (
                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-primary">
                      Sugestii AI
                    </p>
                  </div>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => onProductSelect?.(product.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 object-contain rounded-xl bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary font-bold mt-0.5">
                          {product.price.toLocaleString("ro-RO")} Lei
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] text-muted-foreground">
                            {product.rating}
                          </span>
                          <span className="text-[10px] text-primary/70 ml-1 italic">
                            {product.aiReason}
                          </span>
                        </div>
                      </div>
                      {product.badge && (
                        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shrink-0">
                          {product.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={handleConfirm}
                    className="w-full text-center text-sm text-primary font-medium py-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    Vezi toate rezultatele pentru "{query}"
                  </button>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
