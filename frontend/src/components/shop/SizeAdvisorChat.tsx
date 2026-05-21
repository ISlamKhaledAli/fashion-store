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
                toast.success("Measurements successfully saved to your profile!", {
                  icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                  duration: 5000
                });
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
            } catch (e) {
              // Ignore split JSON chunks
            }
          }
        }
      }

      // Automatically detect and extract recommended sizes like "**Size L**", "**Size 42.5**", or "**L**"
      const match = assistantReply.match(/\*\*Size\s+([^*]+)\*\*/i) || 
                    assistantReply.match(/\*\*([^*]+)\*\*/i) ||
                    assistantReply.match(/size\s+([a-zA-Z0-9.\-\/]+)/i);

      if (match && onSizeRecommended) {
        const rawRecommended = match[1].trim();
        // Cross-reference with available product sizes to ensure we pass a valid select option
        const matchedSize = availableSizes.find(
          (s) => s.toLowerCase() === rawRecommended.toLowerCase()
        ) || availableSizes.find(
          (s) => rawRecommended.toLowerCase().includes(s.toLowerCase())
        );

        if (matchedSize) {
          console.log(`[DEBUG] Automatically auto-selecting recommended size: ${matchedSize}`);
          onSizeRecommended(matchedSize);
          toast.success(`We selected recommended Size: ${matchedSize} for you!`);
        }
      }
    } catch (err) {
      console.error("Size advisor failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content: "I'm sorry, I hit a connection issue while calculating your size. Please try again in a moment.",
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
            className="fixed inset-0 bg-black z-[99990] cursor-pointer"
          />

          {/* Slide-over Right Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-stone-50 shadow-2xl border-l border-stone-200 z-[99999] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="bg-stone-900 px-6 py-5 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase font-sans">
                    AI Size Advisor
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5 font-medium tracking-tight">
                    Custom stylist fit recommendations
                  </p>
                </div>
              </div>
              <Button
                variant="none"
                size="none"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all border-none"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>

            {/* Notification Badge */}
            {measurementsSaved && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-medium tracking-tight">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Measurements updated & saved to profile dashboard.</span>
              </div>
            )}

            {/* Chat Display */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-stone-50/50"
            >
              {messages.map((msg) => {
                // Do not render blank assistant placeholder bubbles
                if (msg.role === "assistant" && msg.content === "") {
                  return null;
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm border ${
                        msg.role === "user"
                          ? "bg-stone-900 border-stone-800 text-white rounded-br-none font-sans font-light"
                          : "bg-white border-stone-200 text-on-surface rounded-bl-none font-sans font-light"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div
                          className="space-y-2 whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-zinc-950">$1</strong>')
                              .replace(/\*(.+)\*/g, '<em class="italic">$1</em>'),
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

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

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-stone-200/80 flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1 bg-clip-padding">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={user ? `Height, weight, etc...` : "Reply to styling expert..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none text-[13px] focus:outline-none focus:ring-0 text-on-surface placeholder-on-surface/40 py-2.5 outline-none font-sans font-light"
                />
                <Button
                  variant="none"
                  size="none"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isLoading}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border-none ${
                    inputVal.trim() && !isLoading
                      ? "bg-primary text-on-primary hover:opacity-90"
                      : "bg-stone-100 text-stone-400 pointer-events-none"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-stone-400 font-sans tracking-tight">
                Recommended sizes are estimates based on standard measurements and fit notes.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
