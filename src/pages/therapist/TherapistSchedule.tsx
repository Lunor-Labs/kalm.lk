import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Video, Users, Plus, X, Dot } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, startOfDay, endOfDay, startOfWeek as startOfWeekDate, endOfWeek } from 'date-fns';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Session {
  id: string;
  clientId: string;
  clientName: string;
  therapistId: string;
  therapistName: string;
  scheduledTime: Date;
  duration: number;
  sessionType: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields for display
  time: string;
  date: Date;
  type: string;
}

const TherapistSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysSessions: 0,
    thisWeekSessions: 0,
    totalClients: 0,
    nextSessionTime: ''
  });

  // Load sessions from database
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, selectedDate]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get sessions for the current therapist
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('therapistId', '==', user.uid),
        where('status', 'in', ['scheduled', 'confirmed']),
        orderBy('scheduledTime', 'asc')
      );

      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const scheduledTime = data.scheduledTime?.toDate() || new Date();
        
        return {
          id: doc.id,
          clientId: data.clientId || '',
          clientName: data.clientName || 'Anonymous User',
          therapistId: data.therapistId || '',
          therapistName: data.therapistName || '',
          scheduledTime,
          duration: data.duration || 60,
          sessionType: data.sessionType || 'video',
          status: data.status || 'scheduled',
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Computed fields for display
          time: format(scheduledTime, 'h:mm a'),
          date: scheduledTime,
          type: data.sessionType || 'video'
        } as Session;
      });

      setSessions(sessionsData);
      calculateStats(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessionsData: Session[]) => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfThisWeek = startOfWeekDate(today);
    const endOfThisWeek = endOfWeek(today);

    const todaysSessions = sessionsData.filter(session => 
      session.scheduledTime >= startOfToday && session.scheduledTime <= endOfToday
    ).length;

    const thisWeekSessions = sessionsData.filter(session =>
      session.scheduledTime >= startOfThisWeek && session.scheduledTime <= endOfThisWeek
    ).length;

    const uniqueClients = new Set(sessionsData.map(session => session.clientId)).size;

    const upcomingSessions = sessionsData
      .filter(session => session.scheduledTime > new Date())
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    const nextSessionTime = upcomingSessions.length > 0 
      ? format(upcomingSessions[0].scheduledTime, 'h:mm a')
      : 'None';

    setStats({
      todaysSessions,
      thisWeekSessions,
      totalClients: uniqueClients,
      nextSessionTime
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate), i)
  );

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Clock className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const handleDayClick = (day: Date) => {
    const daySessions = getSessionsForDate(day);
    if (daySessions.length > 0) {
      setSelectedDaySessions(daySessions);
      setShowDayModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDayModal(false);
    setSelectedSession(null);
  };

  // Show loading state
  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <p className="text-white mb-2">Please log in to view your schedule</p>
          <p className="text-neutral-400">You need to be authenticated as a therapist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">My Schedule</h1>
          <p className="text-neutral-300 text-sm sm:text-base">Manage Your Appointments And Availability</p>
        </div>
        
        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-neutral-800 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-sm font-medium ${
                viewMode === 'week' ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-sm font-medium ${
                viewMode === 'day' ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/therapist/availability')}
            className="bg-primary-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl hover:bg-primary-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-sm sm:text-base">Add Availability</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-primary-500" />
            <span className="text-neutral-300 text-xs sm:text-sm">Today's</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? '...' : stats.todaysSessions}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-accent-green" />
            <span className="text-neutral-300 text-xs sm:text-sm">This Week</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? '...' : stats.thisWeekSessions}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-xs sm:text-sm">Total Clients</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {loading ? '...' : stats.totalClients}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Video className="w-4 sm:w-5 h-4 sm:h-5 text-accent-orange" />
            <span className="text-neutral-300 text-xs sm:text-sm">Next Session</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-white">
            {loading ? '...' : stats.nextSessionTime}
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center justify-between sm:justify-end gap-2">

            <button
              onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? -7 : -1))}
              className="p-2 bg-neutral-800 rounded-xl text-white hover:bg-neutral-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 text-xs sm:text-sm"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? 7 : 1))}
              className="p-2 bg-neutral-800 rounded-xl text-white hover:bg-neutral-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            </div>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="p-4 sm:p-6">
            {/* Responsive week headers with dots */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {weekDays.map((day, index) => {
                const daySessions = getSessionsForDate(day);
                return (
                  <div key={index} className="text-center">
                    <button 
                      onClick={() => handleDayClick(day)}
                      className={`w-full p-1 sm:p-2 rounded-lg flex flex-col items-center ${
                        isSameDay(day, new Date()) ? 'bg-primary-500 text-white' : 'text-neutral-300'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-medium">{format(day, 'EEE')}</p>
                      <p className="text-sm sm:text-base font-bold">{format(day, 'd')}</p>
                      {daySessions.length > 0 && (
                        <Dot 
                          className={`w-4 h-4 ${
                            daySessions.some(s => s.status === 'confirmed') 
                              ? 'text-accent-green' 
                              : 'text-accent-yellow'
                          }`} 
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekDays.map((day, index) => {
                const daySessions = getSessionsForDate(day);
                return (
                  <div key={index} className="min-h-[100px] sm:min-h-[150px]">
                    <div className="h-full flex flex-col gap-1 sm:gap-2">
                      {daySessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          className={`p-2 rounded-lg text-xs text-left ${
                            session.status === 'confirmed'
                              ? 'bg-accent-green/20 border border-accent-green/30'
                              : 'bg-accent-yellow/20 border border-accent-yellow/30'
                          } hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-1">
                            {getSessionIcon(session.type)}
                            <span className="font-medium text-white truncate">{session.time}</span>
                          </div>
                          <p className="text-neutral-300 truncate">{session.clientName}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {getSessionsForDate(selectedDate).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-neutral-800/50 rounded-xl sm:rounded-2xl gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                      session.status === 'confirmed' ? 'bg-accent-green/20' : 'bg-accent-yellow/20'
                    }`}>
                      {getSessionIcon(session.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{session.clientName}</p>
                      <p className="text-neutral-300 text-xs sm:text-sm">{session.time} • {session.duration} min</p>
                    </div>
                  </div>
                  
                  <button className="bg-primary-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-xl hover:bg-primary-600 text-xs sm:text-sm">
                    Join
                  </button>
                </div>
              ))}
              
              {getSessionsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 sm:py-16">
                  <CalendarIcon className="w-12 sm:w-16 h-12 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-neutral-300 mb-1 sm:mb-2 text-sm sm:text-base">No sessions scheduled</p>
                  <p className="text-neutral-400 text-xs sm:text-sm">Add availability to accept bookings</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-800 w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Session Details</h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedSession.status === 'confirmed' ? 'bg-accent-green/20' : 'bg-accent-yellow/20'
                }`}>
                  {getSessionIcon(selectedSession.type)}
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{selectedSession.clientName}</h4>
                  <p className="text-neutral-300 text-sm">
                    {format(selectedSession.date, 'MMMM d, yyyy')} • {selectedSession.time}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-800/50 p-3 rounded-xl">
                  <p className="text-neutral-300 text-xs">Duration</p>
                  <p className="text-white font-medium">{selectedSession.duration} minutes</p>
                </div>
                
                <div className="bg-neutral-800/50 p-3 rounded-xl">
                  <p className="text-neutral-300 text-xs">Type</p>
                  <p className="text-white font-medium capitalize">{selectedSession.type}</p>
                </div>
                
                <div className="bg-neutral-800/50 p-3 rounded-xl">
                  <p className="text-neutral-300 text-xs">Status</p>
                  <p className={`font-medium ${
                    selectedSession.status === 'confirmed' ? 'text-accent-green' : 'text-accent-yellow'
                  }`}>
                    {selectedSession.status}
                  </p>
                </div>
              </div>
              
              <button className="w-full bg-primary-500 text-white py-2 sm:py-3 rounded-xl hover:bg-primary-600">
                Join Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Sessions Modal */}
      {showDayModal && selectedDaySessions.length > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-800 w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {format(selectedDaySessions[0].date, 'MMMM d, yyyy')}
              </h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3">
              {selectedDaySessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    setShowDayModal(false);
                    setShowModal(true);
                  }}
                  className="p-3 sm:p-4 bg-neutral-800/50 rounded-xl sm:rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.status === 'confirmed' ? 'bg-accent-green/20' : 'bg-accent-yellow/20'
                    }`}>
                      {getSessionIcon(session.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{session.clientName}</p>
                      <p className="text-neutral-300 text-xs sm:text-sm">{session.time}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                    session.status === 'confirmed'
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-accent-yellow/20 text-accent-yellow'
                  }`}>
                    {session.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSchedule;