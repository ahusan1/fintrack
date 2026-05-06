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
    <div className="flex flex-col gap-4">
      {/* Total Balance Card */}
      <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-xl shadow-emerald-600/20 text-white flex flex-col justify-between relative overflow-hidden text-left border border-emerald-500">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-800/30 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/50 flex items-center justify-center border border-emerald-400/30 backdrop-blur-sm">
              <Wallet size={14} className="text-white" />
            </div>
            <p className="text-emerald-50 text-sm font-medium tracking-wide">Total Balance</p>
          </div>
          <button className="text-emerald-100 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-500/50">
            <Eye size={16} />
          </button>
        </div>

        <div className="mb-2 relative z-10">
          <h3 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            {formatCurrency(balance)}
          </h3>
          <div className="flex items-center justify-between">
            <p className={cn("inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full transition-colors cursor-pointer border", trends.balance >= 0 ? "bg-white/10 text-emerald-50 border-white/20 hover:bg-white/20" : "bg-rose-500/20 text-rose-50 border-rose-500/30 hover:bg-rose-500/30")}>
              {trends.balance >= 0 ? <ArrowUpRight size={14} className="text-emerald-100" /> : <ArrowDownRight size={14} className="text-rose-100" />}
              {trends.balance > 0 ? "+" : ""}{trends.balance.toFixed(1)}% <span className="opacity-70 font-normal ml-0.5">from last month</span>
            </p>
            <button
              onClick={onExportPDF}
              className="w-10 h-10 rounded-full border border-emerald-400/50 bg-emerald-500/40 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-emerald-50 backdrop-blur-sm"
              title="Export as PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900/50 px-5 py-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5 relative z-10">
            <TrendingUp size={14} className="text-emerald-500" />
            Income
          </p>
          <h3 className="text-2xl font-semibold tracking-tight mb-1 text-slate-900 dark:text-white relative z-10">
            {formatCurrency(stats.income)}
          </h3>
          <p className={cn("text-xs font-medium w-max px-2 py-0.5 rounded-md relative z-10", trends.income >= 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10")}>
            {trends.income > 0 ? "+" : ""}{trends.income.toFixed(1)}%
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900/50 px-5 py-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left relative overflow-hidden group hover:border-rose-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 dark:bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5 relative z-10">
            <TrendingDown size={14} className="text-rose-500" />
            Expense
          </p>
          <h3 className="text-2xl font-semibold tracking-tight mb-1 text-slate-900 dark:text-white relative z-10">
            {formatCurrency(stats.expense)}
          </h3>
          <p className={cn("text-xs font-medium w-max px-2 py-0.5 rounded-md relative z-10", trends.expense <= 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10")}>
            {trends.expense > 0 ? "+" : ""}{trends.expense.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
