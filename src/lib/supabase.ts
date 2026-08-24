import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://robvniipjwxmxkudghyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYnZuaWlwand4bXhrdWRnaHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODg1NDUsImV4cCI6MjEwMzE2NDU0NX0.mimHoEyyTYUNJFngqwex3Z4X-5xcv4SRN78P5CafrV8';

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
