import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, Profile } from '../lib/types';

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  max_participants: string;
}

function EventCard({ 
  event, 
  onEdit, 
  onDelete,
  canManage 
}: { 
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{event.title}</h3>
        {canManage && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(event)}
              className="text-gray-600 hover:text-techserv-blue"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-gray-600 mb-4 font-neuton">{event.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-5 w-5 mr-2" />
          <span>{formatDate(startDate)}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>
            {formatTime(startDate)}
            {endDate && ` - ${formatTime(endDate)}`}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
        )}

        {event.max_participants && (
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span>Maximum {event.max_participants} participants</span>
          </div>
        )}

        {event.creator && (
          <div className="flex items-center text-gray-600 text-sm mt-4">
            <User className="h-4 w-4 mr-2" />
            <span>Created by </span>
            <Link 
              to={`/profile/${event.creator.username}`}
              className="ml-1 hover:text-techserv-blue"
            >
              {event.creator.username}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function EventForm({
  event,
  onSubmit,
  onCancel
}: {
  event?: Event;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (event) {
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate);
      
      return {
        title: event.title,
        description: event.description || '',
        start_date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        end_date: endDate.toISOString().split('T')[0],
        end_time: endDate.toTimeString().slice(0, 5),
        location: event.location || '',
        max_participants: event.max_participants?.toString() || ''
      };
    }

    const now = new Date();
    return {
      title: '',
      description: '',
      start_date: now.toISOString().split('T')[0],
      start_time: now.toTimeString().slice(0, 5),
      end_date: now.toISOString().split('T')[0],
      end_time: (new Date(now.getTime() + 2 * 60 * 60 * 1000)).toTimeString().slice(0, 5),
      location: '',
      max_participants: ''
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">
        {event ? 'Edit Event' : 'Create New Event'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Participants
          </label>
          <input
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2"
            min="1"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const canManageEvents = userProfile?.role === 'admin' || userProfile?.role === 'mod';

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          creator:created_by(email, username)
        `)
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        await fetchEvents();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location: formData.location.trim() || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        created_by: userProfile?.id
      };

      const { error: createError } = await supabase
        .from('events')
        .insert([eventData]);

      if (createError) throw createError;

      setShowEventForm(false);
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    }
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
    if (!editingEvent) return;

    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location: formData.location.trim() || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
      };

      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id);

      if (updateError) throw updateError;

      setEditingEvent(null);
      await fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
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

  const upcomingEvents = events.filter(event => new Date(event.start_date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.start_date) < new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GARDEN EVENTS</h1>
          <p className="text-gray-600 font-neuton">
            Join us for workshops, harvests, and community gatherings
          </p>
        </div>
        {canManageEvents && !showEventForm && !editingEvent && (
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary flex items-center font-saira"
          >
            <Plus className="h-5 w-5 mr-2" />
            NEW EVENT
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {(showEventForm || editingEvent) ? (
        <EventForm
          event={editingEvent || undefined}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      ) : (
        <div className="space-y-8">
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">UPCOMING EVENTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={setEditingEvent}
                    onDelete={handleDeleteEvent}
                    canManage={canManageEvents}
                  />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">PAST EVENTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={setEditingEvent}
                    onDelete={handleDeleteEvent}
                    canManage={canManageEvents}
                  />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-neuton">No events scheduled at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}