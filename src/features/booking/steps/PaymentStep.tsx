import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, CreditCard, Edit, Tag, Video, MessageCircle, Phone, CheckCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../../types/booking';
import { createSession } from '../../../lib/sessions';
import { useAuth } from '../../../contexts/AuthContext';
import { initiatePayHerePayment } from '../../../lib/payhere';
import toast from 'react-hot-toast';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logPaymentError } from '../../../lib/errorLogger';

interface PaymentStepProps {
  bookingData: BookingData;
  onPaymentComplete: () => void;
  onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  bookingData,
  onPaymentComplete,
  onBack,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>(
    bookingData.sessionType || 'video'
  );
  const [showTerms, setShowTerms] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);

  useEffect(() => {
    if (bookingData.sessionType) {
      setSessionType(bookingData.sessionType);
    }
  }, [bookingData.sessionType]);

  const handlePayment = async () => {
    if (!user || !bookingData.therapistId || !bookingData.sessionTime) {
      toast.error('Missing required booking information');
      return;
    }

    setProcessing(true);

    try {
      const sessionTypeDiscount = sessionType === 'audio' ? 500 : sessionType === 'chat' ? 1000 : 0;
      const finalAmount = (bookingData.amount || 0) - sessionTypeDiscount;

      const paymentData = {
        amount: finalAmount,
        currency: 'LKR' as const,
        orderId: `kalm-${Date.now()}-${user.uid.slice(-6)}`,
        items: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Therapy Session`,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email || 'user@kalm.lk',
        phone: '0771234567', // Replace with real user phone if available
        address: 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka' as const,
        deliveryAddress: 'Colombo',
        deliveryCity: 'Colombo',
        deliveryCountry: 'Sri Lanka' as const,
        custom1: bookingData.therapistId,
        custom2: sessionType,
      };

      const paymentResult = await initiatePayHerePayment(paymentData);

      if (paymentResult.success) {
        const bookingId = paymentResult.orderId || `booking-${Date.now()}`;

        // Create session
        const sessionId = await createSession({
          bookingId,
          therapistId: bookingData.therapistId,
          clientId: user.uid,
          sessionType: sessionType,
          status: 'scheduled',
          scheduledTime: bookingData.sessionTime,
          duration: bookingData.duration || 60,
        });

        // Record payment
        try {
          await addDoc(collection(db, 'payments'), {
            bookingId,
            sessionId,
            clientId: user.uid,
            clientName: user.displayName || user.email || 'Unknown',
            therapistId: bookingData.therapistId,
            amount: bookingData.amount || finalAmount,
            currency: 'LKR',
            paymentMethod: 'payhere',
            paymentStatus: 'completed',
            paymentId: paymentResult.paymentId || null,
            orderId: bookingId,
            couponCode: bookingData.couponCode || null,
            discountAmount: bookingData.discountAmount || 0,
            finalAmount,
            payoutStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (paymentErr: any) {
          console.error('Payment record failed:', paymentErr);
          toast.error('Session booked, but payment record failed.');
        }

        toast.success('Payment successful! Session booked.');
        onPaymentComplete();
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      await logPaymentError(error, user?.uid || 'unknown', bookingData.amount || 0, 'payhere');

      let userMessage = 'Payment failed. Please try again.';
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        userMessage = 'Network issue. Please check your connection.';
      } else if (error.message?.includes('card') || error.message?.includes('payment')) {
        userMessage = 'Card declined. Please check details.';
      } else if (error.message?.includes('cancelled') || error.message?.includes('declined')) {
        userMessage = 'Payment declined. Try another method.';
      }

      toast.error(userMessage);
    } finally {
      setProcessing(false);
    }
  };

  const sessionTypeDiscount = sessionType === 'audio' ? 500 : sessionType === 'chat' ? 1000 : 0;
  const totalAmount = (bookingData.amount || 0) - sessionTypeDiscount;

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'audio': return <Phone className="w-5 h-5 text-emerald-600" />;
      case 'chat': return <MessageCircle className="w-5 h-5 text-amber-600" />;
      default: return <Video className="w-5 h-5 text-blue-600" />;
    }
  };

  if (processing) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Payment</h3>
          <p className="text-gray-600 mb-6">Please wait while we process your payment and create your session...</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Payment</h2>
        <p className="text-gray-600 mt-2">Secure payment powered by PayHere</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Cancellation Policy */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Cancellation Policy</span>
            </h3>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">100% Refund</p>
                  <p className="text-gray-600">Cancel more than 24 hours before session</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">50% Refund</p>
                  <p className="text-gray-600">Cancel 12-24 hours before session</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">No Refund</p>
                  <p className="text-gray-600">Cancel less than 12 hours or no-show</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
              <strong>Emergency Cancellations:</strong> Medical emergencies reviewed case-by-case. Contact support.
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-emerald-700 text-sm mb-1">Secure Payment</h4>
                <p className="text-sm text-emerald-600">
                  Your payment is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column – Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Order Summary</span>
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

              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-700">
                  LKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-sm flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Pay LKR {totalAmount.toLocaleString()}</span>
          </button>

          {/* Features */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Instant session creation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>24/7 customer support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Easy cancellation policy</span>
            </div>
          </div>

          {/* Terms & Policy */}
          <div className="text-center text-sm text-gray-500">
            By completing payment, you agree to our{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => setShowTerms(true)}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => setShowCancellation(true)}
            >
              Cancellation Policy
            </button>.
          </div>

          {/* Terms Modal */}
          {showTerms && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Terms of Service</h3>
                </div>
                <div className="p-6 text-gray-700 text-sm space-y-4">
                  <p><strong>Welcome to Kalm.lk:</strong> By using our platform, you agree to these Terms.</p>
                  <p><strong>Services:</strong> We connect users with licensed mental health professionals.</p>
                  <p><strong>Eligibility:</strong> Must be 13+ (under 18 needs parental consent).</p>
                  <p><strong>Privacy:</strong> All sessions are confidential and encrypted.</p>
                  <p><strong>Liability:</strong> We are not liable for therapy outcomes.</p>
                  {/* Add more terms as needed */}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowTerms(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Modal */}
          {showCancellation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Cancellation Policy</h3>
                </div>
                <div className="p-6 text-gray-700 text-sm space-y-4">
                  <p><strong>100% Refund:</strong> Cancel more than 24 hours before.</p>
                  <p><strong>50% Refund:</strong> Cancel 12-24 hours before.</p>
                  <p><strong>No Refund:</strong> Less than 12 hours or no-show.</p>
                  <p><strong>Emergencies:</strong> Reviewed case-by-case.</p>
                  {/* Add more details */}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowCancellation(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;