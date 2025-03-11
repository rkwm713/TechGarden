import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Award,
  Sprout,
  Mail,
  Loader2,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Plot, Achievement } from '../lib/types';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  const achievements: Achievement[] = [
    { title: 'Green Thumb', description: 'Completed 5 garden tasks', achieved: false },
    { title: 'Event Enthusiast', description: 'Attended 3 garden events', achieved: false },
    { title: 'Master Gardener', description: 'Managed a plot for 6 months', achieved: false },
    { title: 'Cleanup Champion', description: 'Completed 10 cleanup sessions', achieved: false },
    { title: 'Weed Warrior', description: 'Removed weeds from 7 sections', achieved: false },
    { title: 'Soil Tester', description: 'Performed 5 soil quality tests', achieved: false },
    { title: 'Soil Steward', description: 'Amended soil in 4 garden beds', achieved: false },
    { title: 'Irrigation Inspector', description: 'Inspected watering systems 3 times', achieved: false },
    { title: 'Tool Master', description: 'Organized and maintained tools on 4 occasions', achieved: false },
    { title: 'Infrastructure Inspector', description: 'Repaired 3 walkways or borders', achieved: false },
    { title: 'Pest Patrol', description: 'Conducted 4 pest monitoring rounds', achieved: false },
    { title: 'Harvest Hero', description: 'Collected produce during 3 harvests', achieved: false },
    { title: 'Planting Pro', description: 'Planted seeds in 5 sessions', achieved: false },
    { title: 'Transplant Expert', description: 'Transplanted seedlings 4 times', achieved: false },
    { title: 'Mulching Maestro', description: 'Applied mulch in 6 garden areas', achieved: false },
    { title: 'Event Organizer', description: 'Coordinated 2 community events', achieved: false },
    { title: 'Community Champion', description: 'Led 5 volunteer meetings', achieved: false },
    { title: 'Innovation Award', description: 'Submitted 3 creative ideas', achieved: false },
    { title: 'Safety Sentinel', description: 'Performed 4 safety inspections', achieved: false },
    { title: 'Feedback Facilitator', description: 'Gathered feedback from 10 volunteers', achieved: false },
    { title: 'Team Player', description: 'Collaborated on 10 group projects', achieved: false },
    { title: 'Resource Recycler', description: 'Recycled 50 lbs of garden waste', achieved: false },
    { title: 'Water Wizard', description: 'Optimized watering schedules 4 times', achieved: false },
    { title: 'Plot Protector', description: 'Maintained an assigned plot for 8 months', achieved: false },
    { title: 'Garden Guardian', description: 'Ensured garden security for 6 months', achieved: false }
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch assigned plots
        const { data: plotsData, error: plotsError } = await supabase
          .from('plots')
          .select('*')
          .eq('assigned_to', profileData.id);

        if (plotsError) throw plotsError;
        setPlots(plotsData || []);

        // Here you would fetch achievement data from the database
        // For now, we'll use mock data

        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSendingMessage(true);
    try {
      // Get current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to send messages');
      }

      // Here you would implement the messaging functionality
      // For now, we'll just simulate a success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessageSuccess(true);
      setMessage('');
      setTimeout(() => {
        setShowMessageForm(false);
        setMessageSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-techserv-sky rounded-full p-4">
                  <User className="h-8 w-8 text-techserv-blue" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  <p className="text-gray-600 font-neuton">{profile.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageForm(true)}
                className="btn-primary flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Message
              </button>
            </div>

            {showMessageForm && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Send Message</h3>
                <form onSubmit={handleSendMessage}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-techserv-blue"
                    rows={4}
                    required
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowMessageForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="btn-primary flex items-center"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : messageSuccess ? (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      ) : (
                        <Mail className="h-5 w-5 mr-2" />
                      )}
                      {messageSuccess ? 'Sent!' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Assigned Plots */}
          {plots.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">GARDEN PLOTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plots.map((plot) => (
                  <Link
                    key={plot.id}
                    to="/plots"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Sprout className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Plot {plot.number}</p>
                        <p className="text-sm text-gray-600">{plot.size}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{plot.plot_type}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Achievements Sidebar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="h-6 w-6 text-techserv-blue" />
            <h2 className="text-xl font-semibold">ACHIEVEMENTS</h2>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
                {achievement.achieved ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}