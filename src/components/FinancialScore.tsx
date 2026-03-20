import React from "react";
import { motion } from "motion/react";
import { calculateFinancialScore, getScoreCategory, getScoreInsight } from "../lib/scoring";
import { UserProfile } from "../services/gemini";
import { ShieldCheck, TrendingUp, AlertCircle } from "lucide-react";

interface FinancialScoreProps {
  profile: UserProfile;
}

export function FinancialScore({ profile }: FinancialScoreProps) {
  const score = calculateFinancialScore(profile);
  const category = getScoreCategory(score);
  const insight = getScoreInsight(score);

  // Circular progress math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Health Score</h3>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
          AI Verified
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="12"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gray-900">{score}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</div>
            <div className="text-2xl font-black text-emerald-600">{category}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{insight}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
        {[
          { label: "Stability", icon: ShieldCheck, color: "text-blue-500" },
          { label: "Growth", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Risk", icon: AlertCircle, color: "text-orange-500" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
