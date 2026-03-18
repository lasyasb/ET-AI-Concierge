import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";
import { Dashboard as RecommendationsPage } from "./components/Dashboard";
import { ToolsPage } from "./pages/ToolsPage";
import { LoansPage } from "./pages/LoansPage";
import { InsurancePage } from "./pages/InsurancePage";
import { MasterclassesPage } from "./pages/MasterclassesPage";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { type UserProfile } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Bot, ShieldCheck, Home, LayoutDashboard, BookOpen, Calculator, Landmark } from "lucide-react";

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        // If onboarding is complete and we are at root, go to home
        if (data.onboardingComplete && location.pathname === "/") {
          navigate("/home");
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [user, navigate, location.pathname]);

  const handleRestart = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        onboardingComplete: false
      });
      navigate("/");
    } catch (error) {
      console.error("Error restarting onboarding:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/recommendations", icon: Sparkles, label: "Recommendations" },
    { path: "/masterclasses", icon: BookOpen, label: "Masterclasses" },
    { path: "/tools", icon: Calculator, label: "Tools" },
    { path: "/loans", icon: Landmark, label: "Loans" },
    { path: "/insurance", icon: ShieldCheck, label: "Insurance" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => navigate(profile?.onboardingComplete ? "/home" : "/")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">ET AI Concierge</span>
          </div>

          {profile?.onboardingComplete && (
            <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    location.pathname === item.path 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <Auth user={user} loading={loading} />
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={
                !user ? (
                  <LandingPage />
                ) : profile?.onboardingComplete ? (
                  <Navigate to="/home" replace />
                ) : (
                  <OnboardingPage user={user} setProfile={setProfile} />
                )
              } />
              
              <Route path="/home" element={
                user && profile?.onboardingComplete ? (
                  <HomePage profile={profile} onRestart={handleRestart} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />
  
              <Route path="/dashboard" element={
                user && profile?.onboardingComplete ? (
                  <DashboardPage profile={profile} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />

              <Route path="/recommendations" element={
                user && profile?.onboardingComplete ? (
                  <RecommendationsPage profile={profile} onRestart={handleRestart} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />
  
              <Route path="/tools" element={
                user && profile?.onboardingComplete ? <ToolsPage profile={profile} /> : <Navigate to="/" replace />
              } />
  
              <Route path="/loans" element={
                user && profile?.onboardingComplete ? <LoansPage profile={profile} /> : <Navigate to="/" replace />
              } />

              <Route path="/insurance" element={
                user && profile?.onboardingComplete ? <InsurancePage profile={profile} /> : <Navigate to="/" replace />
              } />
  
              <Route path="/masterclasses" element={
                user && profile?.onboardingComplete ? <MasterclassesPage profile={profile} /> : <Navigate to="/" replace />
              } />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50 grayscale">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-black tracking-tighter uppercase">ET AI Concierge</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-mono text-gray-400 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Support</span>
          </div>
          <div className="text-xs text-gray-400">
            © 2026 The Economic Times. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto text-center space-y-12"
    >
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
          <Bot className="w-4 h-4" />
          Powered by Gemini AI
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900">
          Your Personal <br />
          <span className="text-emerald-600 italic font-serif">Financial Navigator</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Experience the future of financial advisory. Our AI understands your goals and curates the perfect Economic Times services for your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {[
          { icon: Bot, title: "Smart Chat", desc: "Adaptive onboarding that learns your needs in minutes." },
          { icon: Sparkles, title: "AI Insights", desc: "Personalized reasoning for every recommendation." },
          { icon: ShieldCheck, title: "Secure & Private", desc: "Your financial data is protected and encrypted." },
        ].map((feature, i) => (
          <div key={i} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 text-left space-y-4 hover:bg-white hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold">{feature.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OnboardingPage({ user, setProfile }: { user: User; setProfile: (p: UserProfile) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Let's Build Your Profile</h2>
        <p className="text-gray-500">Answer a few questions to get personalized recommendations.</p>
      </div>
      <Chat user={user} onComplete={setProfile} />
    </motion.div>
  );
}

import { UIProvider } from "./context/UIContext";

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </BrowserRouter>
  );
}
