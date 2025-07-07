import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { TherapistAvailability, DayAvailability, SpecialDate, AvailabilitySettings } from '../types/availability';

export const saveTherapistAvailability = async (
  therapistId: string, 
  weeklySchedule: DayAvailability[], 
  specialDates: SpecialDate[]
): Promise<void> => {
  try {
    const availabilityData: Omit<TherapistAvailability, 'createdAt' | 'updatedAt'> = {
      therapistId,
      weeklySchedule,
      specialDates,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: true,
    };

    const docRef = doc(db, 'therapistAvailability', therapistId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      await updateDoc(docRef, {
        ...availabilityData,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...availabilityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error: any) {
    console.error('Error saving therapist availability:', error);
    throw new Error(error.message || 'Failed to save availability');
  }
};

export const getTherapistAvailability = async (therapistId: string): Promise<TherapistAvailability | null> => {
  try {
    const docRef = doc(db, 'therapistAvailability', therapistId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as TherapistAvailability;
  } catch (error: any) {
    console.error('Error getting therapist availability:', error);
    throw new Error(error.message || 'Failed to get availability');
  }
};

export const getAvailableTimeSlots = async (
  therapistId: string, 
  date: string // YYYY-MM-DD format
): Promise<any[]> => {
  try {
    const availability = await getTherapistAvailability(therapistId);
    if (!availability) {
      return [];
    }

    const dayOfWeek = new Date(date).getDay();
    
    // Check for special dates first
    const specialDate = availability.specialDates.find(sd => sd.date === date);
    if (specialDate) {
      if (!specialDate.isAvailable) {
        return [];
      }
      return specialDate.timeSlots || [];
    }

    // Use weekly schedule
    const daySchedule = availability.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    // TODO: Filter out already booked slots by checking existing bookings
    return daySchedule.timeSlots.filter(slot => slot.isAvailable);
  } catch (error: any) {
    console.error('Error getting available time slots:', error);
    throw new Error(error.message || 'Failed to get available time slots');
  }
};

export const saveAvailabilitySettings = async (
  therapistId: string, 
  settings: AvailabilitySettings
): Promise<void> => {
  try {
    const docRef = doc(db, 'therapistSettings', therapistId);
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Error saving availability settings:', error);
    throw new Error(error.message || 'Failed to save settings');
  }
};

export const getAvailabilitySettings = async (therapistId: string): Promise<AvailabilitySettings | null> => {
  try {
    const docRef = doc(db, 'therapistSettings', therapistId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Return default settings
      return {
        bufferTime: 15,
        maxSessionsPerDay: 8,
        advanceBookingDays: 30,
        cancellationPolicy: {
          hoursBeforeSession: 24,
          refundPercentage: 100,
        },
        sessionTypes: {
          video: { enabled: true, price: 4500 },
          audio: { enabled: true, price: 4000 },
          chat: { enabled: true, price: 3500 },
        },
      };
    }

    return docSnap.data() as AvailabilitySettings;
  } catch (error: any) {
    console.error('Error getting availability settings:', error);
    throw new Error(error.message || 'Failed to get settings');
  }
};

export const bulkUpdateAvailability = async (
  therapistId: string,
  updates: {
    dateRange: { start: string; end: string };
    isAvailable: boolean;
    reason?: string;
  }
): Promise<void> => {
  try {
    const availability = await getTherapistAvailability(therapistId);
    if (!availability) {
      throw new Error('Therapist availability not found');
    }

    const startDate = new Date(updates.dateRange.start);
    const endDate = new Date(updates.dateRange.end);
    const newSpecialDates: SpecialDate[] = [...availability.specialDates];

    // Generate special dates for the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      
      // Remove existing special date if it exists
      const existingIndex = newSpecialDates.findIndex(sd => sd.date === dateString);
      if (existingIndex !== -1) {
        newSpecialDates.splice(existingIndex, 1);
      }

      // Add new special date
      newSpecialDates.push({
        id: `bulk-${Date.now()}-${dateString}`,
        date: dateString,
        isAvailable: updates.isAvailable,
        reason: updates.reason,
      });
    }

    await saveTherapistAvailability(therapistId, availability.weeklySchedule, newSpecialDates);
  } catch (error: any) {
    console.error('Error bulk updating availability:', error);
    throw new Error(error.message || 'Failed to bulk update availability');
  }
};