import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, UserX, Trash2, Shield, MoreVertical } from "lucide-react";
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

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role');
    }
  };

  const deleteUserData = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user's data? This will remove their profile and all associated data.")) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user data');
    }
  };

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
               <div className="flex items-center gap-2">
                 <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{u.full_name || 'No Name'}</p>
                 {u.role === 'admin' && (
                   <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                     <Shield size={10} />
                     Admin
                   </span>
                 )}
                 {u.plan === 'pro' && (
                   <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest">
                     PRO
                   </span>
                 )}
               </div>
               <p className="text-xs text-slate-500 truncate">{u.email}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
               <span className="px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                 Active
               </span>

               {/* Actions Menu (Simple inline for now) */}
               <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleRole(u.id, u.role)}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 rounded-lg transition-colors group relative"
                    title={u.role === 'admin' ? "Remove Admin" : "Make Admin"}
                  >
                    <Shield size={16} />
                  </button>
                  <button 
                    onClick={() => deleteUserData(u.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 rounded-lg transition-colors group relative"
                    title="Delete User Data"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
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
