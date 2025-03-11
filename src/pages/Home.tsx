import React, { useState, useEffect } from 'react';
import { Calendar, Users, Sprout, Loader2 } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import { supabase } from '../lib/supabase';
import type { Event } from '../lib/types';

interface CommunityStats {
  activeGardeners: number;
  gardenPlots: number;
  monthlyEvents: number;
  isLoading: boolean;
}

export default function Home() {
  const [stats, setStats] = useState<CommunityStats>({
    activeGardeners: 0,
    gardenPlots: 0,
    monthlyEvents: 0,
    isLoading: true
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get count of active gardeners (users with assigned plots)
        const { data: gardeners, error: gardenersError } = await supabase
          .from('plot_assignments')
          .select('user_id')
          .eq('role', 'primary');

        if (gardenersError) throw gardenersError;

        // Get unique gardeners count
        const uniqueGardeners = new Set(gardeners?.map(g => g.user_id) || []).size;

        // Get total number of plots
        const { count: plotsCount, error: plotsError } = await supabase
          .from('plots')
          .select('*', { count: 'exact', head: true });

        if (plotsError) throw plotsError;

        // Get count of events in the next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .lte('start_date', thirtyDaysFromNow.toISOString());

        if (eventsError) throw eventsError;

        setStats({
          activeGardeners: uniqueGardeners,
          gardenPlots: plotsCount || 0,
          monthlyEvents: events?.length || 0,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    const fetchEvents = async () => {
      try {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3);

        if (eventsError) throw eventsError;
        setUpcomingEvents(events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchStats();
    fetchEvents();
  }, []);

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section 
        className="relative h-[500px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80")'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
            backdropFilter: 'blur(1px)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
              Welcome to Our Community Garden
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-saira text-techserv-sky opacity-90">
              Growing together, nurturing community
            </p>
            <a 
              href="/plots"
              className="btn-primary inline-block font-saira bg-techserv-blue hover:bg-techserv-storm transition-all duration-300 transform hover:scale-105"
            >
              GET YOUR PLOT
            </a>
          </div>
        </div>
      </section>

      {/* Weather Widget */}
      <section className="max-w-7xl mx-auto px-4">
        <WeatherWidget />
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">UPCOMING EVENTS</h2>
          <a 
            href="/events" 
            className="text-techserv-blue hover:text-techserv-storm font-saira"
          >
            VIEW ALL EVENTS
          </a>
        </div>
        
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-techserv-blue mb-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formatEventDate(event.start_date)}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-techserv-gray font-neuton">
                    {event.description || 'Join us for this exciting garden event!'}
                  </p>
                  {event.location && (
                    <p className="mt-2 text-sm text-techserv-gray">
                      Location: {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-neuton">No upcoming events scheduled</p>
            <a 
              href="/events" 
              className="mt-4 inline-block text-techserv-blue hover:text-techserv-storm font-saira"
            >
              Check All Events
            </a>
          </div>
        )}
      </section>

      {/* Community Stats */}
      <section className="bg-techserv-sky py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">OUR GROWING COMMUNITY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <Users className="h-12 w-12 text-techserv-blue mx-auto mb-4" />
                  <h3 className="text-4xl font-bold text-techserv-blue mb-2">{stats.activeGardeners}</h3>
                  <p className="text-techserv-gray font-neuton">Active Gardeners</p>
                </div>
                <div>
                  <Sprout className="h-12 w-12 text-techserv-blue mx-auto mb-4" />
                  <h3 className="text-4xl font-bold text-techserv-blue mb-2">{stats.gardenPlots}</h3>
                  <p className="text-techserv-gray font-neuton">Garden Plots</p>
                </div>
                <div>
                  <Calendar className="h-12 w-12 text-techserv-blue mx-auto mb-4" />
                  <h3 className="text-4xl font-bold text-techserv-blue mb-2">{stats.monthlyEvents}</h3>
                  <p className="text-techserv-gray font-neuton">Monthly Events</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}