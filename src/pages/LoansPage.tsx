import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Percent, Clock, CheckCircle2, RefreshCcw, User, Wallet, Briefcase } from "lucide-react";
import { useUI } from "../context/UIContext";
import { db, auth } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

import { type UserProfile } from "../services/gemini";

export function LoansPage({ profile }: { profile: UserProfile | null }) {
  const navigate = useNavigate();
  const { openModal, closeModal, showToast } = useUI();

  const loanTypes = [
    { type: "Home Loan", rate: "8.4%", tenure: "Up to 30 years" },
    { type: "Personal Loan", rate: "10.5%", tenure: "Up to 5 years" },
    { type: "Education Loan", rate: "9.2%", tenure: "Up to 15 years" },
    { type: "Car Loan", rate: "8.8%", tenure: "Up to 7 years" },
  ];

  const handleCheckEligibility = (loanType: string) => {
    openModal(
      `Check ${loanType} Eligibility`,
      <EligibilityForm loanType={loanType} profile={profile} />
    );
  };

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
          Loan <span className="text-emerald-600 italic font-serif">Assistant</span>
        </h1>
        <p className="text-xl text-gray-500">Compare rates and find the best financing options for your needs.</p>
      </div>

      <div className="bg-black text-white p-10 rounded-[40px] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Landmark className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">EMI Comparison Demo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loanTypes.map((loan, i) => (
            <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{loan.type}</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">Best Value</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">Interest Rate</div>
                  <div className="text-2xl font-black flex items-center gap-1">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    {loan.rate}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">Max Tenure</div>
                  <div className="text-2xl font-black flex items-center gap-1">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    {loan.tenure.split(" ")[2]}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleCheckEligibility(loan.type)}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors"
              >
                Check Eligibility
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Instant Approval", "Zero Paperwork", "Flexible Repayment"].map((feature, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-900">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EligibilityForm({ loanType, profile }: { loanType: string; profile: UserProfile | null }) {
  const { showToast, closeModal } = useUI();
  const [salary, setSalary] = useState(75000);
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      // Simple eligibility logic: 60x monthly salary
      const eligibleAmount = salary * 60;
      setResult(eligibleAmount);
      setSubmitting(false);
    }, 1200);
  };

  if (result !== null) {
    return (
      <div className="space-y-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-gray-900">Congratulations!</h3>
          <p className="text-gray-500">Based on your monthly income of ₹{salary.toLocaleString()}, you are eligible for:</p>
        </div>
        <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
          <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-2">Maximum Loan Amount</div>
          <div className="text-5xl font-black text-emerald-900">₹{result.toLocaleString()}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={async () => {
              const user = auth.currentUser;
              if (!user) return;
              try {
                const loanCheckId = `loan_${loanType.toLowerCase().replace(/\s+/g, '_')}`;
                const existingChecks = profile?.loanChecks || [];
                const otherChecks = existingChecks.filter(c => c.id !== loanCheckId);
                
                const newCheck = {
                  id: loanCheckId,
                  loanType,
                  eligibleAmount: result,
                  salary,
                  timestamp: new Date().toISOString(),
                  lastUpdated: new Date().toISOString()
                };

                await updateDoc(doc(db, "users", user.uid), {
                  loanChecks: [...otherChecks, newCheck]
                });
                showToast("Application saved. We'll contact you soon.", "success");
                closeModal();
              } catch (error) {
                showToast("Failed to save application", "error");
              }
            }}
            className="py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
          >
            Apply Now
          </button>
          <button 
            onClick={() => {
              showToast("Reminder set for later", "info");
              closeModal();
            }}
            className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            Apply Later
          </button>
        </div>
        <button 
          onClick={() => closeModal()}
          className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Wallet className="w-3 h-3" />
            Monthly Net Salary (₹)
          </label>
          <input 
            type="number" 
            required
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Briefcase className="w-3 h-3" />
            Desired Loan Amount (₹)
          </label>
          <input 
            type="number" 
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Tenure (Years)
          </label>
          <input 
            type="number" 
            required
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={submitting}
        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <RefreshCcw className="w-6 h-6 animate-spin" /> : "Check Eligibility"}
      </button>
    </form>
  );
}
