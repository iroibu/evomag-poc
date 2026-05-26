import React, { useState } from "react";
import { ChevronLeft, MapPin, CreditCard, Check, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "./ui/button";

interface CheckoutScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  total: number;
}

export function CheckoutScreen({ onBack, onSuccess, total }: CheckoutScreenProps) {
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<"depozit" | "curier" | "aceeasi_zi" | "locker">("curier");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "google">("apple");
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="shrink-0 flex items-center px-4 py-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Finalizare comandă</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Address Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Adresă de livrare</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <label className="flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div className="mt-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useProfileAddress ? 'border-primary' : 'border-muted-foreground'}`}>
                  {useProfileAddress && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1" onClick={() => setUseProfileAddress(true)}>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Adresa din profil</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Str. Primăverii nr. 14, Bl. A, Ap. 12<br />
                  București, Sector 1
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useProfileAddress ? 'border-primary' : 'border-muted-foreground'}`}>
                  {!useProfileAddress && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 font-medium text-sm" onClick={() => setUseProfileAddress(false)}>
                Adaugă o adresă nouă (Manual)
              </div>
            </label>
            
            {!useProfileAddress && (
              <div className="p-4 pt-0 space-y-3 border-t bg-gray-50/50 mt-4">
                <input type="text" placeholder="Județ" className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary" />
                <input type="text" placeholder="Localitate/sector" className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary" />
                <input type="text" placeholder="Adresă" className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary" />
                <input type="text" placeholder="Cod poștal" className="w-full text-sm p-3 rounded-lg border bg-white focus:outline-primary" />
              </div>
            )}
          </div>
        </section>

        {/* Delivery Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Metodă de livrare</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'curier' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {deliveryMethod === 'curier' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 font-medium text-sm" onClick={() => setDeliveryMethod('curier')}>
                Livrare prin curier
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'depozit' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {deliveryMethod === 'depozit' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 font-medium text-sm" onClick={() => setDeliveryMethod('depozit')}>
                Ridicare personală depozit
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'aceeasi_zi' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {deliveryMethod === 'aceeasi_zi' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 flex justify-between font-medium text-sm" onClick={() => setDeliveryMethod('aceeasi_zi')}>
                <span>Livrare în aceeași zi</span>
                <span className="font-semibold text-primary">35 lei</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'locker' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {deliveryMethod === 'locker' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 font-medium text-sm" onClick={() => setDeliveryMethod('locker')}>
                Ridicare personală din locker
              </div>
            </label>
          </div>
        </section>

        {/* Payment Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Metodă de plată</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'apple' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'apple' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2" onClick={() => setPaymentMethod('apple')}>
                <div className="bg-black text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Apple Pay
                </div>
                <span className="font-semibold text-sm">Plată rapidă</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'google' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'google' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2" onClick={() => setPaymentMethod('google')}>
                <div className="bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                  G Pay
                </div>
                <span className="font-semibold text-sm">Google Pay</span>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 cursor-pointer">
              <div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-between" onClick={() => setPaymentMethod('card')}>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Card salvat (**** 4242)</span>
                </div>
              </div>
            </label>
          </div>
        </section>

      </div>

      <div className="bg-white border-t p-4 pb-safe space-y-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Total de plată</span>
          <span className="font-black text-xl text-primary">{total.toLocaleString('ro-RO')} Lei</span>
        </div>
        
        <Button 
          onClick={onSuccess} 
          className="w-full h-14 rounded-full text-base font-bold shadow-lg flex items-center gap-2 justify-center"
          style={
            paymentMethod === 'apple' ? { backgroundColor: 'black', color: 'white' } : 
            paymentMethod === 'google' ? { backgroundColor: 'white', color: 'black', border: '1px solid #e5e7eb' } : {}
          }
        >
          {paymentMethod === 'apple' ? (
             <><Smartphone className="h-5 w-5" /> Cumpără cu Apple Pay</>
          ) : paymentMethod === 'google' ? (
             <>Cumpără cu Google Pay</>
          ) : (
             <><ShieldCheck className="h-5 w-5" /> Plătește {total.toLocaleString('ro-RO')} Lei</>
          )}
        </Button>
      </div>
    </div>
  );
}