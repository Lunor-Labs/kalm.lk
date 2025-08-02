import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, CreditCard, Edit, Tag, Video, MessageCircle, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../../types/booking';
import { getTherapistById } from '../../../data/therapists';
import { useTherapists } from '../../../hooks/useTherapists';

interface BookingConfirmationProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
  onBack,
  onEdit
}) => {
  /* const [couponCode, setCouponCode] = useState(''); */
  /* const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0); */
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');

  // Get therapists from both sources to find the selected one
  const { therapists: firebaseTherapists } = useTherapists({ useFirebase: true });
  const { therapists: dummyTherapists } = useTherapists({ useFirebase: false });

  // Mock data - in real app, this would come from API calls
  const serviceNames = {
    'TEENS': 'Teen Therapy (13-17)',
    'INDIVIDUALS': 'Individual Therapy (18+)',
    'FAMILY_COUPLES': 'Family & Couples Therapy',
    'LGBTQIA': 'LGBTQIA+ Support'
  };

  // Get therapist details from both Firebase and dummy data
  const getTherapistDetails = () => {
    if (!bookingData.therapistId) return null;
    
    // First try to find in Firebase data
    const firebaseTherapist = firebaseTherapists.find(t => t.id === bookingData.therapistId);
    if (firebaseTherapist) {
      return firebaseTherapist;
    }
    
    // Then try dummy data
    const dummyTherapist = getTherapistById(bookingData.therapistId);
    if (dummyTherapist) {
      return dummyTherapist;
    }
    
    return null;
  };

  const therapist = getTherapistDetails();
  const therapistName = therapist?.name || 'Unknown Therapist';

  /* const applyCoupon = () => {
    // Mock coupon validation
    const validCoupons = {
      'FIRST10': 10, // 10% discount
      'STUDENT15': 15, // 15% discount
      'WELCOME20': 20 // 20% discount
    };

    if (validCoupons[couponCode as keyof typeof validCoupons]) {
      const discountPercent = validCoupons[couponCode as keyof typeof validCoupons];
      const discountAmount = Math.round((bookingData.amount || 0) * (discountPercent / 100));
      setDiscount(discountAmount);
      setAppliedCoupon(couponCode);
      setCouponCode('');
    } else {
      alert('Invalid coupon code');
    }
  }; */

 /*  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  }; */

  const finalAmount = (bookingData.amount || 0)/*  - discount */;

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-primary-500" />;
      case 'audio': return <Phone className="w-5 h-5 text-accent-green" />;
      case 'chat': return <MessageCircle className="w-5 h-5 text-accent-yellow" />;
      default: return <Video className="w-5 h-5 text-primary-500" />;
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Booking</h2>
          <p className="text-neutral-300">Review your session details before proceeding to payment</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Booking Details */}
        <div className="space-y-6">
          {/* Service */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Service</h3>
              <button
                onClick={() => onEdit(1)}
                className="text-primary-500 hover:text-primary-600 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            {/* <p className="text-neutral-300">
              {serviceNames[bookingData.serviceType as keyof typeof serviceNames] || 'Unknown Service'}
            </p> */}

            <p className="text-neutral-300">
              {serviceNames[bookingData.serviceType as keyof typeof serviceNames] || 
              (therapist?.serviceCategory ? (
                 serviceNames[therapist.serviceCategory as keyof typeof serviceNames] || therapist.serviceCategory) : 'Unknown Service')}
            </p>
          </div>

          {/* Therapist */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Therapist</span>
              </h3>
              <button
                onClick={() => onEdit(2)}
                className="text-primary-500 hover:text-primary-600 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {therapist && (
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-neutral-300 font-medium">{therapistName}</p>
                {therapist && (
                  <p className="text-neutral-400 text-sm">{therapist.specialty}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Session Details</span>
              </h3>
              <button
                onClick={() => onEdit(3)}
                className="text-primary-500 hover:text-primary-600 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            {bookingData.sessionTime && (
              <div className="space-y-2">
                <p className="text-neutral-300">
                  <span className="font-medium">Date:</span> {format(bookingData.sessionTime, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-neutral-300">
                  <span className="font-medium">Time:</span> {format(bookingData.sessionTime, 'h:mm a')}
                </p>
                <p className="text-neutral-300">
                  <span className="font-medium">Duration:</span> {bookingData.duration} minutes
                </p>
              </div>
            )}
          </div>

          {/* Session Type Selection */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Session Type</h3>
            <div className="space-y-3">
              {[
                { type: 'video' as const, label: 'Video Session', price: 0 },
                { type: 'audio' as const, label: 'Audio Session', price: -500 },
                { type: 'chat' as const, label: 'Chat Session', price: -1000 }
              ].map((option) => (
                <label
                  key={option.type}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    sessionType === option.type
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
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
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-neutral-400 text-sm">{getSessionTypeDescription(option.type)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {option.price === 0 ? (
                      <span className="text-neutral-300">Included</span>
                    ) : (
                      <span className="text-accent-green">
                        {option.price > 0 ? '+' : ''}LKR {option.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          {/* Coupon Code */}
          {/* <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Coupon Code</span>
            </h3>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-accent-green/10 border border-accent-green/20 rounded-xl">
                <div>
                  <p className="text-accent-green font-medium">{appliedCoupon}</p>
                  <p className="text-neutral-300 text-sm">LKR {discount.toLocaleString()} discount applied</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-neutral-400 hover:text-neutral-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode.trim()}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            )}
          </div> */}

          {/* Payment Summary */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Summary</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-300">Base Session Fee</span>
                <span className="text-white">LKR {(bookingData.amount || 0).toLocaleString()}</span>
              </div>
              
              {sessionType === 'audio' && (
                <div className="flex justify-between">
                  <span className="text-neutral-300">Audio Session Discount</span>
                  <span className="text-accent-green">-LKR 500</span>
                </div>
              )}
              
              {sessionType === 'chat' && (
                <div className="flex justify-between">
                  <span className="text-neutral-300">Chat Session Discount</span>
                  <span className="text-accent-green">-LKR 1,000</span>
                </div>
              )}
              
              {/* {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-accent-green">Discount ({appliedCoupon})</span>
                  <span className="text-accent-green">-LKR {discount.toLocaleString()}</span>
                </div>
              )} */}
              
              <div className="border-t border-neutral-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-lg font-semibold text-primary-500">
                    LKR {(finalAmount - (sessionType === 'audio' ? 500 : sessionType === 'chat' ? 1000 : 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Type Info */}
          {/* <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              {getSessionTypeIcon(sessionType)}
              <div>
                <h4 className="font-medium text-primary-500 text-sm mb-1">
                  {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session Selected
                </h4>
                <p className="text-xs text-neutral-300">
                  {getSessionTypeDescription(sessionType)}
                </p>
              </div>
            </div>
          </div> */}

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className="w-full bg-primary-500 text-white py-4 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-semibold text-lg"
          >
            Proceed to Payment
          </button>

          {/* Terms */}
          <div className="text-center">
            <p className="text-neutral-400 text-sm">
              By proceeding, you agree to our{' '}
              <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;