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
  experience: number;
  bio: string;
  isAvailable: boolean;
  isActive?: boolean;
}

export const therapistsData: TherapistData[] = [
  {
    id: '1',
    name: 'Dr. Priya Perera',
    specialty: 'Anxiety & Depression',
    image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala'],
    credentials: 'PhD Clinical Psychology',
    availability: 'Available Today',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 4500,
    sessionFormats: ['video', 'audio', 'chat'],
    serviceCategory: 'INDIVIDUALS',
    experience: 8,
    bio: 'Dr. Priya Perera is a licensed clinical psychologist with over 8 years of experience helping individuals overcome anxiety, depression, and stress-related challenges.',
    isAvailable: true,
    isActive: true
  },
  {
    id: '2',
    name: 'Dr. Rohan Silva',
    specialty: 'Relationship Counseling',
    image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala', 'Tamil'],
    credentials: 'MSc Counseling Psychology',
    availability: 'Available Tomorrow',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 5000,
    sessionFormats: ['video', 'audio'],
    serviceCategory: 'FAMILY_COUPLES',
    experience: 6,
    bio: 'Dr. Rohan Silva specializes in relationship and family therapy with 6 years of experience helping couples and families improve communication.',
    isAvailable: false,
    isActive: true
  },
  {
    id: '3',
    name: 'Dr. Amara Fernando',
    specialty: 'Stress & Trauma',
    image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala'],
    credentials: 'PhD Trauma Psychology',
    availability: 'Available Today',
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 5500,
    sessionFormats: ['video', 'audio'],
    serviceCategory: 'INDIVIDUALS',
    experience: 10,
    bio: 'Dr. Amara Fernando is a trauma specialist with 10 years of experience helping individuals heal from traumatic experiences.',
    isAvailable: true,
    isActive: true
  },
  {
    id: '4',
    name: 'Dr. Kavitha Raj',
    specialty: 'Family Therapy',
    image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Tamil'],
    credentials: 'MSc Family Therapy',
    availability: 'Available This Week',
    rating: 4.7,
    reviewCount: 94,
    hourlyRate: 4000,
    sessionFormats: ['video', 'chat'],
    serviceCategory: 'FAMILY_COUPLES',
    experience: 7,
    bio: 'Dr. Kavitha Raj specializes in family dynamics and child psychology with 7 years of experience.',
    isAvailable: true,
    isActive: true
  },
  {
    id: '5',
    name: 'Dr. Nuwan Jayasinghe',
    specialty: 'Addiction Recovery',
    image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala'],
    credentials: 'PhD Clinical Psychology',
    availability: 'Next Week',
    rating: 4.8,
    reviewCount: 203,
    hourlyRate: 6000,
    sessionFormats: ['video', 'audio', 'chat'],
    serviceCategory: 'INDIVIDUALS',
    experience: 12,
    bio: 'Dr. Nuwan Jayasinghe is an addiction specialist with 12 years of experience helping individuals overcome various forms of addiction.',
    isAvailable: false,
    isActive: true
  },
  {
    id: '6',
    name: 'Dr. Sanduni Wickramasinghe',
    specialty: 'Teen Counseling',
    image: 'https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala'],
    credentials: 'MSc Clinical Psychology',
    availability: 'Available Today',
    rating: 4.9,
    reviewCount: 78,
    hourlyRate: 3500,
    sessionFormats: ['video', 'chat'],
    serviceCategory: 'TEENS',
    experience: 5,
    bio: 'Dr. Sanduni Wickramasinghe specializes in adolescent mental health with 5 years of experience.',
    isAvailable: true,
    isActive: true
  },
  {
    id: '7',
    name: 'Dr. Malini Perera',
    specialty: 'LGBTQIA+ Counseling',
    image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala'],
    credentials: 'MSc Inclusive Psychology',
    availability: 'Available Today',
    rating: 4.8,
    reviewCount: 65,
    hourlyRate: 4500,
    sessionFormats: ['video', 'audio', 'chat'],
    serviceCategory: 'LGBTQIA',
    experience: 6,
    bio: 'Dr. Malini Perera provides affirming and inclusive therapy for LGBTQIA+ individuals and couples.',
    isAvailable: true,
    isActive: true
  },
  {
    id: '8',
    name: 'Dr. Chamara Silva',
    specialty: 'Adolescent Psychology',
    image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
    languages: ['English', 'Sinhala', 'Tamil'],
    credentials: 'PhD Adolescent Psychology',
    availability: 'Available Tomorrow',
    rating: 4.7,
    reviewCount: 112,
    hourlyRate: 4200,
    sessionFormats: ['video', 'audio'],
    serviceCategory: 'TEENS',
    experience: 8,
    bio: 'Dr. Chamara Silva specializes in adolescent psychology with 8 years of experience helping teenagers navigate challenges.',
    isAvailable: false,
    isActive: true
  }
];

// Helper functions
export const getTherapistById = (id: string): TherapistData | undefined => {
  return therapistsData.find(therapist => therapist.id === id);
};

export const getTherapistsByCategory = (category: string): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.serviceCategory === category);
};

export const getAvailableTherapists = (): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.isAvailable && (therapist.isActive !== false));
};

export const getTherapistsBySpecialty = (specialty: string): TherapistData[] => {
  return therapistsData.filter(therapist => therapist.specialty.toLowerCase().includes(specialty.toLowerCase()));
};