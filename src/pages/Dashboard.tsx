import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import { Transaction } from "../types";
import { SummaryCards as StatCards } from "../components/dashboard/SummaryCards";
import { Plus, Download } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

import { TransactionList } from "../components/transactions/TransactionList";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { MonthlyChart as Charts } from "../components/charts/MonthlyChart";
import { SpendingOverview } from "../components/dashboard/SpendingOverview";

interface DashboardProps {
  activeTab: string;
}

export function Dashboard({ activeTab }: DashboardProps) {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [refreshTransactions, setRefreshTransactions] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (user) {
      setErrorInfo(null);
      const sub = subscribeToTransactions(
        user.id,
        (data) => {
          setTransactions(data);
        },
        (err) => {
          setErrorInfo(err.message);
        },
      );
      setRefreshTransactions(() => sub.refresh);
      return sub.unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    const handleOpenAddModal = () => handleAddTransaction();
    window.addEventListener("openAddModal", handleOpenAddModal);
    return () => window.removeEventListener("openAddModal", handleOpenAddModal);
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(user.id, editingTransaction.id, data);
      } else {
        await createTransaction(user.id, data);
      }
      setIsFormOpen(false);
      refreshTransactions?.();
    } catch (error: any) {
      console.error(error);
      alert(`Error saving transaction: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await deleteTransaction(user.id, id);
      refreshTransactions?.();
    } catch (error) {
      alert("Error deleting transaction.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Category", "Note", "Amount"];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.category,
      t.note || "",
      t.amount,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `afintrack-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const formatPDFCurrency = (amount: number) => {
      return `INR ${Math.abs(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    };

    doc.setFontSize(18);
    doc.text("Afin Track Transactions", 14, 22);

    doc.setFontSize(12);
    doc.text(
      `Total Balance: ${balance < 0 ? "-" : ""}${formatPDFCurrency(balance)}`,
      14,
      32,
    );
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(`Total Income: ${formatPDFCurrency(totalIncome)}`, 14, 38);
    doc.setTextColor(244, 63, 94); // rose
    doc.text(`Total Expense: ${formatPDFCurrency(totalExpense)}`, 14, 44);
    doc.setTextColor(0, 0, 0); // reset to black

    const pdfHeaders = [["Date", "Type", "Category", "Note", "Amount"]];
    const pdfData = transactions.map((t) => [
      format(new Date(t.date), "MMM dd, yyyy"),
      t.type.toUpperCase(),
      t.category,
      t.note || "",
      t.type === "income" ? `+ ${formatPDFCurrency(t.amount)}` : `- ${formatPDFCurrency(t.amount)}`,
    ]);

    autoTable(doc, {
      head: pdfHeaders,
      body: pdfData,
      startY: 50,
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`afintrack-export-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-16 md:pb-0">
      {errorInfo && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-xl flex flex-col gap-2">
          <h3 className="font-bold">Database Access Error</h3>
          <p className="text-sm">
            We could not read your transactions. Make sure your Supabase URL
            and Anon Key are correct and you have set up your RLS policies
            to allow read/write for authenticated users.
          </p>
          <pre className="text-xs max-h-32 overflow-auto bg-white/50 dark:bg-black/20 p-2 rounded">
            {errorInfo}
          </pre>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")?.[0] || "User"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToCSV}
            className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download size={18} />
            <span className="inline">CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="hidden md:flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download size={18} />
            <span className="inline">PDF</span>
          </button>
          <button
            onClick={handleAddTransaction}
            className="hidden md:flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            New Transaction
          </button>
        </div>
      </div>

      <>
        {activeTab === "dashboard" && (
          <>
            <StatCards transactions={transactions} onExportPDF={exportToPDF} />
            <SpendingOverview transactions={transactions} />
          </>
        )}

        {activeTab === "analytics" && <Charts transactions={transactions} />}

        {(activeTab === "transactions" || activeTab === "dashboard") && (
          <TransactionList
            transactions={
              activeTab === "dashboard"
                ? transactions.slice(0, 5)
                : transactions
            }
            onEdit={handleEditTransaction}
            onDelete={handleDelete}
          />
        )}

        {isFormOpen && (
          <TransactionForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            initialData={editingTransaction}
            isLoading={isSubmitting}
          />
        )}
      </>

      {activeTab === "profile" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-950">
            <img
              src={user?.user_metadata?.avatar_url || "https://via.placeholder.com/96"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {user?.user_metadata?.full_name || user?.user_metadata?.name || "User"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{user?.email}</p>
          <button
            onClick={logout}
            className="px-6 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-sm"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
