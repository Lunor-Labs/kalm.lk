/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types/auth';
import { getCurrentUser } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔔 Auth state changed:', !!firebaseUser);
      try {
        setError(null);
        if (firebaseUser) {
          console.log('📊 Fetching user data...');
          const userData = await getCurrentUser(firebaseUser);
          console.log('✅ User data loaded:', userData?.role);
          setUser(userData);
          
          // Check for pending booking after successful auth
          const pendingBooking = sessionStorage.getItem('pendingBooking');
          if (pendingBooking && userData) {
            try {
              const pending = JSON.parse(pendingBooking);
              // Check if the pending booking is recent (within 1 hour)
              if (Date.now() - pending.timestamp < 3600000) {
                // Redirect to booking flow with pre-selected data
                setTimeout(() => {
                  const bookingState: any = { returnTo: 'booking' };
                  
                  if (pending.serviceCategory) {
                    bookingState.preSelectedService = pending.serviceCategory;
                  }
                  if (pending.therapistId) {
                    bookingState.preSelectedTherapist = pending.therapistId;
                    bookingState.therapistName = pending.therapistName;
                  }
                  
                  window.location.href = '/client/book';
                }, 1000); // Small delay to allow auth state to settle
              }
              // Clear the pending booking
              sessionStorage.removeItem('pendingBooking');
            } catch (error) {
              console.error('Error processing pending booking:', error);
              sessionStorage.removeItem('pendingBooking');
            }
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        setError(err.message || 'Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 Auth context updated');
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};