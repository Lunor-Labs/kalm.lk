import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
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
    return docRef.id;
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