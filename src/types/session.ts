export interface Session {
  id: string;
  bookingId: string;
  therapistId: string;
  clientId: string;
  clientName?: string;
  sessionType: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledTime: Date;
  startTime?: Date;
  endTime?: Date;
  duration: number; // in minutes
  dailyRoomUrl?: string;
  dailyRoomName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'therapist' | 'client';
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  role: 'therapist' | 'client';
  joinedAt?: Date;
  leftAt?: Date;
  isOnline: boolean;
}

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  api_created: boolean;
  privacy: 'public' | 'private';
  config: {
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_chat?: boolean;
    enable_screenshare?: boolean;
    max_participants?: number;
    exp?: number; // expiration timestamp
  };
}

export interface DailyMeetingToken {
  token: string;
  room_name: string;
  user_name: string;
  user_id: string;
  is_owner: boolean;
  exp: number;
}