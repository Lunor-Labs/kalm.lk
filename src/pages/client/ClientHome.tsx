import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, User, Clock, Plus, Video, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ClientHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      title: 'Find Therapists',
      description: 'Browse our network of mental health professionals',
      icon: User,
      color: 'bg-accent-green',
      action: () => navigate('/client/therapists')
    },
    {
      title: 'My Sessions',
      description: 'View and manage your appointments',
      icon: Calendar,
      color: 'bg-accent-yellow',
      action: () => navigate('/client/sessions')
    },
    {
      title: 'Messages',
      description: 'Chat with your therapists',
      icon: MessageCircle,
      color: 'bg-accent-orange',
      action: () => navigate('/client/messages')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500/20 to-accent-green/20 rounded-3xl p-8 border border-primary-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.displayName || 'User'}!
            </h1>
            <p className="text-neutral-300 mb-4">
              {user?.isAnonymous 
                ? 'Continue your anonymous wellness journey with complete privacy.'
                : 'Continue your mental wellness journey with personalized support.'
              }
            </p>
            {user?.isAnonymous && (
              <div className="inline-flex items-center space-x-2 bg-accent-green/20 text-accent-green px-4 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span>Anonymous Account Active</span>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-primary-500/20 rounded-full flex items-center justify-center">
              <User className="w-16 h-16 text-primary-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
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

      {/* Dashboard Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
            <button
              onClick={() => navigate('/client/sessions')}
              className="text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm"
            >
              View All
            </button>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                      {session.type === 'video' ? (
                        <Video className="w-6 h-6 text-primary-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-primary-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.therapist}</p>
                      <p className="text-neutral-300 text-sm">{session.date} at {session.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-accent-green/20 text-accent-green px-3 py-1 rounded-full text-xs">
                      {session.status}
                    </span>
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 text-sm">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-300 mb-2">No upcoming sessions</p>
              <button
                onClick={() => navigate('/client/book')}
                className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
              >
                Book Your First Session
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-2xl">
                  <div className="w-3 h-3 bg-accent-green rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white">{activity.message}</p>
                    <p className="text-neutral-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-300">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold text-white mb-6">Daily Wellness Tip</h2>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent-yellow/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-accent-yellow" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Practice Mindful Breathing</h3>
            <p className="text-neutral-300 leading-relaxed">
              Take 5 minutes today to focus on your breath. Inhale slowly for 4 counts, 
              hold for 4 counts, and exhale for 6 counts. This simple practice can help 
              reduce stress and improve your overall well-being.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;