import {
  ArrowRight,
  Bell,
  ChevronRight,
  Heart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";

function EvomagLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.svg`}
      alt="evomag"
      className="h-10 w-auto"
    />
  );
}

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <div className="h-svh flex flex-col bg-[#F2F2F7] max-w-md mx-auto overflow-hidden relative z-50">
      <div className="absolute inset-0 flex flex-col overflow-y-auto">
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
            <img
              src={`${import.meta.env.BASE_URL}welcome_robot.png`}
              alt="Robot mascot"
              className="h-[116px] w-auto"
            />
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
            onClick={onEnter}
            className="w-full h-14 bg-[#E31E24] hover:bg-[#c5191f] text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200"
          >
            Începe <ArrowRight className="w-5 h-5" />
          </Button>


        </div>
      </div>

    </div>
  );
}
