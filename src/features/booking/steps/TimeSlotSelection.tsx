import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { getTherapistAvailability, getAvailableTimeSlots } from '../../../lib/availability';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface TimeSlotSelectionProps {
  therapistId: string;
  selectedTime?: Date;
  onTimeSelect: (sessionTime: Date, duration: number, amount: number) => void;
  onBack: () => void;
}

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  price: number;
  sessionType: 'video' | 'audio' | 'chat';
  isBooked?: boolean;
}

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  therapistId,
  selectedTime,
  onTimeSelect,
  onBack,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [therapistAvailability, setTherapistAvailability] = useState<any>(null);

  // Next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Load therapist availability
  useEffect(() => {
    const loadTherapistAvailability = async () => {
      try {
        const availability = await getTherapistAvailability(therapistId);
        setTherapistAvailability(availability);
      } catch (error: any) {
        console.error('Failed to load therapist availability:', error);
        toast.error('Failed to load availability');
      }
    };

    if (therapistId) loadTherapistAvailability();
  }, [therapistId]);

  // Generate time slots
  const generateTimeSlotsFromAvailability = async (date: Date): Promise<TimeSlot[]> => {
    if (!therapistAvailability) return [];

    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    let availableTimeSlots: any[] = [];

    // Special dates take priority
    const specialDate = therapistAvailability.specialDates?.find((sd: any) => sd.date === dateString);
    if (specialDate) {
      availableTimeSlots = specialDate.timeSlots || [];
    } else {
      const daySchedule = therapistAvailability.weeklySchedule?.find((day: any) => day.dayOfWeek === dayOfWeek);
      if (!daySchedule || daySchedule.isAvailable === false) return [];
      availableTimeSlots = daySchedule.timeSlots || [];
    }

    if (availableTimeSlots.length === 0) return [];

    // Get booked slots
    const bookedSlots = await getBookedSlotsForDate(therapistId, dateString);

    const slots: TimeSlot[] = [];
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 min buffer

    for (const availSlot of availableTimeSlots) {
      if (!availSlot.isAvailable) continue;

      const [startHour, startMinute] = availSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = availSlot.endTime.split(':').map(Number);

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);

        if (startTime <= bufferTime) continue; // skip past/imminent

        const endTime = new Date(date);
        endTime.setHours(hour + 1, 0, 0, 0);

        const slotKey = `${hour}:00`;
        const isBooked = bookedSlots.includes(slotKey);

        slots.push({
          id: `${therapistId}-${dateString}-${hour}`,
          startTime,
          endTime,
          isAvailable: !isBooked,
          isBooked,
          price: availSlot.price || 4500,
          sessionType: availSlot.sessionType || 'video',
        });
      }
    }

    return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const getBookedSlotsForDate = async (therapistId: string, dateString: string): Promise<string[]> => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('therapistId', '==', therapistId),
        where('status', 'in', ['scheduled', 'confirmed', 'active'])
      );

      const snapshot = await getDocs(q);
      const booked: string[] = [];

      snapshot.docs.forEach((doc) => {
        const booking = doc.data();
        const bookingDate = booking.sessionTime?.toDate();
        if (bookingDate && format(bookingDate, 'yyyy-MM-dd') === dateString) {
          booked.push(format(bookingDate, 'H:mm'));
        }
      });

      return booked;
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!therapistAvailability) return;
      setLoading(true);
      try {
        const slots = await generateTimeSlotsFromAvailability(selectedDate);
        setTimeSlots(slots);
      } catch (error: any) {
        console.error('Failed to load time slots:', error);
        toast.error('Failed to load available time slots');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [selectedDate, therapistId, therapistAvailability]);

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable || slot.isBooked) return;
    const duration = 60; // 1 hour
    onTimeSelect(slot.startTime, duration, slot.price);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Select Date & Time</h2>
        <p className="text-gray-600 mt-2">Choose your preferred session time</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Select Date</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableDates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-sm ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 bg-white text-gray-800'
                  }`}
                >
                  <p className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {format(date, 'EEE')}
                  </p>
                  <p className="text-xl font-bold mt-1">{format(date, 'd')}</p>
                  <p className="text-sm text-gray-500">{format(date, 'MMM')}</p>
                  {isToday && (
                    <span className="mt-2 inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Available Times</span>
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading available slots...</p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
              {timeSlots.map((slot) => {
                const isSelected =
                  selectedTime &&
                  isSameDay(slot.startTime, selectedTime) &&
                  slot.startTime.getHours() === selectedTime.getHours();

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable || slot.isBooked}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-sm ${
                      !slot.isAvailable || slot.isBooked
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 bg-white text-gray-900'
                    }`}
                  >
                    <p className="font-semibold text-lg">
                      {format(slot.startTime, 'h:mm a')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {slot.isBooked ? 'Booked' : `LKR ${slot.price.toLocaleString()}`}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-xl mb-2">No available slots</p>
              <p className="text-gray-600">
                {!therapistAvailability
                  ? 'Therapist availability not configured yet.'
                  : 'Try selecting a different date.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelection;