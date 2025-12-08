/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  saveTherapistAvailability, 
  getTherapistAvailability
} from '../../lib/availability';
import toast from 'react-hot-toast';


const TherapistAvailability = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState(getDefaultWeeklySchedule());
  const [specialDates, setSpecialDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView] = useState<'calendar' | 'settings'>('calendar');
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showDateDetailsModal, setShowDateDetailsModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);

  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    isAvailable: true,
    isRecurring: false,
    sessionType: 'video' as 'video' | 'audio' | 'chat',
    price: 4500
  });

  // Load data on mount
  useEffect(() => {
    if (user?.uid) {
      loadAvailabilityData();
    }
  }, [user]);

  // Populate form when editing a slot
  useEffect(() => {
    if (editingTimeSlot && showTimeSlotModal) {
      setNewTimeSlot({
        startTime: editingTimeSlot.startTime,
        endTime: editingTimeSlot.endTime,
        isAvailable: editingTimeSlot.isAvailable ?? true,
        isRecurring: editingTimeSlot.isRecurring ?? false,
        sessionType: editingTimeSlot.sessionType || 'video',
        price: editingTimeSlot.price || 4500
      });
    } else if (!editingTimeSlot) {
      setNewTimeSlot({
        startTime: '09:00',
        endTime: '10:00',
        isAvailable: true,
        isRecurring: false,
        sessionType: 'video',
        price: 4500
      });
    }
  }, [editingTimeSlot, showTimeSlotModal]);

  const loadAvailabilityData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const availability = await getTherapistAvailability(user.uid);
      if (availability) {
      setWeeklySchedule((availability.weeklySchedule || getDefaultWeeklySchedule()) as any);
      setSpecialDates((availability.specialDates || []) as any);
      } else {
        setWeeklySchedule(getDefaultWeeklySchedule());
        setSpecialDates([]);
      }

    } catch (error: any) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  function getDefaultWeeklySchedule() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((dayName, index) => ({
      dayOfWeek: index,
      dayName,
      isAvailable: false,
      timeSlots: []
    }));
  }

  const getSelectedDateData = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const specialDate = specialDates.find((sd: any) => sd.date === dateString);

    if (specialDate) {
      return {
        isSpecialDate: true,
        isAvailable: (specialDate as any)?.isAvailable ?? false,
        timeSlots: (specialDate as any)?.timeSlots || [],
        reason: (specialDate as any)?.reason
      };
    }

    const dayOfWeek = selectedDate.getDay();
    const weeklyDay = weeklySchedule.find((day: any) => day.dayOfWeek === dayOfWeek);
    return {
      isSpecialDate: false,
      isAvailable: weeklyDay?.isAvailable || false,
      timeSlots: weeklyDay?.timeSlots || [],
      reason: undefined
    };
  };

  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast.error('Please select start and end times');
      return;
    }
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const timeSlotId = editingTimeSlot?.id || `slot-${Date.now()}`;
    const timeSlot = {
      id: timeSlotId,
      ...newTimeSlot
    };

    const dayOfWeek = selectedDate.getDay();

    const updatedSchedule = weeklySchedule.map(day =>
      day.dayOfWeek === dayOfWeek
        ? {
          ...day,
          timeSlots: editingTimeSlot
            ? day.timeSlots.map((ts: any) => (ts.id === timeSlotId ? timeSlot : ts))
            : [...day.timeSlots, timeSlot] as any
        }
        : day
    );

    setWeeklySchedule(updatedSchedule);

    // Auto-save to database
    try {
      if (user?.uid) {
        await saveTherapistAvailability(user.uid, updatedSchedule, specialDates);
        toast.success(editingTimeSlot ? 'Time slot updated' : 'Time slot added');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save time slot');
      // Revert on error
      setWeeklySchedule(weeklySchedule);
    }

    // Reset modal
    setEditingTimeSlot(null);
    setShowTimeSlotModal(false);
  };

  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    const dayOfWeek = selectedDate.getDay();
    const updatedSchedule = weeklySchedule.map(day =>
      day.dayOfWeek === dayOfWeek
        ? { ...day, timeSlots: day.timeSlots.filter((ts: any) => ts.id !== timeSlotId) }
        : day
    );

    setWeeklySchedule(updatedSchedule);

    // Auto-save to database
    try {
      if (user?.uid) {
        await saveTherapistAvailability(user.uid, updatedSchedule, specialDates);
        toast.success('Time slot deleted');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete time slot');
      // Revert on error
      setWeeklySchedule(weeklySchedule);
    }
  };

  const selectedDateData = getSelectedDateData();
  const dateString = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Availability Management</h1>
        <p className="text-gray-400 text-sm md:text-base">Manage your schedule and time slots</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <button
          className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-2xl text-xs md:text-sm font-medium transition-colors duration-200 bg-primary-500 text-white"
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Calendar</span>
        </button>
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-gray-700">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg">
                  Today
                </button>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-gray-700">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-3 text-center text-xs md:text-sm text-gray-400 font-medium">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {(() => {
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];

                for (let i = firstDay; i > 0; i--) {
                  days.push({ date: new Date(year, month - 1, new Date(year, month, 0).getDate() - i + 1), current: false });
                }
                for (let d = 1; d <= daysInMonth; d++) {
                  days.push({ date: new Date(year, month, d), current: true });
                }
                const remaining = (7 - (days.length % 7)) % 7;
                for (let i = 1; i <= remaining; i++) {
                  days.push({ date: new Date(year, month + 1, i), current: false });
                }

                return days.map((item, i) => {
                  const isToday = item.date.toDateString() === new Date().toDateString();
                  const isSelected = item.date.toDateString() === selectedDate.toDateString();
                  const hasSlots = weeklySchedule[item.date.getDay()]?.timeSlots.length > 0;

                  return (
                    <button
                      key={i}
                      disabled={!item.current}
                      onClick={() => {
                        setSelectedDate(item.date);
                        if (item.current) setShowDateDetailsModal(true);
                      }}
                      className={`w-full h-16 md:h-24 lg:h-28 rounded-lg flex items-center justify-center text-sm md:text-lg lg:text-xl font-medium relative transition-all ${
                        !item.current
                          ? 'text-gray-600'
                          : isSelected
                          ? 'bg-primary-500 text-white scale-110 shadow-lg'
                          : isToday
                          ? 'border-2 border-primary-500 text-primary-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {item.date.getDate()}
                      {item.current && hasSlots && (
                        <div className="absolute bottom-1 w-2 h-2 bg-primary-400 rounded-full"></div>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {showDateDetailsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50" onClick={() => setShowDateDetailsModal(false)}>
          <div className="bg-gray-800 w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{dateString}</h2>
              <button onClick={() => setShowDateDetailsModal(false)}><X size={28} /></button>
            </div>

            <label className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={selectedDateData.isAvailable}
                onChange={async (e) => {
                  const dayOfWeek = selectedDate.getDay();
                  const updatedSchedule = weeklySchedule.map(d => 
                    d.dayOfWeek === dayOfWeek ? { ...d, isAvailable: e.target.checked } : d
                  );
                  setWeeklySchedule(updatedSchedule);
                  
                  // Auto-save to database
                  try {
                    if (user?.uid) {
                      await saveTherapistAvailability(user.uid, updatedSchedule, specialDates);
                    }
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to save availability');
                    // Revert on error
                    setWeeklySchedule(weeklySchedule);
                  }
                }}
                className="w-5 h-5 rounded text-primary-500 bg-gray-700"
              />
              <span>Available on this date</span>
            </label>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Time Slots</h3>
                <button onClick={() => { setEditingTimeSlot(null); setShowTimeSlotModal(true); }} className="bg-primary-500 text-white p-2 rounded-lg p-2">
                  <Plus size={20} />
                </button>
              </div>

              {selectedDateData.timeSlots.length === 0 ? (
                <button onClick={() => setShowTimeSlotModal(true)} className="w-full py-8 border border-dashed border-gray-600 rounded-lg text-primary-400 hover:text-primary-300">
                  + Add your first time slot
                </button>
              ) : (
                <div className="space-y-3">
                  {selectedDateData.timeSlots.map((slot: any) => (
                    <div key={slot.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold">{slot.startTime} – {slot.endTime}</div>
                          <div className="text-sm text-gray-400 capitalize">{slot.sessionType}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">LKR {slot.price.toLocaleString()}</div>
                          <div className={slot.isAvailable ? 'text-primary-400' : 'text-red-400'}>
                            {slot.isAvailable ? 'Available' : 'Blocked'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTimeSlot(slot);
                            setShowTimeSlotModal(true);
                          }}
                          className="flex-1 py-2 border border-gray-600 rounded-lg text-sm flex items-center justify-center gap-1"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="flex-1 py-2 border border-red-600 text-red-400 rounded-lg text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50" onClick={() => setShowTimeSlotModal(false)}>
          <div className="bg-gray-800 w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingTimeSlot ? 'Edit' : 'Add'} Time Slot</h2>
              <button onClick={() => setShowTimeSlotModal(false)}><X size={28} /></button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                  <input type="time" value={newTimeSlot.startTime} onChange={e => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))} className="w-full p-3 bg-gray-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Time</label>
                  <input type="time" value={newTimeSlot.endTime} onChange={e => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))} className="w-full p-3 bg-gray-700 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Session Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['video', 'audio', 'chat'] as const).map(t => (
                    <label key={t} className="cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={newTimeSlot.sessionType === t}
                        onChange={() => setNewTimeSlot(prev => ({ ...prev, sessionType: t }))}
                        className="hidden"
                      />
                      <div className={`p-3 text-center rounded-lg font-medium ${newTimeSlot.sessionType === t ? 'bg-primary-500 text-white' : 'bg-gray-700'}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Price (LKR)</label>
                <input
                  type="number"
                  value={newTimeSlot.price}
                  onChange={e => setNewTimeSlot(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newTimeSlot.isAvailable}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="w-5 h-5 rounded text-primary-500 bg-gray-700"
                  />
                  <span>Available for booking</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newTimeSlot.isRecurring}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="w-5 h-5 rounded text-primary-500 bg-gray-700"
                  />
                  <span>Recurring weekly</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium"
                >
                  {editingTimeSlot ? 'Update' : 'Add'} Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistAvailability;