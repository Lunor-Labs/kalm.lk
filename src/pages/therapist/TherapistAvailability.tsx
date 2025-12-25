/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  saveTherapistAvailability,
  getTherapistAvailability
} from '../../lib/availability';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

const TherapistAvailability = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState(getDefaultWeeklySchedule());
  const [specialDates, setSpecialDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showDateDetailsModal, setShowDateDetailsModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);

  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: false,
    sessionType: 'video' as 'video' | 'audio' | 'chat',
    price: 4500
  });

  useEffect(() => {
    if (user?.uid) {
      loadAvailabilityData();
    }
  }, [user]);

  useEffect(() => {
    if (editingTimeSlot && showTimeSlotModal) {
      setNewTimeSlot({
        startTime: editingTimeSlot.startTime,
        endTime: editingTimeSlot.endTime,
        isRecurring: editingTimeSlot.isRecurring ?? false,
        sessionType: editingTimeSlot.sessionType || 'video',
        price: editingTimeSlot.price || 4500
      });
    } else if (!editingTimeSlot) {
      setNewTimeSlot({
        startTime: '09:00',
        endTime: '10:00',
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
        setWeeklySchedule(availability.weeklySchedule || getDefaultWeeklySchedule());
        setSpecialDates(availability.specialDates || []);
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
      timeSlots: []
    }));
  }

  const getSelectedDateData = () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const specialDate = specialDates.find((sd: any) => sd.date === dateString);

    const dayOfWeek = selectedDate.getDay();
    const weeklyDay = weeklySchedule.find((day: any) => day.dayOfWeek === dayOfWeek);

    const weeklySlots = weeklyDay?.timeSlots || [];
    const specialSlots = specialDate?.timeSlots || [];

    const allSlots = [
      ...weeklySlots.map((slot: any) => ({ ...slot, source: 'weekly' })),
      ...specialSlots.map((slot: any) => ({ ...slot, source: 'special' }))
    ];

    return {
      isSpecialDate: !!specialDate,
      timeSlots: allSlots,
      reason: specialDate?.reason
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

  // Parse times into minutes for easy calculation
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const startMinutes = parseTime(newTimeSlot.startTime);
  const endMinutes = parseTime(newTimeSlot.endTime);

  // Generate hourly slots
  const generatedSlots: any[] = [];
  let currentStart = startMinutes;

  while (currentStart + 60 <= endMinutes) {
    const startHour = Math.floor(currentStart / 60).toString().padStart(2, '0');
    const startMin = (currentStart % 60).toString().padStart(2, '0');
    const endHour = Math.floor((currentStart + 60) / 60).toString().padStart(2, '0');
    const endMin = ((currentStart + 60) % 60).toString().padStart(2, '0');

    const timeSlotId = editingTimeSlot?.id || `slot-${Date.now()}-${generatedSlots.length}`;

    generatedSlots.push({
      id: timeSlotId,
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
      isAvailable: true,
      isRecurring: newTimeSlot.isRecurring,
      sessionType: newTimeSlot.sessionType,
      price: newTimeSlot.price,
    });

    currentStart += 60;
  }

  if (generatedSlots.length === 0) {
    toast.error('The selected time range must allow at least one full hour slot');
    return;
  }

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  let updatedSchedule = [...weeklySchedule];
  let updatedSpecialDates = [...specialDates];

  if (newTimeSlot.isRecurring) {
    // Add all generated hourly slots to the weekly schedule for this day
    const dayOfWeek = selectedDate.getDay();

    updatedSchedule = weeklySchedule.map(day =>
      day.dayOfWeek === dayOfWeek
        ? {
            ...day,
            timeSlots: editingTimeSlot
              ? day.timeSlots
                  .filter((ts: any) => ts.id !== editingTimeSlot.id) // remove old if editing
                  .concat(generatedSlots)
              : [...day.timeSlots, ...generatedSlots]
          }
        : day
    );
  } else {
    // Add to special date
    const existingSpecialDateIndex = updatedSpecialDates.findIndex(
      (sd: any) => sd.date === dateString
    );

    if (existingSpecialDateIndex >= 0) {
      const existing = updatedSpecialDates[existingSpecialDateIndex];
      updatedSpecialDates[existingSpecialDateIndex] = {
        ...existing,
        timeSlots: editingTimeSlot
          ? existing.timeSlots
              .filter((ts: any) => ts.id !== editingTimeSlot.id)
              .concat(generatedSlots)
          : [...existing.timeSlots, ...generatedSlots]
      };
    } else {
      updatedSpecialDates.push({
        date: dateString,
        timeSlots: generatedSlots,
        reason: 'One-time availability'
      });
    }
  }

  setWeeklySchedule(updatedSchedule as any);
  setSpecialDates(updatedSpecialDates);

  // Save to DB
  try {
    if (user?.uid) {
      await saveTherapistAvailability(user.uid, updatedSchedule, updatedSpecialDates);
      toast.success(
        editingTimeSlot
          ? `Updated ${generatedSlots.length} hourly slot(s)`
          : `Added ${generatedSlots.length} hourly slot(s)`
      );
    }
  } catch (error: any) {
    toast.error('Failed to save time slots');
    // Revert changes on error
    setWeeklySchedule(weeklySchedule);
    setSpecialDates(specialDates);
  }

  // Reset modal
  setEditingTimeSlot(null);
  setShowTimeSlotModal(false);
};

  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = selectedDate.getDay();

    let updatedSchedule = [...weeklySchedule];
    let updatedSpecialDates = [...specialDates];

    // Try weekly
    const weeklyDayIndex = updatedSchedule.findIndex(d => d.dayOfWeek === dayOfWeek);
    if (weeklyDayIndex !== -1) {
      const day = updatedSchedule[weeklyDayIndex];
      if (day.timeSlots.some((ts: any) => ts.id === timeSlotId)) {
        updatedSchedule[weeklyDayIndex] = {
          ...day,
          timeSlots: day.timeSlots.filter((ts: any) => ts.id !== timeSlotId)
        };
      }
    }

    // Try special date
    const specialIndex = updatedSpecialDates.findIndex(sd => sd.date === dateString);
    if (specialIndex !== -1) {
      const sd = updatedSpecialDates[specialIndex];
      if (sd.timeSlots.some((ts: any) => ts.id === timeSlotId)) {
        updatedSpecialDates[specialIndex] = {
          ...sd,
          timeSlots: sd.timeSlots.filter((ts: any) => ts.id !== timeSlotId)
        };
      }
    }

    setWeeklySchedule(updatedSchedule);
    setSpecialDates(updatedSpecialDates);

    try {
      if (user?.uid) {
        await saveTherapistAvailability(user.uid, updatedSchedule, updatedSpecialDates);
        toast.success('Time slot deleted');
      }
    } catch (error) {
      toast.error('Failed to delete slot');
      loadAvailabilityData(); // revert
    }
  };

  const selectedDateData = getSelectedDateData();
  const dateString = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Availability Management</h1>
        <p className="text-gray-600 mt-1">Set and manage your available time slots</p>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(subMonths(startOfMonth(selectedDate), 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              Today
            </button>

            <button
              onClick={() => setSelectedDate(addMonths(startOfMonth(selectedDate), 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 px-4 pt-4 text-center text-xs font-medium text-gray-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 p-4">
          {(() => {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const firstDayOfMonth = startOfMonth(selectedDate);
            const firstDay = firstDayOfMonth.getDay();
            const daysInMonth = endOfMonth(selectedDate).getDate();

            const days = [];

            // Previous month padding
            for (let i = firstDay; i > 0; i--) {
              days.push({ date: new Date(year, month, 0).getDate() - i + 1, currentMonth: false });
            }

            // Current month
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();

              const dayOfWeek = date.getDay();
              const hasWeekly = weeklySchedule[dayOfWeek]?.timeSlots?.length > 0;

              const dateStr = format(date, 'yyyy-MM-dd');
              const hasSpecial = specialDates.some(sd => sd.date === dateStr && sd.timeSlots?.length > 0);

              const hasSlots = hasWeekly || hasSpecial;

              days.push({
                date,
                day: d,
                currentMonth: true,
                isToday,
                isSelected,
                hasSlots
              });
            }

            // Next month padding
            const remaining = (7 - (days.length % 7)) % 7;
            for (let i = 1; i <= remaining; i++) {
              days.push({ date: new Date(year, month + 1, i), currentMonth: false });
            }

            return days.map((item, index) => (
              <button
                key={index}
                type="button"
                disabled={!item.currentMonth}
                onClick={() => {
                  if (item.currentMonth) {
                    setSelectedDate(item.date);
                    setShowDateDetailsModal(true);
                  }
                }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative
                  transition-all duration-200
                  ${!item.currentMonth 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : item.isSelected 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : item.isToday 
                        ? 'border-2 border-blue-400 text-blue-700 hover:bg-blue-50' 
                        : 'hover:bg-gray-100 text-gray-800'
                  }
                `}
              >
                {item.day || ''}
                {item.currentMonth && item.hasSlots && (
                  <span className="absolute bottom-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Date Details Modal */}
      {showDateDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDateDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">{dateString}</h2>
              <button 
                onClick={() => setShowDateDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-800">Available Time Slots</h3>
                <button
                  onClick={() => {
                    setEditingTimeSlot(null);
                    setShowTimeSlotModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <Plus size={16} /> Add Slot
                </button>
              </div>

              {selectedDateData.timeSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No time slots scheduled</p>
                  <button
                    onClick={() => setShowTimeSlotModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add your first time slot
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateData.timeSlots.map((slot: any) => (
                    <div 
                      key={slot.id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <div className="text-sm text-gray-600 capitalize mt-0.5">
                            {slot.sessionType}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            LKR {slot.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Available
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => {
                            setEditingTimeSlot(slot);
                            setShowTimeSlotModal(true);
                          }}
                          className="flex-1 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="flex-1 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTimeSlotModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTimeSlot ? 'Edit' : 'Add'} Time Slot
              </h2>
              <button 
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newTimeSlot.isRecurring}
                  onChange={e => setNewTimeSlot(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Recurring weekly (every {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })})</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  {editingTimeSlot ? 'Update Slot' : 'Add Slot'}
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