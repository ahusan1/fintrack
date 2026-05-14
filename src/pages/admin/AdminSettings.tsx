import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Shield, Server, Box, LogOut, ChevronRight, User, CreditCard, Save, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function AdminSettings() {
  const { user, logout } = useAuth();
  
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpaySecret, setRazorpaySecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: idData } = await supabase.from('settings').select('value').eq('key', 'razorpay_key_id').single();
        if (idData) setRazorpayKeyId(idData.value);

        const { data: secretData } = await supabase.from('settings').select('value').eq('key', 'razorpay_key_secret').single();
        if (secretData) setRazorpaySecret(secretData.value);
      } catch (err) {
        console.error("Failed to fetch settings config");
      }
    }
    fetchSettings();
  }, []);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const { error: err1 } = await supabase.from('settings').upsert({ 
        key: 'razorpay_key_id', 
        value: razorpayKeyId || '', 
        updatedAt: Date.now() 
      });
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('settings').upsert({ 
        key: 'razorpay_key_secret', 
        value: razorpaySecret || '', 
        updatedAt: Date.now() 
      });
      if (err2) throw err2;

      // Refresh on backend
      await fetch('/api/razorpay/refresh-keys', { method: 'POST' });

      setMessage({ type: 'success', text: 'Payment settings saved successfully.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4">
         <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
             {user?.user_metadata?.avatar_url ? (
                 <img src={user.user_metadata.avatar_url} alt="Admin" className="w-full h-full object-cover" />
             ) : (
                <User size={32} className="text-indigo-600 dark:text-indigo-400" />
             )}
         </div>
         <div className="flex-1 min-w-0">
             <h2 className="font-bold text-slate-900 dark:text-white truncate">{user?.user_metadata?.full_name || 'Admin User'}</h2>
             <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Super Admin
             </span>
             <p className="text-xs text-slate-500 mt-1 truncate">{user?.email}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
          <CreditCard className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Payment Gateway</h2>
        </div>
        
        <form onSubmit={handleSavePaymentSettings} className="p-4 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="font-medium text-xs">{message.text}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Razorpay Key ID
            </label>
            <input
              type="text"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_xxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Razorpay Key Secret
            </label>
            <input
              type="password"
              value={razorpaySecret}
              onChange={(e) => setRazorpaySecret(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">Required for server-side verification.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isLoading ? "Saving..." : "Save Payment Settings"}
          </button>
        </form>
      </div>

      <div className="pt-4 pb-8">
        <button 
           onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                  logout();
              }
           }}
           className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-bold transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
           <LogOut size={20} />
           Logout
        </button>
      </div>
    </div>
  );
}
