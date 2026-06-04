import { useState } from "react";
import products from "../../data/products.json";
import { Wishlist } from "./Wishlist";
import { getOrders, type Order } from "../services/orders";
import { getWishlist } from "../services/wishlist";
import { loadAddresses, saveAddresses, updateAddress, deleteAddress, type Address } from "../services/addresses";
import { loadCards, addCard, setMainCard, deleteCard, type PaymentCard } from "../services/cards";
import { clearAuthUser, getAuthUser } from "../services/auth";
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
  Check,
  Clock,
  Plus,
  ShoppingCart,
  AlertCircle,
  Info,
  Wallet,
  Ticket,
  Star,
  Bell,
  Calendar,
  Tag,
  Activity,
  Search,
  Trash2,
  MoreVertical,
  Zap,
  Home,
  Briefcase,
  Edit2,
  MessageSquare,
  Laptop,
  LogOut
} from "lucide-react";
import { Card } from "./ui/card";
import { OrderDetailScreen } from "./OrderDetailScreen";

interface ProfileProps {
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  onLogout?: () => void;
  onOpenAI?: () => void;
  onCategoryClick?: (title: string, products: any[], catId?: string) => void;
  initialView?: ActiveView;
  viewingOrder?: Order;
}

type ActiveView = "main" | "my-products" | "orders" | "favorites" | "cards" | "addresses";
type OrderStatus = "all" | "in-procesare" | "in-livrare" | "livrate" | "retur";
type ProductFilter = "all" | "upgrade" | "attention" | "good";

// --- Mock Data ---

// Hardcoded upgrade product IDs per equipment item — same brand, same product line only
const upgradeProductMap: Record<string, { title: string; ids: string[]; catId: string }> = {
  e1: {
    title: "Upgrade iPhone — modele noi",
    ids: ["t4", "d1"],   // iPhone 15 Pro, iPhone 15 Pro Max
    catId: "phones",
  },
  e2: {
    title: "Upgrade MacBook — modele noi",
    ids: ["t7"],         // MacBook Air M3
    catId: "laptops",
  },
  e3: {
    title: "Upgrade Apple Watch — modele noi",
    ids: ["t25"],        // Apple Watch Series 9 (newest in catalog)
    catId: "smartwatch",
  },
};

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

export function Profile({ onProductClick, onAddToCart, onLogout, onOpenAI, onCategoryClick, initialView, viewingOrder }: ProfileProps) {
  const [activeView, setActiveView] = useState<ActiveView>(initialView ?? "main");
  const [orderFilter, setOrderFilter] = useState<OrderStatus>("all");
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [orders] = useState<Order[]>(() => getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(viewingOrder);

  const authUser = getAuthUser();
  const fullName = authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : "Utilizator";
  const initials = authUser
    ? `${authUser.firstName.charAt(0)}${authUser.lastName.charAt(0)}`.toUpperCase()
    : "?";
  const email = authUser?.email ?? "";

  const inLivrareCount = orders.filter(o => o.deliveryStatus === "shipped").length;
  const recentlyDeliveredCount = orders.filter(o =>
    o.deliveryStatus === "delivered" &&
    new Date(o.orderDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

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

  const orderTotal = (order: Order) => order.total;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
  
  const [equipment] = useState(initialEquipment);
  const [favorites, setFavorites] = useState(initialFavorites);
  
  // Card adding state
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({ number: "", expiry: "", name: "" });
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);

  // Address adding state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddressData, setNewAddressData] = useState({ judet: "", localitate: "", adresa: "", codPostal: "", tag: "" });
  const [addressMenuOpenId, setAddressMenuOpenId] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>(() => loadAddresses());

  const [cards, setCards] = useState<PaymentCard[]>(() => loadCards());

  const handleOpenOrders = (filter: OrderStatus) => {
    setOrderFilter(filter);
    setActiveView("orders");
  };

  const handleSaveCard = () => {
    if (newCardData.number.length > 4) {
      const lastFour = newCardData.number.replace(/\s/g, "").slice(-4);
      const isVisa = newCardData.number.trim().startsWith("4");
      const updated = addCard({
        number: `**** **** **** ${lastFour}`,
        expiry: newCardData.expiry || "12/28",
        type: isVisa ? "Visa" : "Mastercard",
        isMain: cards.length === 0
      });
      setCards(updated);
      setIsAddingCard(false);
      setNewCardData({ number: "", expiry: "", name: "" });
    } else {
      alert("Introduceți un număr de card valid.");
    }
  };

  const handleSaveAddress = () => {
    if (newAddressData.adresa.trim().length > 0 && newAddressData.localitate.trim().length > 0) {
      const resolvedName = newAddressData.tag.trim() ||
        `${newAddressData.localitate.trim()}${newAddressData.judet.trim() ? ", " + newAddressData.judet.trim() : ""}`;
      const newAddress: Address = {
        id: Date.now().toString(),
        name: resolvedName,
        street: newAddressData.adresa.trim(),
        city: `${newAddressData.localitate.trim()}${newAddressData.judet.trim() ? ", " + newAddressData.judet.trim() : ""}`,
        codPostal: newAddressData.codPostal.trim(),
        isMain: addresses.length === 0
      };
      const updated = [...addresses, newAddress];
      saveAddresses(updated);
      setAddresses(updated);
      setIsAddingAddress(false);
      setNewAddressData({ judet: "", localitate: "", adresa: "", codPostal: "", tag: "" });
    } else {
      alert("Introduceți cel puțin adresa și localitatea.");
    }
  };

  const handleEditAddress = (addr: Address) => {
    const knownTags = ["Acasă", "Birou"];
    const cityParts = addr.city.split(",").map(s => s.trim());
    const localitate = cityParts[0] ?? "";
    const judet = cityParts[1] ?? "";
    setEditingAddressId(addr.id);
    setNewAddressData({
      judet,
      localitate,
      adresa: addr.street,
      codPostal: addr.codPostal ?? "",
      tag: knownTags.includes(addr.name) ? addr.name : ""
    });
  };

  const handleUpdateAddress = () => {
    if (!editingAddressId) return;
    if (newAddressData.adresa.trim().length > 0 && newAddressData.localitate.trim().length > 0) {
      const resolvedName = newAddressData.tag.trim() ||
        `${newAddressData.localitate.trim()}${newAddressData.judet.trim() ? ", " + newAddressData.judet.trim() : ""}`;
      const updated = updateAddress(editingAddressId, {
        name: resolvedName,
        street: newAddressData.adresa.trim(),
        city: `${newAddressData.localitate.trim()}${newAddressData.judet.trim() ? ", " + newAddressData.judet.trim() : ""}`,
        codPostal: newAddressData.codPostal.trim(),
      });
      setAddresses(updated);
      setEditingAddressId(null);
      setNewAddressData({ judet: "", localitate: "", adresa: "", codPostal: "", tag: "" });
    } else {
      alert("Introduceți cel puțin adresa și localitatea.");
    }
  };

  const handleDeleteAddress = (id: string) => {
    const updated = deleteAddress(id);
    setAddresses(updated);
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
    const activeOrders = orders.filter(o =>
      o.deliveryStatus === "pending" || o.deliveryStatus === "processing" || o.deliveryStatus === "shipped"
    );
    const recentlyDeliveredOrders = orders.filter(o => o.deliveryStatus === "delivered");

    const getStepsDone= (status: Order["deliveryStatus"]) => {
      if (status === "pending") return 1;
      if (status === "processing") return 2;
      if (status === "shipped") return 3;
      return 4;
    };

    const formatOrderNumber = (n: number) => `#${n}`;

    const formatShortDate = (iso: string) =>
      new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

    const getStepDate = (orderDate: string, stepOffset: number) => {
      const d = new Date(orderDate);
      d.setDate(d.getDate() + stepOffset);
      return formatShortDate(d.toISOString());
    };

    const renderStatusBadge = (status: Order["deliveryStatus"]) => {
      if (status === "shipped") return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
          <Truck className="w-3 h-3" /> În livrare
        </span>
      );
      if (status === "processing" || status === "pending") return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
          <Clock className="w-3 h-3" /> În procesare
        </span>
      );
      if (status === "delivered") return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
          <Package className="w-3 h-3" /> Livrată
        </span>
      );
      return null;
    };

    const STEP_LABELS = ["Confirmată", "Pregătită", "La curier", "Livrare estimată"];

    const renderActiveOrderCard = (order: Order) => {
      const total = orderTotal(order);
      const stepsDone = getStepsDone(order.deliveryStatus);
      const isSingleProduct = order.products.length === 1;
      const firstProduct = order.products[0];
      const displayProducts = order.products.slice(0, 3);
      const extraCount = order.products.length - 3;

      return (
        <div key={order.orderNumber} className="bg-white rounded-2xl border border-[#E5E5EA] shadow-sm overflow-hidden mb-3">
          {/* Order header row */}
          <div className="flex justify-between items-center px-4 pt-4 pb-3">
            <div>
              <p className="font-bold text-sm text-[#111111]">{formatOrderNumber(order.orderNumber)}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(order.orderDate)}</p>
            </div>
            {renderStatusBadge(order.deliveryStatus)}
          </div>

          {/* Products row — single product: image + name/price; multiple: thumbnails + summary */}
          {isSingleProduct ? (
            <div className="px-4 pb-3 flex items-center gap-3">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-xl p-1.5 shrink-0">
                <img src={firstProduct.images?.[0] ?? ""} className="w-full h-full object-contain mix-blend-multiply" alt={firstProduct.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#111111] line-clamp-2 leading-snug">{firstProduct.name}</p>
                <p className="font-black text-base text-[#111111] mt-1">{total.toLocaleString("ro-RO")} Lei</p>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {displayProducts.map((p, i) => (
                  <div key={i} className="w-14 h-14 bg-[#F5F5F7] rounded-xl p-1 shrink-0">
                    <img src={p.images?.[0] ?? ""} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-xs font-bold text-[#6B7280]">
                    +{extraCount}
                  </div>
                )}
              </div>
              <div className="text-right ml-2">
                <p className="text-xs text-[#6B7280]">{order.products.length} produse</p>
                <p className="font-black text-base text-[#111111]">{total.toLocaleString("ro-RO")} Lei</p>
              </div>
            </div>
          )}

          {/* Delivery timeline */}
          <div className="px-8 pb-3">
            <div className="flex items-center mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${stepsDone > 0 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`}>
                {stepsDone > 0 && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className={`flex-1 h-0.5 ${stepsDone > 1 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${stepsDone > 1 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`}>
                {stepsDone > 1 && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className={`flex-1 h-0.5 ${stepsDone > 2 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${stepsDone > 2 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`}>
                {stepsDone > 2 && (stepsDone === 3 ? <Truck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white" />)}
              </div>
              <div className={`flex-1 h-0.5 ${stepsDone > 3 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${stepsDone > 3 ? "bg-[#E31E24]" : "bg-[#E5E5EA]"}`}>
                {stepsDone > 3 && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="flex items-start">
              {STEP_LABELS.map((label, i) => (
                <>
                  {i > 0 && <div key={`sep-${i}`} className="flex-1" />}
                  <div key={i} className="flex flex-col items-center w-6">
                    <p className="text-[9px] font-medium text-[#6B7280] text-center leading-tight whitespace-nowrap">{label}</p>
                    <p className="text-[9px] text-[#9CA3AF] text-center whitespace-nowrap">{getStepDate(order.orderDate, i)}</p>
                  </div>
                </>
              ))}
            </div>
          </div>

          {/* Estimated delivery banner for shipped orders */}
          {order.deliveryStatus === "shipped" && (
            <div className="mx-4 mb-3 px-3 py-2.5 bg-[#FFF2F2] rounded-xl flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#E31E24] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#111111]">Ajunge mâine</p>
                <p className="text-xs text-[#6B7280]">între 14:00 - 18:00</p>
              </div>
            </div>
          )}

          <div className="px-4 pb-4 pt-3 border-t border-[#F5F5F7] flex justify-end">
            <button
              onClick={() => setSelectedOrder(order)}
              className="flex items-center gap-0.5 text-sm font-bold text-[#E31E24]"
            >
              Vezi detalii <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    };

    const renderDeliveredOrderCard = (order: Order) => {
      const total = orderTotal(order);
      const firstProduct = order.products[0];
      const [productName, productSpec] = firstProduct
        ? firstProduct.name.includes(",")
          ? firstProduct.name.split(",").map(s => s.trim())
          : [firstProduct.name, null]
        : [null, null];
      return (
        <div key={order.orderNumber} className="bg-white rounded-2xl border border-[#E5E5EA] shadow-sm overflow-hidden mb-3">
          <div className="flex justify-between items-center px-4 pt-4 pb-3">
            <div>
              <p className="font-bold text-sm text-[#111111]">{formatOrderNumber(order.orderNumber)}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(order.orderDate)}</p>
            </div>
            {renderStatusBadge(order.deliveryStatus)}
          </div>
          {firstProduct && (
            <div className="px-4 pb-3 flex items-center gap-4">
              <div className="w-20 h-20 bg-[#F5F5F7] rounded-xl p-2 shrink-0">
                <img src={firstProduct.images?.[0] ?? ""} className="w-full h-full object-contain mix-blend-multiply" alt={firstProduct.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#111111] line-clamp-1">{productName}</p>
                {productSpec && <p className="text-xs text-[#6B7280] mt-0.5">{productSpec}</p>}
                <p className="font-black text-base text-[#111111] mt-1">{total.toLocaleString("ro-RO")} Lei</p>
              </div>
            </div>
          )}
          <div className="px-4 pb-4 pt-3 border-t border-[#F5F5F7] flex justify-end">
            <button
              onClick={() => setSelectedOrder(order)}
              className="flex items-center gap-0.5 text-sm font-bold text-[#E31E24]"
            >
              Vezi din nou <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        {/* Header */}
        <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setActiveView("main")}
            className="p-2 -ml-2 rounded-full hover:bg-muted mr-2 flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6 text-[#111111]" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-[#111111]">Comenzile mele</h1>
        </header>

        {orders.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white px-6 pt-8 pb-8 flex flex-col items-center">
              {/* Illustration */}
              <div className="w-48 h-48 mb-2">
                <img src="/evomag-poc/orders_box.png" alt="Nicio comandă" className="w-full h-full object-contain" />
              </div>

              <h2 className="text-[22px] font-black text-[#111111] text-center leading-tight mb-2">
                Prima ta comandă<br/>începe aici.
              </h2>
              <p className="text-sm text-[#9CA3AF] text-center mb-1">Nu ai plasat încă nicio comandă.</p>
              <p className="text-sm text-[#9CA3AF] text-center mb-6">
                Descoperă produse recomandate și{" "}
                <span className="font-bold text-[#E31E24]">cumpără în câteva secunde.</span>
              </p>

              <button className="w-full py-4 rounded-full bg-[#E31E24] text-white font-bold text-base mb-3" onClick={() => onCategoryClick?.("Toate categoriile", products as any[])}>
                Explorează produse
              </button>
              <button className="w-full py-4 rounded-full border border-[#E5E5EA] text-[#111111] font-bold text-sm flex items-center justify-center gap-2" onClick={onOpenAI}>
                <span className="text-[#9CA3AF] text-base">✦</span>
                Vorbește cu EvoMi
              </button>
            </div>

            {/* EvoMi suggestion card */}
            <div className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-[#E5E5EA]">
              <div className="flex items-start gap-3">
                <span className="text-base font-bold text-[#111111] mt-0.5">✦</span>
                <div className="flex-1">
                  <p className="font-bold text-[#111111] text-sm mb-1">Nu știi ce să alegi?</p>
                  <p className="text-sm text-[#6B7280] mb-3">EvoMi te poate ajuta să găsești produsul potrivit pentru tine.</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E31E24] text-[#E31E24] text-sm font-bold" onClick={onOpenAI}>
                    <MessageSquare className="w-4 h-4" /> Întreabă EvoMi
                  </button>
                </div>
              </div>
            </div>

            {/* Popular categories */}
            <div className="px-4 mt-4 pb-6">
              <h3 className="font-bold text-[#111111] text-base mb-3">Explorează categorii populare</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "laptops", name: "Laptopuri", desc: "Performanță pentru orice nevoie", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&q=80" },
                  { id: "phones", name: "Telefoane", desc: "Cele mai noi modele", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" },
                  { id: "smart-home", name: "Smart Home", desc: "Tehnologie pentru casă ta", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80" }
                ].map(cat => (
                  <div key={cat.name} className="bg-white rounded-2xl border border-[#E5E5EA] p-3 flex flex-col overflow-hidden cursor-pointer active:opacity-70" onClick={() => onCategoryClick?.(cat.name, (products as any[]).filter(p => p.category && p.category.toLowerCase().includes(cat.id)), cat.id)}>
                    <p className="font-bold text-xs text-[#111111] mb-1">{cat.name}</p>
                    <p className="text-[10px] text-[#6B7280] mb-2 leading-tight flex-1">{cat.desc}</p>
                    <img src={cat.img} className="w-full h-16 object-contain mix-blend-multiply rounded-lg" alt={cat.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Orders Content ── */
          <div className="flex-1 overflow-y-auto p-4">
            {/* Stats summary */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-sm p-4 mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-[#E31E24]" />
              </div>
              <div className="flex flex-1 items-stretch">
                <div className="flex-1 pr-4">
                  <p className="text-2xl font-black text-[#E31E24] leading-none">{inLivrareCount}</p>
                  <p className="text-xs font-bold text-[#111111]">în livrare</p>
                  <p className="text-[10px] text-[#6B7280]">Comenzi active</p>
                </div>
                <div className="w-px bg-[#E5E5EA]" />
                <div className="flex-1 pl-4">
                  <p className="text-2xl font-black text-green-600 leading-none">{recentlyDeliveredCount}</p>
                  <p className="text-xs font-bold text-[#111111]">livrată recent</p>
                  <p className="text-[10px] text-[#6B7280]">În ultimele 30 zile</p>
                </div>
              </div>
            </div>

            {activeOrders.length > 0 && (
              <>
                <h2 className="text-base font-black text-[#111111] mb-3">Comenzi active</h2>
                {activeOrders.map(renderActiveOrderCard)}
              </>
            )}

            {recentlyDeliveredOrders.length > 0 && (
              <>
                <h2 className="text-base font-black text-[#111111] mb-3 mt-2">Comenzi livrate recent</h2>
                {recentlyDeliveredOrders.map(renderDeliveredOrderCard)}
              </>
            )}
          </div>
        )}
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                    setNewCardData({...newCardData, number: formatted});
                  }}
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
        <div className="px-4 pt-3 pb-6 overflow-y-auto space-y-4">

          {/* Subtitle */}
          <p className="text-sm text-[#6B7280]">Gestionează cardurile tale pentru plăți rapide și sigure.</p>

          {/* Stats Row */}
          <div className="bg-white rounded-2xl px-4 py-3 flex items-start shadow-sm border border-gray-100">
            <div className="flex-1 flex items-start gap-2">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-[#E31E24]" />
              </div>
              <div>
                <p className="text-lg font-black text-[#111111] leading-tight">{cards.length}</p>
                <p className="text-[11px] font-bold text-[#111111] leading-tight">Carduri salvate</p>
                <p className="text-[10px] text-[#6B7280] leading-tight">Plăți mai rapide</p>
              </div>
            </div>
            <div className="w-px bg-gray-100 self-stretch mx-1" />
            <div className="flex-1 flex items-start gap-2 px-1">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-black text-[#111111] leading-tight">100%</p>
                <p className="text-[11px] font-bold text-[#111111] leading-tight">Securizate</p>
                <p className="text-[10px] text-[#6B7280] leading-tight">Date criptate</p>
              </div>
            </div>
            <div className="w-px bg-gray-100 self-stretch mx-1" />
            <div className="flex-1 flex items-start gap-2 pl-1">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#111111] leading-tight mt-1">Plată 1-click</p>
                <p className="text-[10px] text-[#6B7280] leading-tight">Fără completare la fiecare comandă</p>
              </div>
            </div>
          </div>

          {/* Card Items */}
          <div className="space-y-3">
            {cards.map(card => (
              <Card
                key={card.id}
                className={`border-2 shadow-sm rounded-2xl overflow-hidden transition-colors ${
                  card.isMain ? "border-[#E31E24] bg-white" : "border-[#E5E5EA] bg-white hover:border-gray-300"
                }`}
              >
                <div className="p-4 pb-3 flex items-start gap-3 relative">
                  {/* Card Visual */}
                  <div className="w-[82px] h-[54px] rounded-xl flex flex-col justify-between p-2 shrink-0 shadow-md relative bg-gradient-to-br from-[#aaaaaa] to-[#cccccc]">
                    <div className="w-5 h-3.5 rounded-sm" style={{ background: "linear-gradient(135deg, #f9d54a 0%, #c8962a 100%)" }} />
                    <div className="flex justify-end">
                      {card.type.toLowerCase() === "visa" ? (
                        <svg viewBox="0 0 48 20" className="w-8 h-auto" aria-label="Visa">
                          <text x="24" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="15" fill="white" letterSpacing="-0.5">VISA</text>
                        </svg>
                      ) : card.type.toLowerCase() === "mastercard" ? (
                        <svg viewBox="0 0 38 24" className="w-7 h-auto" aria-label="Mastercard">
                          <circle cx="13" cy="12" r="10" fill="#EB001B" />
                          <circle cx="25" cy="12" r="10" fill="#F79E1B" />
                          <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" />
                        </svg>
                      ) : (
                        <CreditCard className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#111111] tracking-wide">{card.number}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Expiră {card.expiry} · {card.type}
                    </p>
                    {card.isMain && (
                      <div className="flex items-center gap-1 mt-2 bg-red-50 px-2 py-1 rounded-full w-fit">
                        <ShieldCheck className="w-3 h-3 text-[#E31E24] shrink-0" />
                        <p className="text-[10px] font-semibold text-[#E31E24]">Cardul principal pentru plățile tale</p>
                      </div>
                    )}
                  </div>

                  {/* Principal badge + menu */}
                  <div className="flex flex-col items-end gap-2 shrink-0 relative">
                    {card.isMain && (
                      <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">Principal</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardMenuOpenId(cardMenuOpenId === card.id ? null : card.id);
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Opțiuni card"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown menu */}
                    {cardMenuOpenId === card.id && (
                      <>
                        {/* Backdrop to close menu */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => { e.stopPropagation(); setCardMenuOpenId(null); }}
                        />
                        <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                          {!card.isMain && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = setMainCard(card.id);
                                setCards(updated);
                                setCardMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#111111] hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                              Marchează ca principal
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = deleteCard(card.id);
                              setCards(updated);
                              setCardMenuOpenId(null);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#E31E24] hover:bg-red-50 transition-colors whitespace-nowrap ${!card.isMain ? "border-t border-gray-100" : ""}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            Șterge card
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </Card>
            ))}
          </div>

          {/* Add Card Button */}
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex flex-col items-center justify-center gap-0.5 py-4 border-2 border-dashed border-[#E5E5EA] rounded-2xl bg-white hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#111111]" />
              <span className="text-[#111111] font-bold text-sm">Adaugă card nou</span>
            </div>
            <span className="text-[11px] text-[#6B7280]">Visa, Mastercard sau alte carduri</span>
          </button>

          {/* Why save card section */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-black text-sm text-[#111111] mb-4">De ce să salvezi cardul?</h3>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Plăți mai rapide</p>
                    <p className="text-[11px] text-[#6B7280]">Finalizezi comenzile în 1-click</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Siguranță maximă</p>
                    <p className="text-[11px] text-[#6B7280]">Datele tale sunt criptate și securizate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <RefreshCcw className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Control deplin</p>
                    <p className="text-[11px] text-[#6B7280]">Poți șterge sau edita oricând</p>
                  </div>
                </div>
              </div>
              {/* Card illustration */}
              <div className="flex items-center justify-center shrink-0 w-24">
                <div className="relative">
                  <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-[#E31E24] to-[#a01015] shadow-md" />
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md border-2 border-white">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (activeView === "addresses") {
    if (isAddingAddress || editingAddressId !== null) {
      const isEditing = editingAddressId !== null;
      return (
        <div className="flex flex-col h-full bg-[#F5F5F7]">
          {renderHeader(isEditing ? "Editează adresa" : "Adaugă adresă nouă", () => {
            setIsAddingAddress(false);
            setEditingAddressId(null);
            setNewAddressData({ judet: "", localitate: "", adresa: "", codPostal: "", tag: "" });
          })}
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Tag selector */}
            <div>
              <label className="text-xs font-bold text-[#6B7280] mb-2 block">Etichetă (opțional)</label>
              <div className="flex gap-3">
                {[
                  { value: "Acasă", label: "Acasă", icon: <Home className="w-4 h-4" /> },
                  { value: "Birou", label: "Birou", icon: <Briefcase className="w-4 h-4" /> },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewAddressData({ ...newAddressData, tag: newAddressData.tag === opt.value ? "" : opt.value })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      newAddressData.tag === opt.value
                        ? "bg-[#FEF2F2] border-[#E31E24] text-[#E31E24]"
                        : "bg-white border-[#E5E5EA] text-[#6B7280] hover:bg-gray-50"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Județ</label>
                <input
                  type="text"
                  placeholder="Județ"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newAddressData.judet}
                  onChange={(e) => setNewAddressData({...newAddressData, judet: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Localitate/sector</label>
                <input
                  type="text"
                  placeholder="Localitate/sector"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newAddressData.localitate}
                  onChange={(e) => setNewAddressData({...newAddressData, localitate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Adresă</label>
                <input
                  type="text"
                  placeholder="Adresă"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newAddressData.adresa}
                  onChange={(e) => setNewAddressData({...newAddressData, adresa: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Cod poștal</label>
                <input
                  type="text"
                  placeholder="Cod poștal"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newAddressData.codPostal}
                  onChange={(e) => setNewAddressData({...newAddressData, codPostal: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsAddingAddress(false);
                  setEditingAddressId(null);
                  setNewAddressData({ judet: "", localitate: "", adresa: "", codPostal: "", tag: "" });
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#111111] bg-white border border-[#E5E5EA] hover:bg-gray-50 transition-colors"
              >
                Renunță
              </button>
              <button
                onClick={isEditing ? handleUpdateAddress : handleSaveAddress}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#E31E24] hover:bg-red-700 transition-colors"
              >
                {isEditing ? "Actualizează adresa" : "Salvează adresa"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    const mainAddress = addresses.find(a => a.isMain);
    const otherAddresses = addresses.filter(a => !a.isMain);

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        {/* Custom header matching design */}
        <header className="shrink-0 flex items-center px-4 pt-5 pb-4 bg-white sticky top-0 z-10">
          <button
            onClick={() => setActiveView("main")}
            className="p-2 -ml-2 rounded-full hover:bg-muted mr-1 flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6 text-[#111111]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111111] leading-tight">Adresele mele</h1>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5">{addresses.length} adrese salvate</p>
          </div>
        </header>

        <div className="px-4 pt-4 pb-6 space-y-3 overflow-y-auto" onClick={() => setAddressMenuOpenId(null)}>
          {/* Main address section */}
          {mainAddress && (() => {
            const addrIcon = mainAddress.name === "Acasă"
              ? { bg: "bg-[#FEF2F2]", icon: <Home className="h-5 w-5 text-[#E31E24]" /> }
              : mainAddress.name === "Birou"
              ? { bg: "bg-[#EEF2FF]", icon: <Briefcase className="h-5 w-5 text-[#6366F1]" /> }
              : { bg: "bg-[#F0FDF4]", icon: <MapPin className="h-5 w-5 text-[#16A34A]" /> };
            return (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-[#E31E24]">Adresă principală</span>
                <Star className="w-3.5 h-3.5 text-[#E31E24]" />
              </div>
              <Card className="bg-white border border-[#E5E5EA] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${addrIcon.bg} flex items-center justify-center shrink-0`}>
                      {addrIcon.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#111111] mb-0.5">{mainAddress.name}</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">{mainAddress.street}<br />{mainAddress.city}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FEF2F2] px-2.5 py-1 rounded-full shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#E31E24]" />
                      <span className="text-[11px] font-semibold text-[#E31E24]">Principală</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#E5E5EA] flex">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditAddress(mainAddress); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[#6B7280] text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editează
                  </button>
                </div>
              </Card>
            </div>
            );
          })()}

          {/* Other addresses section */}
          {otherAddresses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] mb-2 mt-1">Alte adrese</p>
              {otherAddresses.map(addr => {
                const addrIcon = addr.name === "Acasă"
                  ? { bg: "bg-[#FEF2F2]", icon: <Home className="h-5 w-5 text-[#E31E24]" /> }
                  : addr.name === "Birou"
                  ? { bg: "bg-[#EEF2FF]", icon: <Briefcase className="h-5 w-5 text-[#6366F1]" /> }
                  : { bg: "bg-[#F0FDF4]", icon: <MapPin className="h-5 w-5 text-[#16A34A]" /> };
                return (
                <Card key={addr.id} className="bg-white border border-[#E5E5EA] rounded-2xl shadow-sm overflow-visible mb-2">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${addrIcon.bg} flex items-center justify-center shrink-0`}>
                        {addrIcon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-[#111111] mb-0.5">{addr.name}</h4>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{addr.street}<br />{addr.city}</p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddressMenuOpenId(addressMenuOpenId === addr.id ? null : addr.id); }}
                          className="p-1 text-[#6B7280] hover:text-[#111111] transition-colors"
                          aria-label="Opțiuni adresă"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {addressMenuOpenId === addr.id && (
                          <div className="absolute right-0 top-7 z-20 bg-white border border-[#E5E5EA] rounded-xl shadow-lg overflow-hidden w-48">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                                setAddressMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#111111] hover:bg-[#F5F5F7] transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-[#6B7280]" />
                              Editează
                            </button>
                            <div className="h-px bg-[#E5E5EA]" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = addresses.map(a => ({ ...a, isMain: a.id === addr.id }));
                                saveAddresses(updated);
                                setAddresses(updated);
                                setAddressMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#111111] hover:bg-[#F5F5F7] transition-colors"
                            >
                              <Star className="w-4 h-4 text-[#6366F1]" />
                              Setează ca principală
                            </button>
                            <div className="h-px bg-[#E5E5EA]" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                                setAddressMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#E31E24] hover:bg-[#FEF2F2] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Șterge
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          )}

          {/* Add new address — card style */}
          <button
            onClick={() => setIsAddingAddress(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-[#E5E5EA] rounded-2xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#E5E5EA] flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-[#6B7280]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-[#111111] leading-tight">Adaugă adresă nouă</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Adaugă o adresă pentru livrări rapide și sigure</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] shrink-0" />
          </button>

          {/* Promo banner */}
          <div className="flex items-center gap-3 px-4 py-4 bg-[#FEF2F2] rounded-2xl">
            <MapPin className="w-9 h-9 text-[#E31E24] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#111111] leading-tight">Livrare mai rapidă</p>
              <p className="text-xs text-[#6B7280] leading-relaxed mt-0.5">Salvează mai multe adrese și alege ușor unde livrăm.</p>
            </div>
            <button onClick={() => setIsAddingAddress(true)} className="shrink-0 bg-[#E31E24] text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap">
              Adaugă acum
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "my-products") {
    const upgradeCount = equipment.filter(e => e.productStatus === "upgrade").length;
    const attentionCount = equipment.filter(e => e.productStatus === "attention").length;
    const goodCount = equipment.filter(e => e.productStatus === "good").length;

    const filteredEquipment = productFilter === "all" ? equipment : equipment.filter(e => e.productStatus === productFilter);

    const getPercentage = (performance: string) =>
      parseInt(performance.match(/\d+/)?.[0] ?? "0");

    const renderStatusRing = (performance: string, status: string) => {
      const pct = getPercentage(performance);
      const r = 13;
      const circ = 2 * Math.PI * r;
      const dashOffset = circ - (pct / 100) * circ;
      const color = status === "upgrade" ? "#E31E24" : status === "attention" ? "#F97316" : "#2E9B4F";
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0 -rotate-90">
          <circle cx="17" cy="17" r={r} fill="none" stroke="#E5E5EA" strokeWidth="3" />
          <circle
            cx="17" cy="17" r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${circ}`}
            strokeDashoffset={`${dashOffset}`}
            strokeLinecap="round"
          />
        </svg>
      );
    };

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7] font-sans">
        {/* Header */}
        <header className="shrink-0 flex flex-col px-4 pt-5 pb-4 sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("main")}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-[#111111]" />
            </button>
            <h1 className="text-2xl font-black flex-1 text-[#111111] tracking-tight">Produsele mele</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1.5 leading-snug">
            Gestionează inteligent dispozitivele deținute.<br />
            Afli instant valoarea de trade-in și momentul perfect pentru upgrade.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">

          {/* Status Summary Row */}
          <div className="px-4 mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl px-3 py-4 flex flex-col items-center justify-center text-center bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <RefreshCcw className="w-4 h-4 text-[#E31E24]" />
                <span className="text-[#E31E24] font-black text-2xl leading-none">{upgradeCount}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 leading-tight">Upgrade<br />recomandat</span>
            </div>

            <div className="rounded-2xl px-3 py-4 flex flex-col items-center justify-center text-center bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 font-black text-2xl leading-none">{attentionCount}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 leading-tight">Atenție<br />curând</span>
            </div>

            <div className="rounded-2xl px-3 py-4 flex flex-col items-center justify-center text-center bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9B4F]" />
                <span className="text-[#2E9B4F] font-black text-2xl leading-none">{goodCount}</span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 leading-tight">Stare<br />optimă</span>
            </div>
          </div>

          {/* Pill Filters */}
          <div className="px-4 mt-5 overflow-x-auto scrollbar-hide flex gap-2 pb-1">
            {[
              { id: "all", label: "Toate dispozitivele" },
              { id: "upgrade", label: "Necesită upgrade" },
              { id: "attention", label: "De urmărit" },
              { id: "good", label: "Stare perfectă" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setProductFilter(f.id as ProductFilter)}
                className={`px-3 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
                  productFilter === f.id
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-white text-[#6B7280] border-[#E5E5EA] hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Product List */}
          <div className="px-4 mt-4 space-y-4 pb-6">
            {filteredEquipment.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Card Header: image + info + badge + menu */}
                <div className="flex gap-3 p-4 pb-3 items-start">
                  <div className="w-[82px] h-[82px] bg-[#F5F5F7] rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-bold text-[15px] text-[#111111] leading-snug mb-0.5">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">{item.specs}</p>
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-500">
                        Achiziție: {new Date(item.purchaseDate).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                    {item.productStatus === 'upgrade' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#E31E24] bg-[#FEF2F2] px-2 py-1 rounded-full border border-[#E31E24]/20 whitespace-nowrap">
                        <RefreshCcw className="w-2.5 h-2.5" />
                        Upgrade recomandat
                      </span>
                    )}
                    {item.productStatus === 'attention' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5" />
                        Atenție curând
                      </span>
                    )}
                    {item.productStatus === 'good' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#2E9B4F] bg-[#F0FDF4] px-2 py-1 rounded-full border border-green-100 whitespace-nowrap">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Stare optimă
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Text Box */}
                <div className="mx-4 mb-3 p-3 rounded-xl bg-[#EFF6FF] border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-600 leading-relaxed">{item.detailsText}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-2 mx-4 mb-3 pt-3 border-t border-gray-100">
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">Vechime</p>
                    <p className="text-sm font-bold text-[#111111]">{item.age}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">Trade-in estimat</p>
                    <p className="text-sm font-bold text-[#111111]">{item.tradeIn}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Stare</p>
                      <p className="text-sm font-bold text-[#111111]">{item.performance}</p>
                    </div>
                    {renderStatusRing(item.performance, item.productStatus)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mx-4 mb-4">
                  {item.productStatus === 'upgrade' && (
                    <button
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#FEF2F2] text-[#E31E24] text-xs font-bold border border-[#E31E24]/20 hover:bg-red-100 transition-colors"
                      onClick={() => {
                        const map = upgradeProductMap[item.id];
                        if (map) {
                          const upgradeProducts = (products as any[]).filter(p => map.ids.includes(p.id));
                          onCategoryClick?.(map.title, upgradeProducts, map.catId);
                        }
                      }}
                    >
                      Vezi oferte pentru upgrade
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {item.productStatus === 'attention' && (
                    <button
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-orange-50 text-orange-500 text-xs font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                      onClick={() => {
                        const map = upgradeProductMap[item.id];
                        if (map) {
                          const upgradeProducts = (products as any[]).filter(p => map.ids.includes(p.id));
                          onCategoryClick?.(map.title, upgradeProducts, map.catId);
                        }
                      }}
                    >
                      Vezi oferte pentru upgrade
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    </button>
                  )}
                </div>

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
    <div className="flex flex-col h-full bg-[#F2F2F7] overflow-y-auto font-sans">
      {/* Profile Section — centered */}
      <div className="flex flex-col items-center pt-4 pb-8 px-4">
        <div className="w-[96px] h-[96px] rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
          <div className="w-[84px] h-[84px] rounded-full bg-[#E31E24] flex items-center justify-center text-white text-[28px] font-black select-none">
            {initials}
          </div>
        </div>
        <h2 className="text-[22px] font-bold text-[#111111] leading-tight mb-1">{fullName}</h2>
        <p className="text-[15px] text-[#6B7280]">{email}</p>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-3 px-4 pb-8">

        {/* Comenzile mele */}
        <button
          onClick={() => handleOpenOrders("all")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#E31E24]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Comenzile mele</p>
            {inLivrareCount > 0 && (
              <p className="text-[13px] font-semibold text-[#E31E24] leading-tight">{inLivrareCount} în livrare</p>
            )}
            {recentlyDeliveredCount > 0 && (
              <p className="text-[13px] text-[#6B7280] leading-tight">{recentlyDeliveredCount} {recentlyDeliveredCount === 1 ? "comandă finalizată recent" : "comenzi finalizate recent"}</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Produse cumpărate */}
        <button
          onClick={() => setActiveView("my-products")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Laptop className="w-6 h-6 text-[#6366F1]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Produse cumpărate</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">Garanții și detalii tehnice</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Favorite */}
        <button
          onClick={() => setActiveView("favorites")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-[#E31E24]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Favorite</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">
              {getWishlist().length === 1 ? "1 produs urmărit" : `${getWishlist().length} produse urmărite`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Carduri */}
        <button
          onClick={() => setActiveView("cards")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Carduri</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">
              {cards.length === 1 ? "1 card salvat" : `${cards.length} carduri salvate`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Adrese */}
        <button
          onClick={() => setActiveView("addresses")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-[#16A34A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Adrese</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">
              {addresses.length === 1 ? "1 adresă salvată" : `${addresses.length} adrese salvate`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Setări */}
        <button
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-[#6B7280]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#111111] leading-tight mb-0.5">Setări</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">Cont și preferințe</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Deconectare */}
        <button
          onClick={() => {
            clearAuthUser();
            onLogout?.();
          }}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-red-100 active:bg-red-50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6 text-[#DC2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-[#DC2626] leading-tight">Deconectare</p>
            <p className="text-[13px] text-[#6B7280] leading-tight">Ieși din cont</p>
          </div>
        </button>

      </div>
    </div>
  );
}