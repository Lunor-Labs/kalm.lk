import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Users,
  Plus,
  X,
  Dot,
} from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  startOfDay,
  endOfDay,
  endOfWeek,
} from 'date-fns';
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
    nextSessionTime: '',
  });

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, selectedDate]);

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('therapistId', '==', user.uid),
        where('status', 'in', ['scheduled', 'confirmed']),
        orderBy('scheduledTime', 'asc')
      );

      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map((doc) => {
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
          time: format(scheduledTime, 'h:mm a'),
          date: scheduledTime,
          type: data.sessionType || 'video',
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
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);
    const startThisWeek = startOfWeek(today);
    const endThisWeek = endOfWeek(today);

    const todaysSessions = sessionsData.filter(
      (s) => s.scheduledTime >= startToday && s.scheduledTime <= endToday
    ).length;

    const thisWeekSessions = sessionsData.filter(
      (s) => s.scheduledTime >= startThisWeek && s.scheduledTime <= endThisWeek
    ).length;

    const uniqueClients = new Set(sessionsData.map((s) => s.clientId)).size;

    const upcoming = sessionsData
      .filter((s) => s.scheduledTime > today)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    const nextSessionTime = upcoming.length > 0 ? format(upcoming[0].scheduledTime, 'h:mm a') : 'None';

    setStats({
      todaysSessions,
      thisWeekSessions,
      totalClients: uniqueClients,
      nextSessionTime,
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(selectedDate), i)
  );

  const getSessionsForDate = (date: Date) =>
    sessions.filter((session) => isSameDay(session.date, date));

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Clock className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">Please log in to view your schedule</p>
          <p className="text-gray-500">You need to be authenticated as a therapist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and availability</p>
        </div>

        <div className="flex flex-col xs:flex-row gap-3">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => navigate('/therapist/availability')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors font-medium"
          >
            <Plus size={18} />
            Add Availability
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "Today's Sessions", value: stats.todaysSessions, icon: CalendarIcon, color: 'blue-600' },
          { title: 'This Week', value: stats.thisWeekSessions, icon: Clock, color: 'emerald-600' },
          { title: 'Total Clients', value: stats.totalClients, icon: Users, color: 'amber-600' },
          { title: 'Next Session', value: stats.nextSessionTime, icon: Video, color: 'purple-600' },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              <span className="text-sm font-medium text-gray-600">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? -7 : -1))}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Today
              </button>

              <button
                onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? 7 : 1))}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="p-4 sm:p-6">
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => {
                const daySessions = getSessionsForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDayClick(day)}
                    className={`py-3 px-2 rounded-xl text-center transition-colors ${
                      isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        isToday ? 'text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      {format(day, 'd')}
                    </p>
                    {daySessions.length > 0 && (
                      <Dot
                        className={`mx-auto mt-1 w-6 h-6 ${
                          daySessions.some((s) => s.status === 'confirmed')
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Week cells */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const daySessions = getSessionsForDate(day);

                return (
                  <div key={day.toString()} className="min-h-[160px] space-y-2">
                    {daySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        className={`w-full p-3 rounded-xl text-left transition-all text-sm border ${
                          session.status === 'confirmed'
                            ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getSessionIcon(session.type)}
                          <span className="font-semibold text-gray-900">{session.time}</span>
                        </div>
                        <p className="text-gray-700 truncate">{session.clientName}</p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {getSessionsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-20">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No sessions scheduled today
                </h3>
                <p className="text-gray-500">Add your availability to accept bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getSessionsForDate(selectedDate).map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          session.status === 'confirmed' ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}
                      >
                        {getSessionIcon(session.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{session.clientName}</p>
                        <p className="text-gray-600 text-sm">
                          {session.time} • {session.duration} min
                        </p>
                      </div>
                    </div>
                    <button className="mt-4 sm:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Session Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedSession.status === 'confirmed' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}
                >
                  {getSessionIcon(selectedSession.type)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedSession.clientName}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {format(selectedSession.date, 'MMMM d, yyyy')} • {selectedSession.time}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{selectedSession.duration} minutes</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedSession.type}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p
                    className={`font-medium ${
                      selectedSession.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {selectedSession.status}
                  </p>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors font-medium">
                Join Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Sessions Modal */}
      {showDayModal && selectedDaySessions.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {format(selectedDaySessions[0].date, 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedDaySessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    setShowDayModal(false);
                    setShowModal(true);
                  }}
                  className="p-4 bg-gray-50 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.status === 'confirmed' ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}
                    >
                      {getSessionIcon(session.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.clientName}</p>
                      <p className="text-sm text-gray-600">{session.time}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {session.status}
                  </span>
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