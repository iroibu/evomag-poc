import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { saveAuthUser } from "../services/auth";
import { Button } from "./ui/button";

/* ── Logo ─────────────────────────────────────────────── */
function EvomagTextLogo() {
  return (
    <div className="text-center">
      <span className="text-2xl font-black tracking-tight text-[#E31E24]">
        evo
      </span>
      <span className="text-2xl font-black tracking-tight text-[#E31E24] uppercase">
        MAG
      </span>
    </div>
  );
}

/* ── Robot mascot (same as WelcomeScreen) ─────────────── */
function RobotMascot() {
  return (
    <svg width="90" height="106" viewBox="0 0 100 116" fill="none">
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

/* ── Step 1: Welcome ──────────────────────────────────── */
function StepWelcome({
  onEmailClick,
  onGoogleClick,
  onAppleClick,
  onCreateAccount,
}: {
  onEmailClick: () => void;
  onGoogleClick: () => void;
  onAppleClick: () => void;
  onCreateAccount: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top: logo + mascot */}
      <div className="px-6 pt-10 pb-4 flex items-start justify-between">
        <div className="pt-1">
          <EvomagTextLogo />
        </div>
        <div className="relative">
          <div className="absolute -top-1 -right-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E31E24]" />
          </div>
          <div className="absolute top-4 -left-4">
            <Sparkles className="w-2.5 h-2.5 text-gray-300" />
          </div>
          <RobotMascot />
        </div>
      </div>

      {/* Heading */}
      <div className="px-6 pb-5">
        <h1 className="text-[28px] font-black text-[#1A1A2E] leading-tight mb-2">
          Bine ai venit la{" "}
          <span className="text-[#E31E24]">EvoMag</span>
        </h1>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Conectează-te pentru o experiență personalizată și acces la toate beneficiile.
        </p>
      </div>

      {/* Feature list */}
      <div className="px-6 space-y-3 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#E31E24]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Recomandări inteligente</p>
            <p className="text-xs text-gray-400">Produse alese special pentru tine.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Livrare rapidă</p>
            <p className="text-xs text-gray-400">Comenzile tale, livrate cu prioritate.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Oferte relevante</p>
            <p className="text-xs text-gray-400">Promoții și reduceri care contează.</p>
          </div>
        </div>
      </div>

      {/* Social buttons */}
      <div className="px-6 space-y-3 mb-4">
        <button
          onClick={onGoogleClick}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" />
            <path fill="#FBBC05" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.4-11.3-8L6.2 33C9.5 39.6 16.2 44 24 44z" />
            <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.7-4.7 6.2l.1-.1 6.2 5.2C36.6 41.1 44 36 44 24c0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continuă cu Google
        </button>

        <button
          onClick={onAppleClick}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          {/* Apple icon */}
          <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.6 0 287.5 0 202.5 0 107.4 52.5 45.7 103.6 27.3c49.1-17.6 100.3-23.1 151.4-23.1 44.2 0 98.3 11.3 145.2 42.4 44.2 29.8 73.3 70.7 85.3 94.6 3.9 8.1 7.8 16.9 7.8 29.8 0 3.9-1.3 7.8-1.3 11.7 62.9-21.5 132.6-78.8 132.6-197.9 0-83.8-42.1-173.1-92.4-219z" />
          </svg>
          Continuă cu Apple
        </button>
      </div>

      {/* Divider */}
      <div className="px-6 flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">SAU</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email button */}
      <div className="px-6 mb-6">
        <button
          onClick={onEmailClick}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border-2 border-[#E31E24] bg-white text-sm font-semibold text-[#E31E24] hover:bg-red-50 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Continuă cu Email
        </button>
      </div>

      {/* Create account */}
      <div className="px-6 pb-8 flex justify-center">
        <button
          onClick={onCreateAccount}
          className="text-sm text-gray-500"
        >
          Nu ai cont?{" "}
          <span className="text-[#E31E24] font-semibold">
            Creează cont nou <ArrowRight className="inline w-3.5 h-3.5 -mt-0.5" />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Email input ──────────────────────────────── */
function StepEmail({
  email,
  onEmailChange,
  onBack,
  onContinue,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const isValid = email.includes("@") && email.includes(".");

  return (
    <div className="flex flex-col h-full">
      {/* Back */}
      <div className="px-4 pt-6 pb-2">
        <button onClick={onBack} className="p-1 -ml-1" aria-label="Înapoi">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Logo */}
      <div className="px-6 pb-6 pt-2 flex justify-center">
        <EvomagTextLogo />
      </div>

      {/* Heading */}
      <div className="px-6 mb-6">
        <h2 className="text-[22px] font-black text-[#1A1A2E] text-center mb-2">
          Conectează-te cu email
        </h2>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed">
          Introdu adresa de email asociată contului tău.
        </p>
      </div>

      {/* Email field */}
      <div className="px-6 mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Email
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="adresa@exemplu.com"
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#E31E24] focus:bg-white transition-colors"
          />
          {email && (
            <button
              onClick={() => onEmailChange("")}
              className="absolute right-3.5"
              aria-label="Șterge"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="px-6 mb-auto">
        <Button
          onClick={onContinue}
          disabled={!isValid}
          className="w-full h-13 bg-[#E31E24] hover:bg-[#c5191f] disabled:bg-gray-200 disabled:text-gray-400 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          style={{ height: "52px" }}
        >
          Continuă <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Security notice */}
      <div className="px-6 pb-10 pt-8 flex items-start gap-2 justify-center">
        <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Datele tale sunt în siguranță<br />și nu le vom distribui niciodată.
        </p>
      </div>
    </div>
  );
}

/* ── Step 3: Password input ───────────────────────────── */
function StepPassword({
  email,
  onBack,
  onLogin,
  onForgotPassword,
  onCreateAccount,
}: {
  email: string;
  onBack: () => void;
  onLogin: (password: string, rememberMe: boolean) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Back */}
      <div className="px-4 pt-6 pb-2">
        <button onClick={onBack} className="p-1 -ml-1" aria-label="Înapoi">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Logo */}
      <div className="px-6 pb-6 pt-2 flex justify-center">
        <EvomagTextLogo />
      </div>

      {/* Heading */}
      <div className="px-6 mb-2">
        <h2 className="text-[22px] font-black text-[#1A1A2E] text-center mb-3">
          Introdu parola
        </h2>
        <p className="text-[13px] text-gray-500 text-center">{email}</p>
      </div>

      {/* Password field */}
      <div className="px-6 mt-5 mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Parolă
        </label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#E31E24] focus:bg-white transition-colors"
          />
          <button
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5"
            aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="px-6 mb-6 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe((v) => !v)}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
              rememberMe
                ? "bg-[#E31E24] border-[#E31E24]"
                : "border-gray-300 bg-white"
            }`}
          >
            {rememberMe && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-xs font-medium text-gray-700">Ține-mă minte</span>
        </label>

        <button
          onClick={onForgotPassword}
          className="text-xs font-semibold text-[#E31E24] hover:text-[#c5191f] transition-colors"
        >
          Ai uitat parola?
        </button>
      </div>

      {/* Login button */}
      <div className="px-6 mb-6">
        <Button
          onClick={() => onLogin(password, rememberMe)}
          disabled={password.length < 4}
          className="w-full bg-[#E31E24] hover:bg-[#c5191f] disabled:bg-gray-200 disabled:text-gray-400 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          style={{ height: "52px" }}
        >
          Conectează-te <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Create account */}
      <div className="px-6 pb-8 flex justify-center mt-auto">
        <button onClick={onCreateAccount} className="text-sm text-gray-500">
          Nu ai cont?{" "}
          <span className="text-[#E31E24] font-semibold">
            Creează cont nou <ArrowRight className="inline w-3.5 h-3.5 -mt-0.5" />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── LoginScreen (orchestrator) ───────────────────────── */
export interface LoginScreenProps {
  onLoginSuccess: () => void;
  onCreateAccount?: () => void;
}

type LoginStep = "welcome" | "email" | "password";

export function LoginScreen({ onLoginSuccess, onCreateAccount }: LoginScreenProps) {
  const [step, setStep] = useState<LoginStep>("welcome");
  const [email, setEmail] = useState("");

  const goTo = (next: LoginStep) => setStep(next);

  const handleLogin= (password: string, rememberMe: boolean) => {
    saveAuthUser({ email, rememberMe });
    onLoginSuccess();
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    const mockEmail = `user@${provider}.com`;
    saveAuthUser({ email: mockEmail, rememberMe: true });
    onLoginSuccess();
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        maxWidth: "448px",
        margin: "0 auto",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {step === "welcome" && (
        <StepWelcome
          onEmailClick={() => goTo("email")}
          onGoogleClick={() => handleSocialLogin("google")}
          onAppleClick={() => handleSocialLogin("apple")}
          onCreateAccount={() => onCreateAccount?.()}
        />
      )}
      {step === "email" && (
        <StepEmail
          email={email}
          onEmailChange={setEmail}
          onBack={() => goTo("welcome")}
          onContinue={() => goTo("password")}
        />
      )}
      {step === "password" && (
        <StepPassword
          email={email}
          onBack={() => goTo("email")}
          onLogin={handleLogin}
          onForgotPassword={() => {}}
          onCreateAccount={() => onCreateAccount?.()}
        />
      )}
    </div>
  );
}
