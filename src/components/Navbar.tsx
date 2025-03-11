import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-techserv-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-saira tracking-brand flex items-center">
              <Leaf className="h-6 w-6 mr-2 text-techserv-sky" />
              TECHSERV'S COMMUNITY GARDEN
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/plots"
                className="text-white hover:text-techserv-sky font-saira tracking-brand"
              >
                PLOTS
              </Link>
              <Link
                to="/events"
                className="text-white hover:text-techserv-sky font-saira tracking-brand"
              >
                EVENTS
              </Link>
              <Link
                to="/tasks"
                className="text-white hover:text-techserv-sky font-saira tracking-brand"
              >
                TASKS
              </Link>
              <Link
                to="/rules"
                className="text-white hover:text-techserv-sky font-saira tracking-brand"
              >
                RULES
              </Link>
              <Link
                to="/resources"
                className="text-white hover:text-techserv-sky font-saira tracking-brand"
              >
                RESOURCES
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-white hover:text-techserv-sky font-saira tracking-brand"
                  >
                    MY PROFILE
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-techserv-sky font-saira tracking-brand"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:text-techserv-sky font-saira tracking-brand"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-techserv-sky"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/plots"
              className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
              onClick={() => setIsOpen(false)}
            >
              PLOTS
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
              onClick={() => setIsOpen(false)}
            >
              EVENTS
            </Link>
            <Link
              to="/tasks"
              className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
              onClick={() => setIsOpen(false)}
            >
              TASKS
            </Link>
            <Link
              to="/rules"
              className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
              onClick={() => setIsOpen(false)}
            >
              RULES
            </Link>
            <Link
              to="/resources"
              className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
              onClick={() => setIsOpen(false)}
            >
              RESOURCES
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
                  onClick={() => setIsOpen(false)}
                >
                  MY PROFILE
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 text-white hover:text-techserv-sky font-saira tracking-brand"
                onClick={() => setIsOpen(false)}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}