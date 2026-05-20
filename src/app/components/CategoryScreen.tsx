import React from "react";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface CategoryScreenProps {
  title: string;
  products: any[];
  onBack: () => void;
  onProductClick: (id: string) => void;
  onAddToCart: (product: any) => void;
}

export function CategoryScreen({ title, products, onBack, onProductClick, onAddToCart }: CategoryScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-safe">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">{title}</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="cursor-pointer" onClick={() => onProductClick(product.id)}>
              <ProductCard {...product} onAddToCart={() => onAddToCart(product)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}