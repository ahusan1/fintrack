import React from "react";
import { Transaction } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SpendingOverviewProps {
  transactions: Transaction[];
}

export function SpendingOverview({ transactions }: SpendingOverviewProps) {
  const categoryData = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, curr) => {
        const existing = acc.find((item) => item.name === curr.category);
        if (existing) {
          existing.value += curr.amount;
        } else {
          acc.push({ name: curr.category, value: curr.amount });
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    )
    .sort((a, b) => b.value - a.value);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
  ];

  const totalExpense = categoryData.reduce((a, b) => a + b.value, 0);

  if (categoryData.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/50 dark:bg-slate-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-semibold tracking-tight text-slate-800 dark:text-slate-100 text-lg">
          Spending Overview
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-1 cursor-pointer shadow-sm">
          This Month
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-50 ml-1"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
        {/* Donut Chart */}
        <div className="h-[140px] w-[140px] sm:h-[160px] sm:w-[160px] relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-500 font-medium">
              Total Expense
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {categoryData.slice(0, 4).map((entry, index) => {
            const percentage = Math.round((entry.value / totalExpense) * 100);
            return (
              <div
                key={entry.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 w-16 truncate">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold">
                    {percentage}%
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold w-12 text-right">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
