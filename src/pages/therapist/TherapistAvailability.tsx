import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Save, Settings, Copy, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import { format, isSameDay, addDays, startOfDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { 
  saveTherapistAvailability, 
  getTherapistAvailability, 
  saveAvailabilitySettings,
  getAvailabilitySettings 
} from '../../lib/availability';
import { 
  saveNotificationSettings, 
  getNotificationSettings 
} from '../../lib/notifications';
import { DayAvailability, SpecialDate, TimeSlot, AvailabilitySettings } from '../../types/availability';
import { NotificationSettings } from '../../lib/notifications';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const TherapistAvailability: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState<DayAvailability[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'weekly' | 'settings'>('calendar');
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [newTimeSlot, setNewTimeSlot] = useState<Partial<TimeSlot>>({
    startTime: '09:00',
    endTime: '10:00',
    isAvailable: true,
    isRecurring: false,
    sessionType: 'video',
    price: 4500
  });

  // Settings states
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (user) {
      loadAvailabilityData();
    }
  }, [user]);

  const loadAvailabilityData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load availability data
      const availability = await getTherapistAvailability(user.uid);
      if (availability) {
        setWeeklySchedule(availability.weeklySchedule);
        setSpecialDates(availability.specialDates);
      } else {
        // Initialize with default weekly schedule
        setWeeklySchedule(getDefaultWeeklySchedule());
      }

      // Load settings
      const settings = await getAvailabilitySettings(user.uid);
      setAvailabilitySettings(settings);

      const notifications = await getNotificationSettings(user.uid);
      setNotificationSettings(notifications);

    } catch (error: any) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultWeeklySchedule = (): DayAvailability[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((dayName, index) => ({
      dayOfWeek: index,
      dayName,
      isAvailable: false,
      timeSlots: []
    }));
  };

  const saveAvailability = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await saveTherapistAvailability(user.uid, weeklySchedule, specialDates);
      toast.success('Availability saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !availabilitySettings || !notificationSettings) return;

    try {
      setSaving(true);
      await saveAvailabilitySettings(user.uid, availabilitySettings);
      await saveNotificationSettings(user.uid, notificationSettings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedDateData = () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const specialDate = specialDates.find(sd => sd.date === dateString);
    
    if (specialDate) {
      return {
        isSpecialDate: true,
        isAvailable: specialDate.isAvailable,
        timeSlots: specialDate.timeSlots || [],
        reason: specialDate.reason
      };
    }

    const dayOfWeek = selectedDate.getDay();
    const weeklyDay = weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
    
    return {
      isSpecialDate: false,
      isAvailable: weeklyDay?.isAvailable || false,
      timeSlots: weeklyDay?.timeSlots || [],
      reason: undefined
    };
  };

  const updateSelectedDateAvailability = (isAvailable: boolean, reason?: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const existingSpecialDateIndex = specialDates.findIndex(sd => sd.date === dateString);
    
    if (existingSpecialDateIndex !== -1) {
      // Update existing special date
      const updatedSpecialDates = [...specialDates];
      updatedSpecialDates[existingSpecialDateIndex] = {
        ...updatedSpecialDates[existingSpecialDateIndex],
        isAvailable,
        reason
      };
      setSpecialDates(updatedSpecialDates);
    } else {
      // Create new special date
      const newSpecialDate: SpecialDate = {
        id: `special-${Date.now()}`,
        date: dateString,
        isAvailable,
        reason,
        timeSlots: []
      };
      setSpecialDates([...specialDates, newSpecialDate]);
    }
  };

  const addTimeSlotToSelectedDate = (timeSlot: TimeSlot) => {
    const selectedDateData = getSelectedDateData();
    
    if (selectedDateData.isSpecialDate) {
      // Add to special date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const updatedSpecialDates = specialDates.map(sd => {
        if (sd.date === dateString) {
          return {
            ...sd,
            timeSlots: [...(sd.timeSlots || []), timeSlot]
          };
        }
        return sd;
      });
      setSpecialDates(updatedSpecialDates);
    } else {
      // Add to weekly schedule
      const dayOfWeek = selectedDate.getDay();
      const updatedWeeklySchedule = weeklySchedule.map(day => {
        if (day.dayOfWeek === dayOfWeek) {
          return {
            ...day,
            timeSlots: [...day.timeSlots, timeSlot]
          };
        }
        return day;
      });
      setWeeklySchedule(updatedWeeklySchedule);
    }
  };

  const removeTimeSlotFromSelectedDate = (timeSlotId: string) => {
    const selectedDateData = getSelectedDateData();
    
    if (selectedDateData.isSpecialDate) {
      // Remove from special date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const updatedSpecialDates = specialDates.map(sd => {
        if (sd.date === dateString) {
          return {
            ...sd,
            timeSlots: (sd.timeSlots || []).filter(ts => ts.id !== timeSlotId)
          };
        }
        return sd;
      });
      setSpecialDates(updatedSpecialDates);
    } else {
      // Remove from weekly schedule
      const dayOfWeek = selectedDate.getDay();
      const updatedWeeklySchedule = weeklySchedule.map(day => {
        if (day.dayOfWeek === dayOfWeek) {
          return {
            ...day,
            timeSlots: day.timeSlots.filter(ts => ts.id !== timeSlotId)
          };
        }
        return day;
      });
      setWeeklySchedule(updatedWeeklySchedule);
    }
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast.error('Please select start and end times');
      return;
    }

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const timeSlot: TimeSlot = {
      id: editingTimeSlot?.id || `slot-${Date.now()}`,
      startTime: newTimeSlot.startTime!,
      endTime: newTimeSlot.endTime!,
      isAvailable: newTimeSlot.isAvailable ?? true,
      isRecurring: newTimeSlot.isRecurring ?? false,
      sessionType: newTimeSlot.sessionType || 'video',
      price: newTimeSlot.price || 4500
    };

    if (editingTimeSlot) {
      // Update existing time slot
      const selectedDateData = getSelectedDateData();
      
      if (selectedDateData.isSpecialDate) {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const updatedSpecialDates = specialDates.map(sd => {
          if (sd.date === dateString) {
            return {
              ...sd,
              timeSlots: (sd.timeSlots || []).map(ts => ts.id === editingTimeSlot.id ? timeSlot : ts)
            };
          }
          return sd;
        });
        setSpecialDates(updatedSpecialDates);
      } else {
        const dayOfWeek = selectedDate.getDay();
        const updatedWeeklySchedule = weeklySchedule.map(day => {
          if (day.dayOfWeek === dayOfWeek) {
            return {
              ...day,
              timeSlots: day.timeSlots.map(ts => ts.id === editingTimeSlot.id ? timeSlot : ts)
            };
          }
          return day;
        });
        setWeeklySchedule(updatedWeeklySchedule);
      }
    } else {
      // Add new time slot
      addTimeSlotToSelectedDate(timeSlot);
    }

    // Reset form
    setNewTimeSlot({
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true,
      isRecurring: false,
      sessionType: 'video',
      price: 4500
    });
    setEditingTimeSlot(null);
    setShowTimeSlotModal(false);
    toast.success(editingTimeSlot ? 'Time slot updated' : 'Time slot added');
  };

  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setNewTimeSlot({
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      isAvailable: timeSlot.isAvailable,
      isRecurring: timeSlot.isRecurring,
      sessionType: timeSlot.sessionType,
      price: timeSlot.price
    });
    setShowTimeSlotModal(true);
  };

  const updateWeeklySchedule = (dayOfWeek: number, updates: Partial<DayAvailability>) => {
    const updatedWeeklySchedule = weeklySchedule.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return { ...day, ...updates };
      }
      return day;
    });
    setWeeklySchedule(updatedWeeklySchedule);
  };

  const addTimeSlotToWeeklyDay = (dayOfWeek: number) => {
    const timeSlot: TimeSlot = {
      id: `weekly-${dayOfWeek}-${Date.now()}`,
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true,
      isRecurring: true,
      sessionType: 'video',
      price: 4500
    };

    const updatedWeeklySchedule = weeklySchedule.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          timeSlots: [...day.timeSlots, timeSlot]
        };
      }
      return day;
    });
    setWeeklySchedule(updatedWeeklySchedule);
  };

  const removeTimeSlotFromWeeklyDay = (dayOfWeek: number, timeSlotId: string) => {
    const updatedWeeklySchedule = weeklySchedule.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          timeSlots: day.timeSlots.filter(ts => ts.id !== timeSlotId)
        };
      }
      return day;
    });
    setWeeklySchedule(updatedWeeklySchedule);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const dateString = format(date, 'yyyy-MM-dd');
    const specialDate = specialDates.find(sd => sd.date === dateString);
    
    let timeSlots: TimeSlot[] = [];
    let isAvailable = false;

    if (specialDate) {
      timeSlots = specialDate.timeSlots || [];
      isAvailable = specialDate.isAvailable;
    } else {
      const dayOfWeek = date.getDay();
      const weeklyDay = weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
      timeSlots = weeklyDay?.timeSlots || [];
      isAvailable = weeklyDay?.isAvailable || false;
    }

    const availableSlots = timeSlots.filter(ts => ts.isAvailable).length;

    return (
      <div className="flex flex-col items-center mt-1">
        {isAvailable && availableSlots > 0 && (
          <div className="w-1.5 h-1.5 bg-accent-green rounded-full mb-1"></div>
        )}
        {availableSlots > 0 && (
          <span className="text-xs text-cream-200 font-medium">{availableSlots}</span>
        )}
      </div>
    );
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    const dateString = format(date, 'yyyy-MM-dd');
    const specialDate = specialDates.find(sd => sd.date === dateString);
    const isSelected = isSameDay(date, selectedDate);
    
    let className = 'hover:bg-cream-100/10 transition-all duration-200 ';

    if (isSelected) {
      className += 'bg-accent-green text-black font-semibold ';
    }

    if (specialDate) {
      if (specialDate.isAvailable) {
        className += 'border-l-2 border-accent-green ';
      } else {
        className += 'border-l-2 border-red-400 ';
      }
    } else {
      const dayOfWeek = date.getDay();
      const weeklyDay = weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
      if (weeklyDay?.isAvailable) {
        className += 'border-l-2 border-cream-200 ';
      }
    }

    return className;
  };

  const selectedDateData = getSelectedDateData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cream-50">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cream-50 mb-2">Availability Management</h1>
          <p className="text-cream-200">Manage your schedule and time slots</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-black/30 border border-cream-200/20 rounded-2xl p-1">
            {[
              { key: 'calendar', label: 'Calendar', icon: Calendar },
              { key: 'weekly', label: 'Weekly', icon: Clock },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeView === view.key 
                      ? 'bg-accent-green text-black shadow-lg' 
                      : 'text-cream-200 hover:text-cream-50 hover:bg-cream-100/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{view.label}</span>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={activeView === 'settings' ? saveSettings : saveAvailability}
            disabled={saving}
            className="bg-accent-green text-black px-6 py-3 rounded-2xl hover:bg-accent-green/90 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 font-medium shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
            <h2 className="text-xl font-semibold text-cream-50 mb-6">Calendar View</h2>
            
            <div className="calendar-container">
              <ReactCalendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileContent={getTileContent}
                tileClassName={getTileClassName}
                className="w-full bg-transparent text-cream-50 border-none"
                tileDisabled={({ date }) => date < startOfDay(new Date())}
                minDate={new Date()}
                maxDate={addDays(new Date(), 365)}
              />
            </div>

            <div className="mt-6 space-y-3 p-4 bg-black/20 rounded-2xl border border-cream-200/10">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <span className="text-cream-200">Available with time slots</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-3 h-3 bg-cream-200 rounded-full"></div>
                <span className="text-cream-200">Regular weekly schedule</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-cream-200">Unavailable</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-cream-50">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTimeSlotModal(true)}
                  className="bg-accent-green text-black p-2 rounded-xl hover:bg-accent-green/90 transition-all duration-200 shadow-lg"
                  title="Add time slot"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const yesterday = addDays(selectedDate, -1);
                    // copyTimeSlots(yesterday, selectedDate);
                  }}
                  className="bg-cream-200/20 text-cream-50 p-2 rounded-xl hover:bg-cream-200/30 transition-all duration-200 border border-cream-200/20"
                  title="Copy from previous day"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="mb-6 p-4 bg-black/20 rounded-2xl border border-cream-200/10">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedDateData.isAvailable}
                  onChange={(e) => updateSelectedDateAvailability(e.target.checked)}
                  className="w-5 h-5 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                />
                <span className="text-cream-50 font-medium">Available on this date</span>
              </label>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream-50">Time Slots</h3>
              
              {selectedDateData.timeSlots.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-2xl border border-cream-200/10">
                  <Clock className="w-12 h-12 text-cream-200/50 mx-auto mb-4" />
                  <p className="text-cream-200 mb-2">No time slots configured</p>
                  <button
                    onClick={() => setShowTimeSlotModal(true)}
                    className="text-accent-green hover:text-accent-green/80 transition-colors duration-200 text-sm font-medium"
                  >
                    Add your first time slot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateData.timeSlots.map((timeSlot) => (
                    <div
                      key={timeSlot.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        timeSlot.isAvailable
                          ? 'bg-accent-green/10 border-accent-green/30'
                          : 'bg-black/20 border-cream-200/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-cream-50 font-medium">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              timeSlot.sessionType === 'video' ? 'bg-accent-green/20 text-accent-green' :
                              timeSlot.sessionType === 'audio' ? 'bg-cream-200/20 text-cream-200' :
                              'bg-accent-green/20 text-accent-green'
                            }`}>
                              {timeSlot.sessionType}
                            </span>
                            {timeSlot.isRecurring && (
                              <span className="px-2 py-1 rounded-full text-xs bg-black/30 text-cream-200 border border-cream-200/20">
                                Recurring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-cream-200">
                            <span>LKR {timeSlot.price?.toLocaleString()}</span>
                            <span className={timeSlot.isAvailable ? 'text-accent-green' : 'text-cream-200/60'}>
                              {timeSlot.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTimeSlot(timeSlot)}
                            className="p-2 text-cream-200 hover:text-cream-50 transition-colors duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeTimeSlotFromSelectedDate(timeSlot.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly View */}
      {activeView === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-cream-50">Weekly Schedule Template</h2>
              <p className="text-cream-200 text-sm">Set your default weekly availability</p>
            </div>

            <div className="grid gap-4">
              {weeklySchedule.map((day) => (
                <div key={day.dayOfWeek} className="bg-black/20 rounded-2xl p-4 border border-cream-200/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => updateWeeklySchedule(day.dayOfWeek, { isAvailable: e.target.checked })}
                          className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                        />
                        <span className="text-cream-50 font-medium">{day.dayName}</span>
                      </label>
                    </div>
                    
                    {day.isAvailable && (
                      <button
                        onClick={() => addTimeSlotToWeeklyDay(day.dayOfWeek)}
                        className="bg-accent-green/20 text-accent-green p-2 rounded-xl hover:bg-accent-green/30 transition-all duration-200 border border-accent-green/30"
                        title="Add time slot"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {day.isAvailable && (
                    <div className="space-y-2">
                      {day.timeSlots.length === 0 ? (
                        <p className="text-cream-200/60 text-sm italic">No time slots configured</p>
                      ) : (
                        day.timeSlots.map((timeSlot) => (
                          <div
                            key={timeSlot.id}
                            className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-cream-200/10"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-cream-50 text-sm font-medium">
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-accent-green/20 text-accent-green">
                                {timeSlot.sessionType}
                              </span>
                              <span className="text-cream-200 text-sm">
                                LKR {timeSlot.price?.toLocaleString()}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => removeTimeSlotFromWeeklyDay(day.dayOfWeek, timeSlot.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && availabilitySettings && notificationSettings && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Availability Settings */}
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
              <h2 className="text-xl font-semibold text-cream-50 mb-6">Availability Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">Buffer Time (minutes)</label>
                  <input
                    type="number"
                    value={availabilitySettings.bufferTime}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      bufferTime: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50 placeholder-cream-200/50"
                    min="0"
                    max="60"
                  />
                  <p className="text-cream-200/60 text-xs mt-1">Time between sessions</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">Max Sessions Per Day</label>
                  <input
                    type="number"
                    value={availabilitySettings.maxSessionsPerDay}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      maxSessionsPerDay: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50 placeholder-cream-200/50"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">Advance Booking Days</label>
                  <input
                    type="number"
                    value={availabilitySettings.advanceBookingDays}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      advanceBookingDays: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50 placeholder-cream-200/50"
                    min="1"
                    max="365"
                  />
                  <p className="text-cream-200/60 text-xs mt-1">How far in advance clients can book</p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
              <h2 className="text-xl font-semibold text-cream-50 mb-6">Notification Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-cream-50 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.enabled}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: {
                            ...notificationSettings.emailNotifications,
                            enabled: e.target.checked
                          }
                        })}
                        className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                      />
                      <span className="text-cream-200">Enable email notifications</span>
                    </label>

                    {notificationSettings.emailNotifications.enabled && (
                      <div className="ml-7 space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications.sessionReminders}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                sessionReminders: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                          />
                          <span className="text-cream-200 text-sm">Session reminders</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications.newBookings}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                newBookings: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                          />
                          <span className="text-cream-200 text-sm">New bookings</span>
                        </label>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-cream-200 mb-2">Reminder Hours Before Session</label>
                          <input
                            type="number"
                            value={notificationSettings.emailNotifications.hoursBeforeSession}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                hoursBeforeSession: parseInt(e.target.value)
                              }
                            })}
                            className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50 placeholder-cream-200/50"
                            min="1"
                            max="168"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Types Pricing */}
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-cream-200/20">
            <h2 className="text-xl font-semibold text-cream-50 mb-6">Session Types & Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(availabilitySettings.sessionTypes).map(([type, config]) => (
                <div key={type} className="bg-black/20 rounded-2xl p-4 border border-cream-200/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-cream-50 capitalize">{type} Sessions</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => setAvailabilitySettings({
                          ...availabilitySettings,
                          sessionTypes: {
                            ...availabilitySettings.sessionTypes,
                            [type]: { ...config, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                      />
                    </label>
                  </div>
                  
                  {config.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-cream-200 mb-2">Price (LKR)</label>
                      <input
                        type="number"
                        value={config.price}
                        onChange={(e) => setAvailabilitySettings({
                          ...availabilitySettings,
                          sessionTypes: {
                            ...availabilitySettings.sessionTypes,
                            [type]: { ...config, price: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50 placeholder-cream-200/50"
                        min="0"
                        step="100"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTimeSlotModal(false)}></div>
          
          <div className="relative bg-black/80 backdrop-blur-sm rounded-3xl p-6 w-full max-w-md border border-cream-200/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cream-50">
                {editingTimeSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h3>
              <button
                onClick={() => {
                  setShowTimeSlotModal(false);
                  setEditingTimeSlot(null);
                  setNewTimeSlot({
                    startTime: '09:00',
                    endTime: '10:00',
                    isAvailable: true,
                    isRecurring: false,
                    sessionType: 'video',
                    price: 4500
                  });
                }}
                className="text-cream-200 hover:text-cream-50 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                    className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                    className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">Session Type</label>
                <select
                  value={newTimeSlot.sessionType}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, sessionType: e.target.value as any })}
                  className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50"
                >
                  <option value="video">Video Session</option>
                  <option value="audio">Audio Session</option>
                  <option value="chat">Chat Session</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">Price (LKR)</label>
                <input
                  type="number"
                  value={newTimeSlot.price}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, price: parseInt(e.target.value) })}
                  className="w-full p-3 border border-cream-200/20 rounded-2xl focus:ring-2 focus:ring-accent-green focus:border-transparent bg-black/20 text-cream-50"
                  min="0"
                  step="100"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newTimeSlot.isAvailable}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                  />
                  <span className="text-cream-50">Available for booking</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newTimeSlot.isRecurring}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-cream-200/30 text-accent-green focus:ring-accent-green focus:ring-offset-0 bg-black/20"
                  />
                  <span className="text-cream-50">Recurring weekly</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowTimeSlotModal(false);
                    setEditingTimeSlot(null);
                    setNewTimeSlot({
                      startTime: '09:00',
                      endTime: '10:00',
                      isAvailable: true,
                      isRecurring: false,
                      sessionType: 'video',
                      price: 4500
                    });
                  }}
                  className="flex-1 bg-black/40 border border-cream-200/20 text-cream-50 py-3 rounded-2xl hover:bg-black/60 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex-1 bg-accent-green text-black py-3 rounded-2xl hover:bg-accent-green/90 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingTimeSlot ? 'Update' : 'Add'} Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Calendar Styles */}
      <style jsx global>{`
        .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
          color: #FEF9F1 !important;
        }
        
        .react-calendar__navigation {
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(254, 249, 241, 0.1) !important;
          border-radius: 1rem !important;
          margin-bottom: 1rem !important;
          padding: 0.5rem !important;
        }
        
        .react-calendar__navigation button {
          background: transparent !important;
          color: #FEF9F1 !important;
          border: none !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          padding: 0.75rem 1rem !important;
          border-radius: 0.75rem !important;
          transition: all 0.2s !important;
        }
        
        .react-calendar__navigation button:hover {
          background: rgba(166, 227, 176, 0.1) !important;
          color: #A6E3B0 !important;
        }
        
        .react-calendar__navigation button:disabled {
          background: transparent !important;
          color: rgba(254, 249, 241, 0.3) !important;
        }
        
        .react-calendar__month-view__weekdays {
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(254, 249, 241, 0.1) !important;
          border-radius: 0.75rem !important;
          margin-bottom: 0.5rem !important;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          color: #E9E1D4 !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          padding: 0.75rem 0.25rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        .react-calendar__tile {
          background: rgba(0, 0, 0, 0.2) !important;
          color: #FEF9F1 !important;
          border: 1px solid rgba(254, 249, 241, 0.1) !important;
          border-radius: 0.75rem !important;
          margin: 0.125rem !important;
          padding: 0.75rem 0.25rem !important;
          font-weight: 500 !important;
          min-height: 3.5rem !important;
          position: relative !important;
          transition: all 0.2s !important;
        }
        
        .react-calendar__tile:hover {
          background: rgba(166, 227, 176, 0.1) !important;
          border-color: rgba(166, 227, 176, 0.3) !important;
          transform: translateY(-1px) !important;
        }
        
        .react-calendar__tile--active {
          background: #A6E3B0 !important;
          color: #000000 !important;
          border-color: #A6E3B0 !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(166, 227, 176, 0.3) !important;
        }
        
        .react-calendar__tile--now {
          background: rgba(166, 227, 176, 0.15) !important;
          border-color: #A6E3B0 !important;
          color: #A6E3B0 !important;
        }
        
        .react-calendar__tile:disabled {
          background: rgba(0, 0, 0, 0.1) !important;
          color: rgba(254, 249, 241, 0.3) !important;
          border-color: rgba(254, 249, 241, 0.05) !important;
        }
        
        .react-calendar__tile--hasActive {
          background: rgba(166, 227, 176, 0.2) !important;
        }
        
        @media (max-width: 768px) {
          .react-calendar__tile {
            min-height: 3rem !important;
            padding: 0.5rem 0.125rem !important;
            font-size: 0.875rem !important;
            margin: 0.0625rem !important;
          }
          
          .react-calendar__navigation button {
            font-size: 0.875rem !important;
            padding: 0.5rem 0.75rem !important;
          }
          
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.75rem !important;
            padding: 0.5rem 0.125rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TherapistAvailability;