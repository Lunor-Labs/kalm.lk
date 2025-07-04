import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTherapists } from '../hooks/useTherapists';
import { Database, HardDrive } from 'lucide-react';
import TherapistCard from './TherapistCard';

interface TherapistsProps {
  onViewAllTherapists: () => void;
  onOpenAuth: (mode: 'login' | 'signup' | 'anonymous') => void;
}

const Therapists: React.FC<TherapistsProps> = ({ onViewAllTherapists, onOpenAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [useFirebaseData, setUseFirebaseData] = useState(false);

  // Use the custom hook to fetch therapists
  const { therapists: allTherapists, loading, error } = useTherapists({
    useFirebase: useFirebaseData
  });

  // Show first 4 therapists for the landing page
  const displayTherapists = allTherapists.slice(0, 4);

  const handleBookSession = (therapist: any) => {
    if (user) {
      // User is logged in, proceed to booking with pre-selected therapist
      navigate('/client/book', { 
        state: { 
          preSelectedTherapist: therapist.id,
          therapistName: therapist.name,
          returnTo: 'booking'
        } 
      });
    } else {
      // User not logged in, store intended action and prompt for auth
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        therapistId: therapist.id,
        therapistName: therapist.name,
        action: 'book',
        timestamp: Date.now()
      }));
      onOpenAuth('login'); // Show login first for better UX
    }
  };

  return (
    <section id="therapists" className="py-8 lg:py-12 bg-neutral-900 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Meet Our Therapists
            </h2>
            
            {/* Data Source Toggle */}
            <div className="flex items-center space-x-2 bg-black/50 border border-neutral-700 rounded-2xl p-1">
              <button
                onClick={() => setUseFirebaseData(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200 ${
                  !useFirebaseData 
                    ? 'bg-accent-yellow text-black' 
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <HardDrive className="w-3 h-3" />
                <span>Demo</span>
              </button>
              <button
                onClick={() => setUseFirebaseData(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200 ${
                  useFirebaseData 
                    ? 'bg-primary-500 text-white' 
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Live</span>
              </button>
            </div>
          </div>
          
          <p className="text-base lg:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Our team of licensed, experienced therapists are here to support your mental wellness journey.
          </p>
          
          {/* Data Source Info */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              useFirebaseData 
                ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30'
                : 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
            }`}>
              {useFirebaseData ? <Database className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
              <span>
                {useFirebaseData ? 'Live Data' : 'Demo Data'}
              </span>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30">
                <span>⚠️ Error loading data</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading therapists...</p>
            </div>
          </div>
        ) : displayTherapists.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayTherapists.map((therapist) => (
                <TherapistCard
                  key={therapist.id}
                  therapist={therapist}
                  onBookNow={handleBookSession}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => onViewAllTherapists()}
                className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto text-sm"
              >
                <span>View All Therapists</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No therapists available</h3>
            <p className="text-neutral-300 mb-6">
              {useFirebaseData 
                ? 'No therapists have been added to Firebase yet. Try switching to demo data.'
                : 'Demo data is not available.'
              }
            </p>
            {useFirebaseData && (
              <button
                onClick={() => setUseFirebaseData(false)}
                className="bg-accent-yellow text-black px-6 py-3 rounded-2xl hover:bg-accent-yellow/90 transition-colors duration-200 font-medium"
              >
                Switch to Demo Data
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Therapists;