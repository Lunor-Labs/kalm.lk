export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
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