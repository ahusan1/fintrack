import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbvglgjxfahbjlxvyfvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidmdsZ2p4ZmFoYmpseHZ5ZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDQ3MTAsImV4cCI6MjA5MzQ4MDcxMH0.P6fYvdlaF3ing_mnu8BgR3odi4cC-WjQ-L0lOhR-7fE';

let safeStorage;
try {
  safeStorage = window.localStorage;
  // Test access
  safeStorage.getItem('test');
} catch (e) {
  // Mock storage for environments where localStorage is blocked
  safeStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: safeStorage
  }
});
