export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  isRecurring: boolean;
  isBooked?: boolean;
  bookingId?: string;
  price?: number;
  sessionType?: 'video' | 'audio' | 'chat';
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface SpecialDate {
  id: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  reason?: string;
  timeSlots?: TimeSlot[];
}

export interface TherapistAvailability {
  therapistId: string;
  weeklySchedule: DayAvailability[];
  specialDates: SpecialDate[];
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySettings {
  bufferTime: number; // minutes between sessions
  maxSessionsPerDay: number;
  advanceBookingDays: number; // how many days in advance clients can book
  cancellationPolicy: {
    hoursBeforeSession: number;
    refundPercentage: number;
  };
  sessionTypes: {
    video: { enabled: boolean; price: number };
    audio: { enabled: boolean; price: number };
    chat: { enabled: boolean; price: number };
  };
}