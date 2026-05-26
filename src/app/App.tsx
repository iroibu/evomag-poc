import { useState } from "react";
import { loadPreferences } from "./services/userPreferences";
import { addRecentlyViewed } from "./services/recentlyViewed";
import { BottomNav } from "./components/BottomNav";
import { HomeFeed } from "./components/HomeFeed";
import { SearchScreen } from "./components/SearchScreen";
import { AIAssistant } from "./components/AIAssistant";
import { CartScreen, CartItemType } from "./components/CartScreen";
import { CheckoutScreen } from "./components/CheckoutScreen";
import { Toaster, toast } from "sonner";
import { Wishlist } from "./components/Wishlist";
import { Profile } from "./components/Profile";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { CategoryScreen } from "./components/CategoryScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Search, Bell } from "lucide-react";
import { ProductDetail } from "./components/ProductDetail";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => loadPreferences() !== null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleProductClick = (product: any) => {
    addRecentlyViewed(product);
    setSelectedProduct(product);
  };
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categoryView, setCategoryView] = useState<{ title: string, products: any[] } | null>(null);

  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success("Produs adăugat în coș!", {
      duration: 2000,
      position: "top-center",
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeFeed 
                 onProductClick={handleProductClick} 
                 onAddToCart={handleAddToCart} 
                 onSeeAllClick={(title, products) => setCategoryView({ title, products })}
               />;
      case "search":
        return <SearchScreen onProductClick={handleProductClick} onCancel={() => setActiveTab("home")} />;
      case "assistant":
        return <AIAssistant />;
      case "cart":
        return <CartScreen 
                 cartItems={cartItems} 
                 onUpdateQuantity={updateCartQuantity} 
                 onRemoveItem={removeFromCart} 
                 onCheckout={() => setShowCheckout(true)} 
               />;
      case "profile":
        return <Profile onProductClick={handleProductClick} />;
      default:
        return <HomeFeed 
                 onProductClick={handleProductClick} 
                 onAddToCart={handleAddToCart} 
                 onSeeAllClick={(title, products) => setCategoryView({ title, products })}
               />;
    }
  };

  if (!hasSeenWelcome) {
    return <WelcomeScreen onEnter={() => setHasSeenWelcome(true)} />;
  }

  if (showNotifications) {
    return (
      <div className="h-screen flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <NotificationsScreen onBack={() => setShowNotifications(false)} />
      </div>
    );
  }

  if (categoryView) {
    return (
      <div className="h-screen flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <CategoryScreen 
          title={categoryView.title}
          products={categoryView.products}
          onBack={() => setCategoryView(null)}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="h-screen flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <CheckoutScreen 
          total={cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
          onBack={() => setShowCheckout(false)}
          onSuccess={() => {
            setCartItems([]);
            setShowCheckout(false);
            setActiveTab("home");
            alert("Comanda a fost plasată cu succes!");
          }}
        />
      </div>
    );
  }

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background max-w-md mx-auto overflow-hidden">
      <Toaster />
      {/* Top Header */}
      {activeTab !== "assistant" && activeTab !== "search" && (
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background gap-3">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-black text-primary tracking-tight">
              evoMAG
            </h1>
          </div>
          <div className="flex-1 relative" onClick={() => setActiveTab("search")}>
            <div className="w-full bg-muted rounded-full pl-9 pr-3 py-2 text-xs border-0 text-muted-foreground flex items-center cursor-pointer h-9">
              Caută produse, branduri, categorii...
            </div>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <button 
            className="flex-shrink-0 p-2 -mr-2 relative" 
            aria-label="Notificări"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-6 w-6 text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-background"></span>
          </button>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} />
    </div>
  );
}