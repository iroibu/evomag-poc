import { useState } from "react";
import { Package, TrendingUp, CreditCard, Settings, ChevronRight, Sparkles, ChevronLeft, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

interface ProfileProps {
  onProductClick?: (id: string) => void;
}

const initialEquipment = [
  {
    id: "e1",
    name: "iPhone 12 Pro",
    purchaseDate: "2021-03-15",
    upgradeScore: 85,
    recommendation: "iPhone 15 Pro recomandată",
    productId: "1", // Linking to real product
  },
  {
    id: "e2",
    name: "MacBook Air M1",
    purchaseDate: "2021-06-20",
    upgradeScore: 65,
    recommendation: "MacBook Air M3 disponibilă",
    productId: "s1",
  },
];

export function Profile({ onProductClick }: ProfileProps) {
  const [activeView, setActiveView] = useState<"main" | "orders" | "payments">("main");
  const [selectedCard, setSelectedCard] = useState<string>("card1");
  const [equipment, setEquipment] = useState(initialEquipment);

  const handleFeedback = (id: string, isPositive: boolean) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        // Dacă e pozitiv (încă e bun), scade scorul de upgrade. Dacă negativ, crește.
        const newScore = isPositive 
          ? Math.max(10, item.upgradeScore - 15) 
          : Math.min(100, item.upgradeScore + 20);
        return { ...item, upgradeScore: newScore };
      }
      return item;
    }));
  };

  if (activeView === "orders") {
    return (
      <div className="flex flex-col h-full bg-gray-50 pb-24">
        <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setActiveView("main")} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">Comenzile mele</h1>
        </header>
        <div className="p-4 space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-muted-foreground">Comanda #{1000 + i}</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Livrată</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded p-1">
                  <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&q=80" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">iPhone 15 Pro Max 256GB</p>
                  <p className="text-xs text-muted-foreground">15 Martie 2024</p>
                </div>
                <div className="font-bold text-primary">6.799 Lei</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeView === "payments") {
    return (
      <div className="flex flex-col h-full bg-gray-50 pb-24">
        <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setActiveView("main")} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">Metode de plată</h1>
        </header>
        <div className="p-4 space-y-3">
          <Card 
            onClick={() => setSelectedCard("card1")}
            className={`p-4 border-2 shadow-sm relative overflow-hidden cursor-pointer transition-colors ${selectedCard === "card1" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
          >
            {selectedCard === "card1" && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Principal</div>}
            <div className="flex items-center gap-3">
              <CreditCard className={`h-6 w-6 ${selectedCard === "card1" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-bold">**** **** **** 4242</p>
                <p className="text-xs text-muted-foreground">Expiră 12/26 • Visa</p>
              </div>
            </div>
          </Card>
          <Card 
            onClick={() => setSelectedCard("card2")}
            className={`p-4 border-2 shadow-sm cursor-pointer transition-colors ${selectedCard === "card2" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
          >
            {selectedCard === "card2" && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Principal</div>}
            <div className="flex items-center gap-3">
              <CreditCard className={`h-6 w-6 ${selectedCard === "card2" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-bold">**** **** **** 5555</p>
                <p className="text-xs text-muted-foreground">Expiră 08/25 • Mastercard</p>
              </div>
            </div>
          </Card>
          <Button variant="outline" className="w-full mt-4 border-dashed h-12">
            + Adaugă card nou
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <div className="w-full h-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white text-2xl font-bold">
              AR
            </div>
          </Avatar>
          <div>
            <h2>Andrei Răducu</h2>
            <p className="text-sm text-muted-foreground">andrei.raducu@email.com</p>
            <Badge className="mt-2 bg-gradient-to-r from-primary to-red-600 text-white border-0">
              VIP Member
            </Badge>
          </div>
        </div>
      </div>

      {/* Equipment Lifecycle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Echipamentele tale
          </h2>
        </div>
        
        {/* Info box about Upgrade Score */}
        <div className="px-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 text-blue-800 text-xs">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Ce este Scorul de Upgrade?</strong><br />
              Un scor <span className="font-bold text-red-600">ridicat</span> înseamnă că dispozitivul tău este învechit și e momentul ideal pentru un upgrade. Un scor <span className="font-bold text-green-600">scăzut</span> înseamnă că dispozitivul încă îndeplinește standardele optime.
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {equipment.map((item) => (
            <Card key={item.id} className="p-4 border border-gray-100 shadow-sm bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cumpărat în {new Date(item.purchaseDate).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${item.upgradeScore > 75 ? 'text-red-600' : item.upgradeScore < 40 ? 'text-green-600' : 'text-orange-500'}`}>
                      {item.upgradeScore}%
                    </span>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Scor Upgrade</p>
                  </div>
                </div>

                <Progress 
                  value={item.upgradeScore} 
                  className="h-1.5" 
                  indicatorClassName={item.upgradeScore > 75 ? 'bg-red-600' : item.upgradeScore < 40 ? 'bg-green-500' : 'bg-orange-500'} 
                />

                <div className="bg-muted/30 rounded-lg p-3 mt-2 border border-gray-50">
                  <p className="text-xs font-medium text-center mb-2">Mai ești mulțumit de cum funcționează?</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleFeedback(item.id, true)} className="flex-1 h-8 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200">
                      <ThumbsUp className="h-3 w-3 mr-1" /> Da, perfect
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFeedback(item.id, false)} className="flex-1 h-8 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                      <ThumbsDown className="h-3 w-3 mr-1" /> Mai puțin
                    </Button>
                  </div>
                </div>

                {item.upgradeScore > 70 && (
                  <button 
                    onClick={() => onProductClick?.(item.productId)}
                    className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-primary/5 rounded-xl border border-red-100 hover:shadow-sm transition-all text-left"
                  >
                    <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <span className="block text-[10px] font-bold text-red-600 uppercase mb-0.5">Recomandare AI</span>
                      <p className="text-sm font-semibold text-gray-900">{item.recommendation}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        <button
          onClick={() => setActiveView("orders")}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Comenzile mele</span>
          <Badge className="bg-primary/10 text-primary border-0 rounded-full">3</Badge>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => setActiveView("payments")}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Metode de plată</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

      </div>
    </div>
  );
}