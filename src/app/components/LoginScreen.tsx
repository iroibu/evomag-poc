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
import users from "../../data/users.json";

/* ── Logo ─────────────────────────────────────────────── */
function EvomagTextLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.svg`}
      alt="evomag"
      className="h-8 w-auto"
    />
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
    <div className="flex flex-col h-full overflow-y-auto justify-between">
      {/* Top: logo + mascot + heading */}
      <div className="safe-area-inset-top pt-8 pl-4">
        <EvomagTextLogo />
        <div className="flex items-center justify-between pt-4">
          <div className="pl-2">
            <h1 className="text-[28px] font-black text-[#1A1A2E] leading-tight mb-2">
              Bine ai venit la{" "}
              <span className="text-[#E31E24]">evomag</span>
            </h1>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Conectează-te pentru o experiență personalizată și acces la toate beneficiile.
            </p>
          </div>
          <img src="/evomag-poc/login_robot.png" alt="Robot mascot" className="w-[200px] h-auto flex-shrink-0" />
        </div>
      </div>

      {/* Feature list */}
      <div className="px-8 pb-4 space-y-3">
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

      {/* Bottom actions */}
      <div className="px-8 pb-8 flex flex-col gap-3">
        {/* Social buttons */}
        <div className="space-y-2.5">
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
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.7-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 191.4-49 30.8 0 108.2 2.6 168.6 71.9zm-174.6-89.5c-7.7 36.4-22.9 70.1-43.5 98.1-20.7 27.9-52.2 52.2-88.6 52.2s-68-2.6-88-53.5c20.7-29.1 53.5-79.3 91.2-108.9 37.7-29.5 75.5-46.4 113.2-46.4 0 0 15.9 58 15.7 58.5z"/>
              <path d="M549.6 77.5c-30.1 35.9-78.2 63.8-126.4 59.7-6-48.8 17.9-100.7 45.6-132.7 30.1-36.6 82.6-63.8 125.4-65.7 5.3 50.1-14.6 99.8-44.6 138.7"/>
            </svg>
            Continuă cu Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">SAU</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email button */}
        <button
          onClick={onEmailClick}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border-2 border-[#E31E24] bg-white text-sm font-semibold text-[#E31E24] hover:bg-red-50 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Continuă cu Email
        </button>

        {/* Create account */}
        <div className="flex justify-center pt-1">
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
      <div className="px-4 pt-8 pb-2 safe-area-inset-top">
        <button onClick={onBack} className="p-1 -ml-1" aria-label="Înapoi">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center flex-1 justify-center px-8 pb-10 gap-8">
        <EvomagTextLogo />

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[22px] font-black text-[#1A1A2E] mb-2">
            Conectează-te cu email
          </h2>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Introdu adresa de email asociată contului tău.
          </p>
        </div>

        {/* Email field */}
        <div className="w-full">
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
        <Button
          onClick={onContinue}
          disabled={!isValid}
          className="w-full bg-[#E31E24] hover:bg-[#c5191f] disabled:bg-gray-200 disabled:text-gray-400 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          style={{ height: "52px" }}
        >
          Continuă <ArrowRight className="w-4 h-4" />
        </Button>

      </div>

      {/* Security notice */}
      <div className="px-8 pb-8 flex items-start gap-2 justify-center">
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
  loginError,
}: {
  email: string;
  onBack: () => void;
  onLogin: (password: string, rememberMe: boolean) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  loginError?: string;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Back */}
      <div className="px-4 pt-8 pb-2 safe-area-inset-top">
        <button onClick={onBack} className="p-1 -ml-1" aria-label="Înapoi">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center flex-1 justify-center px-8 pb-10 gap-8">
        <EvomagTextLogo />

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[22px] font-black text-[#1A1A2E] mb-2">
            Introdu parola
          </h2>
          <p className="text-[13px] text-gray-500">{email}</p>
        </div>

        {/* Password field + error */}
        <div className="w-full flex flex-col gap-3">
          <div>
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

          {/* Error message */}
          {loginError && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
              {loginError}
            </p>
          )}
        </div>

        {/* Remember me + Forgot password */}
        <div className="w-full flex items-center justify-between">
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
      <div className="px-8 pb-8 flex justify-center">
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
  const [loginError, setLoginError] = useState<string | undefined>();

  const goTo = (next: LoginStep) => setStep(next);

  const handleLogin = (password: string, rememberMe: boolean) => {
    const match = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!match) {
      setLoginError("Email sau parolă incorectă. Încearcă din nou.");
      return;
    }
    setLoginError(undefined);
    saveAuthUser({ email: match.email, firstName: match.firstName, lastName: match.lastName, rememberMe });
    onLoginSuccess();
  };

  const handleSocialLogin = (_provider: "google" | "apple") => {
    const firstUser = users[0];
    saveAuthUser({ email: firstUser.email, firstName: firstUser.firstName, lastName: firstUser.lastName, rememberMe: true });
    onLoginSuccess();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        maxWidth: "448px",
        left: "50%",
        transform: "translateX(-50%)",
        overflow: "hidden",
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
          onBack={() => { setLoginError(undefined); goTo("email"); }}
          onLogin={handleLogin}
          onForgotPassword={() => {}}
          onCreateAccount={() => onCreateAccount?.()}
          loginError={loginError}
        />
      )}
    </div>
  );
}
