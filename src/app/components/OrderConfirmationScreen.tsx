import { CheckCircle2, Package, Home, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { type Order } from "../services/orders";

interface OrderConfirmationScreenProps {
  order: Order;
  onGoHome: () => void;
  onViewOrder: (order: Order) => void;
}

export function OrderConfirmationScreen({ order, onGoHome, onViewOrder }: OrderConfirmationScreenProps) {
  const formattedDate = new Date(order.orderDate).toLocaleString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalPaid = order.total;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Success hero */}
      <div className="flex flex-col items-center justify-center bg-white px-6 pt-14 pb-10 text-center border-b">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Comandă plasată!</h1>
        <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
          Mulțumim! Comanda ta a fost înregistrată cu succes.
        </p>
      </div>

      {/* Order summary card */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Număr comandă</span>
            <span className="text-sm font-bold text-primary">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Data</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total plătit</span>
            <span className="text-sm font-bold">{totalPaid.toLocaleString("ro-RO")} Lei</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold">Produse comandate</h2>
          </div>
          <div className="space-y-3">
            {order.products.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <img
                  src={product.images?.[0] ?? ""}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.quantity} × {product.paidPrice.toLocaleString("ro-RO")} Lei
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status info */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
          Vei primi un email de confirmare în scurt timp. Poți urmări statusul comenzii din secțiunea{" "}
          <button className="font-semibold text-green-600 underline underline-offset-2 hover:text-green-700 transition-colors" onClick={() => onViewOrder(order)}>
            Comenzile mele
          </button>
          .
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 px-4 py-4 bg-white border-t space-y-3">
        <Button className="w-full h-12 bg-[#E31E24] hover:bg-red-700 text-white rounded-full font-bold border-0" onClick={() => onViewOrder(order)}>
          Vezi comanda
        </Button>
        <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" onClick={onGoHome}>
          <Home className="h-4 w-4" />
          Înapoi la pagina principală
        </button>
      </div>
    </div>
  );
}
