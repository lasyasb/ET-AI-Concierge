import React from "react";
import { motion } from "motion/react";
import { TrendingUp, PieChart, Wallet, Target, ArrowLeft, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../services/gemini";
import { FinancialCharts } from "../components/FinancialCharts";

interface DashboardPageProps {
  profile: UserProfile;
}

export function DashboardPage({ profile }: DashboardPageProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-12 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">
            Financial <span className="text-blue-600 italic font-serif">Insights</span>
          </h1>
          <p className="text-gray-500 font-medium">Deep dive into your portfolio and growth trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Assets</div>
            <div className="text-xl font-black text-gray-900">₹25,40,000</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <PieChart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Savings</div>
            <div className="text-xl font-black text-gray-900">₹45,000</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Goal Progress</div>
            <div className="text-xl font-black text-gray-900">68%</div>
          </div>
        </div>
      </div>

      <FinancialCharts profile={profile} />

      {/* Protection Check */}
      <div className="bg-indigo-600 p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-600/20">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
            <ShieldCheck className="w-3 h-3" />
            New Module
          </div>
          <h2 className="text-4xl font-black tracking-tighter leading-none">Is your family <br /><span className="text-indigo-200 italic font-serif">fully protected?</span></h2>
          <p className="text-indigo-100 font-medium">Our new Insurance Planner uses AI to estimate your ideal coverage based on your current income and dependents.</p>
        </div>
        <button 
          onClick={() => navigate("/insurance")}
          className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl"
        >
          Check Protection Score
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Recommendations Summary */}
      <div className="bg-black text-white p-12 rounded-[48px] space-y-8">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-black tracking-tight">AI Strategic Recommendations</h2>
          <p className="text-gray-400 leading-relaxed">Based on your {profile.riskLevel} risk profile and {profile.persona} persona, we've identified these key opportunities for your wealth growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.recommendations?.map((rec, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-lg">{rec.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{rec.description}</p>
              <div className="pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Why this works</div>
                <p className="text-xs text-gray-300 italic">"{rec.whyRecommended}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
