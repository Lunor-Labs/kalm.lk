import React from 'react';
import { Users, Calendar, CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data - in real app, this would come from Firestore
  const stats = [
    {
      title: 'Total Therapists',
      value: '24',
      change: '+2 this month',
      icon: Users,
      color: 'bg-primary-500'
    },
    {
      title: 'Active Bookings',
      value: '156',
      change: '+12% from last month',
      icon: Calendar,
      color: 'bg-accent-green'
    }
  ];

  const recentBookings = [
    {
      id: '1',
      client: 'Anonymous User',
      therapist: 'Dr. Priya Perera',
      date: '2024-01-15',
      time: '2:00 PM',
      status: 'confirmed',
      amount: 4500
    },
    {
      id: '2',
      client: 'John Doe',
      therapist: 'Dr. Rohan Silva',
      date: '2024-01-15',
      time: '3:30 PM',
      status: 'pending',
      amount: 5000
    },
    {
      id: '3',
      client: 'Anonymous User',
      therapist: 'Dr. Sanduni Wickramasinghe',
      date: '2024-01-16',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 3500
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-neutral-300">Monitor your platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-neutral-400 text-sm mb-2">{stat.title}</p>
                <p className="text-accent-green text-sm">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Recent Activity */}
      {/*
      <div className="grid lg:grid-cols-2 gap-8">
 
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Bookings</h2>
          
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-accent-green' : 'bg-accent-yellow'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium">{booking.client}</p>
                    <p className="text-neutral-300 text-sm">with {booking.therapist}</p>
                    <p className="text-neutral-400 text-xs">{booking.date} at {booking.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">LKR {booking.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' 
                      ? 'bg-accent-green/20 text-accent-green' 
                      : 'bg-accent-yellow/20 text-accent-yellow'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Quick Actions */}
        {/*
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center space-x-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl hover:bg-primary-500/20 transition-colors duration-200 text-left">
              <Users className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-white font-medium">Add New Therapist</p>
                <p className="text-neutral-300 text-sm">Onboard a new mental health professional</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-accent-green/10 border border-accent-green/20 rounded-2xl hover:bg-accent-green/20 transition-colors duration-200 text-left">
              <Calendar className="w-5 h-5 text-accent-green" />
              <div>
                <p className="text-white font-medium">View All Bookings</p>
                <p className="text-neutral-300 text-sm">Manage and monitor all sessions</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl hover:bg-accent-yellow/20 transition-colors duration-200 text-left">
              <CreditCard className="w-5 h-5 text-accent-yellow" />
              <div>
                <p className="text-white font-medium">Payment Reports</p>
                <p className="text-neutral-300 text-sm">View financial analytics and reports</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      */}

      {/* System Status */}
      {/*
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold text-white mb-6">System Status</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-accent-green" />
            <div>
              <p className="text-white font-medium">Payment Gateway</p>
              <p className="text-accent-green text-sm">Operational</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-accent-green" />
            <div>
              <p className="text-white font-medium">Video Conferencing</p>
              <p className="text-accent-green text-sm">Operational</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-accent-yellow" />
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-accent-yellow text-sm">Delayed</p>
            </div>
          </div>
        </div>
      </div> */}
    </div> 
  );
};

export default AdminDashboard;