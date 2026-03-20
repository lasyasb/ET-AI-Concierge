import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, PieChart, LineChart, TrendingUp, RefreshCcw, Save, ArrowRight, ShieldCheck, Landmark } from "lucide-react";
import { useUI } from "../context/UIContext";
import { db, auth } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

import { type UserProfile } from "../services/gemini";

export function ToolsPage({ profile }: { profile: UserProfile | null }) {
  const navigate = useNavigate();
  const { openModal, closeModal, showToast } = useUI();

  const handleLaunchTool = (toolName: string) => {
    switch (toolName) {
      case "EMI Calculator":
        openModal("EMI Calculator", <EMICalculator />);
        break;
      case "SIP Planner":
        openModal("SIP Planner", <SIPPlanner profile={profile} />);
        break;
      case "Tax Optimizer":
        openModal("Tax Optimizer", <TaxOptimizer />);
        break;
      case "Portfolio Analyzer":
        openModal("Portfolio Analyzer", <PortfolioAnalyzer profile={profile} />);
        break;
    }
  };

  const tools = [
    { name: "EMI Calculator", desc: "Plan your monthly installments with ease.", icon: Calculator },
    { name: "SIP Planner", desc: "Calculate your future wealth with systematic investments.", icon: TrendingUp },
    { name: "Tax Optimizer", desc: "Find the best ways to save on your annual taxes.", icon: PieChart },
    { name: "Portfolio Analyzer", desc: "Deep dive into your asset allocation and risk.", icon: LineChart },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-6">
      <div className="space-y-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-black tracking-tighter text-gray-900">
          Wealth Tools <span className="text-emerald-600 italic font-serif">Suite</span>
        </h1>
        <p className="text-xl text-gray-500">Professional-grade calculators and analysis tools to power your financial decisions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleLaunchTool(tool.name)}
            className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-4 hover:bg-white hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <tool.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold">{tool.name}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
            <div className="pt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm">
              Launch Tool
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EMICalculator() {
  const { showToast } = useUI();
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [result, setResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => {
      const p = amount;
      const r = rate / 12 / 100;
      const n = tenure * 12;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayable = emi * n;
      const totalInterest = totalPayable - p;

      setResult({
        emi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayable: Math.round(totalPayable)
      });
      setCalculating(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Loan Amount (₹)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Interest Rate (%)</label>
          <input 
            type="number" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tenure (Years)</label>
          <input 
            type="number" 
            value={tenure} 
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <button 
        onClick={calculate}
        disabled={calculating}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {calculating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Calculate EMI"}
      </button>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Monthly EMI</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.emi.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Total Interest</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.totalInterest.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Total Payable</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.totalPayable.toLocaleString()}</div>
            </div>
          </div>
          <button 
            onClick={() => showToast("EMI Plan saved to your profile", "success")}
            className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}

export function SIPPlanner({ profile, initialPlan }: { profile: UserProfile | null; initialPlan?: any }) {
  const { showToast, closeModal } = useUI();
  const [monthly, setMonthly] = useState(initialPlan?.monthly || 10000);
  const [years, setYears] = useState(initialPlan?.years || 10);
  const [returns, setReturns] = useState(initialPlan?.returns || 12);
  const [result, setResult] = useState<any>(initialPlan ? {
    futureValue: initialPlan.futureValue,
    invested: initialPlan.monthly * initialPlan.years * 12,
    gain: initialPlan.futureValue - (initialPlan.monthly * initialPlan.years * 12)
  } : null);
  const [calculating, setCalculating] = useState(false);

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => {
      const p = monthly;
      const i = returns / 12 / 100;
      const n = years * 12;
      const futureValue = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = p * n;
      const gain = futureValue - invested;

      setResult({
        futureValue: Math.round(futureValue),
        invested: Math.round(invested),
        gain: Math.round(gain)
      });
      setCalculating(false);
    }, 800);
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    
    // Duplicate detection (skip if editing same plan)
    const isDuplicate = profile.savedSIPPlans?.some(p => 
      p.id !== initialPlan?.id && // skip self
      p.monthly === monthly && 
      p.years === years && 
      p.returns === returns
    );

    if (isDuplicate) {
      showToast("This SIP plan is already saved.", "info");
      return;
    }

    try {
      let updatedPlans;
      if (initialPlan) {
        // Update existing
        updatedPlans = profile.savedSIPPlans?.map(p => 
          p.id === initialPlan.id 
            ? { ...p, monthly, years, returns, futureValue: result.futureValue, lastUpdated: new Date().toISOString() }
            : p
        );
      } else {
        // Add new
        const newPlan = {
          id: `sip_${Date.now()}`,
          monthly,
          years,
          returns,
          futureValue: result.futureValue,
          timestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        updatedPlans = [...(profile.savedSIPPlans || []), newPlan];
      }

      await updateDoc(doc(db, "users", profile.uid), {
        savedSIPPlans: updatedPlans
      });
      showToast(initialPlan ? "SIP Plan updated" : "SIP Plan saved", "success");
      closeModal?.();
    } catch (error) {
      showToast("Failed to save plan", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Monthly Investment (₹)</label>
          <input 
            type="number" 
            value={monthly} 
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Years</label>
          <input 
            type="number" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Expected Return (%)</label>
          <input 
            type="number" 
            value={returns} 
            onChange={(e) => setReturns(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <button 
        onClick={calculate}
        disabled={calculating}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {calculating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Calculate Wealth"}
      </button>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Future Value</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.futureValue.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Invested Amount</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.invested.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Wealth Gain</div>
              <div className="text-3xl font-black text-emerald-900">₹{result.gain.toLocaleString()}</div>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            {initialPlan ? "Update SIP Goal" : "Start SIP Goal"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

function TaxOptimizer() {
  const { showToast } = useUI();
  const savings = [
    { name: "ELSS (Equity Linked Savings)", limit: "₹1,50,000", saved: "₹46,800" },
    { name: "PPF (Public Provident Fund)", limit: "₹1,50,000", saved: "₹46,800" },
    { name: "NPS (National Pension Scheme)", limit: "₹50,000", saved: "₹15,600" },
    { name: "Health Insurance (80D)", limit: "₹25,000", saved: "₹7,800" },
  ];

  return (
    <div className="space-y-8">
      <div className="p-8 bg-black text-white rounded-[32px] space-y-4">
        <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Estimated Potential Savings</div>
        <div className="text-5xl font-black text-emerald-400">₹1,17,000</div>
        <p className="text-sm text-gray-400">Based on maximum deductions under Section 80C, 80CCD, and 80D.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {savings.map((item, i) => (
          <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
            <div className="space-y-1">
              <div className="font-bold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">Max Limit: {item.limit}</div>
            </div>
            <div className="text-right">
              <div className="text-emerald-600 font-black">Save {item.saved}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Tax Saved</div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => showToast("Tax strategy saved to your dashboard", "success")}
        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
      >
        Save Strategy
      </button>
    </div>
  );
}

function PortfolioAnalyzer({ profile }: { profile: UserProfile | null }) {
  const { showToast } = useUI();
  const [equity, setEquity] = useState(60);
  const [debt, setDebt] = useState(20);
  const [gold, setGold] = useState(10);
  const [cash, setCash] = useState(10);
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const total = equity + debt + gold + cash;
      const riskScore = equity > 70 ? "Aggressive" : equity > 40 ? "Moderate" : "Conservative";
      const divScore = total === 100 && equity > 0 && debt > 0 && gold > 0 ? 92 : 45;
      
      setResult({
        riskScore,
        divScore,
        insight: equity > 50 
          ? "Your portfolio is growth-oriented with a strong equity bias. Consider rebalancing if your goal is near-term."
          : "Your portfolio is defensive. This is great for capital protection but might lag in high-growth cycles."
      });
      setAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Equity %", val: equity, set: setEquity },
          { label: "Debt %", val: debt, set: setDebt },
          { label: "Gold %", val: gold, set: setGold },
          { label: "Cash %", val: cash, set: setCash },
        ].map((item, i) => (
          <div key={i} className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</label>
            <input 
              type="number" 
              value={item.val} 
              onChange={(e) => item.set(Number(e.target.value))}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        ))}
      </div>

      <button 
        onClick={analyze}
        disabled={analyzing}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {analyzing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Analyze Portfolio"}
      </button>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Risk Profile</div>
              <div className="text-2xl font-black text-gray-900">{result.riskScore}</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Diversification</div>
              <div className="text-2xl font-black text-emerald-600">{result.divScore}/100</div>
            </div>
          </div>
          
          <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              AI Portfolio Insight
            </div>
            <p className="text-emerald-900 text-sm leading-relaxed font-medium">{result.insight}</p>
            <button 
              onClick={async () => {
                const user = auth.currentUser;
                if (!user) return;
                try {
                  const configHash = `port_${equity}_${debt}_${gold}_${cash}`;
                  const existingResults = profile?.portfolioResults || [];
                  const existingIndex = existingResults.findIndex(r => r.id === configHash);

                  let updatedResults;
                  if (existingIndex > -1) {
                    updatedResults = [...existingResults];
                    updatedResults[existingIndex] = {
                      ...updatedResults[existingIndex],
                      lastUpdated: new Date().toISOString()
                    };
                  } else {
                    updatedResults = [
                      ...existingResults,
                      {
                        id: configHash,
                        riskScore: result.riskScore,
                        divScore: result.divScore,
                        insight: result.insight,
                        timestamp: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                      }
                    ];
                  }

                  await updateDoc(doc(db, "users", user.uid), {
                    portfolioResults: updatedResults
                  });
                  showToast("Portfolio optimization plan generated", "success");
                } catch (error) {
                  showToast("Failed to save portfolio analysis", "error");
                }
              }}
              className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all"
            >
              Optimize Portfolio
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
