import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, CreditCard, Edit, Tag, Video, MessageCircle, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../../types/booking';
import { getTherapistById } from '../../../data/therapists';
import { useTherapists } from '../../../hooks/useTherapists';

interface BookingConfirmationProps {
  bookingData: BookingData;
  onConfirm: (sessionType: 'video' | 'audio' | 'chat') => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
  onBack,
  onEdit,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');

  // Get therapists from both sources
  const { therapists: firebaseTherapists } = useTherapists({ useFirebase: true });
  const therapist = firebaseTherapists.find(t => t.id === bookingData.therapistId) || 
                   getTherapistById(bookingData.therapistId!);

  const therapistName = therapist?.name || 'Unknown Therapist';

  // Available session types based on therapist
  const availableSessionTypes = [
    { type: 'video' as const, label: 'Video Session', price: 0 },
    { type: 'audio' as const, label: 'Audio Session', price: -500 },
    { type: 'chat' as const, label: 'Chat Session', price: -1000 },
  ].filter(option => therapist?.sessionFormats?.includes(option.type) ?? true);

  useEffect(() => {
    if (availableSessionTypes.length > 0 && !availableSessionTypes.some(opt => opt.type === sessionType)) {
      setSessionType(availableSessionTypes[0].type);
    }
  }, [therapist, availableSessionTypes]);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'audio': return <Phone className="w-5 h-5 text-emerald-600" />;
      case 'chat': return <MessageCircle className="w-5 h-5 text-amber-600" />;
      default: return <Video className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSessionTypeDescription = (type: string) => {
    switch (type) {
      case 'video': return 'Face-to-face video session with full audio and video';
      case 'audio': return 'Voice-only session without video';
      case 'chat': return 'Text-based session with real-time messaging';
      default: return 'Video session';
    }
  };

  const finalAmount = (bookingData.amount || 0);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Confirmation</h2>
        <p className="text-gray-600 mt-2">Review your session details and confirm your booking</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Booking Details */}
        <div className="space-y-6">
          {/* Service */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>Service</span>
              </h3>
              {/* <button onClick={() => onEdit(1)} className="text-blue-600 hover:text-blue-700">
                <Edit className="w-4 h-4" />
              </button> */}
            </div>
            <p className="text-gray-700">
              {therapist?.serviceCategory
                ? therapist.serviceCategory.charAt(0).toUpperCase() + therapist.serviceCategory.slice(1).replace('_', ' & ')
                : 'Unknown Service'}
            </p>
          </div>

          {/* Therapist */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Therapist</span>
              </h3>
              {/* <button onClick={() => onEdit(2)} className="text-blue-600 hover:text-blue-700">
                <Edit className="w-4 h-4" />
              </button> */}
            </div>
            <div className="flex items-center gap-4">
              {therapist?.image && (
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{therapistName}</p>
                <p className="text-sm text-gray-600">{therapist?.specialty}</p>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Session Details</span>
              </h3>
              {/* <button onClick={() => onEdit(3)} className="text-blue-600 hover:text-blue-700">
                <Edit className="w-4 h-4" />
              </button> */}
            </div>
            {bookingData.sessionTime && (
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {format(bookingData.sessionTime, 'EEEE, MMMM d, yyyy')}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{' '}
                  {format(bookingData.sessionTime, 'h:mm a')}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {bookingData.duration} minutes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Session Type Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Type</h3>

            {availableSessionTypes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h4 className="text-gray-800 font-medium mb-2">No Session Types Available</h4>
                <p className="text-gray-600 text-sm">
                  This therapist doesn't have any session types configured.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableSessionTypes.map((option) => (
                  <label
                    key={option.type}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      sessionType === option.type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="sessionType"
                        value={option.type}
                        checked={sessionType === option.type}
                        onChange={(e) => setSessionType(e.target.value as any)}
                        className="sr-only"
                      />
                      {getSessionTypeIcon(option.type)}
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{getSessionTypeDescription(option.type)}</p>
                      </div>
                    </div>
                    {option.price !== 0 && (
                      <span className="text-sm font-medium text-emerald-600">
                        {option.price > 0 ? '+' : ''}LKR {Math.abs(option.price).toLocaleString()}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Payment Summary</span>
            </h3>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Base Session Fee</span>
                <span className="font-medium">LKR {(bookingData.amount || 0).toLocaleString()}</span>
              </div>

              {sessionType === 'audio' && (
                <div className="flex justify-between text-emerald-600">
                  <span>Audio Session Discount</span>
                  <span>-LKR 500</span>
                </div>
              )}

              {sessionType === 'chat' && (
                <div className="flex justify-between text-emerald-600">
                  <span>Chat Session Discount</span>
                  <span>-LKR 1,000</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-700">
                  LKR {(
                    (bookingData.amount || 0) +
                    (sessionType === 'audio' ? -500 : sessionType === 'chat' ? -1000 : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => onConfirm(sessionType)}
            disabled={availableSessionTypes.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-sm"
          >
            {availableSessionTypes.length === 0 ? 'No Session Types Available' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;