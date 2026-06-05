
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { seedAddresses } from "./app/services/addresses.ts";
import { seedCards } from "./app/services/cards.ts";

// Seed default addresses and cards if local storage is empty
seedAddresses();
seedCards();

createRoot(document.getElementById("root")!).render(<App />);

