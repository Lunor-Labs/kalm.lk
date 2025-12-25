import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageCircle, Phone, Play, Plus, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../types/session';
import { getUserSessions, canJoinSessionByTime, shouldMarkSessionAsMissed, markSessionAsMissed } from '../../lib/sessions';
import { format, isToday, isFuture, isWithinInterval, subMinutes } from 'date-fns';
import toast from 'react-hot-toast';

const ClientSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'missed'>('all');
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      try {
        setLoading(true);
        const userSessions = await getUserSessions(user.uid, 'client');
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetched sessions:', userSessions.length, 'sessions');
        }
        const checkAndMarkMissedSessions = async () => {
          for (const session of userSessions) {
            try {
              if (session.status === 'scheduled') {
                const shouldMarkAsMissed = await shouldMarkSessionAsMissed(session);
                if (shouldMarkAsMissed) {
                  await markSessionAsMissed(session.id);
                  session.status = 'missed';
                }
              }
            } catch (error) {
              console.error(`Failed to check missed status for session ${session.id}:`, error);
            }
          }
        };

        await checkAndMarkMissedSessions();
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

  const filteredSessions = sessions.filter(session => {
    switch (filter) {
      case 'upcoming':
        return session.status === 'scheduled' || (session.status === 'active' && isFuture(session.scheduledTime));
      case 'completed':
        return session.status === 'completed';
      case 'missed':
        return session.status === 'missed';
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + sessionsPerPage);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Filtered sessions:', filteredSessions.length, 'Total pages:', totalPages, 'Current page:', currentPage);
    }
  }, [filteredSessions, currentPage]);

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <Phone className="w-6 h-6" />;
      case 'chat': return <MessageCircle className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getStatusColor = (session: Session) => {
    if (session.status === 'active') return 'bg-accent-green/20 text-accent-green border-accent-green/30';
    if (session.status === 'completed') return 'bg-neutral-600/20 text-neutral-400 border-neutral-600/30';
    if (session.status === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (session.status === 'missed') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (isToday(session.scheduledTime)) return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
    return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
  };

  const getStatusText = (session: Session) => {
    if (session.status === 'active') return 'Active';
    if (session.status === 'completed') return 'Completed';
    if (session.status === 'cancelled') return 'Cancelled';
    if (session.status === 'missed') return 'Missed';
    if (isToday(session.scheduledTime)) return 'Today';
    if (isFuture(session.scheduledTime)) return 'Scheduled';
    return 'Past';
  };

  const [joinableSessions, setJoinableSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateJoinableSessions = async () => {
      const joinable = new Set<string>();
      for (const session of sessions) {
        try {
          const canJoin = await canJoinSessionByTime(session);
          if (canJoin) {
            joinable.add(session.id);
          }
        } catch (error) {
          if (session.status === 'scheduled' || session.status === 'active') {
            joinable.add(session.id);
          }
        }
      }
      setJoinableSessions(joinable);
    };

    updateJoinableSessions();
  }, [sessions]);

  const canJoinSession = (session: Session) => {
    return joinableSessions.has(session.id);
  };

  const handleJoinSession = (session: Session) => {
    navigate(`/client/session/${session.id}`);
  };

  const handleBookNewSession = () => {
    navigate('/client/book');
  };

  const toggleNotes = (sessionId: string) => {
    setExpandedNotes(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--primary-300)' }}></div>
          <p className="text-base" style={{ color: 'var(--fixes-heading-dark)' }}>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate('/client/home')}
          className="flex items-center space-x-2 transition-colors duration-200 mb-6 font-medium"
          style={{ color: '#0C4A6E' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--fixes-heading-dark)' }}>My Sessions</h1>
          <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>Manage your therapy appointments</p>
        </div>
      </div>

      {/* Stats Desktop */}
      <div className="hidden md:block">
        <div className="rounded-xl p-3 border" style={{
          backgroundColor: 'var(--bg-card-light)',
          borderColor: 'var(--neutral-200)'
        }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-3">
            {/* Stats Sections */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x" style={{ borderColor: 'var(--neutral-200)' }}>
              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
                  <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Total</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>{sessions.length}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-accent-green" />
                  <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Upcoming</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
                  {sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length}
                </p>
              </div>
              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-accent-yellow" />
                  <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Completed</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Missed</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
                  {sessions.filter(s => s.status === 'missed').length}
                </p>
              </div>
            </div>
            
            {/* Book Session Button */}
            <button
              onClick={handleBookNewSession}
              className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] mb-3 sm:mb-0 sm:mr-6"
              style={{ backgroundColor: 'var(--primary-300)', color: '#0C4A6E' }}
              aria-label="Book a new therapy session"
            >
              <Plus className="w-5 h-5" />
              <span>Book Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Mobile View */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg p-3 border text-center" style={{
            backgroundColor: 'var(--bg-card-light)',
            borderColor: 'var(--neutral-200)'
          }}>
            <div className="flex justify-center items-center gap-2 mb-1">
              <Calendar className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
              <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Total</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>{sessions.length}</p>
          </div>
          
          <div className="rounded-lg p-3 border text-center" style={{
            backgroundColor: 'var(--bg-card-light)',
            borderColor: 'var(--neutral-200)'
          }}>
            <div className="flex justify-center items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-accent-green" />
              <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Upcoming</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
              {sessions.filter(s => s.status === "scheduled" || s.status === "active").length}
            </p>
          </div>
          
          <div className="rounded-lg p-3 border text-center" style={{
            backgroundColor: 'var(--bg-card-light)',
            borderColor: 'var(--neutral-200)'
          }}>
            <div className="flex justify-center items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-accent-yellow" />
              <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Completed</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
              {sessions.filter(s => s.status === "completed").length}
            </p>
          </div>

          <div className="rounded-lg p-3 border text-center" style={{
            backgroundColor: 'var(--bg-card-light)',
            borderColor: 'var(--neutral-200)'
          }}>
            <div className="flex justify-center items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Missed</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--fixes-heading-dark)' }}>
              {sessions.filter(s => s.status === "missed").length}
            </p>
          </div>
        </div>
      </div>

      {/* Book Session Button Mobile */}
      <button
        onClick={handleBookNewSession}
        className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] mb-3 sm:mb-0 sm:mr-6 mx-auto mt-3 block md:hidden"
        style={{ backgroundColor: 'var(--primary-300)', color: '#0C4A6E' }}
        aria-label="Book a new therapy session"
      >
        <Plus className="w-5 h-5" />
        <span>Book Session</span>
      </button>
      
      {/* Filters Desktop */}
      <div className="hidden md:flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm shrink-0" style={{ color: 'var(--neutral-600)' }}>Filter:</span>
          <div className="flex rounded-lg p-1 gap-1 overflow-x-auto" style={{ backgroundColor: 'var(--primary-300)' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'missed', label: 'Missed' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 min-w-[70px] min-h-[40px]`}
                style={{
                  backgroundColor: filter === option.key ? 'white' : 'transparent',
                  color: filter === option.key ? '#0C4A6E' : 'var(--neutral-600)'
                }}
                aria-label={`Filter by ${option.label} sessions`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Mobile */}
      <div className="flex items-center gap-2 block md:hidden">
        <span className="text-sm shrink-0" style={{ color: 'var(--neutral-600)' }}>Filter:</span>
        <div className="flex rounded-lg p-1 gap-1 overflow-x-auto w-full" style={{ backgroundColor: 'var(--primary-300)' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'missed', label: 'Missed' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 min-w-[70px] min-h-[40px]`}
              style={{
                backgroundColor: filter === option.key ? 'white' : 'transparent',
                color: filter === option.key ? '#0C4A6E' : 'var(--neutral-600)'
              }}
              aria-label={`Filter by ${option.label} sessions`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {paginatedSessions.length > 0 ? (
          paginatedSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-lg p-3.5 border hover:border-opacity-60 transition-colors duration-200"
              style={{
                backgroundColor: 'var(--bg-card-light)',
                borderColor: 'var(--neutral-200)'
              }}
              aria-label={`${session.sessionType} session with ${session.therapistName || 'therapist'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-2.5">
                {/* Icon and Status */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--primary-300)' }}>
                    <div style={{ color: '#0C4A6E' }}>
                      {getSessionIcon(session.sessionType)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session)}`}>
                    {getStatusText(session)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-base truncate" style={{ color: 'var(--fixes-heading-dark)' }}>
                    {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm" style={{ color: 'var(--neutral-600)' }}>
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {session.therapistName || 'Unknown'}
                    </span>
                    <span>{format(session.scheduledTime, 'MMM d, yyyy')}</span>
                    <span>{format(session.scheduledTime, 'h:mm a')}</span>
                    <span>{session.duration} min</span>
                  </div>
                  {session.notes && (
                    <button
                      onClick={() => toggleNotes(session.id)}
                      className="text-sm text-left transition-colors duration-200"
                      style={{ color: 'var(--neutral-500)' }}
                      aria-label={expandedNotes.includes(session.id) ? 'Hide session notes' : 'Show session notes'}
                    >
                      <p className={expandedNotes.includes(session.id) ? '' : 'line-clamp-1'}>
                        {session.notes}
                      </p>
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:self-center">
                  {canJoinSession(session) && (
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="text-white px-3 py-2 rounded-lg hover:opacity-90 transition-colors duration-200 flex items-center gap-1.5 min-h-[44px] text-sm"
                      style={{ backgroundColor: 'var(--primary-500)' }}
                      aria-label={`Join ${session.sessionType} session with ${session.therapistName || 'therapist'}`}
                    >
                      <Play className="w-4 h-4" />
                      <span>Join</span>
                    </button>
                  )}
                  
                  {session.status === 'active' && (
                    <span className="bg-accent-green/20 text-accent-green px-2 py-1 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg p-3.5 text-center border" style={{
            backgroundColor: 'var(--bg-card-light)',
            borderColor: 'var(--neutral-200)'
          }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--neutral-200)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--fixes-heading-dark)' }}>
              {filter === 'upcoming' ? 'No upcoming sessions' :
               filter === 'completed' ? 'No completed sessions' :
               filter === 'missed' ? 'No missed sessions' : 'No sessions found'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
              {filter === 'upcoming' ? 'Book your first session to get started' : 
               filter === 'completed' ? 'Complete some sessions to see them here' : 
               'Start your mental wellness journey today'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors duration-200 ${
            currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'text-white hover:opacity-90'
          }`}
          style={{
            backgroundColor: currentPage === 1 ? 'var(--neutral-300)' : 'var(--primary-300)',
            color: currentPage === 1 ? 'var(--neutral-600)' : '#0C4A6E'
          }}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg text-sm min-w-[40px] min-h-[40px] transition-colors duration-200 font-medium`}
              style={{
                backgroundColor: currentPage === page ? 'var(--primary-300)' : 'var(--neutral-200)',
                color: currentPage === page ? '#0C4A6E' : 'var(--neutral-600)'
              }}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors duration-200 ${
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'text-white hover:opacity-90'
          }`}
          style={{
            backgroundColor: currentPage === totalPages ? 'var(--neutral-300)' : 'var(--primary-300)',
            color: currentPage === totalPages ? 'var(--neutral-600)' : '#0C4A6E'
          }}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ClientSessions;