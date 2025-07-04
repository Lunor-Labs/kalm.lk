import DailyIframe from '@daily-co/daily-js';

export interface DailyConfig {
  apiKey: string;
  domain: string;
}

export interface CreateRoomOptions {
  name?: string;
  privacy?: 'public' | 'private';
  properties?: {
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_chat?: boolean;
    enable_screenshare?: boolean;
    max_participants?: number;
    exp?: number;
  };
}

export interface CreateTokenOptions {
  room_name: string;
  user_name: string;
  user_id: string;
  is_owner?: boolean;
  exp?: number;
}

class DailyService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor() {
    // In production, these should come from environment variables
    this.apiKey = import.meta.env.VITE_DAILY_API_KEY || 'demo-api-key';
    this.domain = import.meta.env.VITE_DAILY_DOMAIN || 'kalm-therapy';
    this.baseUrl = 'https://api.daily.co/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Daily API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createRoom(options: CreateRoomOptions = {}) {
    const roomName = options.name || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const roomConfig = {
      name: roomName,
      privacy: options.privacy || 'private',
      properties: {
        start_video_off: options.properties?.start_video_off ?? false,
        start_audio_off: options.properties?.start_audio_off ?? false,
        enable_chat: options.properties?.enable_chat ?? true,
        enable_screenshare: options.properties?.enable_screenshare ?? false,
        max_participants: options.properties?.max_participants ?? 2,
        exp: options.properties?.exp || Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
      },
    };

    return this.makeRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomConfig),
    });
  }

  async deleteRoom(roomName: string) {
    return this.makeRequest(`/rooms/${roomName}`, {
      method: 'DELETE',
    });
  }

  async createMeetingToken(options: CreateTokenOptions) {
    const tokenConfig = {
      properties: {
        room_name: options.room_name,
        user_name: options.user_name,
        user_id: options.user_id,
        is_owner: options.is_owner || false,
        exp: options.exp || Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours from now
      },
    };

    return this.makeRequest('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify(tokenConfig),
    });
  }

  async getRoomInfo(roomName: string) {
    return this.makeRequest(`/rooms/${roomName}`);
  }

  // Client-side Daily.co integration
  static createCallObject() {
    return DailyIframe.createCallObject({
      showLeaveButton: true,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: true,
    });
  }

  static async joinRoom(roomUrl: string, token?: string) {
    const callObject = this.createCallObject();
    
    const joinOptions: any = {
      url: roomUrl,
    };

    if (token) {
      joinOptions.token = token;
    }

    await callObject.join(joinOptions);
    return callObject;
  }
}

export const dailyService = new DailyService();
export default DailyService;