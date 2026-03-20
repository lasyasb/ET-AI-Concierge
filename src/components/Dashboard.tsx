import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Sparkles, TrendingUp, ShieldCheck, GraduationCap, Briefcase, User as UserIcon, RefreshCcw, ArrowRight, LogOut, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import type { UserProfile, Recommendation } from "../services/gemini";

interface DashboardProps {
  profile: UserProfile;
  onRestart: () => void;
}

const PERSONA_ICONS: Record<string, any> = {
  "Beginner": GraduationCap,
  "Trader": TrendingUp,
  "Long-term Investor": Briefcase,
  "High Net Worth Individual": Sparkles,
  "Student": GraduationCap,
};

const PERSONA_COLORS: Record<string, string> = {
  "Beginner": "bg-blue-500",
  "Trader": "bg-orange-500",
  "Long-term Investor": "bg-emerald-500",
  "High Net Worth Individual": "bg-purple-500",
  "Student": "bg-indigo-500",
};

export function Dashboard({ profile, onRestart }: DashboardProps) {
  const navigate = useNavigate();
  const PersonaIcon = PERSONA_ICONS[profile.persona || "Beginner"] || UserIcon;
  const personaColor = PERSONA_COLORS[profile.persona || "Beginner"] || "bg-gray-500";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 p-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg",
                personaColor
              )}
            >
              <PersonaIcon className="w-4 h-4" />
              {profile.persona}
            </motion.div>
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none"
          >
            Your Financial <br />
            <span className="text-emerald-600 italic font-serif">Concierge Report</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            {profile.reasoning}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-2 min-w-[240px]"
        >
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Risk Appetite</div>
          <div className="text-4xl font-black text-gray-900">{profile.riskLevel}</div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
            <div 
              className={cn(
                "h-full transition-all duration-1000",
                profile.riskLevel === "High" ? "w-full bg-red-500" : 
                profile.riskLevel === "Medium" ? "w-2/3 bg-orange-500" : "w-1/3 bg-emerald-500"
              )}
            />
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-2"
        >
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Financial Intent</div>
          <div className="text-3xl font-bold text-gray-900">{profile.intentScore}%</div>
          <p className="text-sm text-gray-500">Based on your goals and engagement level.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-2"
        >
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Primary Focus</div>
          <div className="text-3xl font-bold text-gray-900">{profile.orientation}</div>
          <p className="text-sm text-gray-500">Your current path is oriented towards {profile.orientation?.toLowerCase()}.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black p-8 rounded-3xl text-white space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Need a change?</div>
            <div className="text-xl font-bold">Profile Controls</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onRestart}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group text-center"
            >
              <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-all duration-500" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Refine Profile</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all group text-center text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Logout</span>
            </button>
          </div>
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center justify-between w-full px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-all group"
          >
            <span className="text-sm font-medium">View Activity Hub</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>
      </div>

      {/* Recommendations */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Recommended for You</h2>
          <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block" />
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            AI Curated
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profile.recommendations?.map((rec, i) => (
            <RecommendationCard key={rec.serviceId} recommendation={rec} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

const RecommendationCard: React.FC<{ recommendation: Recommendation; index: number }> = ({ recommendation, index }) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    console.log("Exploring service:", recommendation.serviceId, "Path:", recommendation.actionUrl);
    
    // Determine the internal route based on serviceId or actionUrl
    let targetPath = "/dashboard";
    
    const url = recommendation.actionUrl.toLowerCase();
    const id = recommendation.serviceId.toLowerCase();

    if (url.includes("tools") || id.includes("tools") || id.includes("insurance")) {
      targetPath = "/tools";
    } else if (url.includes("loans") || id.includes("loan")) {
      targetPath = "/loans";
    } else if (url.includes("masterclass") || id.includes("masterclass")) {
      targetPath = "/masterclasses";
    } else if (recommendation.actionUrl.startsWith("/")) {
      targetPath = recommendation.actionUrl;
    }

    console.log("Navigating to:", targetPath);
    navigate(targetPath);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 + index * 0.1 }}
      className="group bg-white p-8 rounded-[40px] shadow-xl hover:shadow-2xl border border-gray-100 transition-all flex flex-col h-full cursor-pointer relative z-10"
      onClick={handleExplore}
    >
      <div className="flex-1 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Sparkles className="w-7 h-7 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
            {recommendation.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100/50">
          <div className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
            <BotIcon className="w-3 h-3" />
            AI Insight
          </div>
          <p className="text-emerald-900 text-xs leading-relaxed font-medium">
            {recommendation.whyRecommended}
          </p>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleExplore();
        }}
        className="mt-8 w-full py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group-hover:translate-y-[-4px] active:scale-95 shadow-lg relative z-20"
      >
        Explore Now
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

function BotIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
