import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../lib/types';
import WeatherWidget from '../components/WeatherWidget';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from);
      }
    });
  }, [navigate, location]);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const createProfile = async (userId: string, userEmail: string) => {
    const { error } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId, 
        email: userEmail,
        username: userEmail.split('@')[0],
        role: 'ruser' as UserRole 
      }]);
    
    if (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('Email or password is incorrect. Please try again.');
        }
        throw signInError;
      }

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await createProfile(user.id, user.email!);
        }

        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
          setIsSignUp(false);
        } else {
          throw error;
        }
      } else if (user) {
        await createProfile(user.id, user.email!);
        setError('Success! Please check your email for confirmation.');
        setIsSignUp(false);
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-techserv-sky to-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - Hero Content */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold ml-3 font-saira tracking-brand text-techserv-black">
              TechServ's COMMUNITY GARDEN
            </h1>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-techserv-black leading-tight">
            Growing Together, Nurturing Community
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 font-neuton">
            Join our thriving community garden where neighbors come together to grow fresh produce,
            share knowledge, and build lasting connections.
          </p>
          
          <div className="mb-8">
            <WeatherWidget />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>

              {error && (
                <div className={`p-3 rounded-md text-sm flex items-center space-x-2 mb-4 ${
                  error.startsWith('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-techserv-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-techserv-blue focus:border-transparent"
                    required
                  />
                  {isSignUp && (
                    <p className="mt-1 text-sm text-gray-500">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-techserv-blue text-white py-2 px-4 rounded-lg hover:bg-techserv-storm transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setPassword('');
                  }}
                  className="w-full text-center text-techserv-blue hover:text-techserv-storm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;