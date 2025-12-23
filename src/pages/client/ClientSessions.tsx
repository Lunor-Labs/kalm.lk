import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageCircle, Phone, Play, Plus, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../types/session';
import { getUserSessions } from '../../lib/sessions';
import { format, isToday, isFuture, isWithinInterval, subMinutes } from 'date-fns';
import toast from 'react-hot-toast';

const ClientSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      try {
        setLoading(true);
        const userSessions = await getUserSessions(user.uid, 'client');
        // Log session count only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetched sessions:', userSessions.length, 'sessions');
      }
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
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [filter]);

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

  // Calculate paginated sessions
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + sessionsPerPage);

  useEffect(() => {
    // Debug pagination
    // Log pagination info only in development
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
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-base">Loading sessions...</p>
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
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Sessions</h1>
          <p className="text-neutral-300 text-sm">Manage your therapy appointments</p>
        </div>
        
        {/* <button
          onClick={handleBookNewSession}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] text-sm"
          aria-label="Book a new therapy session"
        >
          <Plus className="w-5 h-5" />
          <span>Book Session</span>
        </button> */}
      </div>

      {/* Stats Desktop */}
      <div className="hidden md:block">
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20 flex flex-col sm:flex-row items-center sm:items-stretch gap-3">
        {/* Stats Sections */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 sm:divide-x sm:divide-neutral-700">
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-primary-500" />
              <span className="text-neutral-300 text-sm">Total</span>
            </div>
            <p className="text-lg font-bold text-white">{sessions.length}</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-accent-green" />
              <span className="text-neutral-300 text-sm">Upcoming</span>
            </div>
            <p className="text-lg font-bold text-white">
              {sessions.filter(s => s.status === 'scheduled' || s.status === 'active').length}
            </p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-accent-yellow" />
              <span className="text-neutral-300 text-sm">Completed</span>
            </div>
            <p className="text-lg font-bold text-white">
              {sessions.filter(s => s.status === 'completed').length}
            </p>
          </div>
        </div>
        
        {/* Book Session Button */}
        <button
          onClick={handleBookNewSession}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] mb-3 sm:mb-0 sm:mr-6"
          aria-label="Book a new therapy session"
        >
          <Plus className="w-5 h-5" />
          <span>Book Session</span>
        </button>
      </div>
    </div>

    {/* Stats Movile View*/}
    <div className="md:hidden">
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20 text-center">
      <div className="flex justify-center items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-primary-500" />
        <span className="text-neutral-300 text-sm">Total</span>
      </div>
      <p className="text-lg font-bold text-white">{sessions.length}</p>
    </div>
    
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20 text-center">
      <div className="flex justify-center items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-accent-green" />
        <span className="text-neutral-300 text-sm">Upcoming</span>
      </div>
      <p className="text-lg font-bold text-white">
        {sessions.filter(s => s.status === "scheduled" || s.status === "active").length}
      </p>
    </div>
    
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20 text-center">
      <div className="flex justify-center items-center gap-2 mb-1">
        <Video className="w-5 h-5 text-accent-yellow" />
        <span className="text-neutral-300 text-sm">Completed</span>
      </div>
      <p className="text-lg font-bold text-white">
        {sessions.filter(s => s.status === "completed").length}
      </p>
    </div>

  </div>
</div>
{/* Book Session Button */}
        <button
          onClick={handleBookNewSession}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] mb-3 sm:mb-0 sm:mr-6 mx-auto mt-3 block md:hidden"
          aria-label="Book a new therapy session"
        >
          <Plus className="w-5 h-5" />
          <span>Book Session</span>
        </button>
      
      {/* Filters Desktop*/}
      <div className="hidden md:flex items-center"> 
      <div className="flex items-center gap-2">
        <span className="text-neutral-300 text-sm shrink-0">Filter:</span>
        <div className="flex bg-neutral-800 rounded-xl p-1 gap-1 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 min-w-[70px] min-h-[40px] ${
                filter === option.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-300 hover:text-white'
              }`}
              aria-label={`Filter by ${option.label} sessions`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Filters Mobile*/}
      <div className="flex items-center gap-2 block md:hidden">
        <span className="text-neutral-300 text-sm shrink-0">Filter:</span>
        <div className="flex bg-neutral-800 rounded-xl p-1 gap-1 overflow-x-auto w-full">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 min-w-[70px] min-h-[40px] ${
                filter === option.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-300 hover:text-white'
              }`}
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
              className="bg-black/50 backdrop-blur-sm rounded-xl p-3.5 border border-primary-500/20 hover:border-primary-500/40 transition-colors duration-200"
              aria-label={`${session.sessionType} session with ${session.therapistName || 'therapist'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-2.5">
                {/* Icon and Status */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-primary-500/10 rounded-md flex items-center justify-center">
                    {getSessionIcon(session.sessionType)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session)}`}>
                    {getStatusText(session)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-white font-semibold text-base truncate">
                    {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-300">
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
                      className="text-neutral-400 text-sm text-left hover:text-neutral-300 transition-colors duration-200"
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
                      className="bg-primary-500 text-white px-3 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center gap-1.5 min-h-[44px] text-sm"
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
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3.5 text-center border border-primary-500/20">
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              {filter === 'upcoming' ? 'No upcoming sessions' : 
               filter === 'completed' ? 'No completed sessions' : 'No sessions found'}
            </h3>
            <p className="text-neutral-300 text-sm mb-4">
              {filter === 'upcoming' ? 'Book your first session to get started' : 
               filter === 'completed' ? 'Complete some sessions to see them here' : 
               'Start your mental wellness journey today'}
            </p>
            {/* <button
              onClick={handleBookNewSession}
              className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 min-h-[44px] text-sm"
              aria-label="Book your first therapy session"
            >
              Book Your First Session
            </button> */}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm min-h-[44px] ${
            currentPage === 1
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
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
              className={`px-3 py-1.5 rounded-lg text-sm min-w-[40px] min-h-[40px] ${
                currentPage === page
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              } transition-colors duration-200`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm min-h-[44px] ${
            currentPage === totalPages
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
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