import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Camera,
  Check,
  Dumbbell,
  Gamepad2,
  Gift,
  Home,
  Laptop,
  Lock,
  Rocket,
  Scissors,
  Smartphone,
  Star,
  Tag,
  Tv,
  Watch,
  WashingMachine,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const CATEGORIES = [
  { id: "phones", label: "Telefoane", icon: Smartphone },
  { id: "laptops", label: "Laptopuri", icon: Laptop },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "smarthome", label: "Smart Home", icon: Home },
  { id: "tv", label: "TV & Audio", icon: Tv },
  { id: "foto", label: "Foto & Video", icon: Camera },
  { id: "electrocasnice", label: "Electrocasnice", icon: WashingMachine },
  { id: "accesorii", label: "Accesorii", icon: Watch },
  { id: "ingrijire", label: "Îngrijire personală", icon: Scissors },
  { id: "sport", label: "Sport & Outdoor", icon: Dumbbell },
  { id: "copii", label: "Copii", icon: Baby },
  { id: "cadouri", label: "Cadouri", icon: Gift },
];

const PRIORITIES = [
  {
    id: "offers",
    label: "Cele mai bune oferte",
    description: "Vreau să găsesc reduceri și promoții avantajoase.",
    icon: Tag,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    id: "delivery",
    label: "Livrare rapidă",
    description: "Vreau să primesc produsele cât mai repede.",
    icon: Zap,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    id: "premium",
    label: "Produse premium",
    description: "Mă interesează calitatea și brandurile de top.",
    icon: Star,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    id: "newest",
    label: "Cele mai noi produse",
    description: "Vreau să fiu mereu la curent cu ultimele noutăți.",
    icon: Rocket,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    id: "rated",
    label: "Cele mai bine evaluate",
    description: "Prefer produsele recomandate de alți clienți.",
    icon: Star,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
];

function RobotMascot() {
  return (
    <svg width="120" height="140" viewBox="0 0 100 116" fill="none">
      <rect x="18" y="62" width="64" height="38" rx="14" fill="white" />
      <ellipse cx="50" cy="63" rx="20" ry="7" fill="#E31E24" />
      <circle cx="50" cy="36" r="32" fill="#1A1A1A" />
      <path d="M 33 33 Q 38 25 43 33" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 57 33 Q 62 25 67 33" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 38 44 Q 50 54 62 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="28" y="98" width="44" height="12" rx="6" fill="#E31E24" />
      <ellipse cx="50" cy="112" rx="26" ry="4" fill="#E31E24" opacity="0.2" />
    </svg>
  );
}

export interface OnboardingPrefs {
  selectedCategories: string[];
  selectedBrands: string[];
  selectedPriorities: string[];
}

interface OnboardingPreferencesProps {
  onComplete: (prefs: OnboardingPrefs) => void;
}

export function OnboardingPreferences({ onComplete }: OnboardingPreferencesProps) {
  const [step, setStep] = useState(1); // 1: Categories, 2: Priorities, 3: Loading
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const togglePriority = (id: string) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    const timeout = setTimeout(() => {
      onComplete({ selectedCategories, selectedBrands: [], selectedPriorities });
    }, 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        {step === 1 ? (
          <span className="text-[#E31E24] font-black text-xl tracking-tight">evoMAG</span>
        ) : step === 2 ? (
          <button onClick={() => setStep(1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
        ) : (
          <span className="w-6" />
        )}
        <span className="text-sm font-bold text-[#E31E24] bg-red-50 px-3 py-1 rounded-full">
          {step}/3
        </span>
      </div>

      {/* Step 1: Categories */}
      {step === 1 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pb-4">
            <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
              Ce te interesează?
            </h2>
            <p className="text-sm text-muted-foreground">
              Alege până la 5 categorii care te pasionează.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-[#E31E24] bg-red-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E31E24] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Icon className={`w-7 h-7 ${isSelected ? "text-[#E31E24]" : "text-gray-500"}`} />
                    <span className={`text-xs font-semibold text-center leading-tight ${isSelected ? "text-[#E31E24]" : "text-gray-700"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-6 pb-8 pt-2 bg-white">
            <Button
              onClick={() => setStep(2)}
              disabled={selectedCategories.length === 0}
              className="w-full h-14 text-base font-bold rounded-2xl"
            >
              Continuă <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voi alege mai târziu
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Priorities */}
      {step === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pb-4">
            <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
              Ce contează cel mai mult pentru tine?
            </h2>
            <p className="text-sm text-muted-foreground">
              Selectează până la 3 priorități.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
            {PRIORITIES.map((priority) => {
              const Icon = priority.icon;
              const isSelected = selectedPriorities.includes(priority.id);
              return (
                <button
                  key={priority.id}
                  onClick={() => togglePriority(priority.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[#E31E24] bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${priority.iconBg}`}>
                    <Icon className={`w-5 h-5 ${priority.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{priority.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{priority.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${isSelected ? "bg-[#E31E24] border-[#E31E24]" : "border-gray-300"}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-6 pb-8 pt-2 bg-white">
            <Button
              onClick={() => setStep(3)}
              className="w-full h-14 text-base font-bold rounded-2xl"
            >
              Continuă <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-between px-6 pb-10">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full bg-red-50 blur-2xl opacity-80" />
              <RobotMascot />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground mb-3">
                EvoMi își pregătește experiența pentru tine 🚀
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analizăm preferințele tale pentru a-ți oferi recomandări personalizate, oferte relevante și o experiență de shopping mai smart.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#E31E24] rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Se configurează recomandările tale...</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 text-left">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Preferințele tale sunt confidențiale și pot fi modificate oricând din cont.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
