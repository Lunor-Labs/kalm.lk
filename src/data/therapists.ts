// Centralized therapist data for the entire application
export interface TherapistData {
  id: string;
  name: string;
  specialty: string;
  image: string;
  languages: string[];
  credentials: string;
  availability: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  sessionFormats: string[];
  serviceCategory: string;
  services?: string[]; // Optional list of service names (from Firebase)
  experience: number;
  bio: string;
  isActive?: boolean;
}

export const therapistsData: TherapistData[] = [
];

// Helper functions
export const getTherapistById = (id: string): TherapistData | undefined => {
  return therapistsData.find(therapist => therapist.id === id);
};

export const getTherapistsByCategory = (category: string): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.serviceCategory === category);
};

export const getAvailableTherapists = (): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.isActive !== false);
};

export const getTherapistsBySpecialty = (specialty: string): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.specialty.toLowerCase().includes(specialty.toLowerCase()));
};