import { useState } from "react";
import { Check, CreditCard, MapPin, Truck, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { motion } from "motion/react";

interface QuickCheckoutProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const savedAddresses = [
  {
    id: "1",
    name: "Acasă",
    address: "Str. Aviatorilor 25, București, 011863",
    isDefault: true,
  },
  {
    id: "2",
    name: "Birou",
    address: "Bd. Unirii 45, București, 030824",
    isDefault: false,
  },
];

const paymentMethods = [
  {
    id: "1",
    type: "card",
    name: "Visa **** 4242",
    isDefault: true,
  },
  {
    id: "2",
    type: "card",
    name: "Mastercard **** 5555",
    isDefault: false,
  },
];

export function QuickCheckout({ onBack, onComplete }: QuickCheckoutProps) {
  const [step, setStep] = useState<"review" | "processing" | "success">("review");
  const [selectedAddress, setSelectedAddress] = useState("1");
  const [selectedPayment, setSelectedPayment] = useState("1");

  const handleCheckout = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }, 2000);
  };

  if (step === "processing") {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 bg-background">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center mb-6">
          <Sparkles className="h-12 w-12 text-white animate-pulse" />
        </div>
        <h2 className="mb-2">Procesăm comanda...</h2>
        <p className="text-center text-muted-foreground">
          AI-ul nostru verifică stocul și pregătește livrarea
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-screen flex flex-col items-center justify-center px-4 bg-background"
      >
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h2 className="mb-2">Comandă plasată cu succes!</h2>
        <p className="text-center text-muted-foreground mb-6">
          Vei primi un email de confirmare în curând
        </p>
        <Badge className="bg-gradient-to-r from-primary to-red-600 text-white border-0">
          Comanda #EVM-2024-0523
        </Badge>
      </motion.div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-4 border-b bg-background">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2>Checkout rapid</h2>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          {/* AI Optimization Notice */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-red-600/10 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium mb-1">One-tap checkout optimizat AI</h3>
                <p className="text-sm text-muted-foreground">
                  Am completat automat datele tale preferate pentru o experiență rapidă
                </p>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <div className="space-y-3">
            <h3>Rezumat comandă</h3>
            <Card className="p-4 border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80"
                  alt="Product"
                  className="w-20 h-20 object-contain rounded-lg bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="line-clamp-2 mb-1">iPhone 15 Pro Max 256GB</h4>
                  <p className="text-sm text-muted-foreground">Natural Titanium</p>
                  <p className="font-bold mt-1">6,799 Lei</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3>Adresă de livrare</h3>
            </div>
            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
              {savedAddresses.map((address) => (
                <Card
                  key={address.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedAddress === address.id
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={address.id} className="font-medium cursor-pointer">
                          {address.name}
                        </Label>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Implicită
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{address.address}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h3>Metodă de livrare</h3>
            </div>
            <Card className="p-4 border-primary bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Livrare expresă</p>
                  <p className="text-sm text-muted-foreground">1-2 zile lucrătoare</p>
                </div>
                <Badge className="bg-green-500 text-white">Gratuit</Badge>
              </div>
            </Card>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3>Metodă de plată</h3>
            </div>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                    <Label
                      htmlFor={`payment-${method.id}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {method.name}
                    </Label>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Implicită
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Price Breakdown */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">6,799 Lei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livrare</span>
                <span className="font-medium text-green-600">Gratuit</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold">6,799 Lei</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 border-t bg-background px-4 py-4 safe-area-inset-bottom">
        <Button onClick={handleCheckout} size="lg" className="w-full h-14 rounded-xl">
          <Check className="h-5 w-5 mr-2" />
          Confirmă comanda
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Plasând comanda, ești de acord cu termenii și condițiile
        </p>
      </div>
    </div>
  );
}
