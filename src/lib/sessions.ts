import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Session, ChatMessage, SessionParticipant } from '../types/session';
import { dailyService } from './daily';
import { saveTherapistAvailability, getTherapistAvailability } from './availability';
import { format, subMinutes, addMinutes, isBefore, isAfter } from 'date-fns';

export const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Create Daily.co room for video/audio sessions
    let dailyRoomUrl = '';
    let dailyRoomName = '';

    if (sessionData.sessionType === 'video' || sessionData.sessionType === 'audio') {
      const roomOptions = {
        name: `kalm-session-${sessionData.therapistId}-${sessionData.clientId}-${Date.now()}`,
        privacy: 'private' as const,
        properties: {
          start_video_off: true, // Let users turn on their video manually
          start_audio_off: true, // Let users turn on their audio manually
          enable_chat: true,
          enable_screenshare: sessionData.sessionType === 'video',
          max_participants: 2,
          exp: Math.floor(sessionData.scheduledTime.getTime() / 1000) + (4 * 60 * 60), // 4 hours after scheduled time
        },
      };

      const room = await dailyService.createRoom(roomOptions);
      dailyRoomUrl = room.url;
      dailyRoomName = room.name;
    }

    // Create session document in Firestore
    const sessionDoc = {
      ...sessionData,
      dailyRoomUrl,
      dailyRoomName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'sessions'), sessionDoc);
    const sessionId = docRef.id;

    // Update therapist availability to mark the time slot as booked
    try {
      // Resolve the correct therapist user ID from the therapist document
      const therapistDoc = await getDoc(doc(db, 'therapists', sessionData.therapistId));
      if (therapistDoc.exists()) {
        const therapistData = therapistDoc.data();
        const therapistUserId = therapistData?.userId || sessionData.therapistId; // Fallback to document ID

        await updateTherapistAvailabilityAfterBooking(therapistUserId, sessionData.scheduledTime);
      } else {
        console.warn('Therapist document not found, skipping availability update');
      }
    } catch (availabilityError) {
      // Log error but don't fail the session creation
      console.error('Failed to update therapist availability after booking:', availabilityError);
    }

    return sessionId;
  } catch (error: any) {
    console.error('Error creating session:', error);
    throw new Error(error.message || 'Failed to create session');
  }
};

export const updateSession = async (sessionId: string, updates: Partial<Session>): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating session:', error);
    throw new Error(error.message || 'Failed to update session');
  }
};

export const getSession = async (sessionId: string): Promise<Session | null> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return null;
    }

    const data = sessionSnap.data();
    return {
      id: sessionSnap.id,
      ...data,
      scheduledTime: data.scheduledTime?.toDate() || new Date(),
      startTime: data.startTime?.toDate(),
      endTime: data.endTime?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Session;
  } catch (error: any) {
    console.error('Error getting session:', error);
    throw new Error(error.message || 'Failed to get session');
  }
};

export const getUserSessions = async (userId: string, role: 'therapist' | 'client'): Promise<Session[]> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const field = role === 'therapist' ? 'therapistId' : 'clientId';
    const q = query(
      sessionsRef,
      where(field, '==', userId),
      orderBy('scheduledTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledTime: data.scheduledTime?.toDate() || new Date(),
        startTime: data.startTime?.toDate(),
        endTime: data.endTime?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Session;
    });
  } catch (error: any) {
    console.error('Error getting user sessions:', error);
    throw new Error(error.message || 'Failed to get sessions');
  }
};

export const startSession = async (sessionId: string): Promise<void> => {
  try {
    await updateSession(sessionId, {
      status: 'active',
      startTime: new Date(),
    });
  } catch (error: any) {
    console.error('Error starting session:', error);
    throw new Error(error.message || 'Failed to start session');
  }
};

