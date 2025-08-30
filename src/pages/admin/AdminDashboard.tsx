import React, { useState, useEffect } from 'react';
import { Users, Calendar, CreditCard, TrendingUp, Clock, CheckCircle, UserCheck, Crown } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalTherapists: number;
  totalAdmins: number;
  totalSessions: number;
  todaySessions: number;
  activeSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  totalBookings: number;
  monthlyBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'session_booked' | 'session_completed' | 'therapist_joined';
  message: string;
  timestamp: Date;
  userRole?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        usersData,
        sessionsData,
        bookingsData,
        recentActivityData
      ] = await Promise.all([
        loadUsersStats(),
        loadSessionsStats(),
        loadBookingsStats(),
        loadRecentActivity()
      ]);

      setStats({
        ...usersData,
        ...sessionsData,
        ...bookingsData
      });

      setRecentActivity(recentActivityData);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersStats = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let totalClients = 0;
      let totalTherapists = 0;
      let totalAdmins = 0;

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        totalUsers++;
        
        switch (userData.role) {
          case 'client':
            totalClients++;
            break;
          case 'therapist':
            totalTherapists++;
            break;
          case 'admin':
            totalAdmins++;
            break;
        }
      });

      return {
        totalUsers,
        totalClients,
        totalTherapists,
        totalAdmins
      };
    } catch (error) {
      console.error('Error loading users stats:', error);
      return {
        totalUsers: 0,
        totalClients: 0,
        totalTherapists: 0,
        totalAdmins: 0
      };
    }
  };

  const loadSessionsStats = async () => {
    try {
      const sessionsRef = collection(db, 'sessions');
      const sessionsSnapshot = await getDocs(sessionsRef);
      
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      let totalSessions = 0;
      let todaySessions = 0;
      let activeSessions = 0;
      let completedSessions = 0;
      let scheduledSessions = 0;

      sessionsSnapshot.docs.forEach(doc => {
        const sessionData = doc.data();
        const scheduledTime = sessionData.scheduledTime?.toDate();
        
        totalSessions++;
        
        // Count today's sessions
        if (scheduledTime && scheduledTime >= todayStart && scheduledTime <= todayEnd) {
          todaySessions++;
        }
        
        // Count by status
        switch (sessionData.status) {
          case 'active':
            activeSessions++;
            break;
          case 'completed':
            completedSessions++;
            break;
          case 'scheduled':
            scheduledSessions++;
            break;
        }
      });

      return {
        totalSessions,
        todaySessions,
        activeSessions,
        completedSessions,
        scheduledSessions
      };
    } catch (error) {
      console.error('Error loading sessions stats:', error);
      return {
        totalSessions: 0,
        todaySessions: 0,
        activeSessions: 0,
        completedSessions: 0,
        scheduledSessions: 0
      };
    }
  };


  const loadRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent user signups
      const usersRef = collection(db, 'users');
      const recentUsersQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(5));
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      
      recentUsersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const createdAt = userData.createdAt?.toDate() || new Date();
        
        activities.push({
          id: `user-${doc.id}`,
          type: userData.role === 'therapist' ? 'therapist_joined' : 'user_signup',
          message: userData.role === 'therapist' 
            ? `New therapist ${userData.displayName || 'Unknown'} joined`
            : `New ${userData.role} ${userData.displayName || 'user'} signed up`,
          timestamp: createdAt,
          userRole: userData.role
        });
      });

      // Get recent sessions
      const sessionsRef = collection(db, 'sessions');
      const recentSessionsQuery = query(sessionsRef, orderBy('createdAt', 'desc'), limit(5));
      const recentSessionsSnapshot = await getDocs(recentSessionsQuery);
      
      recentSessionsSnapshot.docs.forEach(doc => {
        const sessionData = doc.data();
        const createdAt = sessionData.createdAt?.toDate() || new Date();
        
        if (sessionData.status === 'completed') {
          activities.push({
            id: `session-completed-${doc.id}`,
            type: 'session_completed',
            message: `Session completed with ${sessionData.therapistName || 'therapist'}`,
            timestamp: createdAt
          });
        } else if (sessionData.status === 'scheduled') {
          activities.push({
            id: `session-booked-${doc.id}`,
            type: 'session_booked',
            message: `New session booked with ${sessionData.therapistName || 'therapist'}`,
            timestamp: createdAt
          });
        }
      });

      // Sort by timestamp and return latest 10
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      return [];
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <Users className="w-4 h-4 text-primary-500" />;
      case 'therapist_joined': return <UserCheck className="w-4 h-4 text-accent-green" />;
      case 'session_booked': return <Calendar className="w-4 h-4 text-accent-yellow" />;
      case 'session_completed': return <CheckCircle className="w-4 h-4 text-accent-green" />;
      default: return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-neutral-300 mb-6">{error}</p>
        <button
          onClick={loadDashboardData}
          className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-neutral-300">Monitor your platform's performance and activity</p>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</h3>
              <p className="text-neutral-400 text-sm mb-2">Total Users</p>
              <p className="text-accent-green text-sm">All registered users</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalClients}</h3>
              <p className="text-neutral-400 text-sm mb-2">Total Clients</p>
              <p className="text-accent-green text-sm">Active client accounts</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-green rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalTherapists}</h3>
              <p className="text-neutral-400 text-sm mb-2">Total Therapists</p>
              <p className="text-accent-green text-sm">Licensed professionals</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-yellow rounded-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-black" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAdmins}</h3>
              <p className="text-neutral-400 text-sm mb-2">Total Admins</p>
              <p className="text-accent-green text-sm">Platform administrators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Session Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalSessions}</h3>
              <p className="text-neutral-400 text-sm mb-2">Total Sessions</p>
              <p className="text-accent-green text-sm">All time sessions</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-yellow rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-black" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.todaySessions}</h3>
              <p className="text-neutral-400 text-sm mb-2">Today's Sessions</p>
              <p className="text-accent-green text-sm">Scheduled for today</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-green rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.activeSessions}</h3>
              <p className="text-neutral-400 text-sm mb-2">Active Sessions</p>
              <p className="text-accent-green text-sm">Currently ongoing</p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-orange rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.completedSessions}</h3>
              <p className="text-neutral-400 text-sm mb-2">Completed Sessions</p>
              <p className="text-accent-green text-sm">Successfully finished</p>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      {/*
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <button
              onClick={loadDashboardData}
              className="text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm"
            >
              Refresh
            </button>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-neutral-800/50 rounded-2xl">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-neutral-400 text-xs">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  {activity.userRole && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.userRole === 'therapist' ? 'bg-accent-green/20 text-accent-green' :
                      activity.userRole === 'admin' ? 'bg-accent-yellow/20 text-accent-yellow' :
                      'bg-primary-500/20 text-primary-500'
                    }`}>
                      {activity.userRole}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-300">No recent activity</p>
            </div>
          )}
        </div>
      </div>
      
      */}


    </div>
  );
};

export default AdminDashboard;