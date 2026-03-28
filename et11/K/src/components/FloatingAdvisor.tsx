import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { AdvisorMessage, UserProfile, getAdvisorResponse } from "../services/gemini";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

interface FloatingAdvisorProps {
  profile: UserProfile;
}

export function FloatingAdvisor({ profile }: FloatingAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AdvisorMessage[]>(profile.advisorChatHistory || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AdvisorMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setInput("");
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const responseText = await getAdvisorResponse(newMessages, profile);
      const botMessage: AdvisorMessage = {
        role: "model",
        content: responseText,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Persist to Firestore
      if (profile.uid) {
        await updateDoc(doc(db, "users", profile.uid), {
          advisorChatHistory: updatedMessages
        });
      }
    } catch (error) {
      console.error("Advisor error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "80px" : "600px",
              width: isMinimized ? "300px" : "400px"
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-black text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm leading-tight">Advisor Assistant</h2>
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    AI Advisor Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
                >
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900">How can I help you today?</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Ask me about saving strategies, loan planning, or investment allocation tailored to your profile.
                        </p>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        msg.role === "user" ? "bg-black" : "bg-white border border-gray-200"
                      )}>
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-black text-white rounded-tr-none" 
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                      )}>
                        <div className="prose prose-sm prose-emerald max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 mr-auto">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span className="text-xs text-gray-400 font-medium">Advisor is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form 
                  onSubmit={handleSend}
                  className="p-4 bg-white border-t border-gray-100 flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your advisor..."
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg active:scale-90 disabled:opacity-50 disabled:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen ? "bg-red-500 rotate-90" : "bg-emerald-600"
        )}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <MessageSquare className="w-8 h-8 text-white" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
