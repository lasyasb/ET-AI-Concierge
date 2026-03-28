import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  TrendingUp, 
  Target, 
  Wallet, 
  BookOpen, 
  Calculator, 
  PieChart, 
  Landmark, 
  ArrowRight, 
  LogOut, 
  RefreshCcw, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  ChevronRight,
  Download,
  FileText,
  Trash2,
  Edit3
} from "lucide-react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { type UserProfile } from "../services/gemini";
import { useUI } from "../context/UIContext";
import { FinancialScore } from "../components/FinancialScore";
import { SavingsGoalTracker } from "../components/SavingsGoalTracker";
import { FloatingAdvisor } from "../components/FloatingAdvisor";
import { ReportGenerator } from "../components/ReportGenerator";
import { calculateFinancialScore, getScoreCategory } from "../lib/scoring";
import { SIPPlanner } from "../pages/ToolsPage";

interface HomePageProps {
  profile: UserProfile;
  onRestart: () => void;
}

export function HomePage({ profile, onRestart }: HomePageProps) {
  const navigate = useNavigate();
  const { showToast, openModal } = useUI();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully", "info");
      navigate("/");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };

  const financialScore = calculateFinancialScore(profile);
  const scoreCategory = getScoreCategory(financialScore);

  // Gamification levels
  const getLevel = (score: number) => {
    if (score >= 90) return { title: "Platinum Financial Strategist", color: "bg-indigo-600", icon: Award };
    if (score >= 70) return { title: "Gold Wealth Planner", color: "bg-amber-500", icon: Award };
    if (score >= 40) return { title: "Silver Investor", color: "bg-gray-400", icon: Award };
    return { title: "Bronze Investor", color: "bg-orange-600", icon: Award };
  };

  const level = getLevel(financialScore);

  const handleRemoveActivity = async (collection: string, id: string) => {
    if (!profile.uid) return;
    try {
      if (collection === 'selectedInsurance') {
        await updateDoc(doc(db, "users", profile.uid), {
          selectedInsurance: null
        });
      } else {
        const updatedList = (profile as any)[collection]?.filter((item: any) => item.id !== id);
        await updateDoc(doc(db, "users", profile.uid), {
          [collection]: updatedList
        });
      }
      showToast("Activity removed", "info");
    } catch (error) {
      showToast("Failed to remove activity", "error");
    }
  };

  const handleEditSIPPlan = (plan: any) => {
    openModal("Edit SIP Plan", <SIPPlanner profile={profile} initialPlan={plan} />);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-12 p-6 pb-32"
    >
      {/* Contextual Tips Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-600 text-white p-4 rounded-3xl flex items-center justify-between gap-4 shadow-lg shadow-emerald-600/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Smart Tip: Market is currently favoring long-term debt funds.</p>
            <p className="text-[10px] opacity-80 font-medium">Consider rebalancing your portfolio for better stability.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-white text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1"
        >
          Explore
          <ChevronRight className="w-3 h-3" />
        </button>
      </motion.div>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
            Welcome back, <span className="text-emerald-600 italic font-serif">{profile.displayName || "Investor"}</span>
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">Your financial journey continues here. We've updated your insights.</p>
        </div>
        <ReportGenerator profile={profile} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Progress */}
        <div className="lg:col-span-1 space-y-8">
          {/* Level & Achievements Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${level.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <level.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Level</div>
                <div className="text-xl font-black text-gray-900">{level.title}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Achievements</div>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "1", title: "First Goal", icon: Target, unlocked: (profile.savingsGoals?.length || 0) > 0 },
                  { id: "2", title: "SIP Master", icon: Calculator, unlocked: (profile.savedSIPPlans?.length || 0) > 0 },
                  { id: "3", title: "Loan Ready", icon: Landmark, unlocked: (profile.loanChecks?.length || 0) > 0 },
                  { id: "4", title: "Learner", icon: BookOpen, unlocked: (profile.enrolledMasterclasses?.length || 0) > 0 },
                ].map((badge) => (
                  <div 
                    key={badge.id}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      badge.unlocked ? "bg-emerald-100 text-emerald-600 shadow-sm" : "bg-gray-50 text-gray-300 grayscale"
                    }`}
                    title={badge.title}
                  >
                    <badge.icon className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Health Score Component */}
          <FinancialScore profile={profile} />

          {/* Profile Summary Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Persona</div>
                <div className="text-xl font-black text-gray-900">{profile.persona || "Explorer"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Risk Level</div>
                <div className="text-sm font-black text-gray-900">{profile.riskLevel || "Medium"}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Income</div>
                <div className="text-sm font-black text-gray-900">{profile.incomeRange || "N/A"}</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Primary Goal</div>
              <div className="text-sm font-black text-emerald-900">{profile.goals?.[0] || "Financial Freedom"}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Activities & Actions */}
        <div className="lg:col-span-2 space-y-12">
          {/* Savings Goal Tracker */}
          <SavingsGoalTracker userId={profile.uid!} goals={profile.savingsGoals || []} />

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate("/")}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">AI Concierge</span>
            </button>
            <button 
              onClick={() => navigate("/dashboard")}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">Recommendations</span>
            </button>
            <button 
              onClick={onRestart}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCcw className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">Refine Profile</span>
            </button>
            <button 
              onClick={() => navigate("/loans")}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">Loan Assistant</span>
            </button>
            <button 
              onClick={() => navigate("/insurance")}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">Insurance Planner</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center">Logout</span>
            </button>
          </div>

          {/* My Activities Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
              My Activities
              <div className="h-px flex-1 bg-gray-100 ml-4" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Masterclasses */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Masterclasses</span>
                  </div>
                  <button 
                    onClick={() => navigate("/masterclasses")}
                    className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {profile.enrolledMasterclasses?.length ? (
                    profile.enrolledMasterclasses.slice(0, 2).map((course, i) => (
                      <div key={course.id || `mc-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-900 truncate">{course.title}</div>
                            <div className="text-[10px] text-gray-400">Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveActivity('enrolledMasterclasses', course.id)}
                          className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic py-4">No masterclasses enrolled yet.</div>
                  )}
                </div>
              </div>

              {/* SIP Plans */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">SIP Plans</span>
                  </div>
                  <button 
                    onClick={() => navigate("/tools")}
                    className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    New Plan
                  </button>
                </div>
                <div className="space-y-3">
                  {profile.savedSIPPlans?.length ? (
                    profile.savedSIPPlans.slice(0, 2).map((plan, i) => (
                      <div key={plan.id || `sip-${i}`} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-900">₹{plan.monthly.toLocaleString()}/mo</div>
                          <div className="text-[10px] text-gray-400">{plan.years}Y @ {plan.returns}% • {new Date(plan.lastUpdated || plan.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <div className="text-xs font-black text-blue-600">₹{plan.futureValue.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 uppercase">Target</div>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEditSIPPlan(plan)} className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleRemoveActivity('savedSIPPlans', plan.id)} className="p-1 text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic py-4">No SIP plans saved yet.</div>
                  )}
                </div>
              </div>

              {/* Portfolio Results */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600">
                    <PieChart className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Portfolio</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {profile.portfolioResults?.length ? (
                    profile.portfolioResults.slice(0, 1).map((res, i) => (
                      <div key={res.id || `port-${i}`} className="space-y-3 group relative">
                        <button 
                          onClick={() => handleRemoveActivity('portfolioResults', res.id)}
                          className="absolute top-0 right-0 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-500">Risk Score:</span>
                            <span className="text-xs font-black text-purple-600 ml-2">{res.riskScore}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">Updated: {new Date(res.lastUpdated || res.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                          <p className="text-[11px] text-purple-900 font-medium leading-relaxed italic line-clamp-2">
                            "{res.insight}"
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic py-4">No portfolio analysis yet.</div>
                  )}
                </div>
              </div>

              {/* Selected Protection */}
              {profile.selectedInsurance && (
                <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-600/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-200" />
                      <span className="text-sm font-bold uppercase tracking-widest">Active Protection</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveActivity('selectedInsurance', profile.selectedInsurance!.id)}
                      className="p-2 text-indigo-300 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black">{profile.selectedInsurance.name}</div>
                      <div className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Selected on {new Date(profile.selectedInsurance.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black">{profile.selectedInsurance.coverage}</div>
                      <div className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">{profile.selectedInsurance.premium}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Checks */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Landmark className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Loan Checks</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {profile.loanChecks?.length ? (
                    profile.loanChecks.slice(0, 2).map((check, i) => (
                      <div key={check.id || `loan-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-900">{check.loanType}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {new Date(check.lastUpdated || check.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-black text-amber-600">₹{check.eligibleAmount.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 uppercase">Eligible</div>
                          </div>
                          <button 
                            onClick={() => handleRemoveActivity('loanChecks', check.id)}
                            className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic py-4">No loan checks performed yet.</div>
                  )}
                </div>
              </div>

              {/* Insurance Plans */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Insurance Plans</span>
                  </div>
                  <button 
                    onClick={() => navigate("/insurance")}
                    className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    New Plan
                  </button>
                </div>
                <div className="space-y-3">
                  {profile.insurancePlans?.length ? (
                    profile.insurancePlans.slice(0, 2).map((plan, i) => (
                      <div key={plan.id || `ins-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-900">₹{(plan.suggestedCoverage / 10000000).toFixed(1)} Cr Coverage</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {new Date(plan.lastUpdated || plan.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-black text-indigo-600">{plan.protectionScore}%</div>
                            <div className="text-[10px] text-gray-400 uppercase">Score</div>
                          </div>
                          <button 
                            onClick={() => handleRemoveActivity('insurancePlans', plan.id)}
                            className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic py-4">No insurance plans saved yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Advisor Assistant */}
      <FloatingAdvisor profile={profile} />
    </motion.div>
  );
}
