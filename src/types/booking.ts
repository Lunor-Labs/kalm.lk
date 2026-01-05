export interface Booking {
  id: string;
  therapistId: string;
  clientId: string;
  sessionTime: Date;
  duration: number; // in minutes
  serviceType: string;
  isAnonymous: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  amount: number;
  currency: 'LKR';
  couponCode?: string;
  discountAmount?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingStep {
  step: number;
  title: string;
  completed: boolean;
}

export interface BookingData {
  serviceType?: string;
  serviceName?: string; // exact label from therapistProfile.services
  therapistId?: string;
  sessionType?: 'video' | 'audio' | 'chat';
  sessionTime?: Date;
  duration?: number;
  amount?: number;
  couponCode?: string;
  discountAmount?: number;
}

export interface TimeSlot {
  id: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
}

export interface TherapistAvailability {
  therapistId: string;
  date: string; // YYYY-MM-DD format
  slots: TimeSlot[];
  isAvailable: boolean;
}