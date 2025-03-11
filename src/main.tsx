import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabaseClient';
// Set up admin user on app initialization
async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Sign up error:', error.message);
  } else {
    console.log('Sign up successful:', data);
  }
}
