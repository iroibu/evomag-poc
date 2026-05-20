import React from "react";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartScreenProps {
  cartItems: CartItemType[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartScreen({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: CartScreenProps) {
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coșul tău este gol</h2>
        <p className="text-muted-foreground text-sm">
          Alege produsele dorite și adaugă-le în coș pentru a finaliza comanda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold ml-2 flex-1">Coșul meu</h1>
        <span className="text-sm font-semibold bg-muted px-2 py-1 rounded-full">
          {cartItems.reduce((acc, i) => acc + i.quantity, 0)} articole
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-muted/30 rounded-lg p-2 shrink-0">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-medium line-clamp-2 mb-1">{item.name}</h3>
                <span className="text-sm font-bold text-primary">{item.price.toLocaleString('ro-RO')} Lei</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 bg-muted/50 rounded-full px-1 py-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{total.toLocaleString('ro-RO')} Lei</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Cost livrare</span>
          <span className="font-semibold text-green-600">Gratuit</span>
        </div>
        <div className="h-px bg-border w-full" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Total</span>
          <span className="font-black text-xl text-primary">{total.toLocaleString('ro-RO')} Lei</span>
        </div>
        <Button onClick={onCheckout} className="w-full h-12 rounded-full text-base font-bold shadow-lg shadow-primary/20">
          Spre finalizare
        </Button>
      </div>
    </div>
  );
}