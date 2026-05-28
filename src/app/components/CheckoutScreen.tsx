import React, { useState } from "react";
import { ChevronLeft, MapPin, CreditCard, ShieldCheck, Smartphone, Wallet, Landmark, Percent, Truck, Package, Check, Info } from "lucide-react";
import { Button } from "./ui/button";
import { LockerPickerModal, type Locker } from "./LockerPickerModal";
import { saveOrder, type Order } from "../services/orders";
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
  
  const [paymentMethod, setPaymentMethod] = useState<string>("apple_pay");
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>("card1");
  const [installments, setInstallments] = useState<number>(3);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);

  const savedCards = [
    { id: "card1", number: "**** **** **** 4242", type: "Visa", expiry: "12/26", isMain: true },
    { id: "card2", number: "**** **** **** 5555", type: "Mastercard", expiry: "08/25", isMain: false }
  ];

  const PAYMENT_GROUPS = [
    {
      title: "Plată digitală rapidă",
      methods: [
        { id: "apple_pay", label: "Apple Pay", icon: <Smartphone className="w-5 h-5 text-gray-700" /> },
        { id: "google_pay", label: "Google Pay", icon: <Smartphone className="w-5 h-5 text-gray-700" /> },
      ]
    },
    {
      title: "Card bancar",
      methods: [
        { id: "online_card", label: "Online cu card bancar", icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
        { id: "card_depozit", label: "Plată cu cardul la depozit", icon: <CreditCard className="w-5 h-5 text-gray-500" /> },
      ]
    },
    {
      title: "Numerar / Transfer",
      methods: [
        { id: "ramburs", label: "Numerar la livrare (Ramburs)", icon: <Wallet className="w-5 h-5 text-green-600" /> },
        { id: "ordin_plata", label: "Ordin de plată (Transfer)", icon: <Landmark className="w-5 h-5 text-indigo-600" /> },
      ]
    },
    {
      title: "În rate / Credit",
      methods: [
        { id: "klarna", label: "Plătește fără dobândă cu Klarna", icon: <Percent className="w-5 h-5 text-pink-500" /> },
        { id: "cardavantaj", label: "CardAvantaj Online", icon: <CreditCard className="w-5 h-5 text-red-500" /> },
        { id: "leanpay", label: "Rate prin Leanpay", icon: <Percent className="w-5 h-5 text-blue-500" /> },
        { id: "tbi", label: "Cumpără acum, plătește mai târziu cu TBI Bank", icon: <Percent className="w-5 h-5 text-teal-600" /> },
        { id: "oney", label: "Oney 6x-60x", icon: <Percent className="w-5 h-5 text-green-500" /> },
      ]
    }
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      onBack();
    }
  };

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Facturare",
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

          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${step >= 1 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>1</div>
            <span className="text-[11px] font-bold tracking-tight">Facturare</span>
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${step >= 2 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>2</div>
            <span className="text-[11px] font-bold tracking-tight">Livrare</span>
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${step >= 3 ? 'text-[#E31E24]' : 'text-[#6B7280]'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 3 ? 'bg-[#E31E24] text-white' : 'bg-white border-2 border-[#E5E5EA]'}`}>3</div>
            <span className="text-[11px] font-bold tracking-tight">Plată</span>
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

            {/* Date Contact */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Date contact</h2>
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
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-[#E31E24]" />
                      <span className="font-semibold text-sm text-[#111111]">Adresa din profil</span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Str. Primăverii nr. 14, Bl. A, Ap. 12<br />
                      București, Sector 1
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
                    Adaugă o adresă nouă (Manual)
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
                  <div className="flex-1 font-medium text-sm text-[#111111]" onClick={() => setDeliveryMethod('curier')}>
                    Livrare prin curier
                  </div>
                  <Truck className="h-5 w-5 text-[#6B7280]" />
                </label>
                
                <label className="flex items-center gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === 'depozit' ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                      {deliveryMethod === 'depozit' && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                    </div>
                  </div>
                  <div className="flex-1 font-medium text-sm text-[#111111]" onClick={() => setDeliveryMethod('depozit')}>
                    Ridicare personală (depozit)
                  </div>
                  <Package className="h-5 w-5 text-[#6B7280]" />
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
                    <span className="font-medium text-sm text-[#111111]">Ridicare personală din locker</span>
                    {deliveryMethod === 'locker' && selectedLocker && (
                      <span className="text-xs text-[#E31E24] font-bold mt-0.5">{selectedLocker.name}</span>
                    )}
                  </div>
                  <MapPin className="h-5 w-5 text-[#6B7280]" />
                </label>
              </div>
            </section>

            {/* Adresa de Livrare pt Curier */}
            {deliveryMethod === 'curier' && (
              <section className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider ml-1">Adresă de livrare curier</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                  <label className="flex items-start gap-3 p-4 border-b border-[#E5E5EA] cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${useProfileAddressLivrare ? 'border-[#E31E24]' : 'border-[#E5E5EA]'}`}>
                        {useProfileAddressLivrare && <div className="w-2.5 h-2.5 bg-[#E31E24] rounded-full" />}
                      </div>
                    </div>
                    <div className="flex-1" onClick={() => setUseProfileAddressLivrare(true)}>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-[#E31E24]" />
                        <span className="font-semibold text-sm text-[#111111]">Adresa din profil</span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        Str. Primăverii nr. 14, Bl. A, Ap. 12<br />
                        București, Sector 1
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
                      Adaugă o adresă nouă (Manual)
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            <div className="mb-4">
              <h2 className="text-xl font-black text-[#111111] tracking-tight">Metodă de plată</h2>
              <p className="text-sm font-medium text-[#6B7280]">Selectează cum dorești să achiți comanda</p>
            </div>

            {/* Express Checkout */}
            <div className="space-y-3 mb-6">
              <h3 className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest pl-2">Plată express</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_GROUPS[0].methods.map(method => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
                        isSelected
                          ? 'border-[#E31E24] bg-white shadow-md'
                          : 'border-[#E5E5EA] bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-gray-50' : 'bg-white shadow-sm border border-gray-100'}`}>
                        {method.icon}
                      </div>
                      <span className="font-bold text-[13px] text-[#111111]">{method.label.replace(' Pay', '')} Pay</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 opacity-60 mb-6">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-[10px] font-black text-[#6B7280] tracking-widest">SAU PLĂTEȘTE STANDARD</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Standard Methods */}
            <div className="space-y-6">
              {PAYMENT_GROUPS.slice(1).map((group) => (
                <section key={group.title} className="space-y-3">
                  <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider pl-1">{group.title}</h3>
                  <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden divide-y divide-[#F5F5F7]">
                    {group.methods.map((method) => {
                      const isSelected = paymentMethod === method.id;
                      return (
                        <div key={method.id} className="relative transition-colors">
                          <label 
                            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentMethod(method.id);
                              if (method.id === "online_card") {
                                const mainCard = savedCards.find(c => c.isMain);
                                if (mainCard) setSelectedSavedCard(mainCard.id);
                              }
                            }}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-white shadow-sm' : 'bg-[#F5F5F7]'
                            }`}>
                              {method.icon}
                            </div>
                            <span className={`font-bold text-[14px] leading-tight flex-1 ${
                              isSelected ? 'text-[#111111]' : 'text-gray-700'
                            }`}>
                              {method.label}
                            </span>
                          </label>

                          {/* Nested Configurations Wrapper */}
                          <div className={`overflow-hidden transition-all duration-300 bg-red-50/10 ${isSelected ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>

                            {/* Nested Saved Cards when "Online cu card bancar" is selected */}
                            {method.id === "online_card" && isSelected && (
                              <div className="p-4 pt-0 space-y-3">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Alege cardul salvat</p>
                                {savedCards.map(card => (
                                  <label key={card.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedSavedCard === card.id ? 'border-[#E31E24] bg-white shadow-sm' : 'border-gray-200 bg-white/50 hover:bg-white'}`} onClick={() => setSelectedSavedCard(card.id)}>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedSavedCard === card.id ? 'border-[#E31E24]' : 'border-gray-300'}`}>
                                      {selectedSavedCard === card.id && <div className="w-2 h-2 bg-[#E31E24] rounded-full" />}
                                    </div>
                                    <div className="flex-1 flex items-center gap-3">
                                      <div className="w-10 h-7 rounded bg-[#F5F5F7] border border-gray-200 flex items-center justify-center text-[#111111] shadow-sm">
                                        <CreditCard className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-[#111111] leading-none flex items-center gap-2">
                                          {card.number}
                                          {card.isMain && <span className="bg-[#FEF2F2] text-[#E31E24] px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">Principal</span>}
                                        </p>
                                        <p className="text-[11px] text-[#6B7280] mt-1">{card.type} • Exp {card.expiry}</p>
                                      </div>
                                    </div>
                                  </label>
                                ))}
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 bg-white/50 hover:bg-white hover:border-[#E31E24] cursor-pointer transition-colors mt-2" onClick={() => setSelectedSavedCard("new")}>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedSavedCard === "new" ? 'border-[#E31E24]' : 'border-gray-300'}`}>
                                    {selectedSavedCard === "new" && <div className="w-2 h-2 bg-[#E31E24] rounded-full" />}
                                  </div>
                                  <div className="font-bold text-sm text-[#E31E24]">Adaugă un card nou...</div>
                                </label>
                              </div>
                            )}

                            {/* Nested Klarna */}
                            {method.id === "klarna" && isSelected && (
                              <div className="p-4 pt-0">
                                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 flex items-center justify-center gap-2 shadow-inner">
                                  <Info className="w-4 h-4 text-pink-500 shrink-0" />
                                  <p className="text-sm font-bold text-pink-900 text-center">
                                    3 plăți de {(total / 3).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei fără dobândă
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Nested CardAvantaj */}
                            {method.id === "cardavantaj" && isSelected && (
                              <div className="p-4 pt-0 space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2 block">Număr de rate (fără dobândă)</label>
                                  <div className="flex gap-2">
                                    {[1, 2, 3].map(num => (
                                      <button
                                        key={num}
                                        onClick={(e) => { e.preventDefault(); setInstallments(num); }}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${installments === num ? 'border-[#E31E24] bg-white text-[#E31E24] shadow-md' : 'border-gray-200 bg-white/50 text-[#111111] hover:bg-white'}`}
                                      >
                                        {num} {num === 1 ? 'rată' : 'rate'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                                  <span className="text-sm font-bold text-[#6B7280]">Rată lunară:</span>
                                  <span className="text-xl font-black text-[#E31E24]">{(total / installments).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei</span>
                                </div>
                              </div>
                            )}

                            {/* Nested Leanpay */}
                            {method.id === "leanpay" && isSelected && (
                              <div className="p-4 pt-0 space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2 block">Perioadă și număr de rate</label>
                                  <div className="relative">
                                    <select 
                                      value={installments}
                                      onChange={(e) => setInstallments(Number(e.target.value))}
                                      className="w-full text-sm p-4 rounded-xl border-2 border-[#E5E5EA] bg-white focus:outline-none focus:border-[#E31E24] font-bold text-[#111111] appearance-none shadow-sm"
                                    >
                                      {[6, 12, 18, 24, 36, 48].map(num => (
                                        <option key={num} value={num}>{num} luni (rate)</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col gap-1 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-[#6B7280]">Rată lunară:</span>
                                    <span className="text-xl font-black text-[#E31E24]">{(total / installments * 1.05).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei</span>
                                  </div>
                                  <p className="text-[10px] text-[#6B7280] text-right">*Include dobândă estimativă 5%</p>
                                </div>
                              </div>
                            )}

                            {/* Nested TBI */}
                            {method.id === "tbi" && isSelected && (
                              <div className="p-4 pt-0 space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2 block">Rate TBI Bank</label>
                                  <div className="relative">
                                    <select 
                                      value={installments}
                                      onChange={(e) => setInstallments(Number(e.target.value))}
                                      className="w-full text-sm p-4 rounded-xl border-2 border-[#E5E5EA] bg-white focus:outline-none focus:border-[#E31E24] font-bold text-[#111111] appearance-none shadow-sm"
                                    >
                                      {[4, 6, 12, 18, 24, 36, 48, 60].map(num => (
                                        <option key={num} value={num}>{num} rate lunare</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex flex-col gap-1 shadow-inner">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-teal-800">Rată estimată:</span>
                                    <span className="text-xl font-black text-teal-600">{(total / installments * 1.08).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei</span>
                                  </div>
                                  <p className="text-[10px] text-teal-600/70 text-right">*Include dobândă estimativă 8%</p>
                                </div>
                              </div>
                            )}

                            {/* Nested Oney */}
                            {method.id === "oney" && isSelected && (
                              <div className="p-4 pt-0 space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2 block">Număr de rate (x)</label>
                                  <div className="relative">
                                    <select 
                                      value={installments}
                                      onChange={(e) => setInstallments(Number(e.target.value))}
                                      className="w-full text-sm p-4 rounded-xl border-2 border-[#E5E5EA] bg-white focus:outline-none focus:border-[#E31E24] font-bold text-[#111111] appearance-none shadow-sm"
                                    >
                                      {[6, 10, 12, 14, 18, 24, 36, 48, 60].map(num => (
                                        <option key={num} value={num}>{num} rate (x{num})</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col gap-1 shadow-inner">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-green-800">Rată estimată:</span>
                                    <span className="text-xl font-black text-green-600">{(total / installments * 1.04).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei</span>
                                  </div>
                                  <p className="text-[10px] text-green-600/70 text-right">*Include dobândă estimativă 4%</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] mt-auto z-10 sticky bottom-0">
        
        {step === 3 && (
          <div className="bg-[#F5F5F7] rounded-2xl p-4 space-y-3 mb-2 shadow-inner border border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 shrink-0">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${agreedTerms ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300 bg-white group-hover:border-[#E31E24]'}`}>
                  {agreedTerms && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <input type="checkbox" className="hidden" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
              <p className="text-[10px] font-medium text-[#6B7280] leading-tight flex-1">
                Sunt de acord cu <a href="#" className="text-[#E31E24] font-bold hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Termenii și condițiile</a> și <a href="#" className="text-[#E31E24] font-bold hover:underline underline-offset-2" onClick={e => e.stopPropagation()}>Politica de confidențialitate</a>.
              </p>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 shrink-0">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${newsletter ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300 bg-white group-hover:border-[#E31E24]'}`}>
                  {newsletter && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <input type="checkbox" className="hidden" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              <p className="text-[10px] font-medium text-[#6B7280] leading-tight flex-1">
                Vreau să mă abonez la newsletter pentru a primi oferte exclusive.
              </p>
            </label>
          </div>
        )}

        {step === 1 && (
          <Button 
            onClick={() => setStep(2)} 
            className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 transition-transform active:scale-[0.98]"
          >
            Continuă
          </Button>
        )}

        {step === 2 && (
          <Button 
            onClick={() => setStep(3)} 
            className="w-full h-14 bg-[#E31E24] hover:bg-red-700 text-white rounded-full text-base font-bold shadow-lg border-0 transition-transform active:scale-[0.98]"
          >
            Trimite comanda
          </Button>
        )}

        {step === 3 && (
          <div className="pt-3 border-t border-gray-200/50 flex flex-col gap-4 mt-2">
            <div className="flex items-end justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Total de plată</span>
                <span className="text-[10px] font-medium text-gray-400">TVA inclus</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#111111] tracking-tighter">{total.toLocaleString('ro-RO')}</span>
                <span className="text-sm font-bold text-[#111111]">Lei</span>
              </div>
            </div>
            <Button
              onClick={() => onSuccess(saveOrder(cartItems, total))}
              disabled={!agreedTerms}
              className={`w-full h-14 rounded-2xl text-[15px] font-black shadow-xl flex items-center gap-2 justify-center border-0 transition-all duration-300 active:scale-95 ${agreedTerms ? 'bg-[#E31E24] hover:bg-[#C71015] text-white hover:shadow-2xl hover:shadow-red-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
            >
              {paymentMethod === 'apple_pay' ? (
                 <><Smartphone className="h-5 w-5" /> Plătește cu Apple Pay</>
              ) : paymentMethod === 'google_pay' ? (
                 <><Smartphone className="h-5 w-5" /> Plătește cu Google Pay</>
              ) : (
                 <><ShieldCheck className="h-5 w-5" /> Confirmă și plătește</>
              )}
            </Button>
          </div>
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
