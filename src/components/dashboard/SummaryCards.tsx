import React from "react";
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

interface SummaryCardsProps {
  transactions: Transaction[];
  onExportPDF?: () => void;
}

export function SummaryCards({ transactions, onExportPDF }: SummaryCardsProps) {
  const stats = transactions.reduce(
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

  const balance = stats.income - stats.expense;

  return (
    <div className="flex flex-col gap-4">
      {/* Total Balance Card */}
      <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-xl shadow-emerald-600/20 text-white flex flex-col justify-between relative overflow-hidden text-left">
        {/* Decorative background element if needed */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-emerald-50 text-sm font-medium">Total Balance</p>
          <button className="text-emerald-100 hover:text-white transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-4xl font-black tracking-tight mb-4">
            {formatCurrency(balance)}
          </h3>
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-700/50 hover:bg-emerald-700/70 py-1.5 px-3 rounded-full transition-colors backdrop-blur-sm cursor-pointer">
              <ArrowUpRight size={14} className="text-emerald-200" />
              {balance >= 0 ? "+12.5%" : "-2.1%"} from last month
            </p>
            <button
              onClick={onExportPDF}
              className="w-8 h-8 rounded-full border border-emerald-400/30 flex items-center justify-center hover:bg-emerald-500 transition-colors"
              title="Export as PDF"
            >
              <Download size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            Income
          </p>
          <h3 className="text-lg font-bold tracking-tight mb-1 text-slate-800 dark:text-slate-100">
            {formatCurrency(stats.income)}
          </h3>
          <p className="text-xs font-semibold text-emerald-500">+8.6%</p>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center text-left">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            Expense
          </p>
          <h3 className="text-lg font-bold tracking-tight mb-1 text-slate-800 dark:text-slate-100">
            {formatCurrency(stats.expense)}
          </h3>
          <p className="text-xs font-semibold text-rose-500">-3.4%</p>
        </div>
      </div>
    </div>
  );
}
