import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GardenPlots from './pages/GardenPlots';
import Events from './pages/Events';
import Resources from './pages/Resources';
import Rules from './pages/Rules';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Tasks from './pages/Tasks';
import SignUp from './pages/SignUp';
import { supabase } from './lib/supabase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-sage-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Home />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/plots" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <GardenPlots />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/events" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Events />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/resources" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Resources />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/rules" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Rules />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Profile />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/profile/:username" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <PublicProfile />
              </main>
            </>
          </PrivateRoute>
        } />
        
        <Route path="/tasks" element={
          <PrivateRoute>
            <>
              <Navbar />
              <main className="flex-grow">
                <Tasks />
              </main>
            </>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
