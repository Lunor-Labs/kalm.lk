import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Starting numbers for each counter type
 * These provide:
 * - Professional appearance (not starting at 1)
 * - Easy identification of type from ID range
 * - Buffer space for test/admin data
 */
const COUNTER_STARTING_NUMBERS: Record<'client' | 'therapist' | 'booking' | 'payment', number> = {
  client: 10000,      // Client IDs: 1000, 1001, 1002...
  therapist: 20000,    // Therapist IDs: 100, 101, 102...
  booking: 30000,    // Booking IDs: 10000, 10001, 10002...
  payment: 40000,     // Payment IDs: 5000, 5001, 5002...
};

/**
 * Get the next sequential ID for a given counter type
 * Uses Firestore transactions to ensure atomic increments
 */
export const getNextId = async (counterType: 'client' | 'therapist' | 'booking' | 'payment'): Promise<number> => {
  const counterRef = doc(db, 'counters', counterType);
  const startingNumber = COUNTER_STARTING_NUMBERS[counterType];
  
  try {
    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize counter with starting number if it doesn't exist
        transaction.set(counterRef, { count: startingNumber });
        return startingNumber;
      }
      
      const currentCount = counterDoc.data()?.count || startingNumber - 1;
      const nextCount = currentCount + 1;
      transaction.update(counterRef, { count: nextCount });
      
      return nextCount;
    });
  } catch (error: any) {
    console.error(`Error getting next ${counterType} ID:`, error);
    // Fallback: try to get current count and increment manually
    try {
      const counterDoc = await getDoc(counterRef);
      if (counterDoc.exists()) {
        const currentCount = counterDoc.data()?.count || startingNumber - 1;
        const nextCount = currentCount + 1;
        await updateDoc(counterRef, { count: nextCount });
        return nextCount;
      } else {
        await setDoc(counterRef, { count: startingNumber });
        return startingNumber;
      }
    } catch (fallbackError) {
      console.error(`Fallback error for ${counterType} counter:`, fallbackError);
      // Last resort: use timestamp-based ID
      return Math.floor(Date.now() / 1000);
    }
  }
};

/**
 * Get current count for a counter type (without incrementing)
 */
export const getCurrentCount = async (counterType: 'client' | 'therapist' | 'booking' | 'payment'): Promise<number> => {
  const counterRef = doc(db, 'counters', counterType);
  try {
    const counterDoc = await getDoc(counterRef);
    if (counterDoc.exists()) {
      return counterDoc.data()?.count || 0;
    }
    return 0;
  } catch (error) {
    console.error(`Error getting current ${counterType} count:`, error);
    return 0;
  }
};

