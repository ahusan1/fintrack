import React from "react";
import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, BarChart3, Settings, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export function AdminShell() {
  const { user } = useAuth();
  
  // Strict admin check (ideally based on DB role, but caching it via email for now)
  const isAdmin = user?.email === "ahhacker37@gmail.com";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { name: "Dashboard", id: "", icon: LayoutDashboard },
    { name: "Users", id: "users", icon: Users },
    { name: "Transactions", id: "transactions", icon: CreditCard },
    { name: "Reports", id: "reports", icon: BarChart3 },
    { name: "Settings", id: "settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-indigo-600/30">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight dark:text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500">Finance Track</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              end={item.id === ""}
              key={item.id}
              to={'/admin' + (item.id ? '/' + item.id : '')}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )
              }
            >
              <item.icon size={20} className="shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
               <p className="truncate text-xs">Exit Admin</p>
            </div>
          </NavLink>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto pb-24 md:pb-6 pt-6 px-4 md:px-8">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe pb-2 z-50">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {navItems.map((item) => (
            <NavLink
              end={item.id === ""}
              key={item.id}
              to={'/admin' + (item.id ? '/' + item.id : '')}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 gap-1 p-2 rounded-xl transition-all",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "flex items-center justify-center p-1.5 rounded-xl transition-transform",
                      isActive ? "bg-indigo-100 dark:bg-indigo-900/50 scale-110" : ""
                    )}
                  >
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium text-center w-full truncate">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
