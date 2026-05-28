import React, { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Check,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "./ui/button";
import { LockerPickerModal, type Locker } from "./LockerPickerModal";
import { type CartItemType } from "./CartScreen";

export interface OrderProduct {
  id: string;
  name: string;
  imageUrl: string;
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

function saveOrder(cartItems: CartItemType[], total: number): Order {
  const existing: Order[] = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]");
  const lastOrderNumber = existing.length > 0 ? Math.max(...existing.map((o) => o.orderNumber)) : 0;

  const order: Order = {
    orderNumber: lastOrderNumber + 1,
    orderDate: new Date().toISOString(),
    products: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      paidPrice: item.price,
      quantity: item.quantity,
    })),
    deliveryStatus: "pending",
  };

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...existing, order]));
  return order;
}

interface CheckoutScreenProps {
  onBack: () => void;
  onSuccess: (order: Order) => void;
  total: number;
  cartItems: CartItemType[];
}

const STEPS = ["Facturare", "Livrare", "Plată"] as const;

export function CheckoutScreen({
  onBack,
  onSuccess,
  total,
  cartItems,
}: CheckoutScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [persoanaType, setPersoanaType] = useState<"fizica" | "juridica">(
    "fizica",
  );
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<
    "depozit" | "curier" | "aceeasi_zi" | "locker"
  >("curier");
  const [paymentMethod, setPaymentMethod] = useState<
    | "numerar"
    | "card_depozit"
    | "card_online"
    | "google"
    | "apple"
    | "ordin"
    | "card_avantaj"
    | "optimo"
    | "ipay"
    | "leanpay"
    | "leanpay_promo"
    | "cumpara_acum"
    | "oney"
  >();
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
    else onBack();
  };

  const handleContinue = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
    else {
      const order = saveOrder(cartItems, total);
      onSuccess(order);
    }
  };

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Facturare",
    2: "Livrare",
    3: "Plată",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{stepTitles[step]}</h1>
        </div>
      </header>

      {/* Step indicator */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-b">
        {STEPS.map((label, i) => {
          const s = (i + 1) as 1 | 2 | 3;
          const isCompleted = s < step;
          const isActive = s === step;
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-primary" : isCompleted ? "text-primary" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px ${s < step ? "bg-primary" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Facturare */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Person type + Contact fields */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <label className="flex items-center gap-2 px-4 py-3 flex-1 cursor-pointer" onClick={() => setPersoanaType("fizica")}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${persoanaType === "fizica" ? "border-primary" : "border-muted-foreground"}`}>
                    {persoanaType === "fizica" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <span className="font-medium text-sm">Persoană fizică</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-3 flex-1 cursor-pointer" onClick={() => setPersoanaType("juridica")}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${persoanaType === "juridica" ? "border-primary" : "border-muted-foreground"}`}>
                    {persoanaType === "juridica" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <span className="font-medium text-sm">Persoană juridică</span>
                </label>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nume și prenume"
                  className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                />
              </div>
            </div>

            {/* Company details — shown only for Persoana juridica */}
            {persoanaType === "juridica" && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Detalii firmă
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Cod fiscal"
                    className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                  />
                  <input
                    type="text"
                    placeholder="Nume firmă"
                    className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                  />
                  <input
                    type="text"
                    placeholder="Reg. com."
                    className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                  />
                  <input
                    type="text"
                    placeholder="Bancă"
                    className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                  />
                  <input
                    type="text"
                    placeholder="Cont bancă"
                    className="w-full text-sm p-3 rounded-lg border bg-gray-50 focus:outline-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Adresa Facturare
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <label className="flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer">
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useProfileAddress ? "border-primary" : "border-muted-foreground"}`}
                    >
                      {useProfileAddress && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  <div
                    className="flex-1"
                    onClick={() => setUseProfileAddress(true)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">
                        Adresa din profil
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Str. Primăverii nr. 14, Bl. A, Ap. 12
                      <br />
                      București, Sector 1
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 cursor-pointer">
                  <div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useProfileAddress ? "border-primary" : "border-muted-foreground"}`}
                    >
                      {!useProfileAddress && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  <div
                    className="flex-1 font-medium text-sm"
                    onClick={() => setUseProfileAddress(false)}
                  >
                    Adaugă o adresă nouă (Manual)
                  </div>
                </label>

                {!useProfileAddress && (
                  <div className="p-4 space-y-3 border-t bg-gray-50/50 mt-4">
                    <input
                      type="text"
                      placeholder="Județ"
                      className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary"
                    />
                    <input
                      type="text"
                      placeholder="Localitate/sector"
                      className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary"
                    />
                    <input
                      type="text"
                      placeholder="Adresă"
                      className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary"
                    />
                    <input
                      type="text"
                      placeholder="Cod poștal"
                      className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery */}
        {step === 2 && (
          <section className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
                <div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "curier" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {deliveryMethod === "curier" && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
                <div
                  className="flex-1 font-medium text-sm"
                  onClick={() => setDeliveryMethod("curier")}
                >
                  Livrare prin curier
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
                <div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "depozit" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {deliveryMethod === "depozit" && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
                <div
                  className="flex-1 font-medium text-sm"
                  onClick={() => setDeliveryMethod("depozit")}
                >
                  Ridicare personala (depozit)
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 cursor-pointer">
                <div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "locker" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {deliveryMethod === "locker" && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
                <div
                  className="flex-1 font-medium text-sm"
                  onClick={() => setDeliveryMethod("locker")}
                >
                  Ridicare personală din locker
                </div>
              </label>

              {deliveryMethod === "locker" && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setIsLockerModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedLocker
                      ? `${selectedLocker.name} – ${selectedLocker.address}`
                      : "Alege Locker / Punct ridicare"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <section className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {(
                [
                  { id: "numerar", label: "Numerar (Ramburs)" },
                  { id: "card_depozit", label: "Card in depozit" },
                  { id: "card_online", label: "Online, card de credit sau de debit" },
                  { id: "google", label: "Google Pay" },
                  { id: "apple", label: "Apple Pay" },
                  { id: "ordin", label: "Ordin de plata" },
                  { id: "card_avantaj", label: "CardAvantaj online" },
                  { id: "optimo", label: "Optimo Card online" },
                  { id: "ipay", label: "iPay BT Card online" },
                  { id: "leanpay", label: "Alege rate online prin LEANPAY" },
                  { id: "leanpay_promo", label: "PROMO: Plătește cu Leanpay și primești voucher de până la 500 lei!" },
                  { id: "cumpara_acum", label: "Cumpara acum, plateste mai tarziu, prin" },
                  { id: "oney", label: "Oney: 6x-60x rate prin Credit Online" },
                ] as const
              ).map(({ id, label }, index, arr) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-4 cursor-pointer ${index < arr.length - 1 ? "border-b border-gray-50" : ""}`}
                  onClick={() => setPaymentMethod(id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === id ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === id && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Total de plată</span>
          <span className="font-black text-xl text-primary">
            {total.toLocaleString("ro-RO")} Lei
          </span>
        </div>

        {step < 3 ? (
          <Button
            onClick={handleContinue}
            className="w-full h-14 rounded-full text-base font-bold shadow-lg flex items-center gap-2 justify-center"
          >
            Continuă
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="w-full h-14 rounded-full text-base font-bold shadow-lg flex items-center gap-2 justify-center"
          >
            Trimite comanda
          </Button>
        )}
      </div>

      {isLockerModalOpen && (
        <LockerPickerModal
          selectedLockerId={selectedLocker?.id}
          onClose={() => setIsLockerModalOpen(false)}
          onSelect={(locker) => {
            setSelectedLocker(locker);
            setIsLockerModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
