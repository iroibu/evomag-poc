import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Cpu,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Laptop,
  Smartphone,
  Sparkles,
  Tv,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { savePreferences } from "../services/userPreferences";
import { Button } from "./ui/button";

function EvomagLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" className="h-10 w-auto">
      <defs>
        <linearGradient id="evgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff008c" />
          <stop offset="100%" stopColor="#ff6a00" />
        </linearGradient>
      </defs>
      {/* Symbol */}
      <g fill="url(#evgGrad)">
        <path d="M20 20 H220 L190 60 H40 Z" />
        <path d="M0 85 H180 L210 125 H30 Z" />
        <path d="M20 150 H220 V190 H0 Z" />
      </g>
      {/* Text */}
      <text
        x="260"
        y="160"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="150"
        fontWeight="700"
        fill="url(#evgGrad)"
      >
        evomag
      </text>
    </svg>
  );
}

function RobotMascot() {
  return (
    <svg width="100" height="116" viewBox="0 0 100 116" fill="none">
      {/* Body */}
      <rect x="18" y="62" width="64" height="38" rx="14" fill="white" />
      {/* Neck collar ring */}
      <ellipse cx="50" cy="63" rx="20" ry="7" fill="#E31E24" />
      {/* Head - black sphere */}
      <circle cx="50" cy="36" r="32" fill="#1A1A1A" />
      {/* Left eye arc */}
      <path
        d="M 33 33 Q 38 25 43 33"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right eye arc */}
      <path
        d="M 57 33 Q 62 25 67 33"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Smile */}
      <path
        d="M 38 44 Q 50 54 62 44"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Red base/stand */}
      <rect x="28" y="98" width="44" height="12" rx="6" fill="#E31E24" />
      {/* Base shadow */}
      <ellipse cx="50" cy="112" rx="26" ry="4" fill="#E31E24" opacity="0.2" />
    </svg>
  );
}

interface WelcomeScreenProps {
  onEnter: () => void;
}

const CATEGORIES = [
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "phones", label: "Telefoane", icon: Smartphone },
  { id: "laptops", label: "Laptopuri", icon: Laptop },
  { id: "smarthome", label: "Smart Home", icon: Home },
  { id: "tv", label: "TV & Audio", icon: Tv },
  { id: "pc", label: "Componente PC", icon: Cpu },
];

const CATEGORY_BRANDS: Record<string, string[]> = {
  gaming: [
    "ASUS ROG",
    "Logitech",
    "Corsair",
    "Razer",
    "SteelSeries",
    "HyperX",
    "NVIDIA",
    "AMD",
  ],
  phones: ["Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus", "Google"],
  laptops: ["Apple", "ASUS", "Lenovo", "Dell", "HP", "Acer", "MSI"],
  smarthome: ["Google", "Amazon", "Philips", "Xiaomi", "TP-Link"],
  tv: ["Samsung", "LG", "Sony", "Philips", "Hisense"],
  pc: ["ASUS", "MSI", "Gigabyte", "Intel", "AMD", "Corsair", "Kingston"],
};

