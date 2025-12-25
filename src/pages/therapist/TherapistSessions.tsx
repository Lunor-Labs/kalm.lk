import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Phone,
  Play,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../types/session';
import { getUserSessions, canJoinSessionByTime } from '../../lib/sessions';
import { format, isToday, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

const TherapistSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 6; // slightly increased for light theme

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      try {
        setLoading(true);
        const userSessions = await getUserSessions(user.uid, 'therapist');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredSessions = sessions.filter((session) => {
    switch (filter) {
      case 'today':
        return isToday(session.scheduledTime);
      case 'upcoming':
        return session.status === 'scheduled' || (session.status === 'active' && isFuture(session.scheduledTime));
      case 'completed':
        return session.status === 'completed';
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + sessionsPerPage);

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'audio':
        return <Phone className="w-6 h-6" />;
      case 'chat':
        return <MessageCircle className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const getStatusStyles = (session: Session) => {
    if (session.status === 'active') {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Active',
      };
    }
    if (session.status === 'completed') {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        label: 'Completed',
      };
    }
    if (session.status === 'cancelled') {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Cancelled',
      };
    }
    if (isToday(session.scheduledTime)) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Today',
      };
    }
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: isFuture(session.scheduledTime) ? 'Scheduled' : 'Past',
    };
  };

  const [joinableSessions, setJoinableSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateJoinable = async () => {
      const joinable = new Set<string>();
      for (const session of sessions) {
        try {
          const canJoin = await canJoinSessionByTime(session);
          if (canJoin) joinable.add(session.id);
        } catch {
          if (session.status === 'scheduled' || session.status === 'active') {
            joinable.add(session.id);
          }
        }
      }
      setJoinableSessions(joinable);
    };

    updateJoinable();
  }, [sessions]);

  const canJoinSession = (session: Session) => joinableSessions.has(session.id);

  const handleJoinSession = (session: Session) => {
    navigate(`/therapist/session/${session.id}`);
  };

  const toggleNotes = (sessionId: string) => {
    setExpandedNotes((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-base">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 mt-1">Manage your therapy appointments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Total Sessions', value: sessions.length, icon: Calendar, color: 'blue-600' },
          { title: 'Today', value: sessions.filter((s) => isToday(s.scheduledTime)).length, icon: Clock, color: 'amber-600' },
          {
            title: 'Upcoming',
            value: sessions.filter((s) => s.status === 'scheduled' || s.status === 'active').length,
            icon: Users,
            color: 'emerald-600',
          },
          {
            title: 'Completed',
            value: sessions.filter((s) => s.status === 'completed').length,
            icon: Video,
            color: 'gray-600',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              <span className="text-sm font-medium text-gray-600">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-gray-600 text-sm font-medium shrink-0">Filter by:</span>
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {['all', 'today', 'upcoming', 'completed'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {paginatedSessions.length > 0 ? (
          paginatedSessions.map((session) => {
            const status = getStatusStyles(session);

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon + Status */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700">
                      {getSessionIcon(session.sessionType)}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>Client: {session.clientName || 'Anonymous'}</span>
                      <span>{format(session.scheduledTime, 'MMM d, yyyy')}</span>
                      <span>{format(session.scheduledTime, 'h:mm a')}</span>
                      <span>{session.duration} min</span>
                    </div>

                    {session.notes && (
                      <button
                        onClick={() => toggleNotes(session.id)}
                        className="text-gray-500 hover:text-gray-700 text-sm transition-colors mt-1 block text-left"
                      >
                        <p className={expandedNotes.includes(session.id) ? '' : 'line-clamp-2'}>
                          {session.notes}
                        </p>
                      </button>
                    )}
                  </div>

                  {/* Join button */}
                  {canJoinSession(session) && (
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="mt-3 sm:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2 shadow-sm"
                    >
                      <Play size={16} />
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {filter === 'today'
                ? 'No sessions today'
                : filter === 'upcoming'
                ? 'No upcoming sessions'
                : filter === 'completed'
                ? 'No completed sessions'
                : 'No sessions found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filter === 'today'
                ? 'Your schedule is clear for today'
                : filter === 'upcoming'
                ? 'No upcoming appointments scheduled'
                : filter === 'completed'
                ? 'Complete some sessions to see them here'
                : 'Sessions will appear here once clients book appointments'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-8 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TherapistSessions;