"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, getApiUrl } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const AdminChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-chat");
    if (saved && saved !== "[]") {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse admin chat history");
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I am your store management assistant. Ask me about revenue, low stock, recent orders, or top products.",
        },
      ]);
    }
    setIsInitialized(true);
  }, []);

  // Save to session storage
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem("admin-chat", JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I am your store management assistant. Ask me about revenue, low stock, recent orders, or top products.",
      },
    ]);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/admin/ai/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Admin AI");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder("utf-8");

      // Add a placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lineEnd;
        while ((lineEnd = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          // Ignore keep-alive or comment lines like ": OPENROUTER PROCESSING"
          if (line.startsWith(":")) {
            continue;
          }

          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || "";

              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  last.content += content;
                }
                return updated;
              });
            } catch (e) {
              // Ignore split JSON chunks
            }
          } else if (
            line.length > 0 &&
            !line.startsWith("data: ") &&
            !line.startsWith("{")
          ) {
            // Direct plain text stream fallback
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                last.content += line + "\n";
              }
              return updated;
            });
          }
        }
      }

      // Flush remaining buffer if any
      if (
        buffer.trim().length > 0 &&
        !buffer.startsWith("data: ") &&
        !buffer.startsWith("{") &&
        !buffer.startsWith(":")
      ) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            last.content += buffer;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error connecting to the store database.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-[90px] z-[100] flex h-[500px] w-[400px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-zinc-300" />
                <h3 className="text-xs font-bold tracking-widest uppercase">
                  ✦ Admin Assistant
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="none"
                  size="none"
                  onClick={clearChat}
                  className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  title="Clear Chat"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  variant="none"
                  size="none"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 space-y-4 overflow-y-auto bg-zinc-50 p-4"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto rounded-br-none bg-zinc-900 text-white"
                      : "mr-auto rounded-bl-none border border-zinc-200 bg-white whitespace-pre-wrap text-zinc-800 shadow-sm"
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-2 leading-relaxed last:mb-0"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="mb-2 list-disc space-y-1 pl-4"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="mb-2 list-decimal space-y-1 pl-4"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="font-semibold text-zinc-950"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto flex w-fit items-center gap-2 rounded-2xl rounded-bl-none border border-zinc-200 bg-white px-4 py-3 text-zinc-500 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex gap-2 border-t border-zinc-200 bg-white p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your store..."
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition-shadow outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <Button
                type="submit"
                variant="none"
                size="none"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-6 bottom-6 z-[100] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-2xl transition-colors",
          isOpen ? "bg-zinc-800" : "bg-zinc-950 hover:bg-zinc-800"
        )}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>
    </>
  );
};
