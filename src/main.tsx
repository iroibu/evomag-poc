
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { seedAddresses } from "./app/services/addresses.ts";
import { seedCards } from "./app/services/cards.ts";

// Capture the PWA install prompt as early as possible, before React mounts.
// The beforeinstallprompt event fires once Chrome decides the site is installable.
// If we don't capture it here it is lost before any component mounts.
/* window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaPrompt = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event("pwaPromptReady"));
}); */

// Seed default addresses and cards if local storage is empty
seedAddresses();
seedCards();

createRoot(document.getElementById("root")!).render(<App />);

