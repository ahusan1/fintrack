import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Shield, Server, Box, LogOut, ChevronRight, User } from "lucide-react";

export function AdminSettings() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4">
         <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
             {user?.avatar_url ? (
                 <img src={user.avatar_url} alt="Admin" className="w-full h-full object-cover" />
             ) : (
                <User size={32} className="text-indigo-600 dark:text-indigo-400" />
             )}
         </div>
         <div className="flex-1 min-w-0">
             <h2 className="font-bold text-slate-900 dark:text-white truncate">Admin User</h2>
             <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Super Admin
             </span>
             <p className="text-xs text-slate-500 mt-1 truncate">{user?.email}</p>
         </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">General</div>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Settings size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">General Settings</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Security</div>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Shield size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">Change Password</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Shield size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">Two Factor Authentication</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">System</div>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <UsersIcon size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">Manage Admins</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Server size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">System Logs</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Box size={20} className="text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white text-sm">Backup & Restore</span>
           </div>
           <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="pt-4 pb-8">
        <button 
           onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                  logout();
              }
           }}
           className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-bold transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
           <LogOut size={20} />
           Logout
        </button>
      </div>
    </div>
  );
}

function UsersIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
