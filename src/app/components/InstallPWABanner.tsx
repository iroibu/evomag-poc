import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "evomag_pwa_install_dismissed";

export function InstallPWABanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !promptEvent) return null;

  const handleInstall = async () => {
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground border-t border-primary/20">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Instalează aplicația EvoMAG</p>
        <p className="text-xs opacity-80 leading-tight mt-0.5">Acces rapid, offline și experiență nativă</p>
      </div>
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
      >
        <Download className="h-3.5 w-3.5" />
        Instalează
      </button>
      <button onClick={handleDismiss} aria-label="Închide" className="opacity-70 hover:opacity-100 shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
