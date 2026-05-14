import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowUpRight, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [txObj, setTxObj] = useState({ count: 0, income: 0, expense: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [profilesRes, txRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: 'exact', head: true }),
          supabase.from("transactions").select("*").order("createdAt", { ascending: false }).limit(200),
        ]);

        if (profilesRes.count !== null) setUsersCount(profilesRes.count);

        if (txRes.data) {
          const totalIncome = txRes.data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
          const totalExpense = txRes.data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
          setTxObj({
            count: txRes.data.length,
            income: totalIncome,
            expense: totalExpense
          });
          setRecentTransactions(txRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  const chartData = [
    { name: 'Mon', total: Math.random() * 50000 },
    { name: 'Tue', total: Math.random() * 50000 },
    { name: 'Wed', total: Math.random() * 50000 },
    { name: 'Thu', total: Math.random() * 50000 },
    { name: 'Fri', total: Math.random() * 50000 },
    { name: 'Sat', total: Math.random() * 50000 },
    { name: 'Sun', total: Math.random() * 50000 },
  ];

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
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm">May 12 - May 18, 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{usersCount.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +12.5%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Transactions</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{txObj.count.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +15.3%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Income</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">${txObj.income.toLocaleString()}</p>
          <div className="text-emerald-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +18.6%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">${txObj.expense.toLocaleString()}</p>
          <div className="text-rose-500 text-xs font-medium flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1"/> +11.2%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-slate-900 dark:text-white">Overview</h3>
           <select className="bg-transparent text-sm text-slate-500 border-none outline-none cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
           </select>
        </div>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                formatter={(val: number) => [`$${Math.round(val)}`, 'Total']}
              />
              <Area type="monotone" dataKey="total" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Activity size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-white truncate">New Transaction</p>
                <p className="text-xs text-slate-500 truncate">{t.category}</p>
              </div>
              <div className="text-xs text-slate-400">
                {new Date(t.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
             <div className="text-center py-4 text-slate-500 text-sm">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
