import React from 'react';
import { Star, Clock, MessageCircle, Video, Phone, Users, Award, Check, X } from 'lucide-react';
import { Therapist } from '../types/therapist';

interface TherapistCardProps {
  therapist: Therapist;
  onViewProfile: (therapist: Therapist) => void;
  onBookNow: (therapist: Therapist) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onViewProfile, onBookNow }) => {
  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'audio': return <Phone className="w-3 h-3" />;
      case 'chat': return <MessageCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const features = [
    {
      label: 'Experience',
      value: `${therapist.experience} years`,
      hasFeature: true
    },
    {
      label: 'Languages',
      value: therapist.languages.join(', '),
      hasFeature: true
    },
    {
      label: 'Available',
      value: therapist.isAvailable ? 'Today' : 'Next week',
      hasFeature: therapist.isAvailable
    },
    {
      label: 'Session Types',
      value: `${therapist.sessionFormats.length} formats`,
      hasFeature: true
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cream-200/100 overflow-hidden">
      {/* Header with Photo and Availability */}
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img
            src={therapist.profilePhoto}
            alt={`${therapist.firstName} ${therapist.lastName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1 ${
            therapist.isAvailable 
              ? 'bg-accent-green text-white' 
              : 'bg-neutral-600 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              therapist.isAvailable ? 'bg-white' : 'bg-neutral-300'
            }`}></div>
            <span>{therapist.isAvailable ? 'Available Now' : 'Not Available'}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-1">
          <Star className="w-3 h-3 text-accent-yellow fill-current" />
          <span className="text-white text-xs font-medium">{therapist.rating}</span>
          <span className="text-white/80 text-xs">({therapist.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-white text-xs font-medium">
            LKR {therapist.hourlyRate.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name and Credentials */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-neutral-800 mb-2">
            {therapist.firstName} {therapist.lastName}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-neutral-600">{therapist.credentials[0]}</span>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Specializations
          </h4>
          <div className="flex flex-wrap gap-1">
            {therapist.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-medium"
              >
                {spec}
              </span>
            ))}
            {therapist.specializations.length > 3 && (
              <span className="text-xs text-neutral-500 px-2 py-1">
                +{therapist.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Features Grid - Similar to Hero cards */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wide">
            Quick Info
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                {feature.hasFeature ? (
                  <Check className="w-3 h-3 text-accent-green flex-shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs text-neutral-500">{feature.label}</div>
                  <div className="text-xs text-neutral-700 font-medium truncate">{feature.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Formats */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
            Session Formats
          </h4>
          <div className="flex items-center space-x-3">
            {therapist.sessionFormats.map((format, index) => (
              <div key={index} className="flex items-center space-x-1 text-neutral-600">
                {getSessionFormatIcon(format)}
                <span className="text-xs capitalize">{format}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Available */}
        <div className="mb-6 p-3 bg-cream-50 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <div>
                <div className="text-xs text-neutral-500">Next Available</div>
                <div className="text-sm font-medium text-neutral-700">{therapist.nextAvailableSlot}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-neutral-800">
                LKR {therapist.hourlyRate.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">/session</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onViewProfile(therapist)}
            className="bg-cream-100 text-neutral-700 py-3 rounded-2xl hover:bg-cream-200 transition-colors duration-200 font-medium text-sm"
          >
            View Profile
          </button>
          <button
            onClick={() => onBookNow(therapist)}
            disabled={!therapist.isAvailable}
            className={`py-3 rounded-2xl font-medium text-sm transition-colors duration-200 ${
              therapist.isAvailable
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {therapist.isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;