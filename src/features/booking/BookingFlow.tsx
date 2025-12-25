import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { BookingData, BookingStep } from '../../types/booking';
import ServiceSelection from './steps/ServiceSelection';
import TherapistSelection from './steps/TherapistSelection';
import TimeSlotSelection from './steps/TimeSlotSelection';
import BookingConfirmation from './steps/BookingConfirmation';
import PaymentStep from './steps/PaymentStep';

const BookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  // Check for pre-selected data from navigation state or pending booking
  useEffect(() => {
    const stateData = location.state;
    const pendingBooking = sessionStorage.getItem('pendingBooking');

    let initialData: Partial<BookingData> = {};

    // Navigation state priority
    if (stateData?.preSelectedService) {
      initialData.serviceType = stateData.preSelectedService;
      setCurrentStep(2);
    }

    if (stateData?.preSelectedTherapist) {
      initialData.therapistId = stateData.preSelectedTherapist;
      setCurrentStep(3);
    }

    // Pending booking from sessionStorage (fallback)
    if (pendingBooking) {
      try {
        const pending = JSON.parse(pendingBooking);
        if (Date.now() - pending.timestamp < 3600000) { // 1 hour validity
          if (pending.serviceCategory) {
            initialData.serviceType = pending.serviceCategory;
            setCurrentStep(2);
          }
          if (pending.therapistId) {
            initialData.therapistId = pending.therapistId;
            setCurrentStep(3);
          }
        }
      } catch (error) {
        console.error('Error parsing pending booking:', error);
      }
      sessionStorage.removeItem('pendingBooking');
    }

    if (Object.keys(initialData).length > 0) {
      setBookingData(initialData);
    }
  }, [location.state]);

  const steps: BookingStep[] = [
    { step: 1, title: 'Choose Service', completed: false },
    { step: 2, title: 'Select Therapist', completed: false },
    { step: 3, title: 'Pick Time Slot', completed: false },
    { step: 4, title: 'Confirm Details', completed: false },
    { step: 5, title: 'Payment', completed: false },
  ];

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            selectedService={bookingData.serviceType}
            onServiceSelect={(serviceType) => {
              updateBookingData({ serviceType });
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <TherapistSelection
            serviceType={bookingData.serviceType}
            selectedTherapist={bookingData.therapistId}
            onTherapistSelect={(therapistId) => {
              updateBookingData({ therapistId });
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <TimeSlotSelection
            therapistId={bookingData.therapistId!}
            selectedTime={bookingData.sessionTime}
            onTimeSelect={(sessionTime, duration, amount) => {
              updateBookingData({ sessionTime, duration, amount });
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <BookingConfirmation
            bookingData={bookingData}
            onConfirm={(selectedSessionType) => {
              updateBookingData({ sessionType: selectedSessionType });
              nextStep();
            }}
            onBack={prevStep}
            onEdit={(step) => setCurrentStep(step)}
          />
        );
      case 5:
        return (
          <PaymentStep
            bookingData={bookingData}
            onPaymentComplete={() => {
              navigate('/client/sessions');
            }}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/client/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Book a Session
          </h1>
          <p className="text-lg text-gray-600">
            Follow the steps below to schedule your therapy session
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.step} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step.step < currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step.step === currentStep
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {step.step < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.step}</span>
                  )}
                </div>

                <div className="hidden sm:block flex-1 mx-4">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step.step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                </div>

                <div className="hidden sm:block text-sm font-medium text-gray-700 whitespace-nowrap">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;