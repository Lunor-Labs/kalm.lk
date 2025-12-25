import { User } from './auth';

// Therapist is now a computed interface from User data
export interface Therapist extends NonNullable<User['therapistProfile']> {
  id: string; // The user's UID
}

export interface TherapistFilters {
  specialization?: string;
  language?: string;
  sessionFormat?: string;
  availability?: 'available' | 'all';
  priceRange?: [number, number];
}