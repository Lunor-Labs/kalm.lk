import React, { useRef, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Video, Phone, ChevronLeft } from 'lucide-react';
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

  const { therapists, loading, error } = useTherapists({
    useFirebase: true,
    serviceCategory: serviceType
  });

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4 text-gray-700" />;
      case 'audio': return <Phone className="w-4 h-4 text-gray-700" />;
      case 'chat': return <MessageCircle className="w-4 h-4 text-gray-700" />;
      default: return null;
    }
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.3;
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
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-800">Loading therapists...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Services</span>
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Therapist</h2>
        <p className="text-gray-600 mt-2">Select someone who feels right for your needs</p>
      </div>

      {error && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <span>⚠️ {error}</span>
        </div>
      )}

      {therapists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-700 mb-6 text-lg">
            No therapists available for this service type.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-colors font-medium"
          >
            Choose Different Service
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Horizontal Slider - narrower cards */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory -mx-2 px-2 md:mx-0 md:px-0 hide-scrollbar"
          >
            {therapists.map((therapist) => {
              const isSelected = selectedTherapist === therapist.id;

              return (
                <div
                  key={therapist.id}
                  onClick={() => onTherapistSelect(therapist.id)}
                  className={`
                    relative h-[420px] overflow-hidden group snap-center
                    min-w-[75vw] sm:min-w-[340px] md:min-w-[320px] lg:min-w-[300px]
                    cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50' : ''}
                  `}
                  style={{
                    backgroundImage: `url(${therapist.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Gradient overlay - lighter version for white bg */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

                  {/* Content - bottom aligned */}
                  <div className="relative z-10 h-full p-5 flex flex-col justify-end text-white">
                    <div className="mt-auto">
                      {/* Name, Credentials, Specialty */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">{therapist.name}</h3>
                        <p className="text-sm text-gray-200 font-light">
                          {therapist.credentials}
                        </p>
                        <p className="text-sm text-blue-300 font-medium mt-1">
                          {therapist.specialty}
                        </p>
                      </div>

                      {/* Languages & Formats */}
                      <div className="flex items-end justify-between gap-4 mb-5">
                        {/* Languages */}
                        <div>
                          <p className="text-xs text-gray-300 mb-1 font-medium">Languages</p>
                          <p className="text-sm text-gray-100 font-light">
                            {therapist.languages.join(' • ')}
                          </p>
                        </div>

                        {/* Session Formats Icons */}
                        <div className="flex gap-2">
                          {therapist.sessionFormats.map((format, index) => (
                            <div
                              key={index}
                              className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/20"
                            >
                              {getSessionFormatIcon(format)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price & Book button */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold text-white">
                            LKR {therapist.hourlyRate.toLocaleString()}/hr
                          </span>
                        </div>

                        <button
                          className="w-full bg-white/30 backdrop-blur-md text-white text-sm font-medium py-3.5 rounded-lg hover:bg-white/40 transition-all border border-white/30"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex justify-between mt-8">
            <button
              onClick={() => scrollSlider('left')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollSlider('right')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 rotate-180" />
            </button>
          </div>

          {/* Mobile arrows */}
          <div className="flex justify-center gap-8 mt-8 md:hidden">
            <button
              onClick={() => scrollSlider('left')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollSlider('right')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSelection;