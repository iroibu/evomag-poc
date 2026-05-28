import { ChevronLeft, Package, Truck, CheckCircle2, Clock, XCircle, MapPin, Calendar, Hash } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { type Order, type DeliveryStatus } from "../services/orders";

interface OrderDetailScreenProps {
  order: Order;
  onBack: () => void;
  onProductClick?: (product: any) => void;
}

const TRACKING_STEPS: { status: DeliveryStatus; label: string; description: string }[] = [
  { status: "pending", label: "Comandă plasată", description: "Comanda ta a fost primită și urmează să fie procesată." },
  { status: "processing", label: "În procesare", description: "Comanda este pregătită pentru expediere." },
  { status: "shipped", label: "În livrare", description: "Coletul este în drum spre destinație." },
  { status: "delivered", label: "Livrată", description: "Comanda a fost livrată cu succes." },
];

const STATUS_ORDER: DeliveryStatus[] = ["pending", "processing", "shipped", "delivered"];

const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  pending: "În procesare",
  processing: "În procesare",
  shipped: "În livrare",
  delivered: "Livrată",
  cancelled: "Returnată",
};

const deliveryStatusStyles: Record<DeliveryStatus, string> = {
  pending: "bg-orange-100 text-orange-700",
  processing: "bg-orange-100 text-orange-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-[#DDF7E7] text-[#2E9B4F]",
  cancelled: "bg-gray-100 text-gray-700",
};

function TrackingTimeline({ status }: { status: DeliveryStatus }) {
  if (status === "cancelled") {
    return (
      <Card className="gap-0 p-4 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Urmărire comandă</h2>
        <div className="flex items-center gap-3 text-red-600">
          <XCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Comanda a fost anulată</span>
        </div>
      </Card>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <Card className="gap-0 p-4 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-bold mb-4">Urmărire comandă</h2>
      <div className="space-y-0">
        {TRACKING_STEPS.map((step, idx) => {
          const stepIndex = STATUS_ORDER.indexOf(step.status);
          const isCompleted = stepIndex <= currentIndex;
          const isActive = stepIndex === currentIndex;
          const isLast = idx === TRACKING_STEPS.length - 1;

          return (
            <div key={step.status} className="flex gap-3">
              {/* Icon + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    isCompleted
                      ? isActive
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 ${stepIndex < currentIndex ? "bg-primary" : "bg-gray-200"}`} style={{ minHeight: "24px" }} />
                )}
              </div>

              {/* Text */}
              <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm font-semibold leading-tight ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${isActive ? "text-primary" : isCompleted ? "text-muted-foreground" : "text-gray-300"}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function OrderDetailScreen({ order, onBack, onProductClick }: OrderDetailScreenProps) {
  const orderTotal = order.products.reduce((sum, p) => sum + p.paidPrice * p.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Comanda #{order.orderNumber}</h1>
        <Badge className={`border-0 ${deliveryStatusStyles[order.deliveryStatus]}`}>
          {deliveryStatusLabels[order.deliveryStatus]}
        </Badge>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Tracking timeline */}
        <TrackingTimeline status={order.deliveryStatus} />

        {/* Order info */}
        <Card className="gap-0 p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Detalii comandă</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Număr comandă</span>
              <span className="ml-auto font-semibold">#{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Data plasării</span>
              <span className="ml-auto font-semibold">
                {new Date(order.orderDate).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Produse</span>
              <span className="ml-auto font-semibold">{order.products.reduce((sum, p) => sum + p.quantity, 0)} buc.</span>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card className="gap-0 p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Produse comandate</h2>
          <div className="space-y-3">
            {order.products.map((product) => (
              <button
                key={product.id}
                onClick={() => onProductClick?.({ id: product.id, name: product.name, imageUrl: product.imageUrl, price: product.paidPrice })}
                className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-lg p-1.5 shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cantitate: {product.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">
                    {(product.paidPrice * product.quantity).toLocaleString("ro-RO")} Lei
                  </p>
                  <p className="text-xs text-muted-foreground">{product.paidPrice.toLocaleString("ro-RO")} Lei/buc.</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total plătit</span>
            <span className="text-lg font-black text-primary">{orderTotal.toLocaleString("ro-RO")} Lei</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
