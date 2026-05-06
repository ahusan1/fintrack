import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Sun,
  Moon,
  PieChart as PieIcon,
  Bell,
  Home,
  List,
  Plus,
  BarChart2,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export function Shell() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || "dashboard";

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const triggerAdd = () => {
    window.dispatchEvent(new Event("openAddModal"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex-col text-slate-400">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <CreditCard size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Afin Track
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            {
              name: "Dashboard",
              icon: Home,
              id: "dashboard",
              path: "/dashboard",
            },
            {
              name: "Transactions",
              icon: List,
              id: "transactions",
              path: "/transactions",
            },
            {
              name: "Analytics",
              icon: BarChart2,
              id: "analytics",
              path: "/analytics",
            },
            {
              name: "Profile",
              icon: UserIcon,
              id: "profile",
              path: "/profile",
            },
          ].map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                activeTab === item.id
                  ? "bg-slate-800 text-white"
                  : "hover:text-white hover:bg-slate-800/50",
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:text-white hover:bg-slate-800/50 transition-all font-medium text-sm"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-800 pt-4 mt-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden ring-2 ring-slate-800">
              <img
                src={user?.user_metadata?.avatar_url || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate">
                PRO PLAN
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all font-medium text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))] pb-4 bg-slate-50 dark:bg-slate-950 top-0 z-30 sticky">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[200px]">
              Hello, {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User").split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 shadow-sm shrink-0">
              <img
                src={
                  user?.user_metadata?.avatar_url ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User") +
                    "&background=10b981&color=fff"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between relative">
          <div className="flex w-2/5 justify-around">
            <Link
              to="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full py-2 touch-manipulation select-none cursor-pointer [&>*]:pointer-events-none",
                activeTab === "dashboard"
                  ? "text-emerald-600"
                  : "text-slate-400",
              )}
            >
              <Home
                size={22}
                className={
                  activeTab === "dashboard"
                    ? "fill-emerald-100 dark:fill-emerald-900/30"
                    : ""
                }
              />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link
              to="/transactions"
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full py-2 touch-manipulation select-none cursor-pointer [&>*]:pointer-events-none",
                activeTab === "transactions"
                  ? "text-emerald-600"
                  : "text-slate-400",
              )}
            >
              <List
                size={22}
                className={
                  activeTab === "transactions"
                    ? "fill-emerald-100 dark:fill-emerald-900/30"
                    : ""
                }
              />
              <span className="text-[10px] font-bold">List</span>
            </Link>
          </div>

          <button
            onClick={triggerAdd}
            className="absolute left-1/2 -top-8 -translate-x-1/2 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 border-4 border-slate-50 dark:border-slate-900 z-[60] touch-manipulation select-none cursor-pointer [&>*]:pointer-events-none"
          >
            <Plus size={32} />
          </button>

          <div className="flex w-2/5 justify-around">
            <Link
              to="/analytics"
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full py-2 touch-manipulation select-none cursor-pointer [&>*]:pointer-events-none",
                activeTab === "analytics"
                  ? "text-emerald-600"
                  : "text-slate-400",
              )}
            >
              <BarChart2
                size={22}
                className={
                  activeTab === "analytics"
                    ? "fill-emerald-100 dark:fill-emerald-900/30"
                    : ""
                }
              />
              <span className="text-[10px] font-bold">Stats</span>
            </Link>
            <Link
              to="/profile"
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full py-2 touch-manipulation select-none cursor-pointer [&>*]:pointer-events-none",
                activeTab === "profile" ? "text-emerald-600" : "text-slate-400",
              )}
            >
              <UserIcon
                size={22}
                className={
                  activeTab === "profile"
                    ? "fill-emerald-100 dark:fill-emerald-900/30"
                    : ""
                }
              />
              <span className="text-[10px] font-bold">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
