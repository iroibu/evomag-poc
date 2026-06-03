import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ShoppingCart, Laptop, Smartphone, Home, Flame, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { motion } from "motion/react";
import { getAssistantReply, AssistantProduct } from "../services/geminiAssistant";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  products?: AssistantProduct[];
}

const quickActions = [
  {
    icon: Laptop,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Vreau un laptop",
    subtitle: "Găsește modelul potrivit pentru tine",
    prompt: "Vreau un laptop",
  },
  {
    icon: Smartphone,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    title: "Compară telefoane",
    subtitle: "Alege telefonul care ți se potrivește",
    prompt: "Compară telefoane",
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
    title: "Vezi ofertele de azi",
    subtitle: "Cele mai bune reduceri pentru tine",
    prompt: "Vezi ofertele de azi",
  },
];

function RobotMascot() {
  return (
    <div className="relative h-[146px] w-[164px] overflow-hidden">
      <img
        src="/evomag-poc/evomi-mascot.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </div>
  );
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Buna! Sunt EvoMi. Cum te pot ajuta astazi?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (isWelcomeState) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#E31E24] flex items-center gap-1">
              EvoMi <Sparkles className="h-4 w-4 text-[#E31E24]" />
            </span>
            <span className="text-xs text-gray-400">Asistentul tău de shopping</span>
          </div>
          <div className="flex-1" />
        </div>

        {/* Robot mascot + greeting */}
        <div className="shrink-0 flex flex-col items-center px-4 pt-2 pb-4">
          <div className="relative mb-3">
            <RobotMascot />
          </div>
        </div>

        {/* Action cards */}
        <div className="shrink-0 px-4 pb-3 space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleSendMessage(action.prompt)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-gray-100 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.iconBg}`}>
                  <Icon className={`h-4 w-4 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-gray-900">{action.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{action.subtitle}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Spacer to push input bar to bottom */}
        <div className="flex-1" />

        {/* Input bar */}
        <div className="shrink-0 px-4 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-100">
            <Sparkles className="h-4 w-4 text-[#E31E24] shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Întreabă EvoMi orice despre produse..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-600 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b bg-background px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2>EvoMi</h2>
            <p className="text-sm text-muted-foreground">Mereu disponibil pentru tine</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
          >
            {message.type === "assistant" && (
              <Avatar className="w-8 h-8 shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </Avatar>
            )}
            <div className={`flex-1 ${message.type === "user" ? "flex justify-end" : ""}`}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.products && message.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.products.map((product) => (
                    <Card
                      key={product.id}
                      className="p-3 flex items-center gap-3 border-0 shadow-sm"
                    >
                      <img
                        src={product.images?.[0] ?? ""}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded-lg bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.aiReason}</p>
                        <p className="text-sm font-bold mt-1">
                          {product.price.toLocaleString('ro-RO')} Lei
                        </p>
                      </div>
                      <Button size="sm" className="shrink-0">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8 shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-background px-4 py-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Scrie mesajul tău..."
            className="h-12 rounded-full px-6"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