function getBrandsForCategories(categories: string[]): string[] {
  const brandSet = new Set<string>();
  categories.forEach((cat) =>
    CATEGORY_BRANDS[cat]?.forEach((b) => brandSet.add(b)),
  );
  return Array.from(brandSet).sort();
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [step, setStep] = useState(0); // 0: Splash, 1: Categories, 2: Brands
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const availableBrands = getBrandsForCategories(selectedCategories);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setSelectedBrands([]);
      setStep(2);
    } else {
      savePreferences({ selectedCategories, selectedBrands });
      onEnter();
    }
  };

  const handleSkipBrands = () => {
    savePreferences({ selectedCategories, selectedBrands });
    onEnter();
  };

  return (
    <div className="h-screen flex flex-col bg-[#F2F2F7] max-w-md mx-auto overflow-hidden relative z-50">
      {/* STEP 0: SPLASH */}
      <div
        className={`absolute inset-0 flex flex-col overflow-y-auto transition-all duration-700 ease-in-out ${step === 0 ? "translate-x-0 opacity-100 z-20" : "-translate-x-full opacity-0 z-0"}`}
      >
        {/* Logo */}
        <div className="flex justify-center pt-14 pb-4 flex-shrink-0">
          <EvomagLogo />
        </div>

        {/* Hero: Robot + Floating Products */}
        <div className="relative flex-shrink-0" style={{ height: 260 }}>
          {/* Orbit rings */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 360 260"
            preserveAspectRatio="xMidYMid meet"
          >
            <ellipse
              cx="180"
              cy="130"
              rx="110"
              ry="74"
              fill="none"
              stroke="#E31E24"
              strokeWidth="1.5"
              opacity="0.25"
            />
            <ellipse
              cx="180"
              cy="130"
              rx="145"
              ry="98"
              fill="none"
              stroke="#F7941D"
              strokeWidth="1"
              opacity="0.12"
            />
          </svg>

          {/* Floating product cards */}
          {/* Phone – top-left */}
          <div className="absolute" style={{ left: 28, top: 18 }}>
            <div className="w-[62px] h-[62px] bg-white rounded-[18px] shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&h=120&fit=crop&auto=format"
                alt="Telefon"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Headphones – top-right */}
          <div className="absolute" style={{ right: 36, top: 8 }}>
            <div className="w-[62px] h-[62px] bg-white rounded-[18px] shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop&auto=format"
                alt="Căști"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Heart – middle-left */}
          <div className="absolute" style={{ left: 12, top: 112 }}>
            <div className="w-[46px] h-[46px] bg-white rounded-[14px] shadow-md flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#E31E24] fill-[#E31E24]" />
            </div>
          </div>

          {/* Laptop – middle-right */}
          <div className="absolute" style={{ right: 12, top: 96 }}>
            <div className="w-[70px] h-[58px] bg-white rounded-[18px] shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=140&h=116&fit=crop&auto=format"
                alt="Laptop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Watch – bottom-left */}
          <div className="absolute" style={{ left: 28, bottom: 18 }}>
            <div className="w-[62px] h-[62px] bg-white rounded-[18px] shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120&h=120&fit=crop&auto=format"
                alt="Ceas"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Controller – bottom-right */}
          <div className="absolute" style={{ right: 32, bottom: 18 }}>
            <div className="w-[62px] h-[62px] bg-white rounded-[18px] shadow-md overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=120&h=120&fit=crop&auto=format"
                alt="Controller"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Sparkle dark – top-far-right */}
          <div className="absolute" style={{ right: 14, top: 10 }}>
            <Sparkles className="w-5 h-5 text-[#1A1A2E]" />
          </div>

          {/* Sparkle red – near center-right */}
          <div className="absolute" style={{ right: 100, top: 38 }}>
            <Sparkles className="w-3.5 h-3.5 text-[#E31E24]" />
          </div>

          {/* Robot mascot – centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RobotMascot />
          </div>
        </div>

        {/* Text content */}
        <div className="px-6 pt-2 pb-8 flex flex-col flex-shrink-0">
          <h1 className="text-[32px] font-black leading-tight text-center tracking-tight mb-3 text-[#1A1A2E]">
            Shopping{" "}
            <span className="text-[#E31E24]">mai smart</span>
            <br />
            începe aici
            <span className="text-[#E31E24]">.</span>
          </h1>

          <p className="text-center text-gray-500 text-[13px] font-medium mb-6 leading-relaxed px-2">
            Recomandări personalizate, livrare rapidă
            <br />
            și cele mai bune oferte într-o singură aplicație.
          </p>

          {/* Feature cards */}
          <div className="space-y-3 mb-6">
            <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#E31E24]" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">
                  Recomandări inteligente
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Produse alese special pentru tine.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">
                  Livrare rapidă
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comenzile tale, livrate cu prioritate.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">
                  Oferte relevante
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Promoții și reduceri care contează pentru tine.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleNext}
            className="w-full h-14 bg-[#E31E24] hover:bg-[#c5191f] text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200"
          >
            Începe <ArrowRight className="w-5 h-5" />
          </Button>

          <button
            onClick={() => {
              savePreferences({ selectedCategories: [], selectedBrands: [] });
              onEnter();
            }}
            className="w-full mt-3 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            Am deja cont <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STEP 1 & 2: ONBOARDING PREFERENCES */}
      <div
        className={`absolute inset-0 flex flex-col bg-background transition-all duration-700 ease-in-out ${step > 0 ? "translate-x-0 opacity-100 z-20" : "translate-x-full opacity-0 z-0"}`}
      >
        {/* Progress Bar */}
        <div className="pt-12 px-6 pb-2">
          <div className="flex gap-2 mb-8">
            <div className="h-1.5 flex-1 rounded-full bg-primary/20 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 w-full"></div>
            </div>
            <div className="h-1.5 flex-1 rounded-full bg-primary/20 overflow-hidden">
              <div
                className={`h-full bg-primary transition-all duration-500 ${step > 1 ? "w-full" : "w-0"}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {/* STEP 1 CONTENT: CATEGORIES */}
          <div
            className={`transition-all duration-500 absolute w-full px-6 left-0 ${step === 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">
              Ce te pasionează?
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              Alege cel puțin o categorie pentru a-ți personaliza feed-ul cu
              cele mai relevante oferte.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-3 overflow-hidden ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-card hover:border-primary/30"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-primary bg-white rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-2 w-max rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2 CONTENT: BRANDS */}
          <div
            className={`transition-all duration-500 absolute w-full px-6 left-0 ${step === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">
              Brandurile tale
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              Ce producători preferi? Îți vom arăta lansările lor în prim-plan.
            </p>

            <div className="flex flex-wrap gap-2">
              {availableBrands.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`px-5 py-3 rounded-full border-2 font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-muted bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Bar */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent pt-12">
          <Button
            onClick={handleNext}
            disabled={step === 1 ? selectedCategories.length === 0 : false}
            className="w-full h-14 text-lg font-black rounded-2xl shadow-lg transition-all"
          >
            {step === 1 ? (
              <>
                Continuă <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Salvează și Intră în aplicație{" "}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          {step === 2 && (
            <button
              onClick={handleSkipBrands}
              className="w-full mt-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sari peste acest pas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
