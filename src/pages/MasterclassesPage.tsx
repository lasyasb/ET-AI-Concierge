import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, BookOpen, Users, Award, Star, CheckCircle2, Clock, User } from "lucide-react";
import { useUI } from "../context/UIContext";
import { db, auth } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

import { type UserProfile } from "../services/gemini";

export function MasterclassesPage({ profile }: { profile: UserProfile | null }) {
  const navigate = useNavigate();
  const { openModal, closeModal, showToast } = useUI();

  const classes = [
    { 
      title: "Stock Market Mastery", 
      expert: "By ET Markets Team", 
      duration: "12 Hours", 
      rating: 4.9,
      syllabus: ["Technical Analysis Fundamentals", "Risk Management Strategies", "Live Market Case Studies", "Portfolio Rebalancing"]
    },
    { 
      title: "Advanced Options Trading", 
      expert: "By Professional Traders", 
      duration: "8 Hours", 
      rating: 4.8,
      syllabus: ["Greeks & Volatility", "Complex Option Spreads", "Hedging Techniques", "Trading Psychology"]
    },
    { 
      title: "Personal Finance 101", 
      expert: "By Wealth Advisors", 
      duration: "6 Hours", 
      rating: 4.7,
      syllabus: ["Budgeting & Savings", "Insurance Planning", "Retirement Fundamentals", "Tax Saving Basics"]
    },
    { 
      title: "Crypto & Digital Assets", 
      expert: "By Tech Analysts", 
      duration: "10 Hours", 
      rating: 4.6,
      syllabus: ["Blockchain Technology", "DeFi Ecosystem", "NFTs & Web3", "Regulatory Landscape"]
    },
  ];

  const handleEnroll = (course: any) => {
    openModal(
      "Enroll in Masterclass",
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-video bg-gray-900 rounded-3xl overflow-hidden relative">
            <img 
              src={`https://picsum.photos/seed/${course.title}/800/450`} 
              alt={course.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white opacity-80" />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-2xl font-black text-gray-900 leading-tight">{course.title}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span className="font-bold text-gray-900">{course.expert}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-bold text-gray-900">{course.rating} Rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900">What you'll learn:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.syllabus.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={async () => {
            const user = auth.currentUser;
            if (!user) {
              showToast("Please login to enroll", "error");
              return;
            }

            // Duplicate detection
            const isEnrolled = profile?.enrolledMasterclasses?.some(c => c.title === course.title);
            if (isEnrolled) {
              showToast("You are already enrolled in this masterclass.", "info");
              closeModal();
              return;
            }

            try {
              const enrollment = {
                id: `course_${course.title.toLowerCase().replace(/\s+/g, '_')}`,
                title: course.title,
                enrolledAt: new Date().toISOString()
              };

              await updateDoc(doc(db, "users", user.uid), {
                enrolledMasterclasses: arrayUnion(enrollment)
              });
              closeModal();
              showToast(`You are successfully enrolled in ${course.title}`, "success");
            } catch (error) {
              showToast("Failed to enroll. Please try again.", "error");
            }
          }}
          className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
        >
          Start Learning
        </button>
      </div>
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
          Financial <span className="text-emerald-600 italic font-serif">Masterclasses</span>
        </h1>
        <p className="text-xl text-gray-500">Learn from the experts who power The Economic Times. Elevate your financial IQ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {classes.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img 
                src={`https://picsum.photos/seed/${item.title}/800/450`} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <PlayCircle className="w-16 h-16 text-white relative z-20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{item.rating}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {item.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  2.4k Students
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{item.expert}</span>
                <button 
                  onClick={() => handleEnroll(item)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Certification Included</h2>
          <p className="text-gray-500">Get a verified certificate from ET Masterclass upon completion.</p>
        </div>
        <Award className="w-16 h-16 text-emerald-600 opacity-20" />
      </div>
    </div>
  );
}
