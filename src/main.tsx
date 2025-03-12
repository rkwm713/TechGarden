import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { supabase } from './supabaseClient';
import { AuthProvider } from './contexts/AuthContext';
import { WeatherProvider } from './contexts/WeatherContext';
import ErrorBoundary from './components/ErrorBoundary';

// Confirm that Supabase is loaded properly
console.log('Supabase initialized:', !!supabase);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WeatherProvider>
            <App />
          </WeatherProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
