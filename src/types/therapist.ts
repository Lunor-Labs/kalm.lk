export interface Therapist {
  id: string;
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
}

export interface TherapistFilters {
  specialization?: string;
  language?: string;
  sessionFormat?: string;
  availability?: 'available' | 'all';
  priceRange?: [number, number];
}