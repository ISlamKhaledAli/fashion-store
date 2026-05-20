import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Clock, ChevronDown, Send, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export interface AnalyticsDataPayload {
  period: string;
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  categoryBreakdown: { category: string; revenue: number; percentage: number }[];
  newVsReturning: { newCustomers: number; returning: number };
  revenueTimeline: { date: string; amount: number }[];
}

interface AIInsightsPanelProps {
  analyticsData: AnalyticsDataPayload;
  days: number;
  setDays: (days: number) => void;
  isLoadingData: boolean;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_STORAGE_KEY = 'adminAiInsightsChatState';

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ 
  analyticsData, 
  days,
  setDays,
  isLoadingData 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if the period (days) matches the initial props
        if (parsed.days === days) {
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.messages) setMessages(parsed.messages);
          if (parsed.lastAnalyzed) setLastAnalyzed(new Date(parsed.lastAnalyzed));
        }
      } catch (e) {
        console.error("Failed to parse saved chat state", e);
      }
    }
  }, []);

  // Save state whenever relevant dependencies change
  useEffect(() => {
    if (messages.length > 0) {
      const stateToSave = {
        days,
        language,
        messages,
        lastAnalyzed: lastAnalyzed?.toISOString() || null
      };
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [days, language, messages, lastAnalyzed]);

  useEffect(() => {
    if (!lastAnalyzed) return;
    
    const updateTimeAgo = () => {
      const diffMs = Date.now() - lastAnalyzed.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins === 0) setTimeAgo("Just now");
      else setTimeAgo(`${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [lastAnalyzed]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFetchStream = async (chatHistory: Message[]) => {
    // Cancel any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAnalyzing(true);
    
    // Add temporary assistant message for streaming
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: "assistant", content: "" }]);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/ai/analyze-analytics`;
      
      const payload = {
        ...analyticsData,
        language,
        // Only send previous history, excluding the empty placeholder we just added
        messages: chatHistory.map(m => ({ role: m.role, content: m.content }))
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to analyze data");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream");

      let buffer = "";
      setLastAnalyzed(new Date());

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
              
              setMessages(prev => prev.map(m => 
                m.id === tempId ? { ...m, content: m.content + content } : m
              ));
            } catch (e) {
              // Ignore split JSON chunks
            }
          } else if (line.length > 0 && !line.startsWith("data: ") && !line.startsWith("{")) {
            // Direct plain text stream without SSE formatting (fallback)
            setMessages(prev => prev.map(m => 
              m.id === tempId ? { ...m, content: m.content + line + "\n" } : m
            ));
          }
        }
      }
      
      // Flush remaining buffer if any
      if (buffer.trim().length > 0 && !buffer.startsWith("data: ") && !buffer.startsWith("{") && !buffer.startsWith(":")) {
         setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, content: m.content + buffer } : m
          ));
      }

    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Analysis failed:", error);
      
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, content: "Failed to analyze data. Please try again." } : m
      ));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeInitial = () => {
    if (isLoadingData) return;
    setMessages([]);
    handleFetchStream([]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isAnalyzing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: inputMessage };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputMessage("");
    
    handleFetchStream(updatedMessages);
  };

  const dateRangeOpts = [
    { label: "Last 7 Days", value: 7 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl cinematic-shadow border border-outline-variant/10 relative overflow-hidden flex flex-col max-h-[800px]">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-50" />
      
      <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-headline font-medium tracking-tight text-on-surface flex items-center gap-2">
              ✦ AI Insights
            </h3>
            <p className="text-sm text-on-surface-variant">Expert business analysis based on current metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <Button
            variant="none"
            size="none"
            onClick={() => {
              setLanguage(prev => prev === "en" ? "ar" : "en");
              // Clear messages if language changes to force a fresh translation context on next analysis
              setMessages([]);
              setLastAnalyzed(null);
              sessionStorage.removeItem(CHAT_STORAGE_KEY);
            }}
            className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "English" : "العربية"}
          </Button>

          {/* Period Dropdown */}
          <div className="relative">
            <Button 
              variant="none"
              size="none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Last {days} Days
              <ChevronDown className={cn("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md border border-zinc-100 overflow-hidden z-[60] min-w-[140px]">
                {dateRangeOpts.map(opt => (
                  <button
                    key={opt.value}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-zinc-50",
                      days === opt.value ? "font-bold text-zinc-900 bg-zinc-50/50" : "font-medium text-zinc-500"
                    )}
                    onClick={() => {
                      setDays(opt.value);
                      setIsDropdownOpen(false);
                      // Reset AI text if period changes
                      setMessages([]);
                      setLastAnalyzed(null);
                      sessionStorage.removeItem(CHAT_STORAGE_KEY);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!messages.length && !isAnalyzing ? (
            <Button 
              onClick={handleAnalyzeInitial} 
              disabled={isLoadingData}
              variant="none"
              size="none"
              className="bg-primary text-white hover:bg-primary/90 transition-colors text-sm px-4 py-1.5 rounded-md font-medium"
            >
              Analyze Data
            </Button>
          ) : (
            <Button 
              variant="none"
              size="none"
              onClick={handleAnalyzeInitial} 
              disabled={isAnalyzing || isLoadingData}
              className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-md"
            >
              <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
              Restart
            </Button>
          )}
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest min-h-[300px] max-h-[500px] scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-on-surface-variant/50 min-h-[140px]">
            {language === 'en' ? "Click analyze to generate insights for this period." : "اضغط على تحليل لاستخراج النتائج لهذه الفترة."}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
                dir={language === 'ar' && msg.role === "assistant" ? "rtl" : "ltr"}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface"
                )}>
                  {msg.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                
                <div className={cn(
                  "px-5 py-4 rounded-2xl",
                  msg.role === "user" 
                    ? "bg-surface-container-high text-on-surface rounded-tr-none" 
                    : "bg-surface-container-low/50 border border-outline-variant/10 rounded-tl-none"
                )}>
                  {msg.content === "" && isAnalyzing ? (
                    <div className="flex items-center gap-1 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : (
                    <div className="font-inter leading-relaxed text-[13px] text-on-surface prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:mb-2 prose-p:mb-2 prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-2 prose-li:mb-1 prose-strong:font-bold prose-strong:text-primary">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isAnalyzing}
              placeholder={language === 'en' ? "Ask follow-up questions..." : "اسأل أسئلة إضافية..."}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-full px-5 py-3 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isAnalyzing}
              variant="none"
              size="none"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:bg-surface-container-high disabled:text-on-surface-variant transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {lastAnalyzed && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-on-surface-variant/60 font-medium">
              <Clock className="w-3 h-3" />
              {language === 'en' ? `Last analyzed: ${timeAgo}` : `آخر تحليل: منذ ${timeAgo.replace('Just now', 'الآن').replace(' minutes ago', ' دقائق').replace(' minute ago', ' دقيقة')}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
