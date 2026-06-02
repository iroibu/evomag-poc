
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import productsData from "./data/products.json";
import { seedOrder } from "./app/services/orders.ts";
import { seedAddresses } from "./app/services/addresses.ts";
import { seedCards } from "./app/services/cards.ts";

// Seed a demo delivered order if no orders exist yet
const shuffled = [...productsData].sort(() => Math.random() - 0.5);
seedOrder(
  shuffled.slice(0, 1).map((p: any) => ({
    id: String(p.id),
    name: p.name,
    images: Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []),
    paidPrice: p.price,
    quantity: 1,
  })),
  "delivered"
);

// Seed default addresses if local storage is empty
seedAddresses();

// Seed default cards if local storage is empty
seedCards();

createRoot(document.getElementById("root")!).render(<App />);
