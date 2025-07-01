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
    
    // Check navigation state first
    if (stateData?.preSelectedService) {
      initialData.serviceType = stateData.preSelectedService;
      setCurrentStep(2); // Skip to therapist selection
    }
    
    if (stateData?.preSelectedTherapist) {
      initialData.therapistId = stateData.preSelectedTherapist;
      setCurrentStep(3); // Skip to time slot selection
    }
    
    // Check pending booking from session storage
    if (pendingBooking) {
      try {
        const pending = JSON.parse(pendingBooking);
        // Check if the pending booking is recent (within 1 hour)
        if (Date.now() - pending.timestamp < 3600000) {
          if (pending.serviceCategory) {
            initialData.serviceType = pending.serviceCategory;
            setCurrentStep(2);
          }
          if (pending.therapistId) {
            initialData.therapistId = pending.therapistId;
            setCurrentStep(3);
          }
        }
        // Clear the pending booking
        sessionStorage.removeItem('pendingBooking');
      } catch (error) {
        console.error('Error parsing pending booking:', error);
        sessionStorage.removeItem('pendingBooking');
      }
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
    setBookingData(prev => ({ ...prev, ...data }));
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
            onConfirm={nextStep}
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
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/client/home')}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Book a Session</h1>
          <p className="text-neutral-300">Follow the steps below to book your therapy session</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                  step.step < currentStep
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : step.step === currentStep
                    ? 'border-primary-500 text-primary-500 bg-transparent'
                    : 'border-neutral-600 text-neutral-400 bg-transparent'
                }`}>
                  {step.step < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.step}</span>
                  )}
                </div>
                
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step.step <= currentStep ? 'text-white' : 'text-neutral-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-6 ${
                    step.step < currentStep ? 'bg-primary-500' : 'bg-neutral-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;