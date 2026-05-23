import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userPlan: 'free' | 'pro';
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithIdToken: (token: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole(currentUser: User | null) {
      if (!currentUser) {
        setIsAdmin(false);
        setUserPlan('free');
        setLoading(false);
        return;
      }

      // Try reading from cache first for immediate offline support
      try {
        const cachedRole = localStorage.getItem(`role_${currentUser.id}`);
        const cachedPlan = localStorage.getItem(`plan_${currentUser.id}`);
        if (cachedRole) setIsAdmin(cachedRole === 'admin');
        if (cachedPlan) setUserPlan(cachedPlan as 'free' | 'pro');
      } catch (e) {}

      // If clearly offline, don't block
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
         setLoading(false);
         // We can exit early, cache is already set
         return;
      }

      try {
         // Add a 5 second timeout to prevent hanging on slow connections
         const fetchPromise = supabase
          .from("profiles")
          .select("role, plan")
          .eq("id", currentUser.id)
          .single();

         const timeoutPromise = new Promise<any>((_, reject) => {
            setTimeout(() => reject(new Error("Timeout checking role")), 5000);
         });

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (result && !result.error && result.data) {
          setIsAdmin(result.data.role === 'admin');
          setUserPlan(result.data.plan === 'pro' ? 'pro' : 'free');
          try {
            localStorage.setItem(`role_${currentUser.id}`, result.data.role || 'user');
            localStorage.setItem(`plan_${currentUser.id}`, result.data.plan || 'free');
          } catch(e) {}
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        // Do not override with false/free if we already have cached values, 
        // to avoid degrading experience on transient errors
      } finally {
        setLoading(false);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         checkRole(session.user);
      } else {
         setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (_event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          setUserPlan('free');
          setLoading(false);
        } else if (session) {
          setUser(session.user);
          checkRole(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const signInWithIdToken = async (token: string) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google One Tap Error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Email Sign-In Error:", error);
      throw error;
    }
  };
  
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Email Sign-Up Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, userPlan, loading, signInWithGoogle, signInWithIdToken, signInWithEmail, signUpWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
