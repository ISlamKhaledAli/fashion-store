"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Trash2,
  Search,
  Shirt,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useChatStore } from "@/store/chatStore";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { cn, getApiUrl } from "@/lib/utils";

// High-resolution product images to match store seed
const PRODUCT_IMAGES: Record<string, string> = {
  "nike-air-max-90":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "adidas-superstar":
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80",
  "puma-rsx-efekt":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "nike-dri-fit-club-tee":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  "adidas-essentials-trefoil-tee":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  "zara-oversized-cotton-hoodie":
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  "levis-501-original-jeans":
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
  "levis-512-slim-taper-jeans":
    "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=600&q=80",
  "nike-windrunner-jacket":
    "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80",
  "adidas-firebird-track-jacket":
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  "zara-crossbody-city-bag":
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
  "puma-essentials-baseball-cap":
    "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?auto=format&fit=crop&w=600&q=80",
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
  const imageUrl =
    PRODUCT_IMAGES[slug] ||
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="cinematic-ease my-3 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-md transition-all duration-300 hover:-translate-y-px hover:border-primary/40 hover:shadow-lg sm:flex-row">
      <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-100 sm:w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-sans text-[13px] leading-snug font-semibold tracking-tight text-on-surface">
              {name}
            </h4>
            <span className="font-mono text-[13px] font-bold whitespace-nowrap text-primary">
              ${price}
            </span>
          </div>
          {description && (
            <p className="mt-0.5 line-clamp-2 font-sans text-[11px] leading-relaxed text-on-surface-variant">
              {description}
            </p>
          )}
          {(sizes || colors) && (
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 font-sans text-[10px] text-on-surface/50">
              {sizes && (
                <span>
                  Sizes: <strong className="font-semibold">{sizes}</strong>
                </span>
              )}
              {sizes && colors && <span className="opacity-40">|</span>}
              {colors && (
                <span>
                  Colors: <strong className="font-semibold">{colors}</strong>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end gap-2 border-t border-stone-100 pt-2">
          <Link
            href={`/products/${slug}`}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-1.5 text-[10px] font-bold tracking-widest text-on-surface uppercase transition-all duration-300 hover:border-primary hover:text-primary"
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
    initializeSession,
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
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
        description:
          "Your measurements have been securely saved to your account.",
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
    const lastTriggerIndex = [...updatedMessages]
      .reverse()
      .findIndex((m) => m.isTrigger);
    let activeSizeProductId = null;
    if (lastTriggerIndex !== -1) {
      const originalIndex = updatedMessages.length - 1 - lastTriggerIndex;
      const triggerMsg = updatedMessages[originalIndex];
      const messagesAfterTrigger = updatedMessages.slice(originalIndex + 1);
      const recommendationGiven = messagesAfterTrigger.some(
        (m) =>
          m.role === "assistant" &&
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
        ? getApiUrl(`/size/recommend?productId=${activeSizeProductId}`)
        : getApiUrl("/chat");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: activeSizeProductId || undefined,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          guestCart: !user
            ? {
                items: cartItems.map((item) => ({
                  name: item.name,
                  size: item.size,
                  color: item.color,
                  quantity: item.quantity,
                  price: item.price,
                })),
              }
            : undefined,
        }),
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
                  window.dispatchEvent(
                    new CustomEvent("measurements-saved", {
                      detail: parsed.measurements,
                    })
                  );
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
      updateLastMessage(
        "I'm sorry, I ran into a connection issue 🔌. Please try asking again in a moment."
      );
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
    if (!text)
      return [
        <span
          key="loading"
          className="inline-block h-4 w-2 animate-pulse bg-primary"
        />,
      ];

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
            <div
              key={`text-${i}`}
              className="prose prose-sm prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1 mb-3 max-w-none font-sans text-[13px] leading-relaxed font-light text-on-surface/85"
            >
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
        if (
          i + 1 < lines.length &&
          lines[i + 1].trim() !== "" &&
          !lines[i + 1].trim().startsWith("**") &&
          !lines[i + 1].trim().toLowerCase().includes("sizes available")
        ) {
          description = lines[i + 1].trim();
          i++;
        }

        if (
          i + 1 < lines.length &&
          (lines[i + 1].toLowerCase().includes("sizes available") ||
            lines[i + 1].toLowerCase().includes("sizes:") ||
            lines[i + 1].toLowerCase().includes("colors:"))
        ) {
          const detail = lines[i + 1].trim();
          const detailParts = detail.split("|");
          sizes =
            detailParts[0]?.replace(/sizes(\s+available)?:?/i, "").trim() || "";
          colors = detailParts[1]?.replace(/colors?:?/i, "").trim() || "";
          i++;
        }

        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

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

        if (
          i + 1 < lines.length &&
          (lines[i + 1].trim().startsWith("[") ||
            lines[i + 1].trim().startsWith("http"))
        ) {
          i++;
        }
      } else {
        if (line !== "") {
          currentParagraph.push(line);
        } else if (currentParagraph.length > 0) {
          elements.push(
            <div
              key={`text-${i}`}
              className="prose prose-sm prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1 mb-3 max-w-none font-sans text-[13px] leading-relaxed font-light text-on-surface/85"
            >
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
        <div
          key="text-final"
          className="prose prose-sm prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-stone-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1 mb-1 max-w-none font-sans text-[13px] leading-relaxed font-light text-on-surface/85"
        >
          <ReactMarkdown>{currentParagraph.join("\n")}</ReactMarkdown>
        </div>
      );
    }

    return elements;
  };

  const starterPrompts = [
    {
      label: "Sizing guidance",
      text: "I need help with sizes. What do you recommend?",
      icon: "search",
    },
    {
      label: "Build weekend look",
      text: "Can you build me a complete weekend outfit from the catalog?",
      icon: "shirt",
    },
    {
      label: "Browse Sneakers",
      text: "Show me the best sneakers under $140.",
      icon: "bag",
    },
    {
      label: "Accessorize",
      text: "What accessories go well with a Zara hoodie?",
      icon: "sparkles",
    },
  ];

  const getPromptIcon = (iconName: string) => {
    switch (iconName) {
      case "search":
        return (
          <Search className="h-3.5 w-3.5 text-stone-500 transition-colors group-hover:text-stone-900" />
        );
      case "shirt":
        return (
          <Shirt className="h-3.5 w-3.5 text-stone-500 transition-colors group-hover:text-stone-900" />
        );
      case "bag":
        return (
          <ShoppingBag className="h-3.5 w-3.5 text-stone-500 transition-colors group-hover:text-stone-900" />
        );
      default:
        return (
          <Sparkles className="h-3.5 w-3.5 text-stone-500 transition-colors group-hover:text-stone-900" />
        );
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-[9999] flex flex-col items-end">
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="relative mb-3 flex max-w-xs cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 pr-9 pl-4 text-xs font-medium tracking-tight text-on-surface-variant shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/30"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-primary" />
            <span>
              Need outfit suggestions or styling advice? Let&apos;s chat!
            </span>
            <Button
              variant="none"
              size="none"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-700"
              aria-label="Dismiss tooltip"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="absolute right-6 -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-stone-200 bg-white" />
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
        className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border shadow-xl transition-all duration-300 select-none ${
          isOpen
            ? "border-stone-800 bg-stone-900 text-white"
            : "border-primary bg-primary text-on-primary hover:scale-105 hover:shadow-primary/20"
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
              <X className="h-5 w-5" />
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
              <MessageSquare className="h-5 w-5" />
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
            className="border-stone-250/30 absolute right-0 bottom-18 flex h-[570px] w-[92vw] flex-col overflow-hidden rounded-3xl border bg-white/90 font-sans shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 bg-white/85 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-950 text-white">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-sans text-[12px] font-black tracking-[0.18em] text-stone-900 uppercase">
                    THE CURATOR AI
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-stone-500">
                      Styling Assistant Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="none"
                  size="none"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to clear the conversation?"
                      )
                    ) {
                      clearChat();
                    }
                  }}
                  title="Clear conversation"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400 transition-all duration-300 hover:border-stone-200 hover:bg-stone-100 hover:text-stone-900"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="none"
                  size="none"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400 transition-all duration-300 hover:border-stone-200 hover:bg-stone-100 hover:text-stone-900"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="scrollbar-none flex-1 space-y-4 overflow-y-auto bg-stone-50/20 px-5 py-5"
            >
              {messages.map((msg, index) => {
                if (msg.role === "assistant" && msg.content === "") {
                  return null;
                }

                // Detect if it is a size recommendation message to show divider AFTER it
                const isRecommendationMessage =
                  msg.role === "assistant" &&
                  (msg.content.toLowerCase().includes("i recommend size") ||
                    msg.content.toLowerCase().includes("i recommend **size"));

                return (
                  <React.Fragment key={msg.id || index}>
                    {/* BEFORE trigger message divider */}
                    {msg.isTrigger && (
                      <div className="animate-fade-in my-4 flex w-full items-center justify-center gap-3">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                        <span className="px-2 text-[9px] font-bold tracking-widest whitespace-nowrap text-amber-700/80 uppercase">
                          ── Size advisor ──
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                      </div>
                    )}

                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "animate-fade-in justify-start"}`}
                    >
                      {msg.isTrigger ? (
                        <div className="flex max-w-[85%] flex-col items-end gap-1.5">
                          <span className="flex items-center gap-1 rounded border border-amber-200/50 bg-amber-50 px-2 py-0.5 font-sans text-[9px] font-bold font-semibold tracking-wider text-amber-800 uppercase select-none">
                            <Sparkles className="h-2.5 w-2.5 animate-pulse text-amber-500" />{" "}
                            Size advisor
                          </span>
                          <div className="w-full rounded-2xl rounded-br-sm border border-amber-200/40 bg-amber-50/20 px-4 py-3 font-sans text-[13px] text-stone-800 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                            <p className="leading-relaxed font-medium">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] rounded-2xl border px-4 py-3 text-[13px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] ${
                            msg.role === "user"
                              ? "rounded-br-sm border-stone-900 bg-stone-950 font-sans text-white"
                              : "text-stone-850 rounded-bl-sm border-stone-200/80 bg-white font-sans"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p className="leading-relaxed font-light">
                              {msg.content}
                            </p>
                          ) : (
                            renderMessageContent(msg.content)
                          )}
                        </div>
                      )}
                    </div>

                    {/* AFTER recommendation message divider */}
                    {isRecommendationMessage && (
                      <div className="animate-fade-in my-4 flex w-full items-center justify-center gap-3">
                        <div className="h-px flex-1 bg-stone-200/80" />
                        <span className="px-2 text-[9px] font-bold tracking-widest whitespace-nowrap text-stone-400 uppercase">
                          ── Back to chat ──
                        </span>
                        <div className="h-px flex-1 bg-stone-200/80" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-stone-200/80 bg-white px-4 py-3.5 text-stone-800 shadow-sm">
                    <div className="flex items-center gap-1.5 py-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-800/60"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-800/60"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-800/60"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Panel */}
            <div className="flex flex-col gap-4 border-t border-stone-100 bg-gradient-to-b from-transparent to-white/50 p-5">
              {/* Starter prompts if only initial assistant message present */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2.5">
                  <span className="mb-0.5 ml-1 text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                    Suggested
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {starterPrompts.map((p, idx) => (
                      <Button
                        variant="none"
                        size="none"
                        key={idx}
                        onClick={() => handleSendMessage(p.text)}
                        className="group flex cursor-pointer items-center gap-2 rounded-full border border-stone-200/60 bg-white/70 px-3.5 py-2 text-left font-sans text-[11.5px] text-stone-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300 hover:border-stone-400 hover:text-stone-900 hover:shadow-md"
                      >
                        {getPromptIcon(p.icon)}
                        <span>{p.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* TextInput Input Group */}
              <div className="relative flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-2 py-1.5 shadow-[0_2px_14px_-6px_rgba(0,0,0,0.08)] transition-all duration-500 focus-within:border-stone-300 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    user
                      ? `Styling tips, ${user.name.split(" ")[0]}...`
                      : "Style advice or search..."
                  }
                  disabled={isLoading}
                  className="flex-1 border-none bg-transparent px-4 py-2.5 font-sans text-[13.5px] text-stone-800 placeholder-stone-400 outline-none focus:ring-0 focus:outline-none"
                />
                <Button
                  variant="none"
                  size="none"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isLoading}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none transition-all duration-300",
                    inputVal.trim() && !isLoading
                      ? "bg-stone-950 text-white shadow-md hover:scale-105 active:scale-95"
                      : "pointer-events-none bg-stone-50 text-stone-300"
                  )}
                >
                  <Send className="ml-0.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
