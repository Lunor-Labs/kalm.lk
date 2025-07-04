import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageCircle, Phone, Play, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../types/session';
import { getUserSessions } from '../../lib/sessions';
import { format, isToday, isFuture, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const ClientSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      try {
        setLoading(true);
        const userSessions = await getUserSessions(user.uid, 'client');
        setSessions(userSessions);
      } catch (error: any) {
        console.error('Failed to load sessions:', error);
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  const filteredSessions = sessions.filter(session => {
    switch (filter) {
      case 'upcoming':
        return session.status === 'scheduled' || (session.status === 'active' && isFuture(session.scheduledTime));
      case 'completed':
        return session.status === 'completed';
      default:
        return true;
    }
  });

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Phone className="w-5 h-5" />;
      case 'chat': return <MessageCircle className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (session: Session) => {
    if (session.status === 'active') return 'bg-accent-green/20 text-accent-green border-accent-green/30';
    if (session.status === 'completed') return 'bg-neutral-600/20 text-neutral-400 border-neutral-600/30';
    if (session.status === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (isToday(session.scheduledTime)) return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
    return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
  };

  const getStatusText = (session: Session) => {
    if (session.status === 'active') return 'Active';
    if (session.status === 'completed') return 'Completed';
    if (session.status === 'cancelled') return 'Cancelled';
    if (isToday(session.scheduledTime)) return 'Today';
    if (isFuture(session.scheduledTime)) return 'Scheduled';
    return 'Past';
  };

  const canJoinSession = (session: Session) => {
    return session.status === 'scheduled' || session.status === 'active';
  };

  const handleJoinSession = (session: Session) => {
    navigate(`/client/session/${session.id}`);
  };

  const handleBookNewSession = () => {
    navigate('/client/book');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Sessions</h1>
          <p className="text-neutral-300">Manage your therapy appointments</p>
        </div>
        
        <button
          onClick={handleBookNewSession}
          className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Book Session</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">{sessions.length}</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-accent-green" />
            <span className="text-neutral-300 text-sm">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Video className="w-5 h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {sessions.filter(s => s.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <span className="text-neutral-300 text-sm">Filter:</span>
        <div className="flex bg-neutral-800 rounded-2xl p-1">
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                filter === option.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden">
        {filteredSessions.length > 0 ? (
          <div className="divide-y divide-neutral-800">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-neutral-800/30 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Session Type Icon */}
                    <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                      {getSessionIcon(session.sessionType)}
                    </div>
                    
                    {/* Session Details */}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-white font-semibold">
                          {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(session)}`}>
                          {getStatusText(session)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-300">
                        <span>{format(session.scheduledTime, 'MMM d, yyyy')}</span>
                        <span>{format(session.scheduledTime, 'h:mm a')}</span>
                        <span>{session.duration} minutes</span>
                      </div>
                      {session.notes && (
                        <p className="text-neutral-400 text-sm mt-2">{session.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {canJoinSession(session) && (
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    )}
                    
                    {session.status === 'completed' && (
                      <button className="bg-neutral-700 text-white px-4 py-2 rounded-xl hover:bg-neutral-600 transition-colors duration-200">
                        View Notes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'upcoming' ? 'No upcoming sessions' : 
               filter === 'completed' ? 'No completed sessions' : 'No sessions found'}
            </h3>
            <p className="text-neutral-300 mb-6">
              {filter === 'upcoming' ? 'Book your first session to get started' : 
               filter === 'completed' ? 'Complete some sessions to see them here' : 
               'Start your mental wellness journey today'}
            </p>
            <button
              onClick={handleBookNewSession}
              className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
            >
              Book Your First Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSessions;