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

            // Skip therapists explicitly marked inactive
            if (userData.isActive === false) return null;

            // Convert Firebase therapist to TherapistData format
            return {
              id: doc.id,
              name: `${therapistProfile.firstName} ${therapistProfile.lastName}`,
              specialty: therapistProfile.specializations[0] || 'General Counseling',
              image: therapistProfile.profilePhoto,
              languages: therapistProfile.languages,
              credentials: therapistProfile.credentials.join(', '),
              availability: therapistProfile.nextAvailableSlot || 'Check Availability',
              rating: therapistProfile.rating,
              reviewCount: therapistProfile.reviewCount,
              hourlyRate: therapistProfile.hourlyRate,
              sessionFormats: therapistProfile.sessionFormats,
              serviceCategory: determineServiceCategory(therapistProfile.services),
              experience: therapistProfile.experience,
              bio: therapistProfile.bio,
              isAvailable: userData.isActive !== false,
              isActive: userData.isActive === undefined ? true : userData.isActive
            } as TherapistData;
          }).filter(Boolean) as TherapistData[];

          // Filter by service category if specified
          const filteredTherapists = serviceCategory 
            ? firebaseTherapists.filter(t => t.serviceCategory === serviceCategory)
            : firebaseTherapists;

          setTherapists(filteredTherapists);
        } else {
          // Use dummy data — only include therapists who are active (default true)
          const base = serviceCategory 
            ? therapistsData.filter(t => t.serviceCategory === serviceCategory)
            : therapistsData;

          const filteredTherapists = base
            .filter(t => (t as any).isActive !== false) // respect isActive if present
            .map(t => ({ ...(t as any), isActive: (t as any).isActive === undefined ? true : (t as any).isActive }));

          setTherapists(filteredTherapists as any);
        }
      } catch (err: any) {
        console.error('Error loading therapists:', err);
        setError(err.message || 'Failed to load therapists');
        
        // Fallback to dummy data on error — respect isActive
        const base = serviceCategory 
          ? therapistsData.filter(t => t.serviceCategory === serviceCategory)
          : therapistsData;

        const filteredTherapists = base
          .filter(t => (t as any).isActive !== false)
          .map(t => ({ ...(t as any), isActive: (t as any).isActive === undefined ? true : (t as any).isActive }));

        setTherapists(filteredTherapists as any);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
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