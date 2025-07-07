import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Save, Trash2, Edit, Check, X, ChevronDown, ChevronUp, Settings, Copy } from 'lucide-react';
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
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5])); // Expand weekdays by default
  
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
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);

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

  const toggleDayExpansion = (dayOfWeek: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayOfWeek)) {
        newSet.delete(dayOfWeek);
      } else {
        newSet.add(dayOfWeek);
      }
      return newSet;
    });
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
    toast.success('Time slot added');
  };

  const removeTimeSlot = (dayOfWeek: number, slotId: string) => {
    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, timeSlots: day.timeSlots.filter(slot => slot.id !== slotId) }
          : day
      )
    );
    toast.success('Time slot removed');
  };

  const copyDaySchedule = (fromDay: number, toDay: number) => {
    const sourceDay = weeklyAvailability.find(day => day.dayOfWeek === fromDay);
    if (!sourceDay) return;

    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayOfWeek === toDay
          ? {
              ...day,
              isAvailable: sourceDay.isAvailable,
              timeSlots: sourceDay.timeSlots.map(slot => ({
                ...slot,
                id: `${toDay}-${Date.now()}-${Math.random()}`
              }))
            }
          : day
      )
    );
    toast.success(`Schedule copied to ${weeklyAvailability.find(d => d.dayOfWeek === toDay)?.dayName}`);
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
    setShowQuickTemplates(false);
    toast.success('Quick schedule applied');
  };

  const getTotalWeeklyHours = () => {
    return weeklyAvailability.reduce((total, day) => {
      return total + day.timeSlots.reduce((dayTotal, slot) => {
        const start = parseISO(`2000-01-01T${slot.startTime}`);
        const end = parseISO(`2000-01-01T${slot.endTime}`);
        return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
    }, 0);
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
    <div className="space-y-6 pb-6">
      {/* Mobile-Optimized Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Manage Availability</h1>
          <p className="text-cream-200 text-sm lg:text-base">Set your working hours and manage your schedule</p>
        </div>
        
        {/* Mobile-First Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Toggle */}
          <div className="flex bg-black/50 backdrop-blur-sm border border-cream-200/20 rounded-2xl p-1 flex-1 sm:flex-none">
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'weekly' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('special')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'special' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Special Dates
            </button>
          </div>
          
          {/* Save Button */}
          <button
            onClick={saveAvailability}
            disabled={saving}
            className="bg-primary-500 text-white px-4 py-2 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-cream-200/20">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
            <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500" />
            <span className="text-cream-200 text-xs lg:text-sm">Available Days</span>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-white">
            {weeklyAvailability.filter(day => day.isAvailable).length}/7
          </p>
        </div>
        
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-cream-200/20">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-accent-green" />
            <span className="text-cream-200 text-xs lg:text-sm">Weekly Hours</span>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-white">
            {getTotalWeeklyHours().toFixed(1)}h
          </p>
        </div>
        
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-cream-200/20 col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
            <Edit className="w-4 h-4 lg:w-5 lg:h-5 text-accent-yellow" />
            <span className="text-cream-200 text-xs lg:text-sm">Special Dates</span>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-white">{specialDates.length}</p>
        </div>
      </div>

      {/* Quick Templates - Mobile Optimized */}
      {viewMode === 'weekly' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-cream-200/20 overflow-hidden">
          <button
            onClick={() => setShowQuickTemplates(!showQuickTemplates)}
            className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-black/20 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Quick Templates</h2>
            </div>
            {showQuickTemplates ? (
              <ChevronUp className="w-5 h-5 text-cream-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-cream-200" />
            )}
          </button>
          
          {showQuickTemplates && (
            <div className="p-4 lg:p-6 border-t border-cream-200/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <button
                  onClick={() => generateQuickSchedule('business')}
                  className="p-3 lg:p-4 bg-black/30 border border-cream-200/10 rounded-xl lg:rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
                >
                  <h3 className="text-white font-medium mb-1 lg:mb-2 text-sm lg:text-base">Business Hours</h3>
                  <p className="text-cream-200 text-xs lg:text-sm">Mon-Fri, 9 AM - 5 PM</p>
                </button>
                
                <button
                  onClick={() => generateQuickSchedule('flexible')}
                  className="p-3 lg:p-4 bg-black/30 border border-cream-200/10 rounded-xl lg:rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
                >
                  <h3 className="text-white font-medium mb-1 lg:mb-2 text-sm lg:text-base">Flexible Hours</h3>
                  <p className="text-cream-200 text-xs lg:text-sm">Daily, 8 AM-12 PM & 6-9 PM</p>
                </button>
                
                <button
                  onClick={() => generateQuickSchedule('weekend')}
                  className="p-3 lg:p-4 bg-black/30 border border-cream-200/10 rounded-xl lg:rounded-2xl hover:bg-black/50 transition-colors duration-200 text-left"
                >
                  <h3 className="text-white font-medium mb-1 lg:mb-2 text-sm lg:text-base">Weekend Only</h3>
                  <p className="text-cream-200 text-xs lg:text-sm">Sat-Sun, 10 AM - 4 PM</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Schedule - Mobile Optimized */}
      {viewMode === 'weekly' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-cream-200/20 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-cream-200/20">
            <h2 className="text-lg lg:text-xl font-semibold text-white">Weekly Schedule</h2>
            <p className="text-cream-200 text-sm mt-1">Set your regular weekly availability</p>
          </div>

          <div className="divide-y divide-cream-200/10">
            {weeklyAvailability.map((day) => {
              const isExpanded = expandedDays.has(day.dayOfWeek);
              const hasTimeSlots = day.timeSlots.length > 0;
              
              return (
                <div key={day.dayOfWeek} className="bg-black/20">
                  {/* Day Header - Mobile Optimized */}
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
                        <button
                          onClick={() => toggleDayAvailability(day.dayOfWeek)}
                          className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                            day.isAvailable
                              ? 'bg-accent-green border-accent-green'
                              : 'border-cream-200/40'
                          }`}
                        >
                          {day.isAvailable && <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <h3 className="text-base lg:text-lg font-semibold text-white">{day.dayName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                              day.isAvailable
                                ? 'bg-accent-green/20 text-accent-green'
                                : 'bg-cream-200/20 text-cream-200'
                            }`}>
                              {day.isAvailable ? 'Available' : 'Off'}
                            </span>
                          </div>
                          
                          {/* Time slots summary for mobile */}
                          {day.isAvailable && hasTimeSlots && (
                            <p className="text-cream-200 text-xs lg:text-sm mt-1">
                              {day.timeSlots.length} slot{day.timeSlots.length !== 1 ? 's' : ''} • 
                              {day.timeSlots.reduce((total, slot) => {
                                const start = parseISO(`2000-01-01T${slot.startTime}`);
                                const end = parseISO(`2000-01-01T${slot.endTime}`);
                                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                              }, 0).toFixed(1)}h total
                            </p>
                          )}
                        </div>
                        
                        {day.isAvailable && (
                          <button
                            onClick={() => toggleDayExpansion(day.dayOfWeek)}
                            className="p-2 text-cream-200 hover:text-white transition-colors duration-200 lg:hidden"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Desktop controls */}
                      {day.isAvailable && (
                        <div className="hidden lg:flex items-center space-x-2">
                          <button
                            onClick={() => setEditingDay(editingDay === day.dayOfWeek ? null : day.dayOfWeek)}
                            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Slot</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Add Slot Button */}
                    {day.isAvailable && isExpanded && (
                      <div className="mt-3 lg:hidden">
                        <button
                          onClick={() => setEditingDay(editingDay === day.dayOfWeek ? null : day.dayOfWeek)}
                          className="w-full flex items-center justify-center space-x-2 p-2 bg-primary-500/20 border border-primary-500/30 rounded-xl text-primary-500 hover:bg-primary-500/30 transition-colors duration-200 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Time Slot</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time Slots - Mobile Optimized */}
                  {day.isAvailable && (isExpanded || window.innerWidth >= 1024) && (
                    <div className="px-4 pb-4 lg:p-6 lg:pt-0 space-y-3">
                      {/* Existing Time Slots */}
                      {day.timeSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-black/30 border border-cream-200/10 rounded-xl">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-white font-medium text-sm lg:text-base">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <div className="text-accent-green text-xs lg:text-sm">
                                LKR {slot.price?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Copy to other days */}
                            <div className="relative group">
                              <button className="text-cream-200 hover:text-white transition-colors duration-200 p-1">
                                <Copy className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-2 w-32 bg-black/90 border border-cream-200/20 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
                                <div className="p-2">
                                  <p className="text-cream-200 text-xs mb-2">Copy to:</p>
                                  {weeklyAvailability
                                    .filter(d => d.dayOfWeek !== day.dayOfWeek)
                                    .map(d => (
                                      <button
                                        key={d.dayOfWeek}
                                        onClick={() => copyDaySchedule(day.dayOfWeek, d.dayOfWeek)}
                                        className="w-full text-left px-2 py-1 text-xs text-cream-200 hover:text-white hover:bg-cream-200/10 rounded"
                                      >
                                        {d.dayName}
                                      </button>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeTimeSlot(day.dayOfWeek, slot.id)}
                              className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add New Time Slot Form */}
                      {editingDay === day.dayOfWeek && (
                        <div className="p-3 lg:p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Start</label>
                              <input
                                type="time"
                                value={newTimeSlot.startTime}
                                onChange={(e) => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">End</label>
                              <input
                                type="time"
                                value={newTimeSlot.endTime}
                                onChange={(e) => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white text-sm"
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="block text-sm font-medium text-white mb-1">Price (LKR)</label>
                              <input
                                type="number"
                                value={newTimeSlot.price}
                                onChange={(e) => setNewTimeSlot(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                                className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white text-sm"
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex items-end space-x-2">
                              <button
                                onClick={() => addTimeSlot(day.dayOfWeek)}
                                className="flex-1 bg-accent-green text-white px-3 py-2 rounded-xl hover:bg-accent-green/90 transition-colors duration-200 flex items-center justify-center"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingDay(null)}
                                className="flex-1 bg-black/50 border border-cream-200/20 text-white px-3 py-2 rounded-xl hover:bg-black/70 transition-colors duration-200 flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {day.timeSlots.length === 0 && editingDay !== day.dayOfWeek && (
                        <div className="text-center py-6 lg:py-8">
                          <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-cream-200/40 mx-auto mb-2" />
                          <p className="text-cream-200/60 text-sm">No time slots set</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Special Dates - Mobile Optimized */}
      {viewMode === 'special' && (
        <div className="bg-cream-50/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-cream-200/20 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-cream-200/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-white">Special Dates</h2>
                <p className="text-cream-200 text-sm mt-1">Manage holidays, vacations, and special availability</p>
              </div>
              <button
                onClick={() => setShowAddSpecialDate(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Date</span>
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {/* Add Special Date Form */}
            {showAddSpecialDate && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Date</label>
                    <input
                      type="date"
                      value={newSpecialDate.date}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Status</label>
                    <select
                      value={newSpecialDate.isAvailable ? 'available' : 'unavailable'}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, isAvailable: e.target.value === 'available' }))}
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white text-sm"
                    >
                      <option value="unavailable">Unavailable</option>
                      <option value="available">Available</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-white mb-1">Reason</label>
                    <input
                      type="text"
                      value={newSpecialDate.reason}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Holiday, Vacation, etc."
                      className="w-full p-2 border border-cream-200/20 rounded-xl bg-black/50 text-white placeholder-cream-200/60 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 flex items-end space-x-2">
                    <button
                      onClick={addSpecialDate}
                      className="flex-1 bg-accent-green text-white px-3 py-2 rounded-xl hover:bg-accent-green/90 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowAddSpecialDate(false)}
                      className="flex-1 bg-black/50 border border-cream-200/20 text-white px-3 py-2 rounded-xl hover:bg-black/70 transition-colors duration-200 flex items-center justify-center"
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
                  <div key={specialDate.id} className="flex items-center justify-between p-3 lg:p-4 bg-black/30 border border-cream-200/10 rounded-xl">
                    <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm lg:text-base">
                          {format(parseISO(specialDate.date), 'MMM d, yyyy')}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            specialDate.isAvailable
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {specialDate.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {specialDate.reason && (
                            <span className="text-cream-200 text-xs lg:text-sm">{specialDate.reason}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSpecialDate(specialDate.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 lg:py-16">
                <Calendar className="w-12 h-12 lg:w-16 lg:h-16 text-cream-200/40 mx-auto mb-4" />
                <p className="text-cream-200 mb-2">No special dates set</p>
                <p className="text-cream-200/60 text-sm">Add holidays, vacations, or special availability dates</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistAvailability;