"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Trash2, Search, Shirt, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useChatStore } from "@/store/chatStore";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

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
  const {
    messages,
    isOpen,
    setIsOpen,
    addMessage,
    updateLastMessage,
    clearChat,
    initializeSession
  } = useChatStore();

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { items: cartItems } = useCartStore();

  // Initialize persistent sessionId
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Scroll to bottom on messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Show welcome tooltip after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Listen to measurements-saved custom event to display green success toast
  useEffect(() => {
    const handleMeasurementsSaved = (e: Event) => {
      const customEvent = e as CustomEvent;
      const details = customEvent.detail;
      const parts = [];
      if (details.heightCm) parts.push(`Height: ${details.heightCm}cm`);
      if (details.weightKg) parts.push(`Weight: ${details.weightKg}kg`);
      if (details.chestCm) parts.push(`Chest: ${details.chestCm}cm`);
      
      toast.success(`Styling profile updated! 📏 ${parts.join(" | ")}`, {
        duration: 5000,
        description: "Your measurements have been securely saved to your account."
      });
    };

    window.addEventListener("measurements-saved", handleMeasurementsSaved);
    return () => {
      window.removeEventListener("measurements-saved", handleMeasurementsSaved);
    };
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || isLoading) return;

    if (!customText) setInputVal("");
    setShowTooltip(false);

    // 1. Add user message to store
    addMessage({ role: "user", content: text });
    setIsLoading(true);

    // 2. Fetch fresh snapshot of conversation history to post to API
    const updatedMessages = useChatStore.getState().messages;

    // Detect active sizing productId
    const lastTriggerIndex = [...updatedMessages].reverse().findIndex(m => m.isTrigger);
    let activeSizeProductId = null;
    if (lastTriggerIndex !== -1) {
      const originalIndex = updatedMessages.length - 1 - lastTriggerIndex;
      const triggerMsg = updatedMessages[originalIndex];
      const messagesAfterTrigger = updatedMessages.slice(originalIndex + 1);
      const recommendationGiven = messagesAfterTrigger.some(
        m => m.role === "assistant" && 
        (m.content.toLowerCase().includes("i recommend size") || 
         m.content.toLowerCase().includes("i recommend **size"))
      );
      if (!recommendationGiven) {
        activeSizeProductId = triggerMsg.productId || null;
      }
    }

    // 3. Add placeholder assistant message for streaming response
    addMessage({ role: "assistant", content: "" });

    try {
      const url = activeSizeProductId
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/size/recommend?productId=${activeSizeProductId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/chat`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: activeSizeProductId || undefined,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          guestCart: !user ? {
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
              
              if (parsed.measurementsSaved) {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("measurements-saved", { detail: parsed.measurements }));
                }
                continue;
              }

              const content = parsed.choices?.[0]?.delta?.content || "";
              assistantReply += content;
              
              // Dynamically update the streaming response
              updateLastMessage(assistantReply);
            } catch (e) {
              // Ignore split JSON chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      updateLastMessage("I'm sorry, I ran into a connection issue 🔌. Please try asking again in a moment.");
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

      // Matches "**[Product Name]** — $[Price]" or similar variations
      const productMatch = line.match(/^\*\*([^*]+)\*\* — \$?([0-9.,]+)/i);

      if (productMatch) {
        // Flush active text paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <div key={`text-${i}`} className="text-[13px] leading-relaxed text-on-surface/85 mb-3 font-sans font-light prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1">
              <ReactMarkdown>{currentParagraph.join("\n")}</ReactMarkdown>
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
            <div key={`text-${i}`} className="text-[13px] leading-relaxed text-on-surface/85 mb-3 font-sans font-light prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1">
              <ReactMarkdown>{currentParagraph.join("\n")}</ReactMarkdown>
            </div>
          );
          currentParagraph = [];
        }
      }
      i++;
    }

    if (currentParagraph.length > 0) {
      elements.push(
        <div key="text-final" className="text-[13px] leading-relaxed text-on-surface/85 mb-1 font-sans font-light prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1">
          <ReactMarkdown>{currentParagraph.join("\n")}</ReactMarkdown>
        </div>
      );
    }

    return elements;
  };

  const starterPrompts = [
    { label: "Sizing guidance", text: "I need help with sizes. What do you recommend?", icon: "search" },
    { label: "Build weekend look", text: "Can you build me a complete weekend outfit from the catalog?", icon: "shirt" },
    { label: "Browse Sneakers", text: "Show me the best sneakers under $140.", icon: "bag" },
    { label: "Accessorize", text: "What accessories go well with a Zara hoodie?", icon: "sparkles" }
  ];

  const getPromptIcon = (iconName: string) => {
    switch (iconName) {
      case "search":
        return <Search className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />;
      case "shirt":
        return <Shirt className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />;
      case "bag":
        return <ShoppingBag className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 pl-4 pr-9 py-2.5 bg-white border border-stone-200 shadow-xl rounded-xl text-xs max-w-xs text-on-surface-variant font-medium tracking-tight backdrop-blur-xl relative flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-all duration-300"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
            <span>Need outfit suggestions or styling advice? Let&apos;s chat!</span>
            <Button
              variant="none"
              size="none"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
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
            className="absolute bottom-18 right-0 w-[92vw] sm:w-[400px] h-[570px] bg-white/90 border border-stone-250/30 shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl font-sans"
          >
            {/* Header */}
            <div className="bg-white/85 px-6 py-4 flex items-center justify-between border-b border-stone-100 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[12px] font-black tracking-[0.18em] text-stone-900 uppercase font-sans">
                    THE CURATOR AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-stone-500 font-medium">Styling Assistant Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="none"
                  size="none"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear the conversation?")) {
                      clearChat();
                    }
                  }}
                  title="Clear conversation"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-900 border border-stone-100 hover:border-stone-200 transition-all duration-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="none"
                  size="none"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-900 border border-stone-100 hover:border-stone-200 transition-all duration-300"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-stone-50/20 scrollbar-none"
            >
              {messages.map((msg, index) => {
                if (msg.role === "assistant" && msg.content === "") {
                  return null;
                }

                // Detect if it is a size recommendation message to show divider AFTER it
                const isRecommendationMessage = msg.role === "assistant" &&
                  (msg.content.toLowerCase().includes("i recommend size") ||
                   msg.content.toLowerCase().includes("i recommend **size"));

                return (
                  <React.Fragment key={msg.id || index}>
                    {/* BEFORE trigger message divider */}
                    {msg.isTrigger && (
                      <div className="w-full flex items-center justify-center my-4 gap-3 animate-fade-in">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent flex-1" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-amber-700/80 whitespace-nowrap px-2">
                          ── Size advisor ──
                        </span>
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent flex-1" />
                      </div>
                    )}

                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
                    >
                      {msg.isTrigger ? (
                        <div className="flex flex-col items-end gap-1.5 max-w-[85%]">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 flex items-center gap-1 select-none font-sans font-semibold">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-500" /> Size advisor
                          </span>
                          <div className="rounded-2xl px-4 py-3 text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border bg-amber-50/20 border-amber-200/40 text-stone-800 rounded-br-sm w-full font-sans">
                            <p className="leading-relaxed font-medium">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] border ${
                            msg.role === "user"
                              ? "bg-stone-950 border-stone-900 text-white rounded-br-sm font-sans"
                              : "bg-white border-stone-200/80 text-stone-850 rounded-bl-sm font-sans"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p className="leading-relaxed font-light">{msg.content}</p>
                          ) : (
                            renderMessageContent(msg.content)
                          )}
                        </div>
                      )}
                    </div>

                    {/* AFTER recommendation message divider */}
                    {isRecommendationMessage && (
                      <div className="w-full flex items-center justify-center my-4 gap-3 animate-fade-in">
                        <div className="h-px bg-stone-200/80 flex-1" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 whitespace-nowrap px-2">
                          ── Back to chat ──
                        </span>
                        <div className="h-px bg-stone-200/80 flex-1" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200/80 text-stone-800 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-800/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-800/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-800/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Panel */}
            <div className="p-5 bg-gradient-to-b from-transparent to-white/50 border-t border-stone-100 flex flex-col gap-4">
              {/* Starter prompts if only initial assistant message present */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mb-0.5 ml-1">Suggested</span>
                  <div className="flex flex-wrap gap-2">
                    {starterPrompts.map((p, idx) => (
                      <Button
                        variant="none"
                        size="none"
                        key={idx}
                        onClick={() => handleSendMessage(p.text)}
                        className="group px-3.5 py-2 border border-stone-200/60 bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] rounded-full text-left text-[11.5px] text-stone-600 hover:border-stone-400 hover:text-stone-900 hover:shadow-md transition-all duration-300 font-sans flex items-center gap-2 cursor-pointer"
                      >
                        {getPromptIcon(p.icon)}
                        <span>{p.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* TextInput Input Group */}
              <div className="relative flex items-center gap-2 bg-white/80 border border-stone-200 shadow-[0_2px_14px_-6px_rgba(0,0,0,0.08)] rounded-full px-2 py-1.5 focus-within:border-stone-300 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={user ? `Styling tips, ${user.name.split(" ")[0]}...` : "Style advice or search..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none text-[13.5px] focus:outline-none focus:ring-0 text-stone-800 placeholder-stone-400 py-2.5 px-4 outline-none font-sans"
                />
                <Button
                  variant="none"
                  size="none"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isLoading}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-none shrink-0",
                    inputVal.trim() && !isLoading
                      ? "bg-stone-950 text-white shadow-md hover:scale-105 active:scale-95"
                      : "bg-stone-50 text-stone-300 pointer-events-none"
                  )}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
