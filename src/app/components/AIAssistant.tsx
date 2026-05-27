import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ShoppingCart } from "lucide-react";
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

const quickPrompts = [
  "Recomandă-mi un laptop pentru programare",
  "Care este cel mai bun telefon în 2026?",
  "Căști pentru sală de sport sub 300 Lei",
  "Monitoare pentru gaming",
];

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
                        src={product.imageUrl}
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

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="shrink-0 px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-4 py-2 bg-muted rounded-full text-sm whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t bg-background px-4 py-4 pb-24">
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
