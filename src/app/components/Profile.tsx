import { useState } from "react";
import { Wishlist } from "./Wishlist";
import { OrderDetailScreen } from "./OrderDetailScreen";
import { getOrders, type Order } from "../services/orders";
import { getWishlist } from "../services/wishlist";
import { 
  Package, 
  CreditCard, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  ShieldCheck, 
  MapPin,
  RefreshCcw,
  Truck,
  Box,
  CheckCircle2,
  Clock,
  Plus,
  ShoppingCart,
  AlertCircle,
  Info,
  Wallet,
  Ticket,
  Star,
  HelpCircle,
  Bell,
  Calendar,
  Tag,
  Activity,
  Search
} from "lucide-react";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";

interface ProfileProps {
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

type ActiveView = "main" | "my-products" | "orders" | "favorites" | "cards" | "addresses";
type OrderStatus = "all" | "in-procesare" | "in-livrare" | "livrate" | "retur";
type ProductFilter = "all" | "upgrade" | "attention" | "good";

// --- Mock Data ---

const initialEquipment = [
  {
    id: "e1",
    name: "iPhone 12 Pro",
    specs: "128 GB, Pacific Blue",
    image: "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=200&q=80",
    purchaseDate: "2021-03-15",
    productStatus: "upgrade" as const,
    age: "3 ani, 2 luni",
    tradeIn: "~ 1.200 Lei",
    performance: "Scăzută (72%)",
    detailsText: "Se apropie perioada optimă de upgrade. Dispozitivul nu va mai primi următoarea versiune majoră de iOS, iar valoarea de trade-in va scădea considerabil."
  },
  {
    id: "e2",
    name: "MacBook Air M1",
    specs: "8GB RAM, 256GB SSD, Space Gray",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&q=80",
    purchaseDate: "2022-08-10",
    productStatus: "attention" as const,
    age: "1 an, 9 luni",
    tradeIn: "~ 2.500 Lei",
    performance: "Optimă (89%)",
    detailsText: "Se apropie momentul optim pentru upgrade. Valoarea de trade-in este încă avantajoasă pentru trecerea la un model cu procesor mai nou."
  },
  {
    id: "e3",
    name: "Apple Watch Series 9",
    specs: "45mm, Midnight Aluminum",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&q=80",
    purchaseDate: "2023-11-05",
    productStatus: "good" as const,
    age: "6 luni",
    tradeIn: "~ 1.800 Lei",
    performance: "Excelentă (100%)",
    detailsText: "Funcționează foarte bine. Garanția este activă și bateria este în parametri maximi."
  }
];

const initialFavorites = [
  { id: "f1", name: "PlayStation 5 Console, 825GB, White Edition", price: "2.499 Lei", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&q=80" },
  { id: "f2", name: "Samsung Galaxy S24 Ultra, 512GB, Titanium", price: "5.899 Lei", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&q=80" },
  { id: "f3", name: "Căști Wireless Sony WH-1000XM5, Noise Cancelling", price: "1.499 Lei", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80" },
  { id: "f4", name: "Apple Watch Series 9, GPS, 45mm", price: "2.199 Lei", image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&q=80" }
];

export function Profile({ onProductClick, onAddToCart }: ProfileProps) {
  const [activeView, setActiveView] = useState<ActiveView>("main");
  const [orderFilter, setOrderFilter] = useState<OrderStatus>("all");
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [orders] = useState<Order[]>(() => getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const deliveryStatusToFilter = (status: Order["deliveryStatus"]): OrderStatus => {
    if (status === "pending" || status === "processing") return "in-procesare";
    if (status === "shipped") return "in-livrare";
    if (status === "delivered") return "livrate";
    if (status === "cancelled") return "retur";
    return "in-procesare";
  };

  const statusLabel = (status: Order["deliveryStatus"]): string => {
    const map: Record<Order["deliveryStatus"], string> = {
      pending: "În procesare",
      processing: "În procesare",
      shipped: "În livrare",
      delivered: "Livrată",
      cancelled: "Returnată",
    };
    return map[status];
  };

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter(o => deliveryStatusToFilter(o.deliveryStatus) === orderFilter);

  const orderTotal = (order: Order) =>
    order.products.reduce((sum, p) => sum + p.paidPrice * p.quantity, 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
  
  const [equipment] = useState(initialEquipment);
  const [favorites, setFavorites] = useState(initialFavorites);
  
  // Card adding state
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({ number: "", expiry: "", name: "" });

  const [addresses, setAddresses] = useState([
    { id: "a1", name: "Acasă", street: "Strada Primăverii, Nr. 14, Bl. A", city: "București, Sector 1", isMain: true },
    { id: "a2", name: "Birou", street: "Bulevardul Pipera, Nr. 1", city: "București, Sector 2", isMain: false },
  ]);

  const [cards, setCards] = useState([
    { id: "c1", number: "**** **** **** 4242", expiry: "12/26", type: "Visa", isMain: true },
    { id: "c2", number: "**** **** **** 5555", expiry: "08/25", type: "Mastercard", isMain: false },
  ]);

  const handleOpenOrders = (filter: OrderStatus) => {
    setOrderFilter(filter);
    setActiveView("orders");
  };

  const handleSaveCard = () => {
    if (newCardData.number.length > 4) {
      const lastFour = newCardData.number.slice(-4);
      const isVisa = newCardData.number.startsWith("4");
      
      setCards([...cards, {
        id: Math.random().toString(),
        number: `**** **** **** ${lastFour}`,
        expiry: newCardData.expiry || "12/28",
        type: isVisa ? "Visa" : "Mastercard",
        isMain: cards.length === 0
      }]);
      setIsAddingCard(false);
      setNewCardData({ number: "", expiry: "", name: "" });
    } else {
      alert("Introduceți un număr de card valid.");
    }
  };

  const renderHeader = (title: string, onBack?: () => void) => (
    <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
      <button 
        onClick={onBack || (() => setActiveView("main"))} 
        className="p-2 -ml-2 rounded-full hover:bg-muted mr-2 flex items-center justify-center"
      >
        <ChevronLeft className="h-6 w-6 text-[#111111]" />
      </button>
      <h1 className="text-xl font-bold flex-1 text-[#111111]">{title}</h1>
    </header>
  );


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
    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        {renderHeader("Comenzile mele")}
        
        {/* Filters */}
        <div className="bg-white px-4 py-3 border-b border-[#E5E5EA] overflow-x-auto scrollbar-hide flex gap-2">
          {[
            { id: "all", label: "Toate" },
            { id: "in-procesare", label: "În procesare" },
            { id: "in-livrare", label: "În livrare" },
            { id: "livrate", label: "Livrate" },
            { id: "retur", label: "Retururi" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setOrderFilter(f.id as OrderStatus)}
              className={`px-4 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-colors border whitespace-nowrap ${
                orderFilter === f.id 
                  ? "bg-[#111111] text-white border-[#111111]" 
                  : "bg-white text-[#6B7280] border-[#E5E5EA] hover:border-[#111111]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {filteredOrders.length > 0 ? filteredOrders.map(order => {
            const firstProduct = order.products[0];
            const total = orderTotal(order);
            const filterStatus = deliveryStatusToFilter(order.deliveryStatus);
            return (
              <Card key={order.orderNumber} className="p-4 border border-[#E5E5EA] shadow-sm bg-white rounded-2xl cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedOrder(order)}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-[#6B7280]">Comanda #{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    filterStatus === 'in-procesare' ? 'bg-orange-100 text-orange-700' :
                    filterStatus === 'in-livrare' ? 'bg-blue-100 text-blue-700' :
                    filterStatus === 'livrate' ? 'bg-[#DDF7E7] text-[#2E9B4F]' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {statusLabel(order.deliveryStatus)}
                  </span>
                </div>
                {firstProduct && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#F5F5F7] rounded-xl p-2 shrink-0">
                      <img src={firstProduct.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt={firstProduct.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#111111] line-clamp-1">
                        {firstProduct.name}{order.products.length > 1 ? ` +${order.products.length - 1} produse` : ""}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-1">{formatDate(order.orderDate)}</p>
                      <p className="font-black text-[#E31E24] mt-1.5">{total.toLocaleString("ro-RO")} Lei</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          }) : (
            <div className="text-center text-[#6B7280] py-10">Nu există comenzi pentru acest status.</div>
          )}
        </div>
      </div>
    );
  }

  if (activeView === "favorites") {
    return <Wishlist onBack={() => setActiveView("main")} onProductClick={onProductClick} onAddToCart={onAddToCart} />;
  }

  if (activeView === "cards") {
    if (isAddingCard) {
      return (
        <div className="flex flex-col h-full bg-[#F5F5F7]">
          {renderHeader("Adaugă card nou", () => setIsAddingCard(false))}
          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Număr card</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  maxLength={19}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newCardData.number}
                  onChange={(e) => setNewCardData({...newCardData, number: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Nume titular</label>
                <input 
                  type="text" 
                  placeholder="Nume Prenume" 
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newCardData.name}
                  onChange={(e) => setNewCardData({...newCardData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Expirare</label>
                  <input 
                    type="text" 
                    placeholder="LL/AA" 
                    maxLength={5}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                    value={newCardData.expiry}
                    onChange={(e) => setNewCardData({...newCardData, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">CVV</label>
                  <input 
                    type="password" 
                    placeholder="***" 
                    maxLength={3}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsAddingCard(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#111111] bg-white border border-[#E5E5EA] hover:bg-gray-50 transition-colors"
              >
                Renunță
              </button>
              <button 
                onClick={handleSaveCard}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#E31E24] hover:bg-red-700 transition-colors"
              >
                Salvează card
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        {renderHeader("Cardurile mele")}
        <div className="p-4 space-y-3 overflow-y-auto">
          {cards.map(card => (
            <Card 
              key={card.id}
              onClick={() => {
                setCards(cards.map(c => ({ ...c, isMain: c.id === card.id })));
              }}
              className={`p-4 border-2 shadow-sm rounded-2xl relative overflow-hidden cursor-pointer transition-colors ${
                card.isMain ? "border-[#E31E24] bg-[#FEF2F2]" : "border-[#E5E5EA] bg-white hover:border-gray-300"
              }`}
            >
              {card.isMain && <div className="absolute top-0 right-0 bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">Principal</div>}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${card.isMain ? 'bg-white text-[#E31E24]' : 'bg-[#F5F5F7] text-[#6B7280]'}`}>
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className={`font-bold text-base ${card.isMain ? 'text-[#E31E24]' : 'text-[#111111]'}`}>{card.number}</p>
                  <p className={`text-xs ${card.isMain ? 'text-[#E31E24]/70' : 'text-[#6B7280]'}`}>Expiră {card.expiry} • {card.type}</p>
                </div>
              </div>
            </Card>
          ))}
          <button 
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#E5E5EA] rounded-2xl text-[#111111] font-bold hover:bg-white hover:border-gray-300 transition-colors mt-2"
          >
            <Plus className="w-5 h-5" /> Adaugă card nou
          </button>
        </div>
      </div>
    );
  }

  if (activeView === "addresses") {
    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        {renderHeader("Adresele mele")}
        <div className="p-4 space-y-3 overflow-y-auto">
          {addresses.map(addr => (
            <Card 
              key={addr.id}
              onClick={() => {
                setAddresses(addresses.map(a => ({ ...a, isMain: a.id === addr.id })));
              }}
              className={`p-4 border-2 shadow-sm rounded-2xl relative overflow-hidden cursor-pointer transition-colors ${
                addr.isMain ? "border-[#E31E24] bg-[#FEF2F2]" : "border-[#E5E5EA] bg-white hover:border-gray-300"
              }`}
            >
              {addr.isMain && <div className="absolute top-0 right-0 bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">Principală</div>}
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${addr.isMain ? 'bg-white text-[#E31E24]' : 'bg-[#F5F5F7] text-[#6B7280]'}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${addr.isMain ? 'text-[#E31E24]' : 'text-[#111111]'}`}>{addr.name}</h4>
                  <p className={`text-xs leading-relaxed ${addr.isMain ? 'text-[#E31E24]/80' : 'text-[#6B7280]'}`}>{addr.street}<br/>{addr.city}</p>
                </div>
              </div>
            </Card>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#E5E5EA] rounded-2xl text-[#111111] font-bold hover:bg-white hover:border-gray-300 transition-colors mt-2">
            <Plus className="w-5 h-5" /> Adaugă adresă nouă
          </button>
        </div>
      </div>
    );
  }

  if (activeView === "my-products") {
    const upgradeCount = equipment.filter(e => e.productStatus === "upgrade").length;
    const attentionCount = equipment.filter(e => e.productStatus === "attention").length;
    const goodCount = equipment.filter(e => e.productStatus === "good").length;

    const filteredEquipment = productFilter === "all" ? equipment : equipment.filter(e => e.productStatus === productFilter);

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7] font-sans">
        {/* Light Modern Header */}
        <header className="shrink-0 flex flex-col px-5 pt-10 pb-6 sticky top-0 z-10 bg-[#F5F5F7]/95 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView("main")} 
              className="p-2 -ml-2 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-[#111111]" />
            </button>
            <h1 className="text-2xl font-black flex-1 text-[#111111] tracking-tight">Produsele mele</h1>
          </div>
          <p className="text-gray-500 text-sm mt-2 font-medium">Gestionează inteligent dispozitivele deținute. Afli instant valoarea de trade-in și momentul perfect pentru upgrade.</p>
        </header>

        <div className="flex-1 overflow-y-auto">
          
          {/* Status Summary Row - Light Mode */}
          <div className="px-5 mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm bg-white border border-red-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <AlertCircle className="w-5 h-5 text-[#E31E24]" />
                <span className="text-[#E31E24] font-black text-2xl leading-none">{upgradeCount}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight relative z-10">Upgrade<br/>Acum</span>
            </div>
            
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm bg-white border border-orange-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Info className="w-5 h-5 text-orange-500" />
                <span className="text-orange-500 font-black text-2xl leading-none">{attentionCount}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight relative z-10">Atenție<br/>Curând</span>
            </div>
            
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm bg-white border border-green-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E9B4F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <CheckCircle2 className="w-5 h-5 text-[#2E9B4F]" />
                <span className="text-[#2E9B4F] font-black text-2xl leading-none">{goodCount}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight relative z-10">Stare<br/>Optimă</span>
            </div>
          </div>

          {/* Pill Filters - Light Mode */}
          <div className="px-5 mt-8 overflow-x-auto scrollbar-hide flex gap-2 pb-2">
            {[
              { id: "all", label: "Toate dispozitivele", activeClass: "bg-gray-200/60 text-[#111111] border-gray-300" },
              { id: "upgrade", label: "Necesită Upgrade", activeClass: "bg-[#E31E24]/10 text-[#E31E24] border-[#E31E24]/20" },
              { id: "attention", label: "De Urmărit", activeClass: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
              { id: "good", label: "Stare Perfectă", activeClass: "bg-[#2E9B4F]/10 text-[#2E9B4F] border-[#2E9B4F]/20" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setProductFilter(f.id as ProductFilter)}
                className={`px-5 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  productFilter === f.id 
                    ? f.activeClass 
                    : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Product List - Light Mode */}
          <div className="px-5 mt-4 space-y-4 pb-6">
            {filteredEquipment.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                {/* Decorative background glow for upgrade/attention items */}
                {item.productStatus === 'upgrade' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FEF2F2] rounded-full blur-2xl pointer-events-none" />}
                {item.productStatus === 'attention' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl pointer-events-none" />}
                
                <div className="flex gap-4 items-stretch relative z-10">
                  <div className="w-24 h-24 bg-[#F5F5F7] rounded-2xl p-2 shrink-0 flex items-center justify-center">
                    <img src={item.image} className="max-w-full max-h-full object-contain mix-blend-multiply" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-black text-base text-[#111111] leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs font-medium text-gray-500 truncate mb-2">{item.specs}</p>
                    
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 w-max">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500">Achiziție: {new Date(item.purchaseDate).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status Specific Text Box */}
                <div className={`mt-4 p-3 rounded-xl border relative z-10 ${
                  item.productStatus === 'upgrade' ? 'bg-[#FEF2F2] border-[#E31E24]/20 text-[#E31E24]' :
                  item.productStatus === 'attention' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                  'bg-[#DDF7E7]/50 border-[#2E9B4F]/20 text-[#2E9B4F]'
                }`}>
                  <div className="flex items-start gap-2">
                    {item.productStatus === 'upgrade' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    {item.productStatus === 'attention' && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
                    {item.productStatus === 'good' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                    <p className="text-[11px] font-bold leading-relaxed">{item.detailsText}</p>
                  </div>
                </div>

                {/* 3 Stats Grid */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 relative z-10 px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Vechime</span>
                    <span className="text-xs font-bold text-[#111111]">{item.age}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Trade-in</span>
                    <span className="text-xs font-black text-[#E31E24]">{item.tradeIn}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Status</span>
                    <span className="text-xs font-bold text-[#111111]">{item.performance}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {item.productStatus === 'upgrade' && (
                  <button className="w-full mt-4 bg-[#E31E24]/10 hover:bg-[#E31E24]/20 text-[#E31E24] py-3 rounded-xl text-xs font-black transition-colors relative z-10 border border-[#E31E24]/20">
                    Vezi oferte pentru upgrade
                  </button>
                )}
                {item.productStatus === 'attention' && (
                  <button className="w-full mt-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 py-3 rounded-xl text-xs font-black transition-colors relative z-10 border border-orange-500/20">
                    Evaluează opțiunile de trade-in
                  </button>
                )}
                {item.productStatus === 'good' && (
                  <button className="w-full mt-4 bg-[#2E9B4F]/10 hover:bg-[#2E9B4F]/20 text-[#2E9B4F] py-3 rounded-xl text-xs font-black transition-colors relative z-10 border border-[#2E9B4F]/20">
                    Vezi accesorii compatibile
                  </button>
                )}

              </div>
            ))}
            
            {filteredEquipment.length === 0 && (
              <div className="text-center text-gray-500 py-12 font-medium text-sm">
                Nu s-a găsit niciun produs.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN PROFILE VIEW
  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] overflow-y-auto font-sans">
      {/* User Profile Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-[#E31E24] to-[#C71015] flex items-center justify-center text-white text-2xl font-black">
              AR
            </div>
          </Avatar>
          <div className="flex-1 pt-1">
            <h2 className="text-2xl font-black text-[#111111] leading-tight mb-1.5">Andrei Răducu</h2>
            <p className="text-sm font-medium text-gray-500 mb-3">andrei.raducu@email.com</p>
            <div className="inline-flex items-center gap-1.5 bg-white text-[#E31E24] px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-100 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Membru din 2021</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 relative z-20 space-y-3 pb-8">

        {/* Orders Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div
            className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => handleOpenOrders("all")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-[#E31E24]" />
              </div>
              <h3 className="font-black text-base text-[#111111]">Comenzile mele</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-4 divide-x divide-gray-100 p-4">
            <div onClick={() => handleOpenOrders("in-procesare")} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="relative">
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <Box className="w-5 h-5 text-orange-600" />
                </div>
                {orders.filter(o => deliveryStatusToFilter(o.deliveryStatus) === "in-procesare").length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E31E24] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                    {orders.filter(o => deliveryStatusToFilter(o.deliveryStatus) === "in-procesare").length}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">În proces</span>
            </div>

            <div onClick={() => handleOpenOrders("in-livrare")} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="relative">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                {orders.filter(o => deliveryStatusToFilter(o.deliveryStatus) === "in-livrare").length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                    {orders.filter(o => deliveryStatusToFilter(o.deliveryStatus) === "in-livrare").length}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">În livrare</span>
            </div>

            <div onClick={() => handleOpenOrders("livrate")} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Livrate</span>
            </div>

            <div onClick={() => handleOpenOrders("retur")} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <RefreshCcw className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Retururi</span>
            </div>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
          <div
            onClick={() => setActiveView("my-products")}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-[#E31E24]" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm text-[#111111] mb-0.5">Produsele mele</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-snug">Garanții, upgrade-uri și detalii tehnice</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div
            onClick={() => setActiveView("favorites")}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm text-[#111111] mb-0.5">Favorite</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-snug">{getWishlist().length} produse salvate pentru mai târziu</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div
            onClick={() => setActiveView("cards")}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm text-[#111111] mb-0.5">Cardurile mele</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-snug">{cards.length} carduri salvate pentru plăți rapide</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div
            onClick={() => setActiveView("addresses")}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm text-[#111111] mb-0.5">Adresele mele</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-snug">{addresses.length} adrese salvate pentru livrări</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Settings & Support */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="flex-1 font-bold text-sm text-[#111111]">Centru de suport</h4>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <h4 className="flex-1 font-bold text-sm text-[#111111]">Setări cont</h4>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full bg-white rounded-2xl p-4 text-center font-bold text-sm text-gray-500 hover:text-[#E31E24] hover:bg-red-50 transition-all border border-gray-100 shadow-sm mt-1">
          Ieși din cont
        </button>
        
      </div>
    </div>
  );
}