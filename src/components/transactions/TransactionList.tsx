import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Repeat,
} from "lucide-react";
import { Transaction } from "../../types";
import { formatCurrency, cn } from "../../lib/utils";
import { format } from "date-fns";
import { CATEGORY_ICONS } from "../../constants/categories";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "income" | "expense"
  >("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "category">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || t.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortField === "category") {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight">
            Recent Transactions
          </h2>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
            <div className="flex w-full sm:w-auto items-center gap-2">
              <select
                value={sortField}
                onChange={(e) =>
                  setSortField(e.target.value as "date" | "amount" | "category")
                }
                className="flex-1 sm:flex-none border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
                <option value="category">Sort: Category</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shrink-0 flex items-center justify-center h-[32px] w-[32px]"
                title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
              </button>
            </div>

            <div className="relative w-full sm:flex-1 sm:min-w-[160px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by note or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex w-full sm:w-auto bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
              {(["all", "income", "expense"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all",
                    activeFilter === filter
                      ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View (List) */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((t) => (
            <div
              key={t.id}
              className="flex flex-col p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors cursor-pointer group"
              onClick={() => onEdit(t)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                      t.type === "income"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600",
                    )}
                  >
                    {(() => {
                      const Icon = CATEGORY_ICONS[t.category] || HelpCircle;
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {t.note || "Untitled"}
                      {t.isRecurring && (
                        <Repeat
                          size={12}
                          className="text-emerald-500"
                          title={`Recurring ${t.recurringInterval}`}
                        />
                      )}
                    </span>
                    <span className="text-xs text-slate-500">{t.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      "font-bold text-sm",
                      t.type === "income"
                        ? "text-emerald-500"
                        : "text-rose-500",
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {format(new Date(t.date), "MMM dd")}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FileText
              size={40}
              className="text-slate-200 dark:text-slate-800"
            />
            <p className="text-sm">No transactions</p>
          </div>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-4">Transaction</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600",
                        )}
                      >
                        {(() => {
                          const Icon = CATEGORY_ICONS[t.category] || HelpCircle;
                          return <Icon size={16} />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                          {t.note || "Untitled"}
                          {t.isRecurring && (
                            <Repeat
                              size={12}
                              className="text-emerald-500"
                              title={`Recurring ${t.recurringInterval}`}
                            />
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {t.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(t.date), "MMM dd, yyyy")}
                    </div>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-bold text-sm",
                      t.type === "income"
                        ? "text-emerald-500"
                        : "text-rose-500",
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-20 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileText
                      size={48}
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <p className="text-sm">No transactions found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