export const endSession = async (sessionId: string, notes?: string, deleteRoom: boolean = true): Promise<void> => {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Delete Daily.co room if it exists and deleteRoom is true
    // Only delete room when explicitly ending session, not when just leaving
    if (deleteRoom && session.dailyRoomName) {
      try {
        await dailyService.deleteRoom(session.dailyRoomName);
      } catch (error) {
        console.warn('Failed to delete Daily.co room:', error);
      }
    }

    // Prepare update data, only include notes if it's provided
    const updateData: Partial<Session> = {
      status: 'completed',
      endTime: new Date(),
    };

    // Only add notes if it's provided and not undefined
    if (notes !== undefined && notes !== null && notes.trim() !== '') {
      updateData.notes = notes.trim();
    }

    await updateSession(sessionId, updateData);
  } catch (error: any) {
    console.error('Error ending session:', error);
    throw new Error(error.message || 'Failed to end session');
  }
};

export const generateMeetingToken = async (sessionId: string, userId: string, userName: string, isTherapist: boolean): Promise<string> => {
  try {
    const session = await getSession(sessionId);
    if (!session || !session.dailyRoomName) {
      throw new Error('Session or room not found');
    }

    const tokenResponse = await dailyService.createMeetingToken({
      room_name: session.dailyRoomName,
      user_name: userName,
      user_id: userId,
      is_owner: isTherapist,
      exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours
    });

    return tokenResponse.token;
  } catch (error: any) {
    console.error('Error generating meeting token:', error);
    throw new Error(error.message || 'Failed to generate meeting token');
  }
};

// Chat functionality
export const sendChatMessage = async (sessionId: string, senderId: string, senderName: string, senderRole: 'therapist' | 'client', message: string): Promise<string> => {
  try {
    const messageDoc = {
      sessionId,
      senderId,
      senderName,
      senderRole,
      message,
      type: 'text' as const,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'chatMessages'), messageDoc);
    return docRef.id;
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef,
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ChatMessage;
    });
  } catch (error: any) {
    console.error('Error getting chat messages:', error);
    throw new Error(error.message || 'Failed to get messages');
  }
};

export const subscribeToChatMessages = (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'chatMessages');
  const q = query(
    messagesRef,
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ChatMessage;
    });
    callback(messages);
  });
};

// Session participants
export const addSessionParticipant = async (sessionId: string, userId: string, userName: string, role: 'therapist' | 'client'): Promise<void> => {
  try {
    const participantDoc = {
      sessionId,
      userId,
      userName,
      role,
      joinedAt: serverTimestamp(),
      isOnline: true,
    };

    await addDoc(collection(db, 'sessionParticipants'), participantDoc);
  } catch (error: any) {
    console.error('Error adding session participant:', error);
    throw new Error(error.message || 'Failed to add participant');
  }
};

