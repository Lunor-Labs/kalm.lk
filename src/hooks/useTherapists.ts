import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { therapistsData, TherapistData } from '../data/therapists';

// FirebaseTherapist interface is now handled by the User type from auth.ts

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
          // Fetch from Firebase users collection, filter for therapists
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('role', '==', 'therapist'), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);

          const firebaseTherapists = snapshot.docs.map(doc => {
            const userData = doc.data();
            const therapistProfile = userData.therapistProfile;

            if (!therapistProfile) return null;

            // Convert Firebase therapist to TherapistData format
            return {
              id: doc.id,
              name: `${therapistProfile.firstName} ${therapistProfile.lastName}`,
              specialty: therapistProfile.specializations[0] || 'General Counseling',
              image: therapistProfile.profilePhoto,
              languages: therapistProfile.languages,
              credentials: therapistProfile.credentials.join(', '),
              availability: therapistProfile.isAvailable ? 'Available Today' : therapistProfile.nextAvailableSlot || 'Not Available',
              rating: therapistProfile.rating,
              reviewCount: therapistProfile.reviewCount,
              hourlyRate: therapistProfile.hourlyRate,
              sessionFormats: therapistProfile.sessionFormats,
              serviceCategory: determineServiceCategory(therapistProfile.services),
              experience: therapistProfile.experience,
              bio: therapistProfile.bio,
              isAvailable: therapistProfile.isAvailable
            } as TherapistData;
          }).filter(Boolean) as TherapistData[];

          // Filter by service category if specified
          const filteredTherapists = serviceCategory 
            ? firebaseTherapists.filter(t => t.serviceCategory === serviceCategory)
            : firebaseTherapists;

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