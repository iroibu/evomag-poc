import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Lock, MapPin, CreditCard, ShieldCheck, Smartphone, Wallet, Landmark, Percent, Truck, Package, Check, Info } from "lucide-react";
import { Button } from "./ui/button";
import { LockerPickerModal, type Locker } from "./LockerPickerModal";
import { saveOrder, type Order } from "../services/orders";
import { loadAddresses } from "../services/addresses";
import { loadCards, addCard } from "../services/cards";
import { type CartItemType } from "./CartScreen";

interface CheckoutScreenProps {
  onBack: () => void;
  onSuccess: (order: Order) => void;
  total: number;
  cartItems: CartItemType[];
}

export function CheckoutScreen({ onBack, onSuccess, total, cartItems }: CheckoutScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientType, setClientType] = useState<"fizica" | "juridica">("fizica");
  const [useProfileAddressFacturare, setUseProfileAddressFacturare] = useState(true);
  
  const [useProfileAddressLivrare, setUseProfileAddressLivrare] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<"curier" | "depozit" | "locker">("curier");
  
  const [paymentMethod, setPaymentMethod] = useState<string>("card_bancar");
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>(() => {
    const cards = loadCards();
    return cards.find(c => c.isMain)?.id ?? cards[0]?.id ?? "";
  });
  const [installments, setInstallments] = useState<number>(6);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ number: "", expiry: "", name: "", cvv: "" });
  const [savedCardsState, setSavedCardsState] = useState(() => loadCards());
  const [paymentSubView, setPaymentSubView] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({ number: "1234 5678 9012 3456", expiry: "12 / 26", name: "Andrei Popescu", cvv: "" });

  const mainAddress = loadAddresses().find(a => a.isMain) ?? null;

  const savedCards = savedCardsState;

  const PAYMENT_METHODS = [
    { id: "card_bancar", label: "Card bancar", sublabel: "Visa, Mastercard, Maestro", icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
    { id: "rate", label: "Plată în rate", sublabel: "De la 6 până la 60 de rate", icon: <Percent className="w-5 h-5 text-[#E31E24]" /> },
    { id: "apple_pay", label: "Apple Pay", sublabel: null, icon: <span className="bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tight">🍎 Pay</span> },
    { id: "google_pay", label: "Google Pay", sublabel: null, icon: <span className="border border-gray-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-tight"><span className="text-blue-500">G</span><span className="text-red-500">P</span><span className="text-yellow-500">a</span><span className="text-green-500">y</span></span> },
    { id: "ramburs", label: "Plata la livrare (ramburs)", sublabel: null, icon: <Wallet className="w-5 h-5 text-green-600" /> },
    { id: "transfer", label: "Ordin de plată (Transfer)", sublabel: null, icon: <Landmark className="w-5 h-5 text-indigo-600" /> },
  ];

  const INSTALLMENT_PLANS = [
    { months: 6,  totalFactor: 1.076 },
    { months: 12, totalFactor: 1.137 },
    { months: 24, totalFactor: 1.253 },
    { months: 36, totalFactor: 1.379 },
    { months: 48, totalFactor: 1.497 },
    { months: 60, totalFactor: 1.587 },
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      onBack();
    }
  };

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Datele tale",
    2: "Livrare",
    3: "Plată",
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7]">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-[#111111]">{stepTitles[step]}</h1>
      </header>

      {/* Steps Indicator */}
      <div className="bg-white px-8 py-5 border-b border-[#E5E5EA]">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-3 h-0.5 bg-[#E5E5EA] z-0"></div>
          <div className="absolute left-0 top-3 h-0.5 bg-[#E31E24] z-0 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

          <div className={`relative z-10 flex flex-col items-center gap-1.5`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 1 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>Datele tale</span>
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-1.5`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>
              {step > 2 ? <Check className="w-3 h-3" /> : '2'}
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 2 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>Livrare</span>
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-1.5`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 3 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>3</div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 3 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>Plată</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-6">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Client Type - Radio Buttons */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Tip client</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] p-4 flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer" onClick={() => setClientType('fizica')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${clientType === 'fizica' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                    {clientType === 'fizica' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                  </div>
                  <span className="text-sm font-medium text-[#111111]">Persoană fizică</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer" onClick={() => setClientType('juridica')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${clientType === 'juridica' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                    {clientType === 'juridica' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                  </div>
                  <span className="text-sm font-medium text-[#111111]">Persoană juridică</span>
                </label>
              </div>
            </section>

            {/* Date de facturare */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Date de facturare</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] p-4 space-y-3">
                <input type="text" placeholder="Nume și prenume" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                <input type="email" placeholder="Email" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                <input type="tel" placeholder="Telefon" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
              </div>
            </section>

            {/* Date Firma */}
            {clientType === 'juridica' && (
              <section className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Detalii Firmă</h2>
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] p-4 space-y-3">
                  <input type="text" placeholder="Cod fiscal (CUI/CIF)" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  <input type="text" placeholder="Nume firmă" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  <input type="text" placeholder="Reg. Comerțului (ex: J40/1234/2020)" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  <input type="text" placeholder="Banca" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  <input type="text" placeholder="Cont bancar (IBAN)" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-[#6B7280] mb-3 uppercase tracking-wider">Adresă Sediu Social</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Județ" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                        <input type="text" placeholder="Localitate / Sector" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                      </div>
                      <input type="text" placeholder="Adresă completă" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Adresa Facturare */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Adresă de facturare</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                <label className="flex items-start gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="mt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${useProfileAddressFacturare ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {useProfileAddressFacturare && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1" onClick={() => setUseProfileAddressFacturare(true)}>
                    <span className="font-semibold text-sm text-[#111111]">Acasă</span>
                    <p className="text-xs text-[#6B7280] leading-relaxed mt-0.5">
                      {mainAddress ? <>{mainAddress.street}<br />{mainAddress.city}</> : "Nicio adresă salvată"}
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!useProfileAddressFacturare ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {!useProfileAddressFacturare && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1 font-medium text-sm text-[#111111]" onClick={() => setUseProfileAddressFacturare(false)}>
                    Adaugă o adresă nouă
                  </div>
                </label>
                
                {!useProfileAddressFacturare && (
                  <div className="p-4 space-y-3 border-t border-[#E5E5EA] bg-[#F5F5F7] mt-4 animate-in slide-in-from-top-2">
                    <input type="text" placeholder="Județ" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                    <input type="text" placeholder="Localitate/sector" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                    <input type="text" placeholder="Adresă" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                    <input type="text" placeholder="Cod poștal" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                  </div>
                )}
              </div>
            </section>

            {/* Salvează date */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${saveForFuture ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300 bg-white'}`}>
                {saveForFuture && <Check className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={saveForFuture} onChange={(e) => setSaveForFuture(e.target.checked)} />
              <span className="text-sm text-[#111111]">Salvează datele pentru comenzile viitoare</span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Delivery Section */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Metodă de livrare</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                <label className="flex items-center gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === 'curier' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {deliveryMethod === 'curier' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1" onClick={() => setDeliveryMethod('curier')}>
                    <span className="font-medium text-sm text-[#111111]">Livrare prin curier</span>
                    <p className="text-xs text-[#6B7280] mt-0.5">1-2 zile lucrătoare</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">Gratuit</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === 'depozit' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {deliveryMethod === 'depozit' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1" onClick={() => setDeliveryMethod('depozit')}>
                    <span className="font-medium text-sm text-[#111111]">Ridicare personală (depozit)</span>
                    <p className="text-xs text-[#6B7280] mt-0.5">Disponibil mâine</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">Gratuit</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => {
                  setDeliveryMethod('locker');
                  setIsLockerModalOpen(true);
                }}>
                  <div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === 'locker' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {deliveryMethod === 'locker' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-medium text-sm text-[#111111]">Ridicare din locker</span>
                    {deliveryMethod === 'locker' && selectedLocker ? (
                      <span className="text-xs text-[#E31E24] font-bold mt-0.5">{selectedLocker.name}</span>
                    ) : (
                      <span className="text-xs text-[#6B7280] mt-0.5">1-2 zile lucrătoare</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-green-600">Gratuit</span>
                </label>
              </div>
            </section>

            {/* Adresa de Livrare pt Curier */}
            {deliveryMethod === 'curier' && (
              <section className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Adresă de livrare</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                  <label className="flex items-start gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${useProfileAddressLivrare ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                        {useProfileAddressLivrare && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                      </div>
                    </div>
                    <div className="flex-1" onClick={() => setUseProfileAddressLivrare(true)}>
                      <span className="font-semibold text-sm text-[#111111]">Acasă</span>
                      <p className="text-xs text-[#6B7280] leading-relaxed mt-0.5">
                        {mainAddress ? <>{mainAddress.street}<br />{mainAddress.city}</> : "Nicio adresă salvată"}
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!useProfileAddressLivrare ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                        {!useProfileAddressLivrare && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                      </div>
                    </div>
                    <div className="flex-1 font-medium text-sm text-[#111111]" onClick={() => setUseProfileAddressLivrare(false)}>
                      Adaugă o adresă nouă
                    </div>
                  </label>
                  
                  {!useProfileAddressLivrare && (
                    <div className="p-4 space-y-3 border-t border-[#E5E5EA] bg-[#F5F5F7] mt-4">
                      <input type="text" placeholder="Județ" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                      <input type="text" placeholder="Localitate/sector" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                      <input type="text" placeholder="Adresă" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                      <input type="text" placeholder="Cod poștal" className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-[#E31E24]" />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Info banner */}
            <div className="flex items-center gap-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-3 text-sm text-[#6B7280]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Livrarea este gratuită pentru această comandă.</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">

            {/* ── Main payment list ────────────────────────────────── */}
            {paymentSubView === null && (
              <>
                <section className="space-y-3">
                  <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Alege metoda de plată</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden divide-y divide-[#E5E5EA]">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = paymentMethod === method.id;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setPaymentMethod(method.id);
                            if (["rate", "apple_pay", "google_pay", "ramburs"].includes(method.id)) {
                              setPaymentSubView(method.id);
                            }
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm text-[#111111]">{method.label}</span>
                            {method.sublabel && <p className="text-xs text-[#6B7280] mt-0.5">{method.sublabel}</p>}
                          </div>
                          <div className="flex items-center justify-end shrink-0">
                            {method.icon}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

                {/* Card salvat (shown when card_bancar is selected) */}
                {paymentMethod === "card_bancar" && (
                  <section className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Card salvat</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden divide-y divide-[#E5E5EA]">
                      {savedCards.map(card => (
                        <label
                          key={card.id}
                          className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${selectedSavedCard === card.id ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedSavedCard(card.id)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedSavedCard === card.id ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                            {selectedSavedCard === card.id && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[#111111] flex items-center gap-2">
                              {card.number}
                              {card.isMain && <span className="bg-[#FEF2F2] text-[#E31E24] px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">Principal</span>}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{card.type} • Exp {card.expiry}</p>
                          </div>
                        </label>
                      ))}
                      <button
                        className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setPaymentSubView("card_form")}
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-[#E5E5EA] flex items-center justify-center shrink-0">
                          <span className="text-[#6B7280] text-sm font-bold leading-none">+</span>
                        </div>
                        <span className="font-medium text-sm text-[#6B7280]">Adaugă un card nou</span>
                      </button>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── Plată în rate sub-view ───────────────────────────── */}
            {paymentSubView === "rate" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5 text-[#E31E24]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">Plată în rate</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Alege numărul de rate care ți se potrivesc.</p>
                  </div>
                </div>

                {/* Aprobare instant */}
                <div className="bg-[#F0FDF4] border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-green-200 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#111111]">Aprobare instant</p>
                    <p className="text-xs text-[#6B7280]">Rată lunară de la {Math.round(total * 1.587 / 60).toLocaleString('ro-RO')} Lei</p>
                  </div>
                </div>

                {/* Financial institution */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Instituție financiară</p>
                  <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                    <span className="font-medium text-sm text-[#111111]">EVOMAG Credit – TBI Bank</span>
                    <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                  </div>
                </div>

                {/* Rate options */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Alege numărul de rate</p>
                  <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden divide-y divide-[#E5E5EA]">
                    {INSTALLMENT_PLANS.map((plan) => {
                      const planTotal = Math.round(total * plan.totalFactor);
                      const monthly = Math.round(planTotal / plan.months);
                      const isSelectedPlan = installments === plan.months;
                      return (
                        <label
                          key={plan.months}
                          className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${isSelectedPlan ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
                          onClick={() => setInstallments(plan.months)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelectedPlan ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                            {isSelectedPlan && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm text-[#111111]">{plan.months} rate</span>
                            <p className="text-xs text-[#6B7280] mt-0.5">Total de plată: {planTotal.toLocaleString('ro-RO')} Lei</p>
                          </div>
                          <span className={`text-sm font-bold whitespace-nowrap ${isSelectedPlan ? 'text-[#E31E24]' : 'text-[#111111]'}`}>
                            {monthly.toLocaleString('ro-RO')} Lei / lună
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-center gap-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-3 text-xs text-[#6B7280]">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Dobânda este inclusă în rata afișată.</span>
                </div>

                {/* Total + CTA */}
                <div className="space-y-1 pt-1">
                  <p className="text-xs text-[#6B7280]">Total de plată</p>
                  <p className="text-[10px] text-[#6B7280]">TVA inclus</p>
                  <p className="text-2xl font-black text-[#E31E24]">
                    {Math.round(total * (INSTALLMENT_PLANS.find(p => p.months === installments)?.totalFactor ?? 1)).toLocaleString('ro-RO')} Lei
                  </p>
                  <Button
                    onClick={() => onSuccess(saveOrder(cartItems, total))}
                    className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 mt-2"
                  >
                    Continuă plata
                  </Button>
                </div>

                <button
                  onClick={() => setPaymentSubView(null)}
                  className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111] transition-colors mx-auto pt-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Înapoi la metodele de plată</span>
                </button>
              </div>
            )}

            {/* ── Card bancar form sub-view ────────────────────────── */}
            {paymentSubView === "card_form" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">Card bancar</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Plătește sigur cu cardul tău.</p>
                  </div>
                </div>

                {/* Card form */}
                <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Numărul cardului</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardFormData.number}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                          setCardFormData({ ...cardFormData, number: formatted });
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 font-extrabold text-xs tracking-widest select-none">VISA</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Numele de pe card</label>
                    <input
                      type="text"
                      value={cardFormData.name}
                      onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                      placeholder="Andrei Popescu"
                      className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Data expirării</label>
                      <input
                        type="text"
                        value={cardFormData.expiry}
                        onChange={(e) => setCardFormData({ ...cardFormData, expiry: e.target.value })}
                        placeholder="LL / AA"
                        maxLength={7}
                        className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] mb-1.5">
                        CVV
                        <span className="w-4 h-4 border border-[#6B7280] rounded-full flex items-center justify-center text-[10px] font-bold cursor-help select-none">?</span>
                      </label>
                      <input
                        type="password"
                        value={cardFormData.cvv}
                        onChange={(e) => setCardFormData({ ...cardFormData, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full text-sm p-3 rounded-lg border border-[#E5E5EA] bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Save card */}
                <label
                  className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSaveForFuture(!saveForFuture)}
                >
                  <div className="w-8 h-8 bg-[#F5F5F7] rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#111111]">Salvează cardul pentru plăți viitoare</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Îl poți folosi pentru comenzile viitoare.</p>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${saveForFuture ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300 bg-white'}`}>
                    {saveForFuture && <Check className="w-3 h-3 text-white" />}
                  </div>
                </label>

                {/* Sumar plată */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-sm text-[#111111]">Sumar plată</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Produse</span>
                      <span className="font-medium text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cost livrare</span>
                      <span className="font-medium text-green-600">Gratuit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Reducere</span>
                      <span className="font-medium text-[#E31E24]">-0 Lei</span>
                    </div>
                    <div className="border-t border-[#E5E5EA] pt-2.5 flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#111111]">Total (TVA inclus)</span>
                      <span className="font-bold text-sm text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                  </div>
                </section>

                <Button
                  onClick={() => onSuccess(saveOrder(cartItems, total))}
                  className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 flex items-center gap-2 justify-center"
                >
                  <Lock className="w-4 h-4" /> Plătește {total.toLocaleString('ro-RO')} Lei
                </Button>

                {/* Security note */}
                <div className="flex items-start gap-2 justify-center pb-2">
                  <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">Plată 100% sigură</p>
                    <p className="text-xs text-[#6B7280]">Datele cardului tău sunt protejate.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Apple Pay sub-view ───────────────────────────────── */}
            {paymentSubView === "apple_pay" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4">
                  <div className="bg-black text-white font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 shrink-0">
                    🍎 <span>Pay</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">Apple Pay</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Plătește rapid și sigur cu Apple Pay.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 flex items-center gap-3">
                  <button className="flex-1 bg-black text-white rounded-xl py-3.5 flex items-center justify-center gap-1.5 font-semibold text-sm">
                    🍎 <span>Pay</span>
                  </button>
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📱</div>
                </div>

                {/* Sumar plată */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-sm text-[#111111]">Sumar plată</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Produse</span>
                      <span className="font-medium text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cost livrare</span>
                      <span className="font-medium text-green-600">Gratuit</span>
                    </div>
                    <div className="border-t border-[#E5E5EA] pt-2.5 flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#111111]">Total (TVA inclus)</span>
                      <span className="font-bold text-sm text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                  </div>
                </section>

                <Button
                  onClick={() => onSuccess(saveOrder(cartItems, total))}
                  className="w-full h-14 bg-black hover:bg-gray-900 text-white rounded-full text-base font-bold border-0 flex items-center gap-2 justify-center"
                >
                  Plătește cu 🍎 Pay
                </Button>

                <p className="text-center text-xs text-[#6B7280] flex items-center gap-1 justify-center">
                  <Lock className="w-3 h-3" /> Vei fi redirecționat către Apple Pay
                </p>

                <button
                  onClick={() => setPaymentSubView(null)}
                  className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111] transition-colors mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Înapoi la metodele de plată</span>
                </button>
              </div>
            )}

            {/* ── Google Pay sub-view ──────────────────────────────── */}
            {paymentSubView === "google_pay" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <span className="font-black text-lg leading-none">
                      <span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">Google Pay</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Plătește rapid și sigur cu Google Pay.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 flex items-center gap-3">
                  <button className="flex-1 border-2 border-gray-200 bg-white rounded-xl py-3.5 flex items-center justify-center font-black text-sm hover:bg-gray-50">
                    <span className="text-blue-500">G</span><span className="text-red-500"> P</span><span className="text-yellow-600">a</span><span className="text-green-500">y</span>
                  </button>
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-black text-base leading-none">
                      <span className="text-blue-500">G</span><span className="text-red-500">P</span><span className="text-yellow-600">a</span><span className="text-green-500">y</span>
                    </span>
                  </div>
                </div>

                {/* Sumar plată */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-sm text-[#111111]">Sumar plată</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Produse</span>
                      <span className="font-medium text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cost livrare</span>
                      <span className="font-medium text-green-600">Gratuit</span>
                    </div>
                    <div className="border-t border-[#E5E5EA] pt-2.5 flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#111111]">Total (TVA inclus)</span>
                      <span className="font-bold text-sm text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                  </div>
                </section>

                <Button
                  onClick={() => onSuccess(saveOrder(cartItems, total))}
                  className="w-full h-14 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 rounded-full text-base font-bold shadow-sm flex items-center gap-2 justify-center"
                >
                  Plătește cu&nbsp;<span className="font-black"><span className="text-blue-500">G</span><span className="text-red-500">P</span><span className="text-yellow-600">a</span><span className="text-green-500">y</span></span>
                </Button>

                <p className="text-center text-xs text-[#6B7280] flex items-center gap-1 justify-center">
                  <Lock className="w-3 h-3" /> Vei fi redirecționat către Google Pay
                </p>

                <button
                  onClick={() => setPaymentSubView(null)}
                  className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111] transition-colors mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Înapoi la metodele de plată</span>
                </button>
              </div>
            )}

            {/* ── Plata la livrare sub-view ────────────────────────── */}
            {paymentSubView === "ramburs" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E5EA] p-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-[#111111]">Plata la livrare (ramburs)</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Plătești curierului la livrare.</p>
                  </div>
                  <span className="text-4xl">📦</span>
                </div>

                {/* Sumar plată */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-sm text-[#111111]">Sumar plată</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Produse</span>
                      <span className="font-medium text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Cost livrare</span>
                      <span className="font-medium text-green-600">Gratuit</span>
                    </div>
                    <div className="border-t border-[#E5E5EA] pt-2.5 flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#111111]">Total (TVA inclus)</span>
                      <span className="font-bold text-sm text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span>
                    </div>
                  </div>
                </section>

                <Button
                  onClick={() => onSuccess(saveOrder(cartItems, total))}
                  className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 flex items-center gap-2 justify-center"
                >
                  <Check className="w-5 h-5" /> Confirmă comanda
                </Button>

                <div className="flex items-center gap-2 bg-[#F0FDF4] border border-green-200 rounded-xl p-3 text-xs text-[#6B7280]">
                  <Info className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Vei plăti cu numerar sau card la livrare, direct curierului.</span>
                </div>

                <button
                  onClick={() => setPaymentSubView(null)}
                  className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111] transition-colors mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Înapoi la metodele de plată</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] mt-auto z-10 sticky bottom-0">

        {step === 1 && (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-[#6B7280]">Total: <span className="font-bold text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span></span>
              <ChevronDown className="h-4 w-4 text-[#6B7280]" />
            </div>
            <Button 
              onClick={() => setStep(2)} 
              className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 transition-transform active:scale-[0.98]"
            >
              Continuă
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-[#6B7280]">Total: <span className="font-bold text-[#111111]">{total.toLocaleString('ro-RO')} Lei</span></span>
              <ChevronDown className="h-4 w-4 text-[#6B7280]" />
            </div>
            <Button 
              onClick={() => { setStep(3); setPaymentSubView(null); }}
              className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 transition-transform active:scale-[0.98]"
            >
              Continuă
            </Button>
          </>
        )}

        {step === 3 && paymentSubView === null && (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">Total de plată</p>
                <p className="text-[10px] text-[#6B7280]">TVA inclus</p>
              </div>
              <p className="text-xl font-black text-[#E31E24]">{total.toLocaleString('ro-RO')} Lei</p>
            </div>
            <Button
              onClick={() => onSuccess(saveOrder(cartItems, total))}
              className="w-full h-14 bg-[#E31E24] hover:bg-[#C71015] text-white rounded-full text-base font-bold shadow-xl flex items-center gap-2 justify-center border-0 transition-all duration-300 active:scale-95"
            >
              <Lock className="h-5 w-5" /> Plătește {total.toLocaleString('ro-RO')} Lei
            </Button>
          </>
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

      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsAddCardModalOpen(false)}>
          <div className="bg-[#F5F5F7] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-lg text-[#111111]">Adaugă card nou</h3>
              <button onClick={() => setIsAddCardModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E5E5EA] text-[#6B7280] hover:bg-gray-300 transition-colors">✕</button>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Număr card</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newCardForm.number}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                    setNewCardForm({...newCardForm, number: formatted});
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Nume titular</label>
                <input
                  type="text"
                  placeholder="Nume Prenume"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                  value={newCardForm.name}
                  onChange={(e) => setNewCardForm({...newCardForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">Expirare</label>
                  <input
                    type="text"
                    placeholder="LL/AA"
                    maxLength={5}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                    value={newCardForm.expiry}
                    onChange={(e) => setNewCardForm({...newCardForm, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B7280] mb-1.5 block">CVV</label>
                  <input
                    type="password"
                    placeholder="***"
                    maxLength={3}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-[#E31E24] outline-none transition-all"
                    value={newCardForm.cvv}
                    onChange={(e) => setNewCardForm({...newCardForm, cvv: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddCardModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#111111] bg-white border border-[#E5E5EA] hover:bg-gray-50 transition-colors"
              >
                Renunță
              </button>
              <button
                onClick={() => {
                  if (newCardForm.number.length > 4) {
                    const lastFour = newCardForm.number.replace(/\s/g, "").slice(-4);
                    const updated = addCard({
                      number: `**** **** **** ${lastFour}`,
                      expiry: newCardForm.expiry || "12/28",
                      type: newCardForm.number.trim().startsWith("4") ? "Visa" : "Mastercard",
                      isMain: savedCardsState.length === 0,
                    });
                    setSavedCardsState(updated);
                    setSelectedSavedCard(updated[updated.length - 1].id);
                    setIsAddCardModalOpen(false);
                    setNewCardForm({ number: "", expiry: "", name: "", cvv: "" });
                  }
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#E31E24] hover:bg-red-700 transition-colors"
              >
                Salvează card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