export const updateParticipantStatus = async (sessionId: string, userId: string, isOnline: boolean): Promise<void> => {
  try {
    const participantsRef = collection(db, 'sessionParticipants');
    const q = query(
      participantsRef,
      where('sessionId', '==', sessionId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const participantDoc = querySnapshot.docs[0];
      await updateDoc(participantDoc.ref, {
        isOnline,
        ...(isOnline ? {} : { leftAt: serverTimestamp() }),
      });
    }
  } catch (error: any) {
    console.error('Error updating participant status:', error);
    throw new Error(error.message || 'Failed to update participant status');
  }
};

/**
 * Update therapist availability to mark a time slot as booked
 */
const updateTherapistAvailabilityAfterBooking = async (
  therapistId: string,
  scheduledTime: Date
): Promise<void> => {
  try {
    // Validate scheduledTime
    if (!scheduledTime || isNaN(scheduledTime.getTime())) {
      console.error('Invalid scheduledTime provided:', scheduledTime);
      return;
    }

    // Get current therapist availability
    const availability = await getTherapistAvailability(therapistId);

    if (!availability) {
      console.warn('No availability found for therapist, skipping update');
      return;
    }

    let dateString: string;
    let timeString: string;

    try {
      dateString = format(scheduledTime, 'yyyy-MM-dd');
      timeString = format(scheduledTime, 'HH:mm');
    } catch (formatError) {
      console.error('Error formatting scheduledTime:', formatError);
      return;
    }

    // Check if this is a special date booking
    const specialDateIndex = availability.specialDates?.findIndex(
      (sd: any) => sd.date === dateString
    );

    if (specialDateIndex !== undefined && specialDateIndex >= 0) {
      // Update special date time slot
      const specialDate = availability.specialDates[specialDateIndex];
      const updatedTimeSlots = specialDate.timeSlots.map((slot: any) => {
        try {
          // Handle both Date objects and time strings
          let slotStartTime: any = slot.startTime;

          // If it's a Firestore Timestamp, convert to Date
          if (slotStartTime && typeof slotStartTime === 'object' && slotStartTime.toDate) {
            slotStartTime = slotStartTime.toDate();
          }

          // If startTime is a time string like "09:00", compare directly
          if (typeof slotStartTime === 'string' && slotStartTime.includes(':')) {
            if (slotStartTime === timeString) {
              return { ...slot, isAvailable: false, isBooked: true };
            }
            return slot;
          }

          // If it's a Date object, format and compare
          if (slotStartTime instanceof Date || (typeof slotStartTime === 'string' && !isNaN(Date.parse(slotStartTime)))) {
            const dateObj = slotStartTime instanceof Date ? slotStartTime : new Date(slotStartTime);
            if (!isNaN(dateObj.getTime())) {
              const slotTime = format(dateObj, 'HH:mm');
              if (slotTime === timeString) {
                return { ...slot, isAvailable: false, isBooked: true };
              }
            }
          }

          return slot;
        } catch (slotError) {
          console.error('❌ [AVAILABILITY] Error processing special date slot:', slotError, 'slot:', slot);
          return slot;
        }
      });

      availability.specialDates[specialDateIndex] = {
        ...specialDate,
        timeSlots: updatedTimeSlots
      };
    } else {
      // Update weekly schedule
      const dayOfWeek = scheduledTime.getDay();
      const daySchedule = availability.weeklySchedule?.find((day: any) => day.dayOfWeek === dayOfWeek);

      if (daySchedule) {
        const updatedTimeSlots = daySchedule.timeSlots.map((slot: any) => {
          try {
            // Handle both Date objects and time strings
            let slotStartTime: any = slot.startTime;

            // If it's a Firestore Timestamp, convert to Date
            if (slotStartTime && typeof slotStartTime === 'object' && slotStartTime.toDate) {
              slotStartTime = slotStartTime.toDate();
            }

            // If startTime is a time string like "09:00", compare directly
            if (typeof slotStartTime === 'string' && slotStartTime.includes(':')) {
              if (slotStartTime === timeString) {
                return { ...slot, isAvailable: false, isBooked: true };
              }
              return slot;
            }

            // If it's a Date object, format and compare
            if (slotStartTime instanceof Date || (typeof slotStartTime === 'string' && !isNaN(Date.parse(slotStartTime)))) {
              const dateObj = slotStartTime instanceof Date ? slotStartTime : new Date(slotStartTime);
              if (!isNaN(dateObj.getTime())) {
                const slotTime = format(dateObj, 'HH:mm');
                if (slotTime === timeString) {
                  return { ...slot, isAvailable: false, isBooked: true };
                }
              }
            }

            return slot;
          } catch (slotError) {
            console.error('❌ [AVAILABILITY] Error processing weekly slot:', slotError, 'slot:', slot);
            return slot;
          }
        });

        const dayIndex = availability.weeklySchedule.findIndex((day: any) => day.dayOfWeek === dayOfWeek);
        if (dayIndex >= 0) {
          availability.weeklySchedule[dayIndex] = {
            ...daySchedule,
            timeSlots: updatedTimeSlots
          };
        }
      }
    }

    // Save updated availability
    try {
      await saveTherapistAvailability(therapistId, availability.weeklySchedule, availability.specialDates);
    } catch (saveError: any) {
      console.warn('Availability update skipped - booking still successful');
      // Don't fail the booking process - availability update is a nice-to-have feature
    }
  } catch (error) {
    console.error('Error updating therapist availability after booking:', error);
    // Don't throw error - booking should still succeed even if availability update fails
  }
};

// Session configuration types and functions
export interface SessionConfig {
  joinEarlyMinutes: number; // Minutes before session start when join button becomes available
  joinLateMinutes: number; // Minutes after session end when join button remains available
  updatedAt: Date;
  updatedBy: string;
}

// Default session configuration
const DEFAULT_SESSION_CONFIG: Omit<SessionConfig, 'updatedAt' | 'updatedBy'> = {
  joinEarlyMinutes: 15, // 15 minutes before session start
  joinLateMinutes: 30,  // 30 minutes after session end
};

// Get session configuration from database
export const getSessionConfig = async (): Promise<SessionConfig> => {
  try {
    const configRef = doc(db, 'systemConfig', 'sessionTiming');
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const data = configSnap.data();
      return {
        joinEarlyMinutes: data.joinEarlyMinutes ?? DEFAULT_SESSION_CONFIG.joinEarlyMinutes,
        joinLateMinutes: data.joinLateMinutes ?? DEFAULT_SESSION_CONFIG.joinLateMinutes,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || 'system',
      };
    }

    // Return default config if not found
    return {
      ...DEFAULT_SESSION_CONFIG,
      updatedAt: new Date(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Failed to get session config:', error);
    // Return default config on error
    return {
      ...DEFAULT_SESSION_CONFIG,
      updatedAt: new Date(),
      updatedBy: 'system',
    };
  }
};

// Update session configuration (admin only)
export const updateSessionConfig = async (
  config: Partial<Pick<SessionConfig, 'joinEarlyMinutes' | 'joinLateMinutes'>>,
  updatedBy: string
): Promise<void> => {
  try {
    const configRef = doc(db, 'systemConfig', 'sessionTiming');
    await setDoc(configRef, {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy,
    }, { merge: true });
  } catch (error) {
    console.error('Failed to update session config:', error);
    throw new Error('Failed to update session configuration');
  }
};

// Check if session can be joined based on timing rules
export const canJoinSessionByTime = async (session: Session): Promise<boolean> => {
  try {
    const config = await getSessionConfig();
    const now = new Date();

    // If session is active, always allow joining
    if (session.status === 'active') {
      return true;
    }

    // If session is not scheduled, don't allow joining
    if (session.status !== 'scheduled') {
      return false;
    }

    const sessionStart = session.scheduledTime;
    const sessionEnd = addMinutes(sessionStart, session.duration || 60); // Default 60 minutes

    // Can join from X minutes before start
    const earliestJoinTime = subMinutes(sessionStart, config.joinEarlyMinutes);

    // Can join until Y minutes after end
    const latestJoinTime = addMinutes(sessionEnd, config.joinLateMinutes);
    console.log('earliestJoinTime', earliestJoinTime);
    console.log('latestJoinTime', latestJoinTime);

    return isAfter(now, earliestJoinTime) && isBefore(now, latestJoinTime);
  } catch (error) {
    console.error('Failed to check session join timing:', error);
    // On error, fall back to basic status check
    return session.status === 'scheduled' || session.status === 'active';
  }
};

// Check if a scheduled session should be marked as missed
export const shouldMarkSessionAsMissed = async (session: Session): Promise<boolean> => {
  try {
    // Only check scheduled sessions
    if (session.status !== 'scheduled') {
      return false;
    }

    const config = await getSessionConfig();
    const now = new Date();
    const sessionStart = session.scheduledTime;
    const sessionEnd = addMinutes(sessionStart, session.duration || 60);

    // Latest time when session could still be joined
    const latestJoinTime = addMinutes(sessionEnd, config.joinLateMinutes);

    // If current time is past the latest join time, session should be marked as missed
    return isAfter(now, latestJoinTime);
  } catch (error) {
    console.error('Failed to check if session should be marked as missed:', error);
    // On error, don't mark as missed
    return false;
  }
};

// Mark a session as missed
export const markSessionAsMissed = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'missed',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to mark session as missed:', error);
    throw new Error('Failed to update session status');
  }
};