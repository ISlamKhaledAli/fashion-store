import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  products?: any[];
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
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
