"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Button } from "../ui/Button";
import { getApiUrl } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface SizeAdvisorChatProps {
  productId: string;
  productName: string;
  availableSizes: string[];
  isOpen: boolean;
  onClose: () => void;
  onSizeRecommended?: (size: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const SizeAdvisorChat: React.FC<SizeAdvisorChatProps> = ({
  productId,
  productName,
  availableSizes,
  isOpen,
  onClose,
  onSizeRecommended,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [measurementsSaved, setMeasurementsSaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Initialize conversations
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi there! I am your sizing assistant for **The Curator** 🌌. Let's find your perfect size for the **${productName}**. To start — how tall are you?`,
          timestamp: Date.now(),
        },
      ]);
      setMeasurementsSaved(false);
    }
  }, [isOpen, productName]);

  // Automatic scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || isLoading) return;

    if (!customText) setInputVal("");

    const newMessages: Message[] = [
      ...messages,
      {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    // Prepare assistant placeholder message
    const assistantPlaceholderId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      },
    ]);

    try {
      const response = await fetch(getApiUrl("/size/recommend"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Sizing recommendation API failed");
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

              // Handle saving trigger toast
              if (parsed.measurementsSaved) {
                setMeasurementsSaved(true);
                toast.success(
                  "Measurements successfully saved to your profile!",
                  {
                    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                    duration: 5000,
                  }
                );
                continue;
              }

              const content = parsed.choices?.[0]?.delta?.content || "";
              assistantReply += content;

              // Update the placeholder
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: assistantReply }
                    : msg
                )
              );
            } catch {
              // Ignore split JSON chunks
            }
          }
        }
      }

      // Automatically detect and extract recommended sizes like "**Size L**", "**Size 42.5**", or "**L**"
      const match =
        assistantReply.match(/\*\*Size\s+([^*]+)\*\*/i) ||
        assistantReply.match(/\*\*([^*]+)\*\*/i) ||
        assistantReply.match(/size\s+([a-zA-Z0-9.\-\/]+)/i);

      if (match && onSizeRecommended) {
        const rawRecommended = match[1].trim();
        // Cross-reference with available product sizes to ensure we pass a valid select option
        const matchedSize =
          availableSizes.find(
            (s) => s.toLowerCase() === rawRecommended.toLowerCase()
          ) ||
          availableSizes.find((s) =>
            rawRecommended.toLowerCase().includes(s.toLowerCase())
          );

        if (matchedSize) {
          onSizeRecommended(matchedSize);
          toast.success(
            `We selected recommended Size: ${matchedSize} for you!`
          );
        }
      }
    } catch (err) {
      console.error("Size advisor failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content:
                  "I'm sorry, I hit a connection issue while calculating your size. Please try again in a moment.",
              }
            : msg
        )
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[99990] cursor-pointer bg-black"
          />

          {/* Slide-over Right Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[99999] flex w-full flex-col border-l border-stone-200 bg-stone-50 font-sans shadow-2xl sm:w-[460px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-6 py-5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse text-primary" />
                </div>
                <div>
                  <h3 className="font-sans text-xs font-bold tracking-[0.2em] uppercase">
                    AI Size Advisor
                  </h3>
                  <p className="mt-0.5 text-[10px] font-medium tracking-tight text-stone-400">
                    Custom stylist fit recommendations
                  </p>
                </div>
              </div>
              <Button
                variant="none"
                size="none"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-white/5 text-stone-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Notification Badge */}
            {measurementsSaved && (
              <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-6 py-2.5 text-xs font-medium tracking-tight text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Measurements updated & saved to profile dashboard.</span>
              </div>
            )}

            {/* Chat Display */}
            <div
              ref={chatContainerRef}
              className="flex-1 space-y-4 overflow-y-auto bg-stone-50/50 px-6 py-5"
            >
              {messages.map((msg) => {
                // Do not render blank assistant placeholder bubbles
                if (msg.role === "assistant" && msg.content === "") {
                  return null;
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "animate-fade-in justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl border px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "rounded-br-none border-stone-800 bg-stone-900 font-sans font-light text-white"
                          : "rounded-bl-none border-stone-200 bg-white font-sans font-light text-on-surface"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div
                          className="space-y-2 whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(
                                /\*\*([^*]+)\*\*/g,
                                '<strong class="font-bold text-zinc-950">$1</strong>'
                              )
                              .replace(
                                /\*(.+)\*/g,
                                '<em class="italic">$1</em>'
                              ),
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none border border-stone-200 bg-white px-4 py-3 text-on-surface shadow-sm">
                    <div className="flex items-center gap-1.5 py-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="flex flex-col gap-3 border-t border-stone-200/80 bg-white p-4">
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 bg-clip-padding px-3 py-1">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    user
                      ? `Height, weight, etc...`
                      : "Reply to styling expert..."
                  }
                  disabled={isLoading}
                  className="flex-1 border-none bg-transparent py-2.5 font-sans text-[13px] font-light text-on-surface placeholder-on-surface/40 outline-none focus:ring-0 focus:outline-none"
                />
                <Button
                  variant="none"
                  size="none"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isLoading}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border-none transition-all ${
                    inputVal.trim() && !isLoading
                      ? "bg-primary text-on-primary hover:opacity-90"
                      : "pointer-events-none bg-stone-100 text-stone-400"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-center font-sans text-[10px] tracking-tight text-stone-400">
                Recommended sizes are estimates based on standard measurements
                and fit notes.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
