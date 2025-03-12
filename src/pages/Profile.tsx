import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Settings,
  Bell,
  Sprout,
  Calendar,
  ClipboardList,
  Award,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Profile, Plot, Task, Event } from '../lib/types';

interface ProfileStats {
  totalPlots: number;
  completedTasks: number;
  upcomingEvents: number;
}

interface NotificationPreferences {
  email_events: boolean;
  email_tasks: boolean;
  email_plot_updates: boolean;
}

interface Achievement {
  title: string;
  description: string;
  achieved: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ totalPlots: 0, completedTasks: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_events: true,
    email_tasks: true,
    email_plot_updates: true
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const achievements: Achievement[] = [
    { title: 'Green Thumb', description: 'Completed 5 garden tasks', achieved: stats.completedTasks >= 5 },
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setEditedEmail(profileData.email);
        setEditedUsername(profileData.username);

        // Fetch assigned plots
        const { data: plotsData } = await supabase
          .from('plots')
          .select('*')
          .eq('assigned_to', session.user.id);
        setPlots(plotsData || []);

        // Fetch tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setTasks(tasksData || []);

        // Fetch upcoming events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(5);
        setEvents(eventsData || []);

        // Calculate stats
        setStats({
          totalPlots: plotsData?.length || 0,
          completedTasks: tasksData?.filter(t => t.status === 'completed').length || 0,
          upcomingEvents: eventsData?.length || 0
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', editedUsername.trim())
        .neq('id', profile?.id)
        .single();

      if (checkError && !checkError.message.includes('No rows found')) {
        throw checkError;
      }

      if (existingUser) {
        setUsernameError('This username is already taken');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          email: editedEmail.trim(),
          username: editedUsername.trim()
        })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { 
        ...prev, 
        email: editedEmail.trim(),
        username: editedUsername.trim()
      } : null);
      setIsEditingProfile(false);
      setSuccessMessage('Profile updated successfully');
      setUsernameError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleUpdateNotifications = async (key: keyof NotificationPreferences) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // In a real app, you would save these preferences to the database
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const renderProfileForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          value={editedUsername}
          onChange={(e) => {
            setEditedUsername(e.target.value);
            setUsernameError(null);
          }}
          className={`w-full rounded-lg border ${
            usernameError ? 'border-red-300' : 'border-gray-300'
          } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-techserv-blue`}
        />
        {usernameError && (
          <p className="mt-1 text-sm text-red-600">{usernameError}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={editedEmail}
          onChange={(e) => setEditedEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-techserv-blue"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsEditingProfile(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateProfile}
          className="btn-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderProfileInfo = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <User className="h-5 w-5 text-techserv-blue mr-3" />
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{profile?.username}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-techserv-blue mr-3" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditingProfile(true)}
          className="text-techserv-blue hover:text-techserv-storm"
        >
          Edit
        </button>
      </div>
      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
        <Shield className="h-5 w-5 text-techserv-blue mr-3" />
        <div>
          <p className="text-sm text-gray-500">Account Type</p>
          <p className="font-medium uppercase">{profile.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">MY PROFILE</h1>
              {successMessage && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {isEditingProfile ? renderProfileForm() : renderProfileInfo()}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <Sprout className="h-8 w-8 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-600">{stats.totalPlots}</span>
              </div>
              <h3 className="mt-2 font-semibold text-emerald-900">Active Plots</h3>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <ClipboardList className="h-8 w-8 text-sky-600" />
                <span className="text-2xl font-bold text-sky-600">{stats.completedTasks}</span>
              </div>
              <h3 className="mt-2 font-semibold text-sky-900">Tasks Completed</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-violet-600" />
                <span className="text-2xl font-bold text-violet-600">{stats.upcomingEvents}</span>
              </div>
              <h3 className="mt-2 font-semibold text-violet-900">Upcoming Events</h3>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">RECENT ACTIVITY</h2>
            
            {/* Tasks */}
            {tasks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Tasks</h3>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <ClipboardList className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Upcoming Events</h3>
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {event.location && (
                        <span className="text-sm text-gray-500">{event.location}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && events.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-6 w-6 text-techserv-blue" />
              <h2 className="text-xl font-semibold">NOTIFICATIONS</h2>
            </div>
            
            <div className="space-y-3">
              {Object.entries(notificationPrefs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">
                    {key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                  <button
                    onClick={() => handleUpdateNotifications(key as keyof NotificationPreferences)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-techserv-blue' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Plots */}
          {plots.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="h-6 w-6 text-techserv-blue" />
                <h2 className="text-xl font-semibold">MY PLOTS</h2>
              </div>
              
              <div className="space-y-2">
                {plots.map((plot) => (
                  <a
                    key={plot.id}
                    href="/plots"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">Plot {plot.number}</p>
                      <p className="text-sm text-gray-500">{plot.size}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
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
    </div>
  );
}
