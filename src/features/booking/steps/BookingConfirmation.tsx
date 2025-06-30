import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, CreditCard, Edit, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../../types/booking';

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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Mock data - in real app, this would come from API calls
  const serviceNames = {
    'TEENS': 'Teen Therapy (13-17)',
    'INDIVIDUALS': 'Individual Therapy (18+)',
    'FAMILY_COUPLES': 'Family & Couples Therapy',
    'LGBTQIA': 'LGBTQIA+ Support'
  };

  const therapistName = 'Dr. Priya Perera'; // Would be fetched based on therapistId

  const applyCoupon = () => {
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
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const finalAmount = (bookingData.amount || 0) - discount;

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
            <p className="text-neutral-300">
              {serviceNames[bookingData.serviceType as keyof typeof serviceNames] || 'Unknown Service'}
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
            <p className="text-neutral-300">{therapistName}</p>
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
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          {/* Coupon Code */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
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
          </div>

          {/* Payment Summary */}
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Summary</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-300">Session Fee</span>
                <span className="text-white">LKR {(bookingData.amount || 0).toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-accent-green">Discount ({appliedCoupon})</span>
                  <span className="text-accent-green">-LKR {discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-neutral-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-lg font-semibold text-primary-500">
                    LKR {finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

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