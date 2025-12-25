import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, Clock, Plus, Video, Star, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTherapists } from '../../hooks/useTherapists';
import { getUserSessions } from '../../lib/sessions';
import { Session } from '../../types/session';
import { format, isFuture, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ClientHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const { therapists, loading: therapistsLoading } = useTherapists({ useFirebase: true });
  const featuredTherapists = therapists.slice(0, 3); // still unused but kept for future

  useEffect(() => {
    if (!user) {
      setLoadingSessions(false);
      return;
    }

    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        const userSessions = await getUserSessions(user.uid, 'client');
        setSessions(userSessions);
      } catch (error: any) {
        console.error('Failed to load sessions:', error);
        toast.error('Failed to load your sessions');
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [user]);

  // Upcoming sessions (top 3)
  const upcomingSessions = sessions
    .filter(
      (session) =>
        (session.status === 'scheduled' || session.status === 'active') &&
        isFuture(session.scheduledTime)
    )
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    .slice(0, 3)
    .map((session) => ({
      id: session.id,
      therapist: session.therapistName || 'Therapist',
      date: format(session.scheduledTime, 'MMM d, yyyy'),
      time: format(session.scheduledTime, 'h:mm a'),
      type: session.sessionType,
      status: session.status === 'active' ? 'Active' : 'Confirmed',
    }));

  // Recent activity
  const recentActivity = sessions
    .filter((session) => session.status === 'completed' || session.status === 'scheduled')
    .sort((a, b) => {
      const aTime = a.status === 'completed' && a.endTime ? a.endTime.getTime() : a.updatedAt.getTime();
      const bTime = b.status === 'completed' && b.endTime ? b.endTime.getTime() : b.updatedAt.getTime();
      return bTime - aTime;
    })
    .slice(0, 3)
    .map((session) => {
      const timeAgo =
        session.status === 'completed' && session.endTime
          ? formatDistanceToNow(session.endTime, { addSuffix: true })
          : formatDistanceToNow(session.updatedAt, { addSuffix: true });

      return {
        id: session.id,
        type: session.status === 'completed' ? 'session_completed' : 'booking_confirmed',
        message:
          session.status === 'completed'
            ? `Session with ${session.therapistName || 'therapist'} completed`
            : `Booking confirmed for ${format(session.scheduledTime, 'MMM d')}`,
        time: timeAgo,
      };
    });

  const quickActions = [
    {
      title: 'Book New Session',
      description: 'Find and book with a therapist',
      icon: Plus,
      color: 'bg-blue-600',
      action: () => navigate('/client/book'),
    },
    {
      title: 'My Sessions',
      description: 'View and join your appointments',
      icon: Calendar,
      color: 'bg-emerald-600',
      action: () => navigate('/client/sessions'),
    },
    {
      title: 'Find Therapists',
      description: 'Browse our network of professionals',
      icon: Search,
      color: 'bg-amber-600',
      action: () => navigate('/client/therapists'),
    },
  ];

  // Wellness tips (kept your original array)
  const wellnessTips = [
    {
      title: "Practice Mindful Breathing",
      text: "Take 5 minutes today to focus on your breath. Inhale slowly for 4 counts, hold for 4 counts, and exhale for 6 counts. This simple practice can help reduce stress and improve your overall well-being."
    },
    {
      title: "Take a Walk",
      text: "Step outside for a 10-minute walk. Movement and fresh air can boost your mood and reduce stress."
    },
    {
      title: "Gratitude Check",
      text: "Write down 3 things you're grateful for today. It trains your brain to focus on the good."
    },
    {
      title: "Ground Yourself",
      text: "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. A powerful anxiety-reducing tool."
    },
    {
      title: "Affirm Yourself",
      text: "Say something kind to yourself. Acknowledge your effort, not just results."
    },
    {
      title: "Check In With a Friend",
      text: "Text or call someone just to say hi. Connection matters more than you think."
    },
    {
      title: "Be Kind to Yourself",
      text: "Replace self-criticism with encouragement. You're doing your best."
    },
    {
      title: "Mood Tracker",
      text: "Rate your mood out of 10. Tracking builds awareness and patterns."
    },
    {
      title: "Sit With Sadness",
      text: "It's okay to feel low. Don't push it away. Acknowledge it gently."
    },
    {
      title: "Celebrate Rest",
      text: "Rest is productive. It helps you reset and prevents burnout."
    }
  ];

  const [showWellnessTip, setShowWellnessTip] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const wellnessTipRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoPlaying && showWellnessTip) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % wellnessTips.length);
      }, 5000);
    }
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlaying, showWellnessTip]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowWellnessTip(true);
      },
      { threshold: 0.5 }
    );
    if (wellnessTipRef.current) observer.observe(wellnessTipRef.current);
    return () => {
      if (wellnessTipRef.current) observer.unobserve(wellnessTipRef.current);
    };
  }, []);

  const goToPreviousTip = () => {
    setCurrentTipIndex((prev) => (prev === 0 ? wellnessTips.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % wellnessTips.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSpecificTip = (index: number) => {
    setCurrentTipIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentTip = wellnessTips[currentTipIndex];

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome to Kalm
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          {user?.isAnonymous
            ? 'Continue your anonymous wellness journey with complete privacy.'
            : 'Continue your mental wellness journey with personalized support.'}
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group bg-white rounded-2xl border border-gray-200 p-6 md:p-8 hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div
                  className={`w-16 h-16 ${action.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{action.title}</h3>
                <p className="text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming Sessions</h2>
            <button
              onClick={() => navigate('/client/sessions')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your sessions...</p>
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="space-y-5">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        session.type === 'video'
                          ? 'bg-blue-100'
                          : session.type === 'audio'
                          ? 'bg-emerald-100'
                          : 'bg-amber-100'
                      }`}
                    >
                      {session.type === 'video' ? (
                        <Video className="w-6 h-6 text-blue-600" />
                      ) : session.type === 'audio' ? (
                        <Clock className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <MessageCircle className="w-6 h-6 text-amber-600" />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{session.therapist}</p>
                      <p className="text-gray-600 mt-1">
                        {session.date} • {session.time}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 mt-2 rounded-full text-xs font-medium ${
                          session.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/client/session/${session.id}`)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap"
                  >
                    {session.status === 'Active' ? 'Join Now' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-xl mb-4">No upcoming sessions yet</p>
              <button
                onClick={() => navigate('/client/book')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Book Your First Session
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-xl">No recent activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Tips Carousel */}
      <div
        ref={wellnessTipRef}
        className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 transition-all duration-700 ${
          showWellnessTip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Daily Wellness Tip</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousTip}
              className="p-2.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextTip}
              className="p-2.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative min-h-[120px]">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-7 h-7 text-amber-600" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{currentTip.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{currentTip.text}</p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2.5 mt-8">
            {wellnessTips.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSpecificTip(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentTipIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Tip ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;