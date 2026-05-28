import { useState, Fragment } from "react";
import { Package, TrendingUp, CreditCard, Settings, ChevronRight, Sparkles, ChevronLeft, ThumbsUp, ThumbsDown, Info, MessageSquare, Zap, ChevronUp, ChevronDown, ShieldCheck, Gauge, Shield, ArrowLeftRight } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import productsData from "../../data/products";
import { getProductById } from "../../data";
import { type Order, type DeliveryStatus } from "./CheckoutScreen";
import { OrderDetailScreen } from "./OrderDetailScreen";

const ORDERS_STORAGE_KEY = "evomag_orders";

function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  pending: "În așteptare",
  processing: "În procesare",
  shipped: "Expediată",
  delivered: "Livrată",
  cancelled: "Anulată",
};

const deliveryStatusStyles: Record<DeliveryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

interface ProfileProps {
  onProductClick?: (product: any) => void;
}

const initialEquipment = [
  {
    id: "e1",
    name: "iPhone 12 Pro",
    specs: "128 GB, Pacific Blue",
    image: "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=200&q=80",
    purchaseDate: "2021-03-15",
    upgradeScore: 85,
    recommendation: "iPhone 15 Pro",
    productId: "1",
    features: [
      { icon: ShieldCheck, label: "Garanție", status: "activă 6 luni" },
      { icon: Gauge, label: "Performanță inteligentă", status: "activată" },
      { icon: Shield, label: "Protejare ecran", status: "valabilă" },
      { icon: ArrowLeftRight, label: "Trade-in", status: "valabil" }
    ],
    upgradeDetails: "Pe sistemele portabile admiți de upgrade, nu instalează actualizări. Este recomandat upgrade-ul după 3 ani."
  },
  {
    id: "e2",
    name: "MacBook Air M1",
    specs: "8GB RAM, 256GB SSD, Space Gray",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&q=80",
    purchaseDate: "2021-06-20",
    upgradeScore: 65,
    recommendation: "MacBook Air M3",
    productId: "s1",
    features: [
      { icon: ShieldCheck, label: "Garanție", status: "activă 1 an" },
      { icon: Gauge, label: "Performanță inteligentă", status: "activată" },
      { icon: Shield, label: "Protejare fizică", status: "valabilă" },
      { icon: ArrowLeftRight, label: "Trade-in", status: "valabil" }
    ],
    upgradeDetails: "Dispozitivul funcționează optim, dar M3 aduce îmbunătățiri semnificative de performanță."
  },
  {
    id: "e3",
    name: "Apple Watch (3rd gen)",
    specs: "42mm, Space Gray",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&q=80",
    purchaseDate: "2020-11-10",
    upgradeScore: 45,
    recommendation: "Apple Watch Series 9",
    productId: "s2",
    features: [
      { icon: ShieldCheck, label: "Garanție", status: "expirată" },
      { icon: Gauge, label: "Performanță inteligentă", status: "activată" },
      { icon: Shield, label: "Protejare ecran", status: "expirată" },
      { icon: ArrowLeftRight, label: "Trade-in", status: "valabil" }
    ],
    upgradeDetails: "Funcționează bine pentru uzul zilnic, dar lipsa unor funcții moderne poate fi limitativă."
  }
];

export function Profile({ onProductClick }: ProfileProps) {
  const [activeView, setActiveView] = useState<"main" | "orders" | "payments">("main");
  const [selectedCard, setSelectedCard] = useState<string>("card1");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleFeedback = (id: string, isPositive: boolean) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        // Dacă e pozitiv (încă e bun), scade scorul de upgrade. Dacă negativ, crește.
        const newScore = isPositive 
          ? Math.max(10, item.upgradeScore - 15) 
          : Math.min(100, item.upgradeScore + 20);
        return { ...item, upgradeScore: newScore };
      }
      return item;
    }));
  };

  if (selectedOrder) {
    return (
      <OrderDetailScreen
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onProductClick={onProductClick}
      />
    );
  }

  if (activeView === "orders") {
    const orders = loadOrders().slice().reverse();
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setActiveView("main")} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">Comenzile mele</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-muted-foreground">Nu ai comenzi încă</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Comenzile tale vor apărea aici după plasare.</p>
            </div>
          ) : (
            orders.map((order) => {
              const orderTotal = order.products.reduce((sum, p) => sum + p.paidPrice * p.quantity, 0);
              return (
                <Card
                  key={order.orderNumber}
                  onClick={() => setSelectedOrder(order)}
                  className="gap-0 p-3 border border-gray-100 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-muted-foreground">Comanda #{order.orderNumber}</span>
                    <Badge className={`hover:opacity-100 border-0 ${deliveryStatusStyles[order.deliveryStatus]}`}>
                      {deliveryStatusLabels[order.deliveryStatus]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(order.orderDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="space-y-1">
                    {order.products.map((product) => (
                      <div key={product.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg p-0.5 shrink-0">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm text-gray-800 flex-1 line-clamp-1">{product.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">x{product.quantity}</span>
                        <span className="text-sm font-semibold text-primary shrink-0">
                          {(product.paidPrice * product.quantity).toLocaleString("ro-RO")} Lei
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total</span>
                    <span className="font-black text-primary">{orderTotal.toLocaleString("ro-RO")} Lei</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (activeView === "payments") {
    return (
      <div className="flex flex-col h-full bg-gray-50 pb-24">
        <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setActiveView("main")} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">Metode de plată</h1>
        </header>
        <div className="p-4 space-y-3">
          <Card 
            onClick={() => setSelectedCard("card1")}
            className={`p-4 border-2 shadow-sm relative overflow-hidden cursor-pointer transition-colors ${selectedCard === "card1" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
          >
            {selectedCard === "card1" && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Principal</div>}
            <div className="flex items-center gap-3">
              <CreditCard className={`h-6 w-6 ${selectedCard === "card1" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-bold">**** **** **** 4242</p>
                <p className="text-xs text-muted-foreground">Expiră 12/26 • Visa</p>
              </div>
            </div>
          </Card>
          <Card 
            onClick={() => setSelectedCard("card2")}
            className={`p-4 border-2 shadow-sm cursor-pointer transition-colors ${selectedCard === "card2" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
          >
            {selectedCard === "card2" && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Principal</div>}
            <div className="flex items-center gap-3">
              <CreditCard className={`h-6 w-6 ${selectedCard === "card2" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-bold">**** **** **** 5555</p>
                <p className="text-xs text-muted-foreground">Expiră 08/25 • Mastercard</p>
              </div>
            </div>
          </Card>
          <Button variant="outline" className="w-full mt-4 border-dashed h-12">
            + Adaugă card nou
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <div className="w-full h-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white text-2xl font-bold">
              AR
            </div>
          </Avatar>
          <div>
            <h2>Andrei Răducu</h2>
            <p className="text-sm text-muted-foreground">andrei.raducu@email.com</p>
            <Badge className="mt-2 bg-gradient-to-r from-primary to-red-600 text-white border-0">
              VIP Member
            </Badge>
          </div>
        </div>
      </div>

      {/* Equipment Lifecycle */}
      <div className="space-y-4">
        <div className="px-4">
          <h2 className="font-bold text-lg mb-1">
            Ține evidența produselor tale
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Monitorizăm garanțiile și produsele tale. Primești notificări automate când dispozitivul necesită upgrade sau când expiră garanția.
          </p>
        </div>

        {/* Progress Timeline */}
        <div className="px-4">
          <div className="flex items-start">
            {(['Produs înregistrat', 'Monitorizare activă', 'Notificare upgrade', 'Beneficii'] as const).map((label, idx) => {
              const step = idx + 1;
              return (
                <Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step === 1 ? 'bg-primary text-white' : step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step}
                    </div>
                    <span className="w-16 text-center text-[9px] text-muted-foreground mt-1">{label}</span>
                  </div>
                  {idx < 3 && <div className={`flex-1 h-0.5 mt-4 ${step <= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Banner */}
        <div className="px-4">
          <div className="bg-gradient-to-br from-primary/10 via-red-50 to-red-100/50 rounded-xl p-4 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="font-bold text-sm mb-1">Ține evidența produselor de top și fii la curent</h3>
              <p className="text-xs text-muted-foreground">Monitorizăm automat dispozitivele tale și îți oferim recomandări personalizate de upgrade</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3">
          {equipment.map((item) => {
            const isExpanded = expandedItems.includes(item.id);
            return (
              <Card key={item.id} className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                <div className="p-4 space-y-3">
                  {/* Header with Image and Title */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.specs}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Cumpărat în {new Date(item.purchaseDate).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {item.features.map((feature, idx) => {
                      const Icon = feature.icon;
                      const isActive = feature.status.includes('activă') || feature.status.includes('valabil');
                      return (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
                            <Icon className={`h-3 w-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-900 leading-tight">{feature.label}</p>
                            <p className={`text-[9px] leading-tight ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{feature.status}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommendation Link */}
                  {item.upgradeScore > 40 && (
                    <button
                      className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-red-50 to-primary/5 rounded-lg border border-red-100 hover:shadow-sm transition-all text-left group"
                    >
                      <span className="text-xs font-medium text-gray-900">Vezi oferta personalizată pentru upgrade</span>
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Expandable Section */}
                <button
                  onClick={() => setExpandedItems(prev =>
                    isExpanded ? prev.filter(id => id !== item.id) : [...prev, item.id]
                  )}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">Recomandări timp de upgrade</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100">
                    <p className="text-xs text-gray-700 leading-relaxed">{item.upgradeDetails}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        <button
          onClick={() => setActiveView("orders")}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Comenzile mele</span>
          {loadOrders().length > 0 && (
            <Badge className="bg-primary/10 text-primary border-0 rounded-full">{loadOrders().length}</Badge>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => setActiveView("payments")}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Metode de plată</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

      </div>
    </div>
  );
}