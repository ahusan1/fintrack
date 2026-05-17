import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan } from '../../pages/admin/AdminPlans'; // Optional if not exporting from there. Instead inline below
// import omitted

export function SubscriptionPlans() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>('free'); 
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Fetch current plan
  useEffect(() => {
    async function fetchPlan() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      if (data?.plan) {
        setCurrentPlan(data.plan);
      }
      
      try {
        const res = await fetch("/api/config");
        const config = await res.json();
        if (config.subscription_plans && config.subscription_plans.length > 0) {
          setPlans(config.subscription_plans);
        } else {
          // Fallback if not configured
          setPlans([
            {
              id: 'free',
              name: 'Free',
              price: 0,
              interval: 'lifetime',
              features: [
                { id: '1', name: 'Up to 100 transactions/month', included: true }
              ]
            },
            {
              id: 'pro',
              name: 'Pro',
              price: config.pro_plan_price || 999,
              interval: 'lifetime',
              isPopular: true,
              features: [
                { id: '1', name: 'Unlimited transactions', included: true }
              ]
            }
          ]);
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

  const handleUpgrade = async (plan: any) => {
    if (!user) return;
    
    // Free plans don't need checkout
    if (plan.price === 0) {
      if (!window.confirm(`Are you sure you want to switch to the ${plan.name} plan?`)) return;
      setProcessingPlanId(plan.id);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ plan: plan.id })
          .eq('id', user.id);
          
        if (error) throw error;
        setCurrentPlan(plan.id);
        alert(`Successfully switched to ${plan.name} plan.`);
      } catch (error) {
        console.error(error);
        alert('Failed to update plan.');
      } finally {
        setProcessingPlanId(null);
      }
      return;
    }
    
    setProcessingPlanId(plan.id);
    setIsLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        setIsLoading(false);
        setProcessingPlanId(null);
        return;
      }

      // Create Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: `rcptid_${user.id}`, planId: plan.id }),
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
        amount: orderData.amount, // fetched properly from backend
        currency: orderData.currency,
        name: "Afin Track",
        description: `${plan.name} Subscription`,
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
                .update({ plan: plan.id })
                .eq("id", user.id);

              if (error) throw error;

              setCurrentPlan(plan.id);
              alert(`Successfully upgraded to ${plan.name}!`);
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
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="mt-8 text-left">
      <div className="mb-6 text-center sm:text-left">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subscription Plans</h3>
        <p className="text-slate-500 mt-1">Manage your billing and subscription features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
           const isActive = currentPlan === plan.id;
           const isProcessing = processingPlanId === plan.id;

           return (
             <div key={plan.id} className={cn(
               "relative bg-white dark:bg-slate-900 border rounded-2xl p-6 transition-all flex flex-col",
               isActive 
                 ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/50" 
                 : plan.isPopular
                   ? "border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500 transform lg:-translate-y-2"
                   : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
             )}>
               {isActive && (
                 <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                   Current Plan
                 </div>
               )}
               {plan.isPopular && !isActive && (
                 <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                   <Star size={12} className="fill-white" />
                   Most Popular
                 </div>
               )}
               
               <div className="flex flex-col mb-4">
                 <h4 className={cn("text-xl font-bold", plan.isPopular ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white")}>
                   {plan.name}
                 </h4>
                 <div className="flex items-baseline gap-1 mt-2">
                   <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                   </span>
                   {plan.price > 0 && <span className="text-sm font-medium text-slate-500">/{plan.interval === 'lifetime' ? 'once' : plan.interval === 'yearly' ? 'yr' : 'mo'}</span>}
                 </div>
               </div>
               
               <div className="flex-1">
                 <ul className="space-y-3 mb-8 text-sm">
                   {plan.features.map((feature: any, i: number) => (
                     <li key={i} className="flex items-start gap-3">
                       {feature.included ? (
                          <Check size={16} className={cn("mt-0.5 shrink-0", plan.isPopular ? "text-indigo-500" : "text-slate-400")} />
                       ) : (
                          <XCircle size={16} className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
                       )}
                       <span className={feature.included ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-500 line-through"}>
                         {feature.name}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>

               {isActive ? (
                 <button disabled className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-500 disabled:opacity-80 shadow-md">
                   Active
                 </button>
               ) : (
                 <button 
                   onClick={() => handleUpgrade(plan)}
                   disabled={isLoading}
                   className={cn(
                     "w-full py-3 px-4 rounded-xl font-bold transition-all active:scale-[0.98]",
                     plan.isPopular 
                       ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                       : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                   )}
                 >
                   {isProcessing ? 'Processing...' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                 </button>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
}
