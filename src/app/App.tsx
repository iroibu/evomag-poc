import { useState } from "react";
import { loadPreferences, savePreferences } from "./services/userPreferences";
import { addRecentlyViewed } from "./services/recentlyViewed";
import { getCart, saveCart, clearCart } from "./services/cart";
import { BottomNav } from "./components/BottomNav";
import { HomeFeed } from "./components/HomeFeed";
import { SearchScreen } from "./components/SearchScreen";
import { AIAssistant } from "./components/AIAssistant";
import { CartScreen, type CartItemType } from "./components/CartScreen";
import { CheckoutScreen } from "./components/CheckoutScreen";
import { OrderConfirmationScreen } from "./components/OrderConfirmationScreen";
import { OrderDetailScreen } from "./components/OrderDetailScreen";
import { Toaster, toast } from "sonner";
import { Wishlist } from "./components/Wishlist";
import { Profile } from "./components/Profile";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { CategoryScreen } from "./components/CategoryScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { OnboardingPreferences, type OnboardingPrefs } from "./components/OnboardingPreferences";
import { isLoggedIn, saveAuthUser, clearAuthUser } from "./services/auth";
import { Search, Bell } from "lucide-react";
import { ProductDetail } from "./components/ProductDetail";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { type Order } from "./services/orders";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [hasSeenWelcome, setHasSeenWelcome] = useState(
    () => localStorage.getItem("evomag_has_seen_welcome") === "true"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLoggedIn());
  const [hasSetPreferences, setHasSetPreferences] = useState(() => loadPreferences() !== null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleProductClick = (product: any) => {
    addRecentlyViewed(product);
    setSelectedProduct(product);
  };
  const [cartItems, setCartItems] = useState<CartItemType[]>(() => getCart());
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [profileInitialView, setProfileInitialView] = useState<"main" | "orders">("main");
  const [showNotifications, setShowNotifications] = useState(false);
  const [categoryView, setCategoryView] = useState<{ title: string, products: any[], catId?: string } | null>(null);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<string | undefined>(undefined);
  const [aiSessionKey, setAISessionKey] = useState(0);

  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const updated = existing
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...product, quantity: 1 }];
      saveCart(updated);
      return updated;
    });
    toast.success("Produs adăugat în coș!", {
      duration: 2000,
      position: "top-center",
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
      });
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveCart(updated);
      return updated;
    });
  };

  const renderScreen = () => {
    if (selectedProduct) {
      return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onProductClick={setSelectedProduct} />;
    }
    if (categoryView) {
      return <CategoryScreen
               title={categoryView.title}
               products={categoryView.products}
               catId={categoryView.catId}
               onBack={() => setCategoryView(null)}
               onProductClick={handleProductClick}
               onAddToCart={handleAddToCart}
             />;
    }
    if (showNotifications) {
      return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
    }
    switch (activeTab) {
      case "home":
        return <HomeFeed 
                 onProductClick={handleProductClick} 
                 onAddToCart={handleAddToCart} 
                 onSeeAllClick={(title, products, catId) => setCategoryView({ title, products, catId })}
                 onAIClick={() => { setPendingAIPrompt(undefined); setActiveTab("assistant"); }}
                 onAIQuickAction={(prompt) => { setPendingAIPrompt(prompt); setAISessionKey(k => k + 1); setActiveTab("assistant"); }}
               />;
      case "search":
        return <SearchScreen onProductClick={handleProductClick} onCancel={() => setActiveTab("home")} />;
      case "assistant":
        return <AIAssistant key={aiSessionKey} initialPrompt={pendingAIPrompt} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />;
      case "cart":
        return <CartScreen 
                 cartItems={cartItems} 
                 onUpdateQuantity={updateCartQuantity} 
                 onRemoveItem={removeFromCart} 
                 onCheckout={() => setShowCheckout(true)} 
                 onProductClick={handleProductClick}
                 onAddToCart={handleAddToCart}
               />;
      case "wishlist":
        return <Wishlist onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case "profile":
        return <Profile key={profileInitialView} onProductClick={handleProductClick} onAddToCart={handleAddToCart} onLogout={() => setIsAuthenticated(false)} onOpenAI={() => { setPendingAIPrompt(undefined); setActiveTab("assistant"); }} onCategoryClick={(title, prods, catId) => setCategoryView({ title, products: prods, catId })} initialView={profileInitialView} viewingOrder={viewingOrder} />;
      default:
        return <HomeFeed 
                 onProductClick={handleProductClick} 
                 onAddToCart={handleAddToCart} 
                 onSeeAllClick={(title, products, catId) => setCategoryView({ title, products, catId })}
                 onAIClick={() => { setPendingAIPrompt(undefined); setActiveTab("assistant"); }}
                 onAIQuickAction={(prompt) => { setPendingAIPrompt(prompt); setAISessionKey(k => k + 1); setActiveTab("assistant"); }}
               />;
    }
  };

  if (!hasSeenWelcome) {
    return (
      <WelcomeScreen
        onEnter={() => {
          localStorage.setItem("evomag_has_seen_welcome", "true");
          setHasSeenWelcome(true);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  if (!hasSetPreferences) {
    return (
      <div className="h-dvh flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <OnboardingPreferences
          onComplete={(prefs: OnboardingPrefs) => {
            savePreferences(prefs);
            setHasSetPreferences(true);
          }}
        />
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="h-dvh flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <CheckoutScreen 
          total={cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
          cartItems={cartItems}
          onBack={() => setShowCheckout(false)}
          onSuccess={(order) => {
            setCartItems([]);
            clearCart();
            setShowCheckout(false);
            setConfirmedOrder(order);
          }}
        />
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="h-dvh flex flex-col bg-background max-w-md mx-auto overflow-hidden">
        <OrderConfirmationScreen
          order={confirmedOrder}
          onGoHome={() => {
            setConfirmedOrder(null);
            setActiveTab("home");
          }}
          onViewOrder={(order) => {
            setConfirmedOrder(null);
            setViewingOrder(order);
            setProfileInitialView("orders");
            setActiveTab("profile");
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background max-w-md mx-auto overflow-hidden">
      <Toaster />
      {/* Top Header */}
      {activeTab !== "search" && (
        <header className="shrink-0 safe-area-inset-top flex items-center justify-between px-4 py-3 border-b bg-background gap-3">
          <div className="flex-shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="evomag" className="h-7 w-auto" />
          </div>
          <div className="flex-1 relative" onClick={() => setActiveTab("search")}>
            <div className="w-full bg-muted rounded-full pl-9 pr-3 py-2 text-xs border-0 text-muted-foreground flex items-center cursor-pointer h-9">
              Caută produse...
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
      <main className="flex-1 min-h-0 overflow-y-auto" style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}>
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => { setSelectedProduct(null); setCategoryView(null); setShowNotifications(false); if (tab === "assistant") setPendingAIPrompt(undefined); if (tab === "profile") { setProfileInitialView("main"); setViewingOrder(null); } setActiveTab(tab); }} cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} />
    </div>
  );
}

