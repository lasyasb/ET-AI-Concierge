import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth } from "../firebase";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface AuthProps {
  user: User | null;
  loading: boolean;
}

export function Auth({ user, loading }: AuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    
    const provider = new GoogleAuthProvider();
    // Force select account to avoid some popup issues in iframes
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Ignore common cancellation errors to avoid console noise
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed:", error);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) return <div className="animate-pulse h-10 w-24 bg-gray-200 rounded-full" />;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName || "User"} 
            className="w-8 h-8 rounded-full border border-gray-200"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
            )}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={isAuthenticating}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-black rounded-full hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          )}
        >
          {isAuthenticating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isAuthenticating ? "Signing in..." : "Get Started"}
        </button>
      )}
    </div>
  );
}
