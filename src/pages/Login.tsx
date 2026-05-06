import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleOneTapLogin, GoogleLogin } from "@react-oauth/google";

function OneTapLogin({ onSuccess, onError }: { onSuccess: (res: any) => void, onError: () => void }) {
  useGoogleOneTapLogin({
    onSuccess,
    onError,
    use_fedcm_for_prompt: true,
  });
  return null;
}

export function Login() {
  const { signInWithIdToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
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

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      if (credentialResponse.credential) {
        await signInWithIdToken(credentialResponse.credential);
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100">
      {!isIframe && (
        <OneTapLogin 
          onSuccess={handleSuccess} 
          onError={() => setError("Google One Tap Login Failed")} 
        />
      )}
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/20 bg-white">
            <img src="/icon.svg" alt="Afin Track" className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Afin Track</h1>
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
              <p>Google Login works best when opened in a full window to support native sign-in.</p>
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

          <div className="flex justify-center w-full">
            <GoogleLogin
               onSuccess={handleSuccess}
               onError={() => {
                 setError("Google Login Failed. Please try again.");
               }}
               useOneTap={false}
               theme="outline"
               size="large"
               shape="rectangular"
               width="320"
               text="continue_with"
             />
          </div>

          <p className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-relaxed px-4 pt-4">
            Enterprise grade security built for your peace of mind
          </p>
        </div>

        <div className="text-center group flex items-center justify-center gap-4">
          <Link
            to="/terms"
            className="text-slate-400 text-[10px] uppercase tracking-widest font-bold hover:text-emerald-500 transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            to="/privacy"
            className="text-slate-400 text-[10px] uppercase tracking-widest font-bold hover:text-emerald-500 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
