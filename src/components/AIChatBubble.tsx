import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Filter, Info } from "lucide-react";
import { ChatMessage } from "../types";

interface AIChatBubbleProps {
  onApplyFilter: (filter: {
    type?: "alumni" | "student" | "all";
    query?: string;
    batch?: string;
    occupation?: string;
    topic?: string;
  }) => void;
  activeTheme: string;
}

export function AIChatBubble({ onApplyFilter, activeTheme }: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am the CCE Connection Hub Intelligent Assistant. Ask me anything about our Alumni, Student statistics, research publications, or mentoring opportunities!\n\n**Try asking me:**\n* 'Which alumni work at Google or Samsung?'\n* 'Who is available for career guidance?'\n* 'What research papers have been published?'\n* 'Find students skilled in React/frontend programming.'",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6), // Send last 3 rounds
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process conversation");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text || "I was unable to retrieve a reply. Please try again later.",
        timestamp: new Date().toISOString(),
        suggestedFilter: data.suggestedFilter || undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "My apologies. I had trouble connecting to the CCE Brain server. Here's a brief check: try looking up key terms like 'Google', 'AI/ML' or 'counsel' to search our database locally.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = (qn: string) => {
    handleSendMessage(qn);
  };

  const executeFilterPreFill = (filter: any) => {
    onApplyFilter(filter);
    setIsOpen(false);
  };

  const getThemeBubbleColor = () => {
    switch (activeTheme) {
      case "black-dark-red":
        return "bg-black text-red-500 border border-red-900/30 hover:scale-105";
      case "dark-red-green":
        return "bg-red-700 hover:bg-red-600 text-white shadow-emerald-950/20";
      default:
        return "bg-red-600 hover:bg-red-500 text-white shadow-red-950/20";
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        id="ai-floating-bubble-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer animate-bounce ${getThemeBubbleColor()}`}
        title="Ask CCE Assistant"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>

      {/* Chat Sidebar/Modal Panel */}
      {isOpen && (
        <div
          id="ai-assistant-modal-panel"
          className="fixed bottom-24 right-6 w-[92vw] sm:w-[450px] h-[75vh] max-h-[600px] z-50 rounded-2xl shadow-3xl flex flex-col overflow-hidden border border-white/10 backdrop-blur-xl bg-neutral-900/95 text-stone-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-red-650 to-red-900 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-300 animate-spin-slow" />
              <div>
                <h3 className="font-display font-semibold text-sm tracking-wide">CCE INTELLIGENT BOT</h3>
                <span className="text-[10px] text-zinc-300 font-mono">POWERED BY GEMINI 3.5 FLASH</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs scrollbar-thin">
            <div className="flex items-start gap-2 bg-red-600/10 border border-red-900/20 rounded-lg p-3 text-stone-300 leading-relaxed text-[11px]">
              <Info className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>
                Our AI Assistant scans all stored CCE Alumni batches and student records to help matches! Ask for programming mentors, companies, or universities.
              </span>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-red-600 text-white rounded-tr-none"
                      : "bg-stone-800/80 text-stone-100 rounded-tl-none border border-white/5"
                  }`}
                >
                  {m.text}

                  {/* Intercept Suggested Filter Overlay */}
                  {m.suggestedFilter && (
                    <div className="mt-3 p-2 rounded bg-black/40 border border-emerald-500/20 text-[11px] flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Filter className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[10px] tracking-wider uppercase font-mono">Matching Filter Extracted!</span>
                      </div>
                      <p className="text-zinc-300 text-[10px]">
                        The AI interpreted: Show {m.suggestedFilter.type} records
                        {m.suggestedFilter.topic ? ` with topic '${m.suggestedFilter.topic}'` : ""}
                        {m.suggestedFilter.query ? ` matching '${m.suggestedFilter.query}'` : ""}.
                      </p>
                      <button
                        onClick={() => executeFilterPreFill(m.suggestedFilter)}
                        className="py-1 px-2.5 rounded text-center font-semibold bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] active:scale-95 transition cursor-pointer"
                      >
                        Apply Filters Now
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-stone-500 mt-1 px-1 font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-stone-800/40 text-stone-400 max-w-[80vw]">
                <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                <span>CCE Brain is reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Help Buttons */}
          <div className="px-4 py-2 border-t border-white/5 bg-stone-900 text-left">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block mb-1">Quick Queries</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Which alumni work at Google?",
                "Mentors for career guidance?",
                "Find students skilled in React",
                "Who has published research papers?",
              ].map((q, i) => (
                <button
                  key={i}
                  id={`preset-chat-${i}`}
                  onClick={() => handleSuggestClick(q)}
                  className="px-2 py-0.5 rounded text-[10px] bg-stone-850 hover:bg-stone-800 text-stone-300 border border-white/5 transition active:scale-95 cursor-pointer max-w-full truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            id="chat-input-form"
            className="p-3 bg-stone-950 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              id="chat-message-textbox"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask CCE Bot..."
              className="flex-1 bg-stone-900 border border-white/5 hover:border-white/15 focus:border-red-650/55 rounded-lg px-3.5 py-2 text-xs text-stone-200 outline-none transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              id="chat-send-msg-btn"
              className="p-2 rounded-lg bg-red-700 hover:bg-red-600 text-white transition disabled:opacity-50 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
