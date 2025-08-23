import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

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
}

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  therapistId,
  selectedTime,
  onTimeSelect,
  onBack
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Mock time slots - in real app, this would come from Firestore
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseDate = startOfDay(date);
    
    // Generate slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);
      
      // Randomly make some slots unavailable for demo
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        id: `${therapistId}-${hour}`,
        startTime,
        endTime,
        isAvailable,
        price: 4500
      });
    }
    
    return slots;
  };

  useEffect(() => {
    const loadTimeSlots = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const slots = generateTimeSlots(selectedDate);
      setTimeSlots(slots);
      setLoading(false);
    };

    loadTimeSlots();
  }, [selectedDate, therapistId]);

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    
    const duration = 60; // 1 hour session
    onTimeSelect(slot.startTime, duration, slot.price);
  };

  return (
    <div className="p-8">
      {/* Back button above the title, left-aligned */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white whitespace-nowrap">Select Date & Time</h2>
        <p className="text-neutral-300">Choose your preferred session time</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
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
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isSelected ? 'text-primary-500' : 'text-white'}`}>
                        {format(date, 'EEEE')}
                      </p>
                      <p className="text-neutral-300 text-sm">
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
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Available Times</span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-neutral-300 text-sm">Loading slots...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime && isSameDay(slot.startTime, selectedTime) && 
                                 slot.startTime.getHours() === selectedTime.getHours();
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable}
                    className={`p-3 rounded-2xl border-2 transition-all duration-200 text-center ${
                      !slot.isAvailable
                        ? 'border-neutral-800 bg-neutral-800/30 text-neutral-500 cursor-not-allowed'
                        : isSelected
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                        : 'border-neutral-800 hover:border-neutral-700 bg-black/30 text-white hover:text-primary-500'
                    }`}
                  >
                    <p className="font-semibold text-sm">
                      {format(slot.startTime, 'h:mm a')}
                    </p>
                    <p className="text-xs opacity-80">
                      LKR {slot.price.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && timeSlots.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-300 mb-4">No available slots for this date.</p>
              <p className="text-neutral-400 text-sm">Please select a different date.</p>
            </div>
          )}
        </div>
      </div>
      {/*     
      {selectedTime && (
        <div className="mt-8 p-6 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
          <h4 className="text-white font-semibold mb-2">Selected Session</h4>
          <p className="text-neutral-300">
            {format(selectedTime, 'EEEE, MMMM d, yyyy')} at {format(selectedTime, 'h:mm a')}
          </p>
          <p className="text-primary-500 font-semibold mt-2">
            Duration: 60 minutes • LKR 4,500
          </p>
        </div>
      )}
        */}
    </div>
  );
};

export default TimeSlotSelection;