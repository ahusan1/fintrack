import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, CheckCircle, GripVertical } from "lucide-react";
import { supabase } from "../../lib/supabase";

export interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly" | "lifetime";
  features: PlanFeature[];
  isPopular?: boolean;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "lifetime",
    features: [
      { id: "1", name: "Up to 100 transactions/month", included: true },
      { id: "2", name: "Basic dashboard", included: true },
      { id: "3", name: "Email support", included: false },
      { id: "4", name: "AI Categorization", included: false }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    interval: "lifetime",
    isPopular: true,
    features: [
      { id: "1", name: "Unlimited transactions", included: true },
      { id: "2", name: "Advanced dashboard & reports", included: true },
      { id: "3", name: "Priority support", included: true },
      { id: "4", name: "AI Categorization", included: true }
    ]
  }
];

export function AdminPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'subscription_plans').single();
      if (data && data.value) {
        setPlans(JSON.parse(data.value));
      } else {
        // If no plans exist, initialize with default
        setPlans(DEFAULT_PLANS);
        // Save default plans to db
        await supabase.from('settings').upsert({
          key: 'subscription_plans',
          value: JSON.stringify(DEFAULT_PLANS),
          updatedAt: Date.now()
        });
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
      setPlans(DEFAULT_PLANS);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePlansToDb(newPlans: SubscriptionPlan[]) {
    try {
      setIsSaving(true);
      setPlans(newPlans);
      await supabase.from('settings').upsert({
        key: 'subscription_plans',
        value: JSON.stringify(newPlans),
        updatedAt: Date.now()
      });
      // Optionally update the single "pro_plan_price" setting if they modify the PRO plan
      // to keep backward compatibility with the current checkout flow
      const proPlan = newPlans.find(p => p.id === 'pro');
      if (proPlan) {
        await supabase.from('settings').upsert({
           key: 'pro_plan_price',
           value: proPlan.price.toString(),
           updatedAt: Date.now()
        });
        await fetch('/api/razorpay/refresh-keys', { method: 'POST' }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to save plans", err);
      alert("Failed to save plans");
    } finally {
      setIsSaving(false);
    }
  }

  const handleEditPlan = (index: number) => {
    setEditingPlanIndex(index);
    setEditForm({ ...plans[index], features: [...plans[index].features] });
  };

  const handleAddNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: "plan_" + Date.now(),
      name: "New Plan",
      price: 0,
      interval: "lifetime",
      features: []
    };
    setEditingPlanIndex(plans.length);
    setEditForm(newPlan);
  };

  const handleDeletePlan = async (index: number) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      const newPlans = plans.filter((_, i) => i !== index);
      await savePlansToDb(newPlans);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    
    let newPlans = [...plans];
    if (editingPlanIndex !== null && editingPlanIndex < plans.length) {
       newPlans[editingPlanIndex] = editForm;
    } else {
       newPlans.push(editForm);
    }
    await savePlansToDb(newPlans);
    setEditingPlanIndex(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingPlanIndex(null);
    setEditForm(null);
  };

  const updateEditForm = (updates: Partial<SubscriptionPlan>) => {
    if (editForm) {
      setEditForm({ ...editForm, ...updates });
    }
  };

  const addFeature = () => {
    if (editForm) {
      updateEditForm({
        features: [...editForm.features, { id: Date.now().toString(), name: "New Feature", included: true }]
      });
    }
  };

  const updateFeature = (index: number, updates: Partial<PlanFeature>) => {
    if (editForm) {
      const updatedFeatures = [...editForm.features];
      updatedFeatures[index] = { ...updatedFeatures[index], ...updates };
      updateEditForm({ features: updatedFeatures });
    }
  };

  const removeFeature = (index: number) => {
    if (editForm) {
      const updatedFeatures = editForm.features.filter((_, i) => i !== index);
      updateEditForm({ features: updatedFeatures });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription Plans
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage access tiers for users.</p>
        </div>
        {!editingPlanIndex && editingPlanIndex !== 0 && (
          <button
            onClick={handleAddNewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Add Plan
          </button>
        )}
      </div>

      {editingPlanIndex !== null && editForm ? (
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPlanIndex < plans.length ? 'Edit Plan' : 'Create New Plan'}
             </h2>
             <div className="flex gap-2">
                 <button onClick={handleCancelEdit} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                     <X size={20} />
                 </button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plan ID</label>
                <input 
                  type="text" 
                  value={editForm.id}
                  disabled={editingPlanIndex < plans.length && editForm.id === 'free' || editForm.id === 'pro'}
                  onChange={e => updateEditForm({ id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-500 mt-1">Unique identifier (e.g. 'pro', 'starter'). Cannot change default 'free'!'pro' IDs.</p>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => updateEditForm({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (INR)</label>
                <input 
                  type="number" 
                  value={editForm.price}
                  onChange={e => updateEditForm({ price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Billing Interval</label>
                <select 
                   value={editForm.interval}
                   onChange={e => updateEditForm({ interval: e.target.value as any })}
                   className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                >
                   <option value="lifetime">One-time / Lifetime</option>
                   <option value="monthly">Monthly</option>
                   <option value="yearly">Yearly</option>
                </select>
             </div>

             <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={editForm.isPopular || false}
                     onChange={e => updateEditForm({ isPopular: e.target.checked })}
                     className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                   />
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Highlight as "Popular" plan</span>
                </label>
             </div>
           </div>

           <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-900 dark:text-white">Features List</h3>
                 <button 
                   onClick={addFeature}
                   className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                 >
                   <Plus size={14} /> Add Feature
                 </button>
             </div>

             <div className="space-y-3">
                 {editForm.features.map((feature, idx) => (
                    <div key={feature.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                       <GripVertical size={16} className="text-slate-400 cursor-move shrink-0" />
                       
                       <input 
                         type="text"
                         value={feature.name}
                         onChange={e => updateFeature(idx, { name: e.target.value })}
                         className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none px-2"
                         placeholder="Feature description"
                       />

                       <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={feature.included}
                            onChange={e => updateFeature(idx, { included: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-slate-500 font-medium">Included</span>
                       </label>

                       <button 
                         onClick={() => removeFeature(idx)}
                         className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 ))}
                 {editForm.features.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No features added yet.</p>
                 )}
             </div>
           </div>

           <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={handleCancelEdit}
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Plan"}
              </button>
           </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           {plans.map((plan, index) => (
              <div 
                key={plan.id}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${plan.isPopular ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20' : 'border-slate-200 dark:border-slate-800'} p-6 shadow-sm flex flex-col`}
              >
                {plan.isPopular && (
                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Most Popular
                   </span>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">{plan.name}</h3>
                    <p className="text-slate-500 text-sm">ID: {plan.id}</p>
                  </div>
                  <div className="flex gap-1">
                     <button 
                       onClick={() => handleEditPlan(index)}
                       className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                     >
                        <Edit2 size={16} />
                     </button>
                     {plan.id !== 'free' && plan.id !== 'pro' && (
                       <button 
                         onClick={() => handleDeletePlan(index)}
                         className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                       >
                          <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-slate-500 font-medium">/{plan.interval === 'lifetime' ? 'once' : plan.interval === 'yearly' ? 'yr' : 'mo'}</span>}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {plan.features.map(f => (
                     <div key={f.id} className="flex items-start gap-2">
                       {f.included ? (
                          <CheckCircle size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                       ) : (
                          <X size={16} className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                       )}
                       <span className={`text-sm ${f.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                          {f.name}
                       </span>
                     </div>
                  ))}
                </div>
              </div>
           ))}
         </div>
      )}
    </div>
  );
}
