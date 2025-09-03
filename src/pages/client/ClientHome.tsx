import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, User, Clock, Plus, Video, Star, Search, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTherapists } from '../../hooks/useTherapists';
import TherapistCard from '../../components/TherapistCard';

const ClientHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch therapists for the "Find Therapist" section
  const { therapists, loading: therapistsLoading } = useTherapists({ useFirebase: false });
  const featuredTherapists = therapists.slice(0, 3); // Show top 3 therapists

  // Mock data - in real app, this would come from Firestore
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
              {/* Welcome back, {user?.displayName || 'User'}! */}
              Welcome to Kalm
            </h1>
            <p className="text-neutral-300 mb-4">
              {user?.isAnonymous 
                ? 'Continue your anonymous wellness journey with complete privacy.'
                : 'Continue your mental wellness journey with personalized support.'
              }
            </p>
            {user?.isAnonymous && (<></>
              // <div className="inline-flex items-center space-x-2 bg-accent-green/20 text-accent-green px-4 py-2 rounded-full text-sm">
              //   <div className="w-2 h-2 bg-accent-green rounded-full"></div>
              //   <span>Anonymous Account Active</span>
              // </div>
            )}
          </div>
          {/* <div className="hidden lg:block">
            <div className="w-32 h-32 bg-primary-500/20 rounded-full flex items-center justify-center">
              <User className="w-16 h-16 text-primary-500" />
            </div>
          </div> */}
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

      {/*Mobile Quick Actions*/}
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
          <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-neutral-800/50 rounded-lg sm:rounded-xl md:rounded-2xl gap-2 sm:gap-0">
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
                {/* Optional: Add date/time if needed */}
                <p className="text-neutral-300 text-xs sm:text-sm">{session.date} at {session.time}</p>
                <span className="bg-accent-green/20 text-accent-green px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                {session.status}
              </span>
              </div>
            </div>
            <div className="flex items-center justify-end sm:justify-normal space-x-2 sm:space-x-3 ml-0 sm:ml-4">
              {/* <span className="bg-accent-green/20 text-accent-green px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                {session.status}
              </span> */}
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

      {/* Featured Therapists Section */}
      {/*
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Featured Therapists</h2>
            <p className="text-neutral-300 text-sm">Connect with our top-rated mental health professionals</p>
          </div>
          <button
            onClick={() => navigate('/client/therapists')}
            className="text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
          >
            View All Therapists
          </button>
        </div>

        {therapistsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : featuredTherapists.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTherapists.map((therapist) => (
              <div key={therapist.id} className="bg-neutral-800/50 rounded-2xl p-4 hover:bg-neutral-800/70 transition-colors duration-200">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{therapist.name}</h3>
                    <p className="text-primary-500 text-sm">{therapist.specialty}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-accent-yellow fill-current" />
                      <span className="text-neutral-300 text-sm">{therapist.rating}</span>
                      <span className="text-neutral-400 text-sm">({therapist.reviewCount})</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Languages:</span>
                    <span className="text-neutral-300">{therapist.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Rate:</span>
                    <span className="text-accent-green font-medium">LKR {therapist.hourlyRate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Availability:</span>
                    <span className={`${therapist.isAvailable ? 'text-accent-green' : 'text-neutral-400'}`}>
                      {therapist.availability}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookSession(therapist)}
                  className="w-full bg-primary-500 text-white py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-300 mb-2">No therapists available</p>
            <button
              onClick={() => navigate('/client/therapists')}
              className="text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm"
            >
              Browse All Therapists
            </button>
          </div>
        )}
      </div>
      */}

      {/* Session Types Info */}
      {/*
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold text-white mb-6">Available Session Types</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-neutral-800/50 rounded-2xl">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-white font-semibold mb-2">Video Sessions</h3>
            <p className="text-neutral-300 text-sm">Face-to-face therapy with full video and audio communication</p>
          </div>
          
          <div className="text-center p-4 bg-neutral-800/50 rounded-2xl">
            <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-accent-green" />
            </div>
            <h3 className="text-white font-semibold mb-2">Audio Sessions</h3>
            <p className="text-neutral-300 text-sm">Voice-only therapy sessions for those who prefer audio communication</p>
          </div>
          
          <div className="text-center p-4 bg-neutral-800/50 rounded-2xl">
            <div className="w-16 h-16 bg-accent-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-accent-yellow" />
            </div>
            <h3 className="text-white font-semibold mb-2">Chat Sessions</h3>
            <p className="text-neutral-300 text-sm">Text-based therapy sessions for written communication</p>
          </div>
        </div>
      </div>
        */}

      {/* Wellness Tips */}
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