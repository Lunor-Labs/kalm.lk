import React, { useState, useEffect } from 'react';
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
  onBack
}) => {

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [therapistAvailability, setTherapistAvailability] = useState<any>(null);

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Load therapist availability data
  useEffect(() => {
    const loadTherapistAvailability = async () => {
      try {
        // Therapist ID is now directly the user ID
        const therapistUserId = therapistId;

        // Get availability using the userId
        const availability = await getTherapistAvailability(therapistUserId);
        setTherapistAvailability(availability);
      } catch (error: any) {
        console.error('Failed to load therapist availability:', error);
        toast.error('Failed to load therapist availability');
      }
    };

    if (therapistId) {
      loadTherapistAvailability();
    }
  }, [therapistId]);

  // Generate time slots from Firebase availability data
  const generateTimeSlotsFromAvailability = async (date: Date): Promise<TimeSlot[]> => {
    if (!therapistAvailability) return [];

    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Check for special dates first
    const specialDate = therapistAvailability.specialDates?.find((sd: any) => sd.date === dateString);
    let availableTimeSlots: any[] = [];

    if (specialDate) {
      // Special dates don't have isAvailable flag in the new system, so always use them if they exist
      availableTimeSlots = specialDate.timeSlots || [];
    } else {
      // Use weekly schedule
      const daySchedule = therapistAvailability.weeklySchedule?.find((day: any) => day.dayOfWeek === dayOfWeek);

      if (!daySchedule) {
        return []; // No schedule available on this day
      }

      // Check availability (support both old and new data structures)
      const isAvailable = daySchedule.isAvailable !== false; // Default to true if not set

      if (!isAvailable) {
        return []; // No slots available on this day
      }

      // Check if the day has time slots configured
      availableTimeSlots = daySchedule.timeSlots || [];

      if (availableTimeSlots.length === 0) {
        return []; // No slots available on this day
      }
    }

    // Check for existing bookings to mark slots as booked
    const bookedSlots = await getBookedSlotsForDate(therapistId, dateString);
    
    // Convert availability time slots to TimeSlot format
    const slots: TimeSlot[] = [];

    for (const availSlot of availableTimeSlots) {
      if (!availSlot.isAvailable) continue;

      const parseSlotTime = (timeStr: string) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute ?? 0, 0, 0);
        return slotTime;
      };

      const startTime = parseSlotTime(availSlot.startTime);
      const endTime = parseSlotTime(availSlot.endTime);

      // Skip invalid ranges
      if (endTime <= startTime) continue;

      // Check if this slot is already booked
      const slotKey = format(startTime, 'HH:mm');
      const isBooked = bookedSlots.includes(slotKey);

      // Only show slots that start in the future (with 15-minute buffer)
      const now = new Date();
      const bufferTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      if (startTime <= bufferTime) {
        continue; // Skip past and imminent time slots
      }

      slots.push({
        id: `${therapistId}-${dateString}-${slotKey}`,
        startTime,
        endTime,
        isAvailable: !isBooked,
        isBooked,
        price: availSlot.price || 4500,
        sessionType: availSlot.sessionType || 'video'
      });
    }

    return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  // Get booked slots for a specific date
  const getBookedSlotsForDate = async (therapistId: string, dateString: string): Promise<string[]> => {
    try {
      // Query existing bookings for this therapist on this date
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('therapistId', '==', therapistId),
        where('status', 'in', ['scheduled', 'confirmed', 'active'])
      );
      
      const snapshot = await getDocs(q);
      const bookedSlots: string[] = [];
      
      snapshot.docs.forEach(doc => {
        const booking = doc.data();
        const bookingDate = booking.sessionTime?.toDate();
        
        if (bookingDate && format(bookingDate, 'yyyy-MM-dd') === dateString) {
          const timeSlot = format(bookingDate, 'HH:mm');
          bookedSlots.push(timeSlot);
        }
      });
      
      return bookedSlots;
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
    
    const duration = 60; // 1 hour session
    onTimeSelect(slot.startTime, duration, slot.price);
  };

  return (
    <div className="p-8">
      {/* Back button above the title, left-aligned */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-fixes-accent-purple hover:text-fixes-accent-blue transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-fixes-heading-dark">Back</span>
        </button>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-black whitespace-nowrap">Select Date & Time</h2>
        <p className="text-fixes-heading-dark">Choose your preferred session time</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-black text-black mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Select Date</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {availableDates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-fixes-accent-purple bg-white'
                      : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-black ${isSelected ? 'text-fixes-accent-purple' : 'text-black'}`}>
                        {format(date, 'EEEE')}
                      </p>
                      <p className="text-fixes-heading-dark text-sm">
                        {format(date, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {isToday && (
                      <span className="bg-accent-green text-white text-xs px-2 py-1 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <h3 className="text-lg font-black text-black mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Available Times</span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-fixes-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-fixes-heading-dark text-sm">Loading slots...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime && slot.startTime.getTime() === selectedTime.getTime();
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable || slot.isBooked}
                    className={`p-3 rounded-xl transition-all duration-200 text-center shadow-sm hover:shadow-md ${
                      !slot.isAvailable || slot.isBooked
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : isSelected
                        ? 'ring-2 ring-fixes-accent-purple bg-white text-fixes-accent-purple'
                        : 'bg-white hover:bg-neutral-50 text-black hover:text-fixes-accent-purple'
                    }`}
                  >
                    <p className="font-black text-sm">
                      {format(slot.startTime, 'h:mm a')}
                    </p>
                    {/* <p className="text-xs opacity-80">
                      {slot.isBooked ? 'Booked' : `LKR ${slot.price.toLocaleString()}`}
                    </p>
                    {slot.sessionType && (
                      <p className="text-xs opacity-60 capitalize">
                        {slot.sessionType}
                      </p>
                    )} */}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && timeSlots.length === 0 && (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-fixes-heading-dark mx-auto mb-4" />
              <p className="text-fixes-heading-dark mb-2">No available slots for this date</p>
              <p className="text-fixes-heading-dark text-sm">
                {!therapistAvailability
                  ? 'Therapist availability not configured yet.'
                  : 'Please select a different date or contact the therapist.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelection;