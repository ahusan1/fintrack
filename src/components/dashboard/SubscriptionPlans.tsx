import React, { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function SubscriptionPlans() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free'); // In a real app, calculate from db
  const [isLoading, setIsLoading] = useState(false);
  const [proPrice, setProPrice] = useState(999);

  // Fetch current plan
  React.useEffect(() => {
    async function fetchPlan() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      if (data?.plan) {
        setCurrentPlan(data.plan);
      }
      
      try {
        const res = await fetch("/api/config");
        const config = await res.json();
        if (config.pro_plan_price) {
          setProPrice(config.pro_plan_price);
        }
      } catch (err) {
        console.error("Failed to fetch plan config:", err);
      }
    }
    fetchPlan();
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        setIsLoading(false);
        return;
      }

      // Create Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: `rcptid_${user.id}` }),
      });

      let orderData;
      try {
        orderData = await orderRes.json();
      } catch (err) {
        throw new Error("Server returned an invalid response. Please verify whether Razorpay keys are properly configured in Admin Settings.");
      }

      if (!orderRes.ok) {
        throw new Error(orderData.error || orderData.message || "Failed to create order");
      }

      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Afin Track",
        description: "Pro Subscription",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            let verifyData;
            try {
              verifyData = await verifyRes.json();
            } catch (err) {
              throw new Error("Payment verified by gateway, but server response is invalid. Please contact support.");
            }

            if (verifyData.success) {
              // Update DB
              const { error } = await supabase
                .from("profiles")
                .update({ plan: "pro" })
                .eq("id", user.id);

              if (error) throw error;

              setCurrentPlan("pro");
              alert("Successfully upgraded to Pro!");
              window.location.reload(); // optionally reload to apply context changes
            } else {
              alert("Payment verification failed! Please contact support.");
            }
          } catch (err) {
             console.error("Verification error:", err);
             alert("Something went wrong during verification.");
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to upgrade plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user || !window.confirm("Are you sure you want to cancel your Pro subscription?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setCurrentPlan('free');
      alert('Your subscription has been canceled.');
    } catch (error) {
      console.error(error);
      alert('Failed to downgrade plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 text-left">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Subscription Plan</h3>
        <p className="text-sm text-slate-500">Manage your billing and subscription features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={cn(
          "relative bg-white dark:bg-slate-900 border rounded-2xl p-6 transition-all",
          currentPlan === 'free' 
            ? "border-slate-300 dark:border-slate-600 shadow-md ring-1 ring-slate-200 dark:ring-slate-700" 
            : "border-slate-100 dark:border-slate-800 opacity-60"
        )}>
          {currentPlan === 'free' && (
            <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-700">
              Current Plan
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Basic</h4>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹0<span className="text-sm font-medium text-slate-500">/mo</span></span>
          </div>
          <ul className="space-y-3 mb-8">
            {['Up to 50 transactions/month', 'Basic Analytics', 'Standard export (CSV)', 'Community support'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Check size={16} className="text-slate-400" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlan === 'free' ? (
            <button disabled className="w-full py-3 px-4 rounded-xl font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 disabled:cursor-not-allowed">
              Active
            </button>
          ) : (
            <button 
              onClick={handleDowngrade}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Downgrade to Basic
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={cn(
          "relative bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border rounded-2xl p-6 transition-all",
          currentPlan === 'pro' 
            ? "border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500" 
            : "border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700"
        )}>
          {currentPlan === 'pro' && (
            <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
              <Star size={12} className="fill-white" />
              Current Plan
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
              Pro <Zap size={18} className="text-indigo-500 fill-indigo-500" />
            </h4>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{proPrice}<span className="text-sm font-medium text-slate-500">/mo</span></span>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              'Unlimited transactions', 
              'Advanced AI analytics (Coming soon)', 
              'PDF & CSV detailed exports', 
              'Priority support', 
              'Custom categories'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <Check size={16} className="text-indigo-500" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlan === 'pro' ? (
            <button disabled className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-500 disabled:cursor-not-allowed shadow-md">
              Active
            </button>
          ) : (
            <button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
