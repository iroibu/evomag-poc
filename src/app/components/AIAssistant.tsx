import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ShoppingCart, Heart, Laptop, Smartphone, Home, Flame, ChevronRight, ArrowLeft } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { getAssistantReply, type AssistantProduct } from "../services/geminiAssistant";
import { getAuthUser } from "../services/auth";
import { isInWishlist, toggleWishlist } from "../services/wishlist";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  products?: AssistantProduct[];
}

function AIProductCard({
  product,
  onAddToCart,
  onProductClick,
}: {
  product: AssistantProduct;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}) {
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex items-center gap-3 p-2.5 cursor-pointer active:scale-[0.98]"
      onClick={() => onProductClick?.(product)}
    >
      <div className="w-[72px] h-[72px] bg-white flex items-center justify-center shrink-0 p-1">
        <img
          src={product.images?.[0] ?? ""}
          alt={product.name}
          className="max-h-full object-contain mix-blend-multiply"
          draggable={false}
        />
      </div>
      <div className="flex-1 min-w-0">
        {product.aiReason && (
          <p className="text-[10px] text-[#E31E24] font-semibold mb-0.5 line-clamp-1">{product.aiReason}</p>
        )}
        <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">{product.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-black text-[#E31E24] leading-none">
            {product.price.toLocaleString("ro-RO")} Lei
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newState = toggleWishlist(product);
                setWishlisted(newState);
                toast.success(newState ? "Adăugat la favorite!" : "Eliminat din favorite!");
              }}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label={`${wishlisted ? "Elimină din" : "Adaugă în"} wishlist`}
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "fill-[#E31E24] text-[#E31E24]" : "text-gray-400"}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
              className="w-7 h-7 rounded-full border border-[#E31E24] flex items-center justify-center hover:bg-[#E31E24] hover:text-white text-[#E31E24] transition-colors"
              aria-label={`Adaugă ${product.name} în coș`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  {
    icon: Laptop,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-500",
    title: "Vreau un laptop",
    subtitle: "Găsește modelul potrivit pentru tine",
    prompt: "Vreau un laptop",
  },
  {
    icon: Smartphone,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    title: "Vreau un telefon",
    subtitle: "Găsește telefonul potrivit pentru tine",
    prompt: "Vreau un telefon",
  },
  {
    icon: Home,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Smart Home",
    subtitle: "Soluții inteligente pentru casa ta",
    prompt: "Smart Home",
  },
  {
    icon: Flame,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "Vreau ofertele de azi",
    subtitle: "Cele mai bune reduceri pentru tine",
    prompt: "Vreau ofertele de azi",
  },
];

function QuickActionCard({
  action,
  onClick,
}: {
  action: (typeof quickActions)[number];
  onClick: () => void;
}) {
  const Icon = action.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${action.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${action.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 leading-tight">{action.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{action.subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
    </button>
  );
}

function ChatInputBar({
  value,
  onChange,
  onSend,
  placeholder = "Întreabă EvoMi orice despre produse...",
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-gray-100">
      <Sparkles className="h-5 w-5 text-[#E31E24] shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
        aria-label="Mesaj pentru EvoMi"
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        aria-label="Trimite mesajul"
        className="w-10 h-10 rounded-full bg-[#E31E24] flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
      >
        <Send className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

export function AIAssistant({ initialPrompt, onAddToCart, onProductClick }: { initialPrompt?: string; onAddToCart?: (product: any) => void; onProductClick?: (product: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Bună! Sunt EvoMi. Cum te pot ajuta astăzi?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authUser = getAuthUser();
  const firstName = authUser?.firstName ?? "tu";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt?.trim()) {
      handleSendMessage(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const result = await getAssistantReply(message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.message,
        products: result.refused ? undefined : result.products,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Îmi pare rău, a apărut o eroare. Te rog să încerci din nou.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    handleSendMessage(input);
    setInput("");
  };

  const isWelcomeState = messages.length <= 1;

  /* ── WELCOME / HOME STATE ─────────────────────────────── */
  if (isWelcomeState) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <header className="shrink-0 safe-area-inset-top px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#E31E24] flex items-center gap-1.5">
              EvoMi
              <Sparkles className="h-4 w-4 text-[#E31E24]" />
            </span>
            <span className="text-xs text-gray-400">Asistentul tău de shopping</span>
          </div>
          <div className="flex-1" />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Robot mascot */}
          <div className="flex flex-col items-center px-4 pt-4 pb-2">
            <div className="relative inline-flex items-center justify-center">
              <img
                src="/evomag-poc/ai_assistant_robot.png"
                alt="EvoMi asistent"
                className="w-44 object-contain"
              />
            </div>
          </div>

          {/* Greeting */}
          <div className="flex flex-col items-center px-4 pb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Salut, {firstName} 👋
            </h1>
            <p className="text-base text-gray-500 mt-1">Cu ce te pot ajuta astăzi?</p>
          </div>

          {/* Quick action cards */}
          <div className="px-4 space-y-3 pb-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                action={action}
                onClick={() => handleSendMessage(action.prompt)}
              />
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 pb-4 pt-3">
          <ChatInputBar value={input} onChange={setInput} onSend={handleSend} />
        </div>
      </div>
    );
  }

  /* ── CHAT STATE ───────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="shrink-0 safe-area-inset-top px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
        <button
          aria-label="Înapoi"
          onClick={() => setMessages([messages[0]])}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-lg font-bold text-[#E31E24] flex items-center gap-1.5">
            EvoMi
            <Sparkles className="h-4 w-4 text-[#E31E24]" />
          </span>
          <span className="text-xs text-gray-400">Asistentul tău de shopping</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.type === "assistant" && (
                <Avatar className="w-8 h-8 shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </Avatar>
              )}
              <div className={`flex-1 ${message.type === "user" ? "flex justify-end" : ""}`}>
                <div
                  className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-[#E31E24] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2.5 max-w-[85%]">
                    {message.products.map((product) => (
                      <AIProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onProductClick={onProductClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8 shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </Avatar>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-3 border-t border-gray-100">
        <ChatInputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Scrie mesajul tău..."
        />
      </div>
    </div>
  );
}
