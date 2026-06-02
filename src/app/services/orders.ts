import { type CartItemType } from "../components/CartScreen";

export interface OrderProduct {
  id: string;
  name: string;
  images: string[];
  paidPrice: number;
  quantity: number;
}

export type DeliveryStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  orderNumber: number;
  orderDate: string;
  products: OrderProduct[];
  deliveryStatus: DeliveryStatus;
}

const ORDERS_STORAGE_KEY = "evomag_orders";

export function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

export function seedOrder(products: OrderProduct[], deliveryStatus: DeliveryStatus): void {
  const existing = getOrders();
  if (existing.length > 0) return;

  const order: Order = {
    orderNumber: 1,
    orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    products,
    deliveryStatus,
  };

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order]));
}

export function saveOrder(cartItems: CartItemType[], total: number): Order {
  const existing = getOrders();
  const lastOrderNumber = existing.length > 0 ? Math.max(...existing.map((o) => o.orderNumber)) : 0;

  const order: Order = {
    orderNumber: lastOrderNumber + 1,
    orderDate: new Date().toISOString(),
    products: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      images: item.images,
      paidPrice: item.price,
      quantity: item.quantity,
    })),
    deliveryStatus: "pending",
  };

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...existing, order]));
  return order;
}
