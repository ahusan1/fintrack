import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Save, HelpCircle } from "lucide-react";
import { Transaction, TransactionType } from "../../types";
import { CATEGORIES, CATEGORY_ICONS } from "../../constants/categories";
import { cn } from "../../lib/utils";

const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(["monthly", "yearly", "weekly"]).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormValues) => Promise<void>;
  initialData?: Transaction;
  onClose: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  onSubmit,
  initialData,
  onClose,
  isLoading,
}: TransactionFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? {
          amount: initialData.amount,
          type: initialData.type,
          category: initialData.category,
          note: initialData.note || "",
          date: initialData.date,
          isRecurring: initialData.isRecurring || false,
          recurringInterval: initialData.recurringInterval || "monthly",
        }
      : {
          amount: 0,
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          category: "",
          note: "",
          isRecurring: false,
          recurringInterval: "monthly",
        },
  });

  const selectedType = watch("type");
  const selectedCategory = watch("category");
  const isRecurring = watch("isRecurring");

  // Reset category if type changes
  useEffect(() => {
    if (!initialData || selectedType !== initialData.type) {
      setValue("category", "");
    } else {
      setValue("category", initialData.category);
    }
  }, [selectedType, initialData, setValue]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => onSubmit(data))}
          className="space-y-4"
        >
          <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {(["expense", "income"] as TransactionType[]).map((type) => (
              <label
                key={type}
                className={cn(
                  "flex-1 py-2 px-4 text-center rounded-lg cursor-pointer transition-all text-sm font-semibold capitalize",
                  selectedType === type
                    ? "bg-white dark:bg-neutral-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                )}
              >
                <input
                  type="radio"
                  value={type}
                  {...register("type")}
                  className="sr-only"
                />
                {type}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className="w-full pl-8 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              Date
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {CATEGORIES[selectedType].map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || HelpCircle;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-sm",
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300 shadow-sm"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Icon size={20} className="mb-1" />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-2">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-400">
              Note (Optional)
            </label>
            <textarea
              rows={2}
              {...register("note")}
              placeholder="What was this for?"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isRecurring")}
                className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 border-neutral-300 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Recurring Transaction
              </span>
            </label>

            {isRecurring && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-400">
                  Interval
                </label>
                <select
                  {...register("recurringInterval")}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : initialData ? (
              <>
                <Save size={20} /> Update
              </>
            ) : (
              <>
                <Plus size={20} /> Add
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
