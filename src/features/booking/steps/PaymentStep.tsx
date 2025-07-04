import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Video, MessageCircle, Phone } from 'lucide-react';
import { BookingData } from '../../../types/booking';
import { createSession } from '../../../lib/sessions';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PaymentStepProps {
  bookingData: BookingData;
  onPaymentComplete: () => void;
  onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  bookingData,
  onPaymentComplete,
  onBack
}) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');

  const handlePayment = async () => {
    if (!user || !bookingData.therapistId || !bookingData.sessionTime) {
      toast.error('Missing required booking information');
      return;
    }

    setProcessing(true);

    try {
      // In a real app, this would integrate with PayHere
      // For demo purposes, we'll simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create the session in Firebase after successful payment
      const sessionId = await createSession({
        bookingId: `booking-${Date.now()}`, // In real app, this would come from the booking
        therapistId: bookingData.therapistId,
        clientId: user.uid,
        sessionType: sessionType,
        status: 'scheduled',
        scheduledTime: bookingData.sessionTime,
        duration: bookingData.duration || 60,
      });

      toast.success('Payment successful! Session booked.');
      console.log('Session created with ID:', sessionId);
      
      // Simulate successful payment
      onPaymentComplete();
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const finalAmount = (bookingData.amount || 0) - (bookingData.discountAmount || 0);
  const sessionTypeDiscount = sessionType === 'audio' ? 500 : sessionType === 'chat' ? 1000 : 0;
  const totalAmount = finalAmount - sessionTypeDiscount;

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  if (processing) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
            <p className="text-neutral-300 mb-4">Please wait while we process your payment and create your session...</p>
            <div className="mt-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-2xl">
              <p className="text-accent-green text-sm">
                <Shield className="w-4 h-4 inline mr-2" />
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-neutral-300">Secure payment powered by PayHere</p>
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
        {/* Payment Methods */}
        <div className="space-y-6">
          {/* Session Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Final Session Type</h3>
            <div className="space-y-3">
              {[
                { type: 'video' as const, label: 'Video Session', discount: 0, description: 'Face-to-face with video and audio' },
                { type: 'audio' as const, label: 'Audio Session', discount: 500, description: 'Voice-only communication' },
                { type: 'chat' as const, label: 'Chat Session', discount: 1000, description: 'Text-based messaging' }
              ].map((option) => (
                <label
                  key={option.type}
                  className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    sessionType === option.type
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-black/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="sessionType"
                    value={option.type}
                    checked={sessionType === option.type}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getSessionTypeIcon(option.type)}
                      <div>
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-sm text-neutral-300">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {option.discount > 0 && (
                        <p className="text-accent-green text-sm">-LKR {option.discount}</p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              {/* Credit/Debit Card */}
              <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === 'card'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-black/30'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-primary-500" />
                  <div>
                    <p className="font-medium text-white">Credit/Debit Card</p>
                    <p className="text-sm text-neutral-300">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </label>

              {/* Mobile Wallet */}
              <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === 'mobile'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-black/30'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile"
                  checked={paymentMethod === 'mobile'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-accent-green rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Mobile Wallet</p>
                    <p className="text-sm text-neutral-300">eZ Cash, mCash, Dialog Pay</p>
                  </div>
                </div>
              </label>

              {/* Bank Transfer */}
              <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMethod === 'bank'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-black/30'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-accent-yellow rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Online Banking</p>
                    <p className="text-sm text-neutral-300">All major Sri Lankan banks</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-2xl">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-green text-sm mb-1">Secure Payment</h4>
                <p className="text-xs text-neutral-300">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-black/30 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-300">Base Session Fee</span>
                <span className="text-white">LKR {(bookingData.amount || 0).toLocaleString()}</span>
              </div>
              
              {sessionTypeDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-accent-green">
                    {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session Discount
                  </span>
                  <span className="text-accent-green">-LKR {sessionTypeDiscount.toLocaleString()}</span>
                </div>
              )}
              
              {bookingData.discountAmount && bookingData.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-accent-green">Coupon Discount</span>
                  <span className="text-accent-green">-LKR {bookingData.discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-neutral-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-xl font-semibold text-white">Total</span>
                  <span className="text-xl font-semibold text-primary-500">
                    LKR {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4">
            <h4 className="font-medium text-primary-500 text-sm mb-2">Session Details</h4>
            <div className="space-y-1 text-xs text-neutral-300">
              <p>• {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} session with your therapist</p>
              <p>• {bookingData.duration || 60} minutes duration</p>
              <p>• Secure and private communication</p>
              <p>• Session recording available upon request</p>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full bg-primary-500 text-white py-4 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Pay LKR {totalAmount.toLocaleString()}</span>
          </button>

          {/* Payment Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-neutral-300">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              <span>Instant session creation</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-300">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              <span>24/7 customer support</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-300">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              <span>Easy cancellation policy</span>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center">
            <p className="text-neutral-400 text-xs">
              By completing this payment, you agree to our{' '}
              <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary-500 hover:text-primary-600">Cancellation Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;