import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User as UserIcon, Bot, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { getNextQuestion, classifyAndRecommend, type UserProfile } from "../services/gemini";
import { db } from "../firebase";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export function Chat({ user, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    const startChat = async () => {
      setLoading(true);
      const initialHistory: Message[] = [
        { role: "model", content: "Hello! I'm your ET AI Concierge. I'm here to help you navigate the Economic Times ecosystem and find the best financial services for your needs. To get started, could you tell me a bit about your current age group?" }
      ];
      setMessages(initialHistory);
      setLoading(false);
    };
    startChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || isClassifying) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, "users", user.uid, "chat"), {
        role: "user",
        content: userMessage,
        timestamp: serverTimestamp(),
      });

      const responseText = await getNextQuestion(newMessages);
      
      // Save model response to Firestore
      await addDoc(collection(db, "users", user.uid, "chat"), {
        role: "model",
        content: responseText,
        timestamp: serverTimestamp(),
      });

      const updatedMessages: Message[] = [...newMessages, { role: "model", content: responseText }];
      setMessages(updatedMessages);

      if (responseText.includes("ONBOARDING_COMPLETE")) {
        setIsClassifying(true);
        const classification = await classifyAndRecommend(updatedMessages);
        
        const profile: UserProfile = {
          ...classification,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          wealthScore: 650, // Initial demo score (out of 1000)
          savingsGoalProgress: 25, // Initial demo progress
        };

        await setDoc(doc(db, "users", user.uid), profile, { merge: true });
        onComplete(profile);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-black text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">ET AI Concierge</h2>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online & Ready
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
          Step {Math.ceil(messages.length / 2)} of 5
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
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
                  <UserIcon className="w-4 h-4 text-white" />
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
                {msg.content.replace("ONBOARDING_COMPLETE", "")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 mr-auto"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}

        {isClassifying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-3xl border border-emerald-100 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-emerald-900 font-bold text-lg">Analyzing Your Profile</h3>
              <p className="text-emerald-700 text-sm">Our AI is crafting your personalized financial roadmap...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-4 bg-white border-top border-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading || isClassifying}
          className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || isClassifying}
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg active:scale-90 disabled:opacity-50 disabled:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
