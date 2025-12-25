export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Therapist-specific profile data (only populated for therapists)
  therapistProfile?: {
    firstName: string;
    lastName: string;
    credentials: string[];
    profilePhoto: string;
    specializations: string[];
    languages: string[];
    services: string[];
    isAvailable: boolean;
    sessionFormats: ('video' | 'audio' | 'chat')[];
    bio: string;
    experience: number; // years
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    nextAvailableSlot?: string;
    calendarUrl?: string;
    therapistIdInt?: number; // Sequential therapist ID
  };
}

export type UserRole = 'client' | 'therapist' | 'admin';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface AnonymousSignupData {
  username: string;
  password: string;
}

export interface UserManagement {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}