import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, Plus, Trash2, TrendingUp, Clock, Wallet } from "lucide-react";
import { SavingsGoal } from "../services/gemini";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useUI } from "../context/UIContext";

interface SavingsGoalTrackerProps {
  userId: string;
  goals: SavingsGoal[];
}

export function SavingsGoalTracker({ userId, goals }: SavingsGoalTrackerProps) {
  const { openModal, closeModal, showToast } = useUI();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAddGoal = () => {
    openModal("Add New Savings Goal", <AddGoalForm userId={userId} onComplete={closeModal} />);
  };

  const handleDeleteGoal = async (goal: SavingsGoal) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        savingsGoals: arrayRemove(goal)
      });
      showToast("Goal removed", "info");
    } catch (error) {
      showToast("Error removing goal", "error");
    }
  };

  const handleUpdateProgress = async (goal: SavingsGoal, newAmount: number) => {
    try {
      // To update an item in an array in Firestore, we usually remove the old one and add the new one
      // or use a more complex structure. For simplicity in this demo, we'll do remove/add.
      const updatedGoal = { ...goal, currentSavings: newAmount };
      await updateDoc(doc(db, "users", userId), {
        savingsGoals: arrayRemove(goal)
      });
      await updateDoc(doc(db, "users", userId), {
        savingsGoals: arrayUnion(updatedGoal)
      });
      setUpdatingId(null);
      showToast("Progress updated!", "success");
    } catch (error) {
      showToast("Error updating progress", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
          Savings Goals
          <div className="h-px flex-1 bg-gray-100 ml-4" />
        </h2>
        <button 
          onClick={handleAddGoal}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = Math.min(100, (goal.currentSavings / goal.targetAmount) * 100);
              const isNearCompletion = progress >= 80;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 relative group"
                >
                  <button 
                    onClick={() => handleDeleteGoal(goal)}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.title}</h3>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{goal.category}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-500">₹{goal.currentSavings.toLocaleString()}</span>
                      <span className="text-gray-900">₹{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${isNearCompletion ? "bg-emerald-500" : "bg-blue-500"}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Clock className="w-3 h-3" />
                      {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString()}` : "No deadline"}
                    </div>
                    <div className="text-xs font-black text-emerald-600">{Math.round(progress)}%</div>
                  </div>

                  {updatingId === goal.id ? (
                    <div className="pt-4 flex gap-2">
                      <input 
                        type="number"
                        placeholder="New amount"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateProgress(goal, Number((e.target as HTMLInputElement).value));
                          }
                        }}
                      />
                      <button 
                        onClick={() => setUpdatingId(null)}
                        className="px-3 py-2 text-xs font-bold text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 flex items-center justify-between gap-4">
                      <button 
                        onClick={() => setUpdatingId(goal.id)}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Update Progress
                      </button>
                      {isNearCompletion && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Almost there!
                        </div>
                      )}
                    </div>
                  )}
                  
                  {progress < 50 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-[10px] text-blue-700 font-medium leading-relaxed">
                      💡 Increasing monthly investment by 10% could help you reach this goal 3 months sooner.
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">No active savings goals. Start by adding one!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AddGoalForm({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const { showToast } = useUI();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState<SavingsGoal["category"]>("Emergency Fund");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGoal: SavingsGoal = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        targetAmount: Number(target),
        currentSavings: 0,
        category,
        deadline: deadline || undefined,
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, "users", userId), {
        savingsGoals: arrayUnion(newGoal)
      });

      showToast("Goal added successfully!", "success");
      onComplete();
    } catch (error) {
      showToast("Error adding goal", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Goal Title</label>
          <input 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Tesla Model 3"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Target Amount (₹)</label>
            <input 
              required
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="500000"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option>Emergency Fund</option>
              <option>Car</option>
              <option>Home</option>
              <option>Retirement</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Target Date (Optional)</label>
          <input 
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>
      <button 
        type="submit"
        className="w-full py-5 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all"
      >
        Create Goal
      </button>
    </form>
  );
}
