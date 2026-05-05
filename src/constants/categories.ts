import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Film,
  HeartPulse,
  BookOpen,
  Briefcase,
  MonitorPlay,
  TrendingUp,
  Gift,
  HelpCircle,
} from "lucide-react";
import { TransactionType } from "../types";

export const CATEGORIES: Record<TransactionType, string[]> = {
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ],
  income: ["Salary", "Freelance", "Investments", "Gift", "Other"],
};

export const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Entertainment: Film,
  Health: HeartPulse,
  Education: BookOpen,
  Salary: Briefcase,
  Freelance: MonitorPlay,
  Investments: TrendingUp,
  Gift: Gift,
  Other: HelpCircle,
};
