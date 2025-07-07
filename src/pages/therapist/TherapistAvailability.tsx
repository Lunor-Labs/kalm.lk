import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Save, Trash2, Edit, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format, addDays, startOfWeek, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import toast from 'react-hot-toast';

interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  isRecurring: boolean;
  price?: number;
}

interface DayAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface SpecialDate {
  id: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  reason?: string;
  timeSlots?: TimeSlot[];
}

const TherapistAvailability: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'special'>('weekly');
  
  // Weekly recurring availability
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayAvailability[]>([
    { dayOfWeek: 1, dayName: 'Monday', isAvailable: true, timeSlots: [] },
    { dayOfWeek: 2, dayName: 'Tuesday', isAvailable: true, timeSlots: [] },
    { dayOfWeek: 3, dayName: 'Wednesday', isAvailable: true, timeSlots: [] },
    { dayOfWeek: 4, dayName: 'Thursday', isAvailable: true, timeSlots: [] },
    { dayOfWeek: 5, dayName: 'Friday', isAvailable: true, timeSlots: [] },
    { dayOfWeek: 6, dayName: 'Saturday', isAvailable: false, timeSlots: [] },
    { dayOfWeek: 0, dayName: 'Sunday', isAvailable: false, timeSlots: [] },
  ]);

  // Special dates (holidays, vacations, etc.)
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  
  // UI state
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState({ startTime: '09:00', endTime: '10:00', price: 4500 });
  const [showAddSpecialDate, setShowAddSpecialDate] = useState(false);
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    isAvailable: false,
    reason: ''
  });

  useEffect(() => {
    loadAvailability();
  }, [user]);

  const loadAvailability = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, this would fetch from Firestore
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data with some pre-filled slots
      const mockWeeklyAvailability = weeklyAvailability.map(day => {
        if (day.dayOfWeek >= 1 && day.dayOfWeek <= 5) { // Weekdays
          return {
            ...day,
            timeSlots: [
              {
                id: `${day.dayOfWeek}-1`,
                startTime: '09:00',
                endTime: '12:00',
                isAvailable: true,
                isRecurring: true,
                price: 4500
              },
              {
                id: `${day.dayOfWeek}-2`,
                startTime: '14:00',
                endTime: '17:00',
                isAvailable: true,
                isRecurring: true,
                price: 4500
              }
            ]
          };
        }
        return day;
      });
      
      setWeeklyAvailability(mockWeeklyAvailability);
      
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Availability saved successfully');
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const toggleDayAvailability = (dayOfWeek: number) => {
    setWeeklyAvailability(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, isAvailable: !day.isAvailable, timeSlots: !day.isAvailable ? [] : day.timeSlots }
          : day
      )
    );
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: TimeSlot = {
      id: `${dayOfWeek}-${Date.now()}`,
      startTime: newTimeSlot.startTime,
      endTime: newTimeSlot.endTime,
      isAvailable: true,
      isRecurring: true,
      price: newTimeSlot.price
    };

    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, timeSlots: [...day.timeSlots, newSlot] }
          : day
      )
    );

    setNewTimeSlot({ startTime: '09:00', endTime: '10:00', price: 4500 });
    setEditingDay(null);
  };

  const removeTimeSlot = (dayOfWeek: number, slotId: string) => {
    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, timeSlots: day.timeSlots.filter(slot => slot.id !== slotId) }
          : day
      )
    );
  };

  const addSpecialDate = () => {
    const specialDate: SpecialDate = {
      id: Date.now().toString(),
      date: newSpecialDate.date,
      isAvailable: newSpecialDate.isAvailable,
      reason: newSpecialDate.reason,
      timeSlots: newSpecialDate.isAvailable ? [] : undefined
    };

    setSpecialDates(prev => [...prev, specialDate]);
    setNewSpecialDate({
      date: format(new Date(), 'yyyy-MM-dd'),
      isAvailable: false,
      reason: ''
    });
    setShowAddSpecialDate(false);
    toast.success('Special date added');
  };

  const removeSpecialDate = (id: string) => {
    setSpecialDates(prev => prev.filter(date => date.id !== id));
    toast.success('Special date removed');
  };

  const generateQuickSchedule = (type: 'business' | 'flexible' | 'weekend') => {
    let newSchedule: DayAvailability[] = [];

    switch (type) {
      case 'business':
        newSchedule = weeklyAvailability.map(day => ({
          ...day,
          isAvailable: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
          timeSlots: day.dayOfWeek >= 1 && day.dayOfWeek <= 5 ? [
            {
              id: `${day.dayOfWeek}-business`,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true,
              isRecurring: true,
              price: 4500
            }
          ] : []
        }));
        break;
      
      case 'flexible':
        newSchedule = weeklyAvailability.map(day => ({
          ...day,
          isAvailable: true,
          timeSlots: [
            {
              id: `${day.dayOfWeek}-morning`,
              startTime: '08:00',
              endTime: '12:00',
              isAvailable: true,
              isRecurring: true,
              price: 4500
            },
            {
              id: `${day.dayOfWeek}-evening`,
              startTime: '18:00',
              endTime: '21:00',
              isAvailable: true,
              isRecurring: true,
              price: 5000
            }
          ]
        }));
        break;
      
      case 'weekend':
        newSchedule = weeklyAvailability.map(day => ({
          ...day,
          isAvailable: day.dayOfWeek === 0 || day.dayOfWeek === 6,
          timeSlots: day.dayOfWeek === 0 || day.dayOfWeek === 6 ? [
            {
              id: `${day.dayOfWeek}-weekend`,
              startTime: '10:00',
              endTime: '16:00',
              isAvailable: true,
              isRecurring: true,
              price: 5500
            }
          ] : []
        }));
        break;
    }

    setWeeklyAvailability(newSchedule);
    toast.success('Quick schedule applied');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Availability</h1>
          <p className="text-cream-200">Set your working hours and manage your schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-black/50 backdrop-blur-sm border border-cream-200/20 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'weekly' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('special')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'special' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Special Dates
            </button>
          </div>
          
          <button
            onClick={saveAvailability}
            disabled={saving}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Quick Schedule Templates */}
      {viewMode === 'weekly' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Schedule Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => generateQuickSchedule('business')}
              className="p-4 bg-black/30 border border-cream-200/10 rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
            >
              <h3 className="text-white font-medium mb-2">Business Hours</h3>
              <p className="text-cream-200 text-sm">Monday-Friday, 9 AM - 5 PM</p>
            </button>
            
            <button
              onClick={() => generateQuickSchedule('flexible')}
              className="p-4 bg-black/30 border border-cream-200/10 rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
            >
              <h3 className="text-white font-medium mb-2">Flexible Hours</h3>
              <p className="text-cream-200 text-sm">Daily, 8 AM - 12 PM & 6 PM - 9 PM</p>
            </button>
            
            <button
              onClick={() => generateQuickSchedule('weekend')}
              className="p-4 bg-black/30 border border-cream-200/10 rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
            >
              <h3 className="text-white font-medium mb-2">Weekend Only</h3>
              <p className="text-cream-200 text-sm">Saturday-Sunday, 10 AM - 4 PM</p>
            </button>
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      {viewMode === 'weekly' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl border border-cream-200/20 overflow-hidden">
          <div className="p-6 border-b border-cream-200/20">
            <h2 className="text-xl font-semibold text-white">Weekly Recurring Schedule</h2>
            <p className="text-cream-200 text-sm mt-1">Set your regular weekly availability</p>
          </div>

          <div className="p-6 space-y-6">
            {weeklyAvailability.map((day) => (
              <div key={day.dayOfWeek} className="border border-cream-200/20 rounded-2xl overflow-hidden">
                {/* Day Header */}
                <div className="flex items-center justify-between p-4 bg-black/30">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleDayAvailability(day.dayOfWeek)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                        day.isAvailable
                          ? 'bg-accent-green border-accent-green'
                          : 'border-cream-200/40'
                      }`}
                    >
                      {day.isAvailable && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <h3 className="text-lg font-semibold text-white">{day.dayName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      day.isAvailable
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-cream-200/20 text-cream-200'
                    }`}>
                      {day.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  {day.isAvailable && (
                    <button
                      onClick={() => setEditingDay(editingDay === day.dayOfWeek ? null : day.dayOfWeek)}
                      className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add Time Slot</span>
                    </button>
                  )}
                </div>

                {/* Time Slots */}
                {day.isAvailable && (
                  <div className="p-4 space-y-4">
                    {/* Existing Time Slots */}
                    {day.timeSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-black/30 border border-cream-200/10 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <Clock className="w-4 h-4 text-primary-500" />
                          <span className="text-white font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-accent-green text-sm">
                            LKR {slot.price?.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => removeTimeSlot(day.dayOfWeek, slot.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add New Time Slot */}
                    {editingDay === day.dayOfWeek && (
                      <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                            <input
                              type="time"
                              value={newTimeSlot.startTime}
                              onChange={(e) => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                              className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">End Time</label>
                            <input
                              type="time"
                              value={newTimeSlot.endTime}
                              onChange={(e) => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                              className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Price (LKR)</label>
                            <input
                              type="number"
                              value={newTimeSlot.price}
                              onChange={(e) => setNewTimeSlot(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                              className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white"
                            />
                          </div>
                          <div className="flex items-end space-x-2">
                            <button
                              onClick={() => addTimeSlot(day.dayOfWeek)}
                              className="bg-accent-green text-white px-4 py-2 rounded-xl hover:bg-accent-green/90 transition-colors duration-200"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingDay(null)}
                              className="bg-black/50 border border-cream-200/20 text-white px-4 py-2 rounded-xl hover:bg-black/70 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {day.timeSlots.length === 0 && editingDay !== day.dayOfWeek && (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-cream-200/40 mx-auto mb-2" />
                        <p className="text-cream-200/60 text-sm">No time slots set for this day</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Dates */}
      {viewMode === 'special' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl border border-cream-200/20 overflow-hidden">
          <div className="p-6 border-b border-cream-200/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Special Dates</h2>
                <p className="text-cream-200 text-sm mt-1">Manage holidays, vacations, and special availability</p>
              </div>
              <button
                onClick={() => setShowAddSpecialDate(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Special Date</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Add Special Date Form */}
            {showAddSpecialDate && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Date</label>
                    <input
                      type="date"
                      value={newSpecialDate.date}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <select
                      value={newSpecialDate.isAvailable ? 'available' : 'unavailable'}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, isAvailable: e.target.value === 'available' }))}
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white"
                    >
                      <option value="unavailable">Unavailable</option>
                      <option value="available">Available</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Reason</label>
                    <input
                      type="text"
                      value={newSpecialDate.reason}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Holiday, Vacation, etc."
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white placeholder-cream-200/60"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={addSpecialDate}
                      className="bg-accent-green text-white px-4 py-2 rounded-xl hover:bg-accent-green/90 transition-colors duration-200"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowAddSpecialDate(false)}
                      className="bg-black/50 border border-cream-200/20 text-white px-4 py-2 rounded-xl hover:bg-black/70 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Special Dates List */}
            {specialDates.length > 0 ? (
              <div className="space-y-3">
                {specialDates.map((specialDate) => (
                  <div key={specialDate.id} className="flex items-center justify-between p-4 bg-black/30 border border-cream-200/10 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-white font-medium">
                          {format(parseISO(specialDate.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            specialDate.isAvailable
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {specialDate.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {specialDate.reason && (
                            <span className="text-cream-200 text-sm">{specialDate.reason}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSpecialDate(specialDate.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-cream-200/40 mx-auto mb-4" />
                <p className="text-cream-200 mb-2">No special dates set</p>
                <p className="text-cream-200/60 text-sm">Add holidays, vacations, or special availability dates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-cream-200 text-sm">Available Days</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {weeklyAvailability.filter(day => day.isAvailable).length}/7
          </p>
        </div>
        
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-accent-green" />
            <span className="text-cream-200 text-sm">Weekly Hours</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {weeklyAvailability.reduce((total, day) => {
              return total + day.timeSlots.reduce((dayTotal, slot) => {
                const start = parseISO(`2000-01-01T${slot.startTime}`);
                const end = parseISO(`2000-01-01T${slot.endTime}`);
                return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              }, 0);
            }, 0).toFixed(1)}h
          </p>
        </div>
        
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
          <div className="flex items-center space-x-3 mb-2">
            <Edit className="w-5 h-5 text-accent-yellow" />
            <span className="text-cream-200 text-sm">Special Dates</span>
          </div>
          <p className="text-2xl font-bold text-white">{specialDates.length}</p>
        </div>
      </div>
    </div>
  );
};

export default TherapistAvailability;