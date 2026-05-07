import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Filter, Receipt } from "lucide-react";
import { cn } from "../../lib/utils";

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'All' | 'Income' | 'Expense'>('All');

  useEffect(() => {
    async function fetchTxs() {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*, profiles(full_name, email)")
          .order("createdAt", { ascending: false })
          .limit(100);

        if (!error && data) {
          setTransactions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTxs();
  }, []);

  const filtered = transactions.filter(t => {
    if (tab === 'Income') return t.type === 'income';
    if (tab === 'Expense') return t.type === 'expense';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transactions
        </h1>
        <div className="flex items-center gap-2 text-slate-500">
           <Search size={20} />
           <Filter size={20} />
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
        {['All', 'Income', 'Expense'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              tab === t 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 px-1 py-2">
           Recent Transactions
        </div>
        {filtered.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className={cn(
               "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-inner",
               t.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
            )}>
               {t.type === 'income' ? '+' : '-'}
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-slate-900 dark:text-white truncate">{t.category}</p>
               <p className="text-xs text-slate-500 truncate">{t.profiles?.full_name || t.profiles?.email || 'Unknown User'}</p>
            </div>
            <div className="text-right flex-shrink-0">
               <p className={cn(
                 "font-bold",
                 t.type === 'income' ? "text-emerald-500" : "text-slate-900 dark:text-white"
               )}>
                 {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
               </p>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
             <Receipt size={32} className="mx-auto mb-3 opacity-50" />
             <p className="text-sm">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
