import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, MessageCircle, Video, Phone, Award, Database, HardDrive } from 'lucide-react';
import { useTherapists } from '../../../hooks/useTherapists';
import { TherapistData } from '../../../data/therapists';

interface TherapistSelectionProps {
  serviceType?: string;
  selectedTherapist?: string;
  onTherapistSelect: (therapistId: string) => void;
  onBack: () => void;
}

const TherapistSelection: React.FC<TherapistSelectionProps> = ({
  serviceType,
  selectedTherapist,
  onTherapistSelect,
  onBack
}) => {
  const [useFirebaseData, setUseFirebaseData] = useState(false);
  
  // Use the custom hook to fetch therapists
  const { therapists, loading, error } = useTherapists({
    useFirebase: useFirebaseData,
    serviceCategory: serviceType
  });

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'audio': return <Phone className="w-3 h-3" />;
      case 'chat': return <MessageCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading therapists...</p>
            <p className="text-neutral-400 text-sm mt-2">
              {useFirebaseData ? 'Fetching from Firebase...' : 'Loading demo data...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Therapist</h2>
          <p className="text-neutral-300">Select a therapist that feels right for you</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Data Source Toggle */}
          <div className="flex items-center space-x-2 bg-black/50 border border-neutral-700 rounded-2xl p-1">
            <button
              onClick={() => setUseFirebaseData(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                !useFirebaseData 
                  ? 'bg-accent-yellow text-black' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Demo</span>
            </button>
            <button
              onClick={() => setUseFirebaseData(true)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                useFirebaseData 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Live</span>
            </button>
          </div>
          
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          useFirebaseData 
            ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30'
            : 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
        }`}>
          {useFirebaseData ? <Database className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
          <span>
            {useFirebaseData ? 'Live Data from Firebase' : 'Demo Data'}
          </span>
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30">
            <span>⚠️ {error}</span>
          </div>
        )}
      </div>

      {therapists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-300 mb-4">
            {useFirebaseData 
              ? 'No therapists available in Firebase for this service type.'
              : 'No therapists available for this service type.'
            }
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onBack}
              className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
            >
              Choose Different Service
            </button>
            {useFirebaseData && (
              <button
                onClick={() => setUseFirebaseData(false)}
                className="bg-accent-yellow text-black px-6 py-3 rounded-2xl hover:bg-accent-yellow/90 transition-colors duration-200"
              >
                Try Demo Data
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {therapists.map((therapist) => {
            const isSelected = selectedTherapist === therapist.id;
            
            return (
              <button
                key={therapist.id}
                onClick={() => onTherapistSelect(therapist.id)}
                className={`group bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 text-left ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Rating */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-accent-yellow fill-current" />
                    <span className="text-white text-xs font-medium">{therapist.rating}</span>
                    <span className="text-white/80 text-xs">({therapist.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-xs font-medium">
                      LKR {therapist.hourlyRate.toLocaleString()}
                    </span>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {therapist.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-neutral-300">{therapist.credentials}</span>
                    </div>
                    <p className="text-primary-500 font-medium text-sm">
                      {therapist.specialty}
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Languages:</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Session Formats:</p>
                      <div className="flex items-center space-x-3">
                        {therapist.sessionFormats.map((format, index) => (
                          <div key={index} className="flex items-center space-x-1 text-neutral-300">
                            {getSessionFormatIcon(format)}
                            <span className="text-xs capitalize">{format}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-accent-green" />
                      <span className="text-xs text-accent-green font-medium">
                        {therapist.availability}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapistSelection;