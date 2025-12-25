import React from 'react';
import { X, Star, Clock, MessageCircle, Video, Phone, Award, Users, Calendar, ArrowLeft } from 'lucide-react';
import { Therapist } from '../types/therapist';

interface TherapistProfileProps {
  therapist: Therapist;
  onClose: () => void;
  onBookNow: (therapist: Therapist) => void;
}

const TherapistProfile: React.FC<TherapistProfileProps> = ({ therapist, onClose, onBookNow }) => {
  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSessionFormatLabel = (format: string) => {
    switch (format) {
      case 'video': return 'Video Sessions';
      case 'audio': return 'Audio Sessions';
      case 'chat': return 'Chat Sessions';
      default: return format;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="h-64 overflow-hidden rounded-t-3xl">
            <img
              src={therapist.profilePhoto}
              alt={`${therapist.firstName} ${therapist.lastName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Back Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-2 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Back</span>
          </button>

          {/* Availability Badge */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
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

          {/* Profile Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {therapist.firstName} {therapist.lastName}
                </h1>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent-yellow fill-current" />
                    <span className="text-white font-medium">{therapist.rating}</span>
                    <span className="text-white/80">({therapist.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-white">{therapist.experience} years experience</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  LKR {therapist.hourlyRate.toLocaleString()}
                </div>
                <div className="text-white/80 text-sm">per session</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">About</h2>
                <p className="text-neutral-600 leading-relaxed">{therapist.bio}</p>
              </div>

              {/* Credentials */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Credentials</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {therapist.credentials.map((credential, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-primary-50 rounded-2xl"
                    >
                      <Award className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <span className="text-primary-700 font-medium">{credential}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-cream-100 text-neutral-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Services Offered</h2>
                <div className="space-y-2">
                  {therapist.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-white border border-cream-200 rounded-2xl"
                    >
                      <Users className="w-5 h-5 text-accent-green flex-shrink-0" />
                      <span className="text-neutral-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-cream-50 rounded-3xl p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Quick Info</h3>
                
                {/* Languages */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.languages.map((language, index) => (
                      <span
                        key={index}
                        className="bg-accent-green/10 text-accent-green px-3 py-1 rounded-full text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session Formats */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Session Formats</h4>
                  <div className="space-y-2">
                    {therapist.sessionFormats.map((format, index) => (
                      <div key={index} className="flex items-center space-x-2 text-neutral-700">
                        {getSessionFormatIcon(format)}
                        <span className="text-sm">{getSessionFormatLabel(format)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Available */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Next Available</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-neutral-700">{therapist.nextAvailableSlot}</span>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="bg-white border-2 border-primary-200 rounded-3xl p-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-neutral-800 mb-1">
                    LKR {therapist.hourlyRate.toLocaleString()}
                  </div>
                  <div className="text-neutral-600 text-sm">per session</div>
                </div>

                <button
                  onClick={() => onBookNow(therapist)}
                  disabled={!therapist.isAvailable || therapist.isActive === false}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    (therapist.isAvailable && therapist.isActive !== false)
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>{(therapist.isActive === false) ? 'Inactive' : (therapist.isAvailable ? 'Book Session' : 'Currently Unavailable')}</span>
                </button>

                {therapist.isAvailable && (
                  <p className="text-xs text-neutral-500 text-center mt-3">
                    You'll be redirected to secure booking calendar
                  </p>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="bg-accent-green/10 border border-accent-green/20 rounded-2xl p-4">
                <h4 className="font-medium text-accent-green text-sm mb-2">Privacy Protected</h4>
                <p className="text-xs text-neutral-600">
                  All bookings are made through our secure platform. 
                  No personal contact information is shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile;