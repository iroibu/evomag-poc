import { CheckCircle2, Package, Home, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { type Order } from "../services/orders";

interface OrderConfirmationScreenProps {
  order: Order;
  onGoHome: () => void;
  onViewOrder: (order: Order) => void;
}

export function OrderConfirmationScreen({ order, onGoHome, onViewOrder }: OrderConfirmationScreenProps) {
  const formattedDate = new Date(order.orderDate).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalPaid = order.products.reduce(
    (acc, p) => acc + p.paidPrice * p.quantity,
    0
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Success hero */}
      <div className="flex flex-col items-center justify-center bg-white px-6 pt-12 pb-8 text-center border-b">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-11 w-11 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Comandă plasată!</h1>
        <p className="text-sm text-muted-foreground">
          Mulțumim! Comanda ta a fost înregistrată cu succes.
        </p>
      </div>

      {/* Order summary card */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Număr comandă</span>
            <span className="text-sm font-bold text-primary">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Data</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total plătit</span>
            <span className="text-sm font-bold">{totalPaid.toLocaleString("ro-RO")} Lei</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold">Produse comandate</h2>
          </div>
          <div className="space-y-3">
            {order.products.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <img
                  src={product.imageUrl}
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
          Vei primi un email de confirmare în scurt timp. Poți urmări statusul comenzii din secțiunea <span className="font-semibold">Comenzile mele</span>.
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 px-4 py-4 bg-white border-t space-y-2">
        <Button className="w-full" onClick={() => onViewOrder(order)}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Vezi comanda
        </Button>
        <Button variant="outline" className="w-full" onClick={onGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Înapoi la pagina principală
        </Button>
      </div>
    </div>
  );
}
