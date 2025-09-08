import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, User, Clock, Plus, Video, Star, Search, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTherapists } from '../../hooks/useTherapists';
import TherapistCard from '../../components/TherapistCard';

const ClientHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch therapists
  const { therapists, loading: therapistsLoading } = useTherapists({ useFirebase: false });
  const featuredTherapists = therapists.slice(0, 3);

  // Mock data
  const upcomingSessions = [
    {
      id: '1',
      therapist: 'Dr. Priya Perera',
      date: '2024-01-15',
      time: '2:00 PM',
      type: 'video',
      status: 'confirmed'
    },
    {
      id: '2',
      therapist: 'Dr. Rohan Silva',
      date: '2024-01-18',
      time: '10:00 AM',
      type: 'audio',
      status: 'confirmed'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'session_completed',
      message: 'Session with Dr. Priya Perera completed',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'booking_confirmed',
      message: 'Booking confirmed for Jan 18',
      time: '1 day ago'
    }
  ];

  const quickActions = [
    {
      title: 'Book New Session',
      description: 'Find and book a session with a therapist',
      icon: Plus,
      color: 'bg-primary-500',
      action: () => navigate('/client/book')
    },
    {
      title: 'My Sessions',
      description: 'View and join your appointments',
      icon: Calendar,
      color: 'bg-accent-green',
      action: () => navigate('/client/sessions')
    },
    {
      title: 'Messages',
      description: 'Chat with your therapists',
      icon: MessageCircle,
      color: 'bg-accent-yellow',
      action: () => navigate('/client/messages')
    },
    {
      title: 'Find Therapists',
      description: 'Browse our network of professionals',
      icon: Search,
      color: 'bg-accent-orange',
      action: () => navigate('/client/therapists')
    }
  ];

  const handleBookSession = (therapist: any) => {
    navigate('/client/book', { 
      state: { 
        preSelectedTherapist: therapist.id,
        therapistName: therapist.name,
        returnTo: 'booking'
      } 
    });
  };

  const wellnessTip = {
    title: "Practice Mindful Breathing",
    text: "Take 5 minutes today to focus on your breath. Inhale slowly for 4 counts, hold for 4 counts, and exhale for 6 counts. This simple practice can help reduce stress and improve your overall well-being."
  };

  const [showWellnessTip, setShowWellnessTip] = useState(false);
  const wellnessTipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShowWellnessTip(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (wellnessTipRef.current) {
      observer.observe(wellnessTipRef.current);
    }
    return () => {
      if (wellnessTipRef.current) {
        observer.unobserve(wellnessTipRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500/20 to-accent-green/20 rounded-3xl p-8 border border-primary-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Kalm
            </h1>
            <p className="text-neutral-300 mb-4">
              {user?.isAnonymous 
                ? 'Continue your anonymous wellness journey with complete privacy.'
                : 'Continue your mental wellness journey with personalized support.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hidden md:block">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-2 text-left"
              >
                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-neutral-300 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="block md:hidden">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-neutral-300 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Upcoming Sessions</h2>
            <button
              onClick={() => navigate('/client/sessions')}
              className="text-primary-500 hover:text-primary-600 transition-colors duration-200 text-xs sm:text-sm"
            >
              View All
            </button>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {upcomingSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-neutral-800/50 rounded-lg sm:rounded-xl md:rounded-2xl"
                >
                  {/* Left side */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      {session.type === 'video' ? (
                        <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                      ) : (
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{session.therapist}</p>
                      <p className="text-neutral-300 text-xs sm:text-sm">{session.date} at {session.time}</p>
                      <span className="bg-accent-green/20 text-accent-green px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                        {session.status}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center ml-4">
                    <button 
                      onClick={() => navigate('/client/sessions')}
                      className="bg-primary-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl hover:bg-primary-600 transition-colors duration-200 text-xs sm:text-sm"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-neutral-300 mb-2 text-sm sm:text-base">No upcoming sessions</p>
              <button
                onClick={() => navigate('/client/book')}
                className="bg-primary-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-primary-600 transition-colors duration-200 text-sm sm:text-base"
              >
                Book Your First Session
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-neutral-800/50 rounded-lg sm:rounded-xl md:rounded-2xl">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-accent-green rounded-full mt-2 sm:mt-2.5 flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-white text-sm sm:text-base line-clamp-2">{activity.message}</p>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-neutral-300 text-sm sm:text-base">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Tip */}
      <div
        ref={wellnessTipRef}
        className={`bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800 shadow-2xl
          transition-all duration-1000 ease-out
          ${showWellnessTip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}
        `}
      >
        <h2 className="text-xl font-semibold text-white mb-6">Daily Wellness Tip</h2>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent-yellow/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-accent-yellow" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">{wellnessTip.title}</h3>
            <p className="text-neutral-300 leading-relaxed">
              {wellnessTip.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;
