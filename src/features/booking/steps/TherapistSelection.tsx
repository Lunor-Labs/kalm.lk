import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Video, Phone } from 'lucide-react';
import { useTherapists } from '../../../hooks/useTherapists';

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
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Use the custom hook to fetch therapists, always using Firebase
  const { therapists, loading, error } = useTherapists({
    useFirebase: true,
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

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading therapists...</p>
            <p className="text-neutral-400 text-sm mt-2">Fetching from Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button above the title */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white whitespace-nowrap">Choose Your Therapist</h2>
        <p className="text-neutral-300">Select a therapist that feels right for you</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30 mb-6">
          <span>⚠️ {error}</span>
        </div>
      )}

      {therapists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-300 mb-4">
            No therapists available for this service type.
          </p>
          <div className="flex items-center justify-center">
            <button
              onClick={onBack}
              className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
            >
              Choose Different Service
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Slider */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar snap-x snap-mandatory -mx-4 px-2 md:mx-0 md:px-0"
          >
            {therapists.map((therapist) => {
              const isSelected = selectedTherapist === therapist.id;
              return (
                <button
                  key={therapist.id}
                  onClick={() => onTherapistSelect(therapist.id)}
                  className={`
                    snap-center
                    min-w-[80vw] max-w-[90vw]
                    md:min-w-[320px] md:max-w-xs
                    group bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 text-left
                    ${isSelected 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-neutral-800 hover:border-neutral-700'
                    }
                  `}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
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
                      <div className="flex items-center space-x-2 mb-2 space-y-3">
                        <div>
                          <p className="text-xs text-neutral-400 font-bold">Accreditations:</p>
                          <p className="text-xs text-neutral-300">{therapist.credentials}</p>
                        </div>
                      </div>
                      <p className="text-primary-500 font-medium text-sm">
                        {therapist.specialty}
                      </p>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1 font-bold">Languages:
                          {therapist.languages.map((lang, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full ml-2"
                            >
                              {lang}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1 font-bold">Session Formats:</p>
                        <div className="flex items-center space-x-3">
                          {therapist.sessionFormats.map((format, index) => (
                            <div key={index} className="flex items-center space-x-1 text-neutral-300">
                              {getSessionFormatIcon(format)}
                              <span className="text-xs capitalize">{format}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop Arrows (sides) */}
          <div className="hidden md:block">
            <button
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-400 hover:bg-primary-500 text-white rounded-full p-2 shadow-lg transition"
              onClick={() => scrollSlider('left')}
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-400 hover:bg-primary-500 text-white rounded-full p-2 shadow-lg transition"
              onClick={() => scrollSlider('right')}
              aria-label="Scroll right"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Mobile Arrows (bottom center) */}
          <div className="flex justify-center gap-6 mt-4 md:hidden">
            <button
              type="button"
              className="bg-neutral-400 hover:bg-primary-500 text-white rounded-full p-3 shadow-lg transition"
              onClick={() => scrollSlider('left')}
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="bg-neutral-400 hover:bg-primary-500 text-white rounded-full p-3 shadow-lg transition"
              onClick={() => scrollSlider('right')}
              aria-label="Scroll right"
            >
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSelection;
