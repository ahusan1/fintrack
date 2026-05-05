import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Transaction } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { format } from "date-fns";

interface MonthlyChartProps {
  transactions: Transaction[];
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  // Category Data
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

  // COLORS for Pie Chart
  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#f472b6",
  ];

  // Monthly Data (Last 7 Days / Months)
  const monthlyData = transactions
    .reduce(
      (acc, curr) => {
        const month = format(new Date(curr.date), "MMM").toUpperCase();
        const existing = acc.find((item) => item.month === month);
        if (existing) {
          if (curr.type === "income") existing.income += curr.amount;
          else existing.expenses += curr.amount;
        } else {
          acc.push({
            month,
            income: curr.type === "income" ? curr.amount : 0,
            expenses: curr.type === "expense" ? curr.amount : 0,
          });
        }
        return acc;
      },
      [] as { month: string; income: number; expenses: number }[],
    )
    .slice(-7);

  return (
    <div className="flex flex-col gap-6">
      {/* Header for Mobile Analytics inside the component (optional, but requested layout is vertical) */}

      {/* Expense Overview (Category Distribution) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 font-sans">
          Expense Overview
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-[200px] w-full md:w-1/2 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
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
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                {formatCurrency(categoryData.reduce((a, b) => a + b.value, 0))}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Total
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-3">
            {categoryData.slice(0, 5).map((entry, index) => {
              const total = categoryData.reduce((a, b) => a + b.value, 0);
              const percentage =
                total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {percentage}%
                    </span>
                    <span className="text-sm font-medium text-slate-400 w-16 text-right">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense Trend (Spending Analytics) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            Expense Trend
          </h3>
          <select className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer">
            <option>This Month</option>
          </select>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#f1f5f9"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(value: number) => [formatCurrency(value), ""]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="expenses"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Expenses"
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
