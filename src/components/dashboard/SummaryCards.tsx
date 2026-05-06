import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { Transaction } from "../../types";
import { startOfMonth, subMonths, isAfter, isBefore } from "date-fns";

interface SummaryCardsProps {
  transactions: Transaction[];
  onExportPDF?: () => void;
}

function calculatePercentage(current: number, last: number) {
  if (last === 0) return current > 0 ? 100 : 0;
  return ((current - last) / Math.abs(last)) * 100;
}

export function SummaryCards({ transactions, onExportPDF }: SummaryCardsProps) {
  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === "income") {
          acc.income += curr.amount;
        } else {
          acc.expense += curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const balance = stats.income - stats.expense;

  const trends = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));

    let currentIncome = 0;
    let currentExpense = 0;
    let lastIncome = 0;
    let lastExpense = 0;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (isAfter(date, startOfCurrentMonth) || date.getTime() === startOfCurrentMonth.getTime()) {
        if (t.type === "income") currentIncome += t.amount;
        else currentExpense += t.amount;
      } else if ((isAfter(date, startOfLastMonth) || date.getTime() === startOfLastMonth.getTime()) && isBefore(date, startOfCurrentMonth)) {
        if (t.type === "income") lastIncome += t.amount;
        else lastExpense += t.amount;
      }
    });

    const currentBalance = currentIncome - currentExpense;
    const lastBalance = lastIncome - lastExpense;

    return {
      balance: calculatePercentage(currentBalance, lastBalance),
      income: calculatePercentage(currentIncome, lastIncome),
      expense: calculatePercentage(currentExpense, lastExpense)
    };
  }, [transactions]);

  return (
    <div className="flex flex-col gap-5">
      {/* Total Balance Card */}
      <div className="bg-slate-900 dark:bg-slate-950 p-7 rounded-[2rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between relative overflow-hidden text-left border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
              <Wallet size={16} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Total Balance</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
            <Eye size={18} />
          </button>
        </div>

        <div className="mb-2 relative z-10">
          <h3 className="text-[2.75rem] leading-none sm:text-6xl font-semibold tracking-tighter mb-5">
            {formatCurrency(balance)}
          </h3>
          <div className="flex items-center justify-between">
            <p className={cn("inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors cursor-pointer border", trends.balance >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
              {trends.balance >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
              {trends.balance > 0 ? "+" : ""}{trends.balance.toFixed(1)}% <span className="text-slate-500 font-medium ml-0.5">vs last month</span>
            </p>
            <button
              onClick={onExportPDF}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-colors text-slate-300 backdrop-blur-md"
              title="Export as PDF"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 px-6 py-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <TrendingUp size={16} strokeWidth={2.5} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Income
            </p>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
            {formatCurrency(stats.income)}
          </h3>
          <p className={cn("text-xs font-semibold w-max px-2 py-0.5 rounded-lg", trends.income >= 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10")}>
            {trends.income > 0 ? "+" : ""}{trends.income.toFixed(1)}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900 px-6 py-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
               <TrendingDown size={16} strokeWidth={2.5} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Expense
            </p>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
            {formatCurrency(stats.expense)}
          </h3>
          <p className={cn("text-xs font-semibold w-max px-2 py-0.5 rounded-lg", trends.expense <= 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10")}>
            {trends.expense > 0 ? "+" : ""}{trends.expense.toFixed(1)}% <span className="text-slate-400 font-medium ml-1">vs last month</span>
          </p>
        </div>
      </div>
    </div>
  );
}
