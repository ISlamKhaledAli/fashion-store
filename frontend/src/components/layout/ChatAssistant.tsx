"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

// High-resolution product images to match store seed
const PRODUCT_IMAGES: Record<string, string> = {
  "nike-air-max-90": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "adidas-superstar": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80",
  "puma-rsx-efekt": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "nike-dri-fit-club-tee": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  "adidas-essentials-trefoil-tee": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  "zara-oversized-cotton-hoodie": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  "levis-501-original-jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
  "levis-512-slim-taper-jeans": "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=600&q=80",
  "nike-windrunner-jacket": "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80",
  "adidas-firebird-track-jacket": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  "zara-crossbody-city-bag": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
  "puma-essentials-baseball-cap": "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?auto=format&fit=crop&w=600&q=80"
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  sizes: string;
  colors: string;
  slug: string;
}

// Inline Interactive Product Card Component
const InteractiveProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  description,
  sizes,
  colors,
  slug,
}) => {
  const imageUrl = PRODUCT_IMAGES[slug] || "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-white border border-stone-200 shadow-md rounded-xl p-3 my-3 cinematic-ease hover:border-primary/40 hover:shadow-lg hover:-translate-y-px transition-all duration-300">
      <div className="w-full sm:w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-stone-100 border border-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-[13px] text-on-surface leading-snug font-sans tracking-tight">
              {name}
            </h4>
            <span className="text-[13px] font-bold text-primary font-mono whitespace-nowrap">
              ${price}
            </span>
          </div>
          {description && (
            <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 font-sans leading-relaxed">
              {description}
            </p>
          )}
          {(sizes || colors) && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-on-surface/50 font-sans">
              {sizes && <span>Sizes: <strong className="font-semibold">{sizes}</strong></span>}
              {sizes && colors && <span className="opacity-40">|</span>}
              {colors && <span>Colors: <strong className="font-semibold">{colors}</strong></span>}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-3 pt-2 border-t border-stone-100 justify-end">
          <Link
            href={`/products/${slug}`}
            className="px-4 py-1.5 rounded-lg border border-stone-200 text-on-surface hover:border-primary hover:text-primary transition-all duration-300 text-[10px] uppercase font-bold tracking-widest bg-white flex items-center gap-1.5"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your personal stylist at **The Curator** 🌌. How can I help you complete your look today? Feel free to ask in English or Arabic! 😊"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user, accessToken } = useAuthStore();
  const { items: cartItems } = useCartStore();

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Show welcome tooltip after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || isLoading) return;

    if (!customText) setInputVal("");
    setShowTooltip(false);

    const newUserMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Add dummy assistant response placeholder for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          messages: updatedMessages,
          guestCart: !accessToken ? {
            items: cartItems.map(item => ({
              name: item.name,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price
            }))
          } : undefined
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("No readable stream");
      }

      let assistantReply = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let lineEnd;
        while ((lineEnd = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || "";
              assistantReply += content;
              
              // Dynamically update the streaming response
              setMessages(prev => {
                const nextMsg = [...prev];
                nextMsg[nextMsg.length - 1] = {
                  role: "assistant",
                  content: assistantReply
                };
                return nextMsg;
              });
            } catch (e) {
              // Ignore split JSON chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "I'm sorry, I ran into a connection issue 🔌. Please try asking again in a moment."
        };
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Text parser mapping product markdown to InteractiveProductCards
  const renderMessageContent = (text: string) => {
    if (!text) return [<span key="loading" className="inline-block w-2 h-4 bg-primary animate-pulse" />];
    
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      // Matches "**[Product Name]** — [Price]" or similar variations
      const productMatch = line.match(/^\*\*([^*]+)\*\* — \$?([0-9.,]+)/i);

      if (productMatch) {
        // Flush active text paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <div key={`text-${i}`} className="text-[13px] leading-relaxed text-on-surface/85 whitespace-pre-line mb-3 font-sans font-light">
              {currentParagraph.join("\n")}
            </div>
          );
          currentParagraph = [];
        }

        const name = productMatch[1].trim();
        const price = productMatch[2].trim();
        let description = "";
        let sizes = "";
        let colors = "";

        // Check for next lines details
        if (i + 1 < lines.length && lines[i + 1].trim() !== "" && !lines[i + 1].trim().startsWith("**") && !lines[i + 1].trim().toLowerCase().includes("sizes available")) {
          description = lines[i + 1].trim();
          i++;
        }

        if (i + 1 < lines.length && (lines[i + 1].toLowerCase().includes("sizes available") || lines[i + 1].toLowerCase().includes("sizes:") || lines[i + 1].toLowerCase().includes("colors:"))) {
          const detail = lines[i + 1].trim();
          const detailParts = detail.split("|");
          sizes = detailParts[0]?.replace(/sizes(\s+available)?:?/i, "").trim() || "";
          colors = detailParts[1]?.replace(/colors?:?/i, "").trim() || "";
          i++;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        elements.push(
          <InteractiveProductCard
            key={`product-${i}`}
            name={name}
            price={price}
            description={description}
            sizes={sizes}
            colors={colors}
            slug={slug}
          />
        );

        if (i + 1 < lines.length && (lines[i + 1].trim().startsWith("[") || lines[i + 1].trim().startsWith("http"))) {
          i++;
        }
      } else {
        if (line !== "") {
          currentParagraph.push(line);
        } else if (currentParagraph.length > 0) {
          elements.push(
            <div key={`text-${i}`} className="text-[13px] leading-relaxed text-on-surface/85 whitespace-pre-line mb-3 font-sans font-light">
              {currentParagraph.join("\n")}
            </div>
          );
          currentParagraph = [];
        }
      }
      i++;
    }

    if (currentParagraph.length > 0) {
      elements.push(
        <div key="text-final" className="text-[13px] leading-relaxed text-on-surface/85 whitespace-pre-line mb-1 font-sans font-light">
          {currentParagraph.join("\n")}
        </div>
      );
    }

    return elements;
  };

  const starterPrompts = [
    { label: "🔍 Sizing guidance", text: "I need help with sizes. What do you recommend?" },
    { label: "👗 Build weekend look", text: "Can you build me a complete weekend outfit from the catalog?" },
    { label: "👟 Browse Sneakers", text: "Show me the best sneakers under $140." },
    { label: "👜 Accessorize", text: "What accessories go well with a Zara hoodie?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 px-4 py-2.5 bg-white border border-stone-200 shadow-xl rounded-xl text-xs max-w-xs text-on-surface-variant font-medium tracking-tight backdrop-blur-xl relative flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-all duration-300"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
            <span>Need outfit suggestions or styling advice? Let&apos;s chat!</span>
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-stone-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border cursor-pointer select-none transition-all duration-300 relative ${
          isOpen
            ? "bg-stone-900 border-stone-800 text-white"
            : "bg-primary border-primary text-on-primary hover:shadow-primary/20 hover:scale-105"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expanded Chat Assistant Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute bottom-18 right-0 w-[92vw] sm:w-[400px] h-[550px] bg-stone-50 border border-stone-200/90 shadow-2xl rounded-2xl flex flex-col overflow-hidden backdrop-blur-3xl font-sans"
          >
            {/* Header */}
            <div className="bg-stone-900 px-5 py-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold tracking-widest text-white uppercase font-sans">
                    THE CURATOR AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-stone-400 font-medium">Styling Assistant Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-stone-50/50"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] shadow-sm border ${
                      msg.role === "user"
                        ? "bg-stone-900 border-stone-800 text-white rounded-br-none font-sans"
                        : "bg-white border-stone-200 text-on-surface rounded-bl-none font-sans"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="leading-relaxed font-light">{msg.content}</p>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 text-on-surface rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Panel */}
            <div className="p-4 bg-white border-t border-stone-200/80 flex flex-col gap-3">
              {/* Starter prompts if only initial assistant message present */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-0.5">Suggested Questions</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {starterPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p.text)}
                        className="p-2 border border-stone-200 rounded-xl text-left text-[11px] text-on-surface/80 hover:border-primary hover:bg-stone-50 transition-all cursor-pointer font-sans leading-snug"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TextInput Input Group */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1 bg-clip-padding">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={user ? `Styling tips, ${user.name.split(" ")[0]}...` : "Style advice or search items..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none text-[13px] focus:outline-none focus:ring-0 text-on-surface placeholder-on-surface/40 py-2.5 outline-none font-sans font-light"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isLoading}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                    inputVal.trim() && !isLoading
                      ? "bg-primary text-on-primary hover:opacity-90"
                      : "bg-stone-100 text-stone-400 pointer-events-none"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
