import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  products?: any[];
  isTrigger?: boolean;
  productId?: string;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  sessionId: string;
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  clearChat: () => void;
  initializeSession: () => void;
  triggerSizeAdvisor: (productId: string, productName: string) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am your personal stylist at **The Curator** 🌌. How can I help you complete your look today? Feel free to ask in English or Arabic! 😊",
          timestamp: Date.now(),
        },
      ],
      isOpen: false,
      sessionId: "",

      setIsOpen: (isOpen) => set({ isOpen }),

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => {
          let updatedMessages = [...state.messages, newMessage];
          
          // Max stored messages: 100 (trim oldest when exceeded)
          if (updatedMessages.length > 100) {
            const hasWelcome = updatedMessages[0]?.id === "welcome";
            if (hasWelcome) {
              updatedMessages = [
                updatedMessages[0],
                ...updatedMessages.slice(updatedMessages.length - 99),
              ];
            } else {
              updatedMessages = updatedMessages.slice(updatedMessages.length - 100);
            }
          }

          return { messages: updatedMessages };
        });
      },

      updateLastMessage: (content) => {
        set((state) => {
          const updatedMessages = [...state.messages];
          if (updatedMessages.length > 0) {
            const lastIndex = updatedMessages.length - 1;
            if (updatedMessages[lastIndex].role === "assistant") {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content,
              };
            }
          }
          return { messages: updatedMessages };
        });
      },

      clearChat: () => {
        set({
          messages: [
            {
              id: "welcome",
              role: "assistant",
              content: "Hello! I am your personal stylist at **The Curator** 🌌. How can I help you complete your look today? Feel free to ask in English or Arabic! 😊",
              timestamp: Date.now(),
            },
          ],
          sessionId: generateId(),
        });
      },

      initializeSession: () => {
        if (!get().sessionId) {
          set({ sessionId: generateId() });
        }
      },

      triggerSizeAdvisor: async (productId: string, productName: string) => {
        // 1. Open the chat widget
        set({ isOpen: true });

        // 2. Add the user trigger message
        const triggerMessage: Message = {
          id: generateId(),
          role: "user",
          content: `Find my size for: ${productName}`,
          isTrigger: true,
          productId,
          timestamp: Date.now(),
        };

        set((state) => {
          let updatedMessages = [...state.messages, triggerMessage];
          if (updatedMessages.length > 100) {
            const hasWelcome = updatedMessages[0]?.id === "welcome";
            if (hasWelcome) {
              updatedMessages = [
                updatedMessages[0],
                ...updatedMessages.slice(updatedMessages.length - 99),
              ];
            } else {
              updatedMessages = updatedMessages.slice(updatedMessages.length - 100);
            }
          }
          return { messages: updatedMessages };
        });

        // 3. Add placeholder assistant message for streaming response
        const placeholderId = generateId();
        const placeholderMessage: Message = {
          id: placeholderId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, placeholderMessage]
        }));

        // 4. Stream response from /api/size/recommend
        try {
          const updatedMessages = get().messages.slice(0, -1);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/size/recommend`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
              messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch size recommendation");
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
                  get().updateLastMessage(assistantReply);
                } catch (e) {
                  // Ignore split JSON chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Size advisor streaming request failed:", err);
          get().updateLastMessage("I'm sorry, I ran into a connection issue 🔌. Please try asking again in a moment.");
        }
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
