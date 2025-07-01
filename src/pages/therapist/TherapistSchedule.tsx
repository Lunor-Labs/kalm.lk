import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const TherapistSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Mock data - in real app, this would come from Firestore
  const sessions = [
    {
      id: '1',
      clientName: 'Anonymous User',
      time: '10:00 AM',
      duration: 60,
      type: 'video',
      status: 'confirmed',
      date: new Date()
    },
    {
      id: '2',
      clientName: 'John D.',
      time: '2:00 PM',
      duration: 60,
      type: 'audio',
      status: 'confirmed',
      date: new Date()
    },
    {
      id: '3',
      clientName: 'Anonymous User',
      time: '4:00 PM',
      duration: 60,
      type: 'video',
      status: 'pending',
      date: addDays(new Date(), 1)
    }
  ];

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Schedule</h1>
          <p className="text-neutral-300">Manage your appointments and availability</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-neutral-800 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'week' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'day' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
          
          <button className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Availability</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Today's Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-accent-green" />
            <span className="text-neutral-300 text-sm">This Week</span>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-sm">Total Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">45</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Video className="w-5 h-5 text-accent-orange" />
            <span className="text-neutral-300 text-sm">Next Session</span>
          </div>
          <p className="text-lg font-bold text-white">10:00 AM</p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors duration-200 text-sm"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const daySessions = getSessionsForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-3 rounded-2xl ${
                      isToday ? 'bg-primary-500 text-white' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                      <p className="text-lg font-bold">{format(day, 'd')}</p>
                    </div>
                    
                    <div className="space-y-2 min-h-[200px]">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-xl text-xs ${
                            session.status === 'confirmed'
                              ? 'bg-accent-green/20 border border-accent-green/30'
                              : 'bg-accent-yellow/20 border border-accent-yellow/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {getSessionIcon(session.type)}
                            <span className="font-medium text-white">{session.time}</span>
                          </div>
                          <p className="text-neutral-300">{session.clientName}</p>
                          <p className={`text-xs ${
                            session.status === 'confirmed' ? 'text-accent-green' : 'text-accent-yellow'
                          }`}>
                            {session.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {getSessionsForDate(selectedDate).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-2xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      session.status === 'confirmed' ? 'bg-accent-green/20' : 'bg-accent-yellow/20'
                    }`}>
                      {getSessionIcon(session.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.clientName}</p>
                      <p className="text-neutral-300 text-sm">{session.time} • {session.duration} min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      session.status === 'confirmed'
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-accent-yellow/20 text-accent-yellow'
                    }`}>
                      {session.status}
                    </span>
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 text-sm">
                      Join Session
                    </button>
                  </div>
                </div>
              ))}
              
              {getSessionsForDate(selectedDate).length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-300 mb-2">No sessions scheduled for this day</p>
                  <p className="text-neutral-400 text-sm">Add availability to start accepting bookings</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistSchedule;