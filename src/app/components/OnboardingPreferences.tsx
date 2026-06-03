import {
  ArrowRight,
  Check,
  Cpu,
  Flame,
  Gamepad2,
  Home,
  Laptop,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

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

export interface OnboardingPrefs {
  selectedCategories: string[];
  selectedBrands: string[];
}

interface OnboardingPreferencesProps {
  onComplete: (prefs: OnboardingPrefs) => void;
}

export function OnboardingPreferences({ onComplete }: OnboardingPreferencesProps) {
  const [step, setStep] = useState(1); // 1: Categories, 2: Brands
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
    if (step === 1) {
      setSelectedBrands([]);
      setStep(2);
    } else {
      onComplete({ selectedCategories, selectedBrands });
    }
  };

  const handleSkipBrands = () => {
    onComplete({ selectedCategories, selectedBrands });
  };

  return (
    <div className="flex flex-col h-full">
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
  );
}
