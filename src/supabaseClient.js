import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqytsssiwhkkyapvvpxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeXRzc3Npd2hra3lhcHZ2cHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDM5MDIsImV4cCI6MjA1NzIxOTkwMn0.08bifJJ2mzgzfsx8n-LdNNbVSwPYqjhiu-esLofFs_Q';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
