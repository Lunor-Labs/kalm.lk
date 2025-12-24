import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { therapistsData, TherapistData } from '../data/therapists';

export interface FirebaseTherapist {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  credentials: string[];
  specializations: string[];
  languages: string[];
  services: string[];
  isAvailable: boolean;
  isActive: boolean;
  sessionFormats: string[];
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  profilePhoto: string;
  nextAvailableSlot: string;
  createdAt: any;
  updatedAt: any;
}

export interface UseTherapistsOptions {
  useFirebase?: boolean;
  serviceCategory?: string;
}

export const useTherapists = (options: UseTherapistsOptions = {}) => {
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { useFirebase = false, serviceCategory } = options;

  useEffect(() => {
    const loadTherapists = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useFirebase) {
          // Fetch from Firebase
          const therapistsRef = collection(db, 'therapists');
          const q = query(therapistsRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          
          const firebaseTherapists = snapshot.docs.map(doc => {
            const data = doc.data() as FirebaseTherapist;
            
            // Convert Firebase therapist to TherapistData format
            return {
              id: doc.id,
              name: `${data.firstName} ${data.lastName}`,
              specialty: data.specializations[0] || 'General Counseling',
              image: data.profilePhoto,
              languages: data.languages,
              credentials: data.credentials.join(', '),
              availability: data.isAvailable ? 'Available Today' : data.nextAvailableSlot,
              rating: data.rating,
              reviewCount: data.reviewCount,
              hourlyRate: data.hourlyRate,
              sessionFormats: data.sessionFormats,
              serviceCategory: determineServiceCategory(data.services),
              experience: data.experience,
              bio: data.bio,
              isAvailable: data.isAvailable
            } as TherapistData;
          }).filter(t => t); // Filter out any null entries
          
          // Only include active therapists
          const activeTherapists = firebaseTherapists.filter(t => {
            const originalDoc = snapshot.docs.find(doc => doc.id === t.id);
            const isActive = originalDoc?.data().isActive !== false; // Default to true if not set
            return isActive;
          });

          // Filter by service category if specified
          const filteredTherapists = serviceCategory 
            ? activeTherapists.filter(t => t.serviceCategory === serviceCategory)
            : activeTherapists;

          setTherapists(filteredTherapists);
        } else {
          // Use dummy data
          const filteredTherapists = serviceCategory 
            ? therapistsData.filter(t => t.serviceCategory === serviceCategory)
            : therapistsData;
          
          setTherapists(filteredTherapists);
        }
      } catch (err: any) {
        console.error('Error loading therapists:', err);
        setError(err.message || 'Failed to load therapists');
        
        // Fallback to dummy data on error
        const filteredTherapists = serviceCategory 
          ? therapistsData.filter(t => t.serviceCategory === serviceCategory)
          : therapistsData;
        setTherapists(filteredTherapists);
      } finally {
        setLoading(false);
      }
    };

    loadTherapists();
  }, [useFirebase, serviceCategory]);

  return { therapists, loading, error, refetch: () => loadTherapists() };
};

// Helper function to determine service category from services array
const determineServiceCategory = (services: string[]): string => {
  const serviceStr = services.join(' ').toLowerCase();
  
  if (serviceStr.includes('teen') || serviceStr.includes('adolescent')) {
    return 'TEENS';
  } else if (serviceStr.includes('couple') || serviceStr.includes('family')) {
    return 'FAMILY_COUPLES';
  } else if (serviceStr.includes('lgbtq') || serviceStr.includes('lgbt')) {
    return 'LGBTQIA';
  } else {
    return 'INDIVIDUALS';
  }
};