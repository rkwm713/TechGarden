import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqytsssiwhkkyapvvpxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeXRzc3Npd2hra3lhcHZ2cHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDM5MDIsImV4cCI6MjA1NzIxOTkwMn0.08bifJJ2mzgzfsx8n-LdNNbVSwPYqjhiu-esLofFs_Q';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Initialize auth state
supabase.auth.getSession().catch(console.error);

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any application cache/state if needed
    localStorage.clear();
  }
});
