import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, UserX } from "lucide-react";
import { cn } from "../../lib/utils";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("createdAt", { ascending: false });

        if (!error && data) {
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.full_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
      (u.email?.toLowerCase() || "").includes(search.toLowerCase());
    
    // For demo, we consider everyone active unless they have a specific flag. 
    // Just simulating the tabs here.
    return matchesSearch; 
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Users
        </h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
        {['All Users', 'Active', 'Inactive'].map((t) => {
          const val = t.split(' ')[0] as any;
          return (
            <button
              key={t}
              onClick={() => setTab(val)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                tab === val 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {filteredUsers.map((u, i) => (
          <div key={u.id} className={cn(
            "flex items-center gap-4 p-4",
            i !== filteredUsers.length - 1 && "border-b border-slate-100 dark:border-slate-800"
          )}>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
               {u.avatar_url ? (
                 <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                   {u.full_name?.charAt(0) || u.email?.charAt(0) || '?'}
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{u.full_name || 'No Name'}</p>
               <p className="text-xs text-slate-500 truncate">{u.email}</p>
            </div>
            <div className="flex-shrink-0">
               <span className="px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                 Active
               </span>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500">
             <UserX size={32} className="mx-auto mb-3 opacity-50" />
             <p className="text-sm">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
