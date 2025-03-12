import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Messages from './pages/Messages';
import NewMessage from './pages/NewMessage';
import { PrivateRoute } from './contexts/AuthContext';

// Route configuration to reduce repetition
const routes = [
  { path: '/', element: <Home /> },
  { path: '/plots', element: <GardenPlots /> },
  { path: '/events', element: <Events /> },
  { path: '/resources', element: <Resources /> },
  { path: '/rules', element: <Rules /> },
  { path: '/profile', element: <Profile /> },
  { path: '/profile/:username', element: <PublicProfile /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/messages', element: <Messages /> },
  { path: '/messages/:conversationId', element: <Messages /> },
  { path: '/messages/new', element: <NewMessage /> },
];

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-sage-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Routes */}
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <main className="flex-grow">
                    {route.element}
                  </main>
                </>
              </PrivateRoute>
            }
          />
        ))}
      </Routes>
    </div>
  );
}

export default App;
