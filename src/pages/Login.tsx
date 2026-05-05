import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Github, AlertTriangle, ExternalLink, Mail, Lock } from "lucide-react";

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const isIframe = window.self !== window.top;

  useEffect(() => {
    // Check for error in hash (Supabase OAuth redirects with errors in hash)
    const hash = window.location.hash;
    if (hash && hash.includes("error_description")) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get("error_description");
      if (errorDesc) {
        setError(errorDesc.replace(/\+/g, " "));
        // Clear the hash so it doesn't persist on refresh
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred during login. If you are in a preview iframe, try opening the app in a new tab.",
      );
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        alert("Sign up successful! Please check your email to verify your account (if email verification is enabled in Supabase). Or try logging in now.");
        setIsSignUp(false); // Switch to login after successful sort-of-signup
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred with email authentication.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <CreditCard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">SpendWise</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Smart Financial Overview
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-6 backdrop-blur-sm">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-900/50 text-center">
              {error}
            </div>
          )}

          {isIframe && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-xl border border-amber-100 dark:border-amber-900/50 text-center flex flex-col items-center gap-2">
              <AlertTriangle size={20} />
              <p>Google Login might fail inside the preview iframe or popups might be blocked.</p>
              <a
                href={window.location.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 mt-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
              >
                <span>Open in New Tab</span>
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-sm text-sm"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 font-bold tracking-[0.2em]">
                Or {isSignUp ? "sign up" : "log in"} with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 text-sm"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors"
            >
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-relaxed px-4 pt-4">
            Enterprise grade security built for your peace of mind
          </p>
        </div>

        <div className="text-center group">
          <a
            href="#"
            className="text-slate-400 text-[10px] uppercase tracking-widest font-bold hover:text-emerald-500 transition-colors"
          >
            Terms & Privacy Architecture →
          </a>
        </div>
      </div>
    </div>
  );
}
