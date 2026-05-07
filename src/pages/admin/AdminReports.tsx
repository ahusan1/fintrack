import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight } from "lucide-react";

export function AdminReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0, txs: 0, users: 0 });

  useEffect(() => {
     async function fetchReports() {
        try {
           const [txRes, userRes] = await Promise.all([
             supabase.from("transactions").select("amount, type, createdAt").order("createdAt", { ascending: true }),
             supabase.from("profiles").select("id", { count: 'exact', head: true })
           ]);

           if (txRes.data) {
              let inc = 0;
              let exp = 0;
              // Group by simple mock days for the chart
              const grouped: Record<string, { income: number, expense: number, name: string }> = {};

              txRes.data.forEach(t => {
                 if (t.type === 'income') inc += t.amount;
                 else exp += t.amount;

                 const d = new Date(t.createdAt);
                 const dateKey = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                 
                 if (!grouped[dateKey]) {
                    grouped[dateKey] = { name: dateKey, income: 0, expense: 0 };
                 }
                 if (t.type === 'income') grouped[dateKey].income += t.amount;
                 else grouped[dateKey].expense += t.amount;
              });

              setTotals({
                 income: inc,
                 expense: exp,
                 txs: txRes.data.length,
                 users: userRes.count || 0
              });

              // Take last 7 days of data
              let chartArr = Object.values(grouped).slice(-7);
              // if empty, fill some mock dates
              if (chartArr.length === 0) {
                 chartArr = [
                    { name: '1 May', income: 0, expense: 0 },
                    { name: '2 May', income: 0, expense: 0 },
                 ];
              }

              setData(chartArr);
           }
        } catch (err) {
           console.error(err);
        } finally {
           setLoading(false);
        }
     }
     fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
      <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="text-slate-500 text-sm">May 1 - May 18, 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Income</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">${totals.income.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +16.6%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">${totals.expense.toLocaleString()}</p>
          <div className="text-rose-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +11.2%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Transactions</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totals.txs.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +14.5%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">New Users</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totals.users.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +9.8%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Income vs Expense</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
